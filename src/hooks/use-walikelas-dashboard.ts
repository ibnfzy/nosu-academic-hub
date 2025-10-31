/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useDashboardSemester,
  type DashboardSemesterMetadata,
  type DashboardSemesterRecord,
} from "@/hooks/use-dashboard-semester";
import apiService from "@/services/apiService";
import { mergeUserData } from "@/utils/mergeUserData";
import { useToast } from "@/hooks/use-toast";
import { printReport } from "@/utils/helpers";
import { useSemesterEnforcement } from "@/hooks/use-semester-enforcement";

interface CurrentUser {
  id: string;
  nama?: string;
  kelasId?: string;
  teacherId?: string;
}

interface StudentFormState {
  id?: string;
  userId?: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: string;
  tanggalLahir: string;
  alamat: string;
  nomorHP: string;
  namaOrangTua: string;
  pekerjaanOrangTua: string;
  tahunMasuk: string;
  username: string;
  password: string;
  email: string;
}

type UnknownRecord = Record<string, unknown>;

interface ScheduleConflictDetail extends UnknownRecord {
  hari: string | null;
  jamMulai: string | null;
  jamSelesai: string | null;
  kelasNama: string | null;
  teacherNama: string | null;
  subjectNama: string | null;
}

interface ScheduleConflictInfo {
  conflictScope?: string | null;
  conflicts: ScheduleConflictDetail[];
}

interface WalikelasScheduleFilters {
  kelasId: string;
  hari: string;
}

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const toScheduleConflictDetail = (
  value: unknown
): ScheduleConflictDetail | null => {
  if (!isRecord(value)) {
    return null;
  }

  const record = value as UnknownRecord;
  const normalizeStringOrNull = (candidate: unknown) => {
    if (candidate === null || candidate === undefined) {
      return null;
    }
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      return trimmed === "" ? null : trimmed;
    }
    if (typeof candidate === "number") {
      return String(candidate);
    }
    return null;
  };

  return {
    ...record,
    hari: normalizeStringOrNull(record.hari),
    jamMulai: normalizeStringOrNull(record.jamMulai),
    jamSelesai: normalizeStringOrNull(record.jamSelesai),
    kelasNama: normalizeStringOrNull(record.kelasNama),
    teacherNama: normalizeStringOrNull(record.teacherNama),
    subjectNama: normalizeStringOrNull(record.subjectNama),
  } as ScheduleConflictDetail;
};

const normalizeGender = (value: unknown): string => {
  if (!value) return "";

  const normalized = String(value).toLowerCase().trim();

  if (["l", "laki-laki", "laki laki", "male", "m"].includes(normalized)) {
    return "L";
  }

  if (["p", "perempuan", "female", "f"].includes(normalized)) {
    return "P";
  }

  return String(value).toUpperCase();
};

const normalizeDateValue = (value: unknown): string => {
  if (!value) return "";

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split("T")[0] ?? "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0] ?? "";
    }
  }

  return "";
};

const createDefaultStudentForm = (): StudentFormState => ({
  id: "",
  userId: "",
  nis: "",
  nisn: "",
  nama: "",
  jenisKelamin: "",
  tanggalLahir: "",
  alamat: "",
  nomorHP: "",
  namaOrangTua: "",
  pekerjaanOrangTua: "",
  tahunMasuk: new Date().getFullYear().toString(),
  username: "",
  password: "",
  email: "",
});

const useWalikelasDashboard = (currentUser: CurrentUser | null) => {
  const { toast } = useToast();

  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("students");
  const [semesters, setSemesters] = useState<DashboardSemesterRecord[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [walikelasSchedules, setWalikelasSchedules] = useState<any[]>([]);
  const [walikelasScheduleMetadata, setWalikelasScheduleMetadata] =
    useState<UnknownRecord | null>(null);
  const [walikelasScheduleError, setWalikelasScheduleError] =
    useState<string | null>(null);
  const [walikelasScheduleConflicts, setWalikelasScheduleConflicts] =
    useState<ScheduleConflictInfo | null>(null);
  const [walikelasScheduleFilters, setWalikelasScheduleFilters] =
    useState<WalikelasScheduleFilters>(() => ({
      kelasId: currentUser?.kelasId ? String(currentUser.kelasId) : "",
      hari: "",
    }));
  const [isWalikelasScheduleLoading, setIsWalikelasScheduleLoading] =
    useState(false);
  const [studentForm, setStudentForm] = useState<StudentFormState>(
    createDefaultStudentForm
  );
  const [semesterWarning, setSemesterWarning] = useState<string>("");
  const [uploadBlockedReason, setUploadBlockedReason] = useState<string>("");
  const semesterWarningRef = useRef<string | null>(null);

  const notifyMissingTeacherId = useCallback(() => {
    toast({
      title: "Data Wali Kelas",
      description:
        "ID wali kelas tidak ditemukan pada akun Anda. Hubungi admin untuk bantuan lebih lanjut.",
      variant: "destructive",
    });
  }, [toast]);

  const {
    mode: enforcementMode,
    isStrictMode,
    isStrictModeActive,
    isRelaxedMode,
    activeSemesterMetadata: enforcedActiveSemester,
    hasActiveSemester: hasEnforcedActiveSemester,
    shouldAttachSemesterId,
    isSemesterExpired,
  } = useSemesterEnforcement();

  const clearStudentForm = useCallback(() => {
    setStudentForm(createDefaultStudentForm());
    setEditingStudent(null);
  }, []);

  const handleStudentDialogChange = useCallback(
    (open: boolean) => {
      setShowStudentDialog(open);
      if (!open) {
        clearStudentForm();
      }
    },
    [clearStudentForm]
  );

  const startAddStudent = useCallback(() => {
    clearStudentForm();
    setShowStudentDialog(true);
  }, [clearStudentForm]);

  const updateStudentForm = useCallback((field: string, value: string) => {
    setStudentForm((prev) => ({
      ...prev,
      [field]: field === "tanggalLahir" ? normalizeDateValue(value) : value,
    }));
  }, []);

  const resetStudentForm = useCallback(() => {
    clearStudentForm();
    setShowStudentDialog(false);
  }, [clearStudentForm]);

  const updateWalikelasScheduleFilters = useCallback(
    (updates: Partial<WalikelasScheduleFilters>) => {
      setWalikelasScheduleFilters((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  const editStudent = useCallback((student: any) => {
    const mergedRecord = student?.mergedUserData ?? null;
    const resolvedTanggalLahir = normalizeDateValue(
      mergedRecord?.tanggalLahir ?? student?.tanggalLahir
    );
    const resolvedNis = (() => {
      const candidate = mergedRecord?.nis ?? student?.nis;
      if (candidate === undefined || candidate === null) return "";
      return String(candidate);
    })();

    setStudentForm({
      ...createDefaultStudentForm(),
      ...(mergedRecord ?? {}),
      ...student,
      nis: resolvedNis,
      tanggalLahir: resolvedTanggalLahir,
    });
    setEditingStudent(student);
    setShowStudentDialog(true);
  }, []);

  const {
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
    buildSemesterTitle,
  } = useDashboardSemester({ semesters });

  const getEffectiveSemesterId = useCallback(
    (customId?: string | number | null) => {
      if (customId) return String(customId);
      if (isStrictModeActive && enforcedActiveSemester?.id) {
        return String(enforcedActiveSemester.id);
      }
      if (selectedSemesterId) return String(selectedSemesterId);
      if (semesters.length === 1 && semesters[0]?.id) {
        return String(semesters[0].id);
      }
      return "";
    },
    [
      enforcedActiveSemester?.id,
      isStrictModeActive,
      selectedSemesterId,
      semesters,
    ]
  );

  const buildSemesterRequestPayload = useCallback(
    (semesterIdParam?: string | number | null) => {
      const effectiveSemesterId = getEffectiveSemesterId(semesterIdParam);
      const enforcedId =
        enforcedActiveSemester?.id !== undefined &&
        enforcedActiveSemester?.id !== null
          ? String(enforcedActiveSemester.id)
          : null;

      const normalizedEffectiveId =
        effectiveSemesterId && effectiveSemesterId !== ""
          ? effectiveSemesterId
          : null;

      const candidateSemesterId =
        normalizedEffectiveId !== null ? normalizedEffectiveId : enforcedId;

      const shouldUseSemesterId = shouldAttachSemesterId(candidateSemesterId);
      const semesterIdForRequest =
        shouldUseSemesterId && candidateSemesterId ? candidateSemesterId : null;

      const tryResolveMetadata = (
        candidate: string | number | null | undefined
      ): DashboardSemesterMetadata | null => {
        if (candidate === undefined || candidate === null) {
          return null;
        }
        return resolveSemesterMetadata(String(candidate));
      };

      let resolvedMetadata: DashboardSemesterMetadata | null =
        tryResolveMetadata(semesterIdForRequest) ??
        tryResolveMetadata(candidateSemesterId) ??
        tryResolveMetadata(normalizedEffectiveId);

      if (!resolvedMetadata) {
        resolvedMetadata =
          selectedSemesterMetadata ??
          (isStrictModeActive ? enforcedActiveSemester ?? null : null) ??
          (semesters.length === 1
            ? normalizeSemesterMetadata(semesters[0])
            : null);
      }

      return {
        semesterId: semesterIdForRequest,
        tahunAjaran:
          resolvedMetadata?.tahunAjaran !== undefined &&
          resolvedMetadata?.tahunAjaran !== null
            ? resolvedMetadata.tahunAjaran
            : null,
        semester:
          resolvedMetadata?.semesterNumber !== undefined &&
          resolvedMetadata?.semesterNumber !== null
            ? resolvedMetadata.semesterNumber
            : null,
        metadata: resolvedMetadata,
        candidateSemesterId,
      };
    },
    [
      enforcedActiveSemester,
      getEffectiveSemesterId,
      isStrictModeActive,
      normalizeSemesterMetadata,
      resolveSemesterMetadata,
      selectedSemesterMetadata,
      semesters,
      shouldAttachSemesterId,
    ]
  );

  const selectedSemesterMetadata = useMemo(() => {
    if (selectedSemesterId) {
      return resolveSemesterMetadata(selectedSemesterId);
    }
    if (isStrictModeActive && enforcedActiveSemester) {
      return enforcedActiveSemester;
    }
    if (semesters.length === 1) {
      return normalizeSemesterMetadata(semesters[0]);
    }
    return null;
  }, [
    enforcedActiveSemester,
    isStrictModeActive,
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
    selectedSemesterId,
    semesters,
  ]);

  useEffect(() => {
    if (!currentUser?.kelasId) {
      return;
    }

    setWalikelasScheduleFilters((prev) => {
      if (prev.kelasId && prev.kelasId !== "") {
        return prev;
      }
      return {
        ...prev,
        kelasId: String(currentUser.kelasId),
      };
    });
  }, [currentUser?.kelasId]);

  const loadSemesters = useCallback(async () => {
    try {
      const semestersData = await apiService.getSemesters();
      const normalizedSemesters = Array.isArray(semestersData)
        ? semestersData
        : [];

      setSemesters(normalizedSemesters);

      const enforcedId =
        enforcedActiveSemester?.id !== undefined &&
        enforcedActiveSemester?.id !== null
          ? String(enforcedActiveSemester.id)
          : "";

      if (isStrictModeActive && enforcedId) {
        if (selectedSemesterId !== enforcedId) {
          setSelectedSemesterId(enforcedId);
        }
      } else if (normalizedSemesters.length > 0) {
        const activeSemester = normalizedSemesters.find(
          (item) => item?.isActive
        );
        const initialSemesterId =
          activeSemester?.id ?? normalizedSemesters[0]?.id;

        if (initialSemesterId && !selectedSemesterId) {
          setSelectedSemesterId(String(initialSemesterId));
        }
      }
    } catch (error) {
      console.error("Failed to load semesters", error);
      toast({
        title: "Error",
        description: "Gagal memuat data semester",
        variant: "destructive",
      });
    }
  }, [enforcedActiveSemester, isStrictModeActive, selectedSemesterId, toast]);

  const loadWalikelasData = useCallback(
    async (semesterIdParam?: string | number | null) => {
      if (!currentUser) return;

      setLoading(true);
      try {
        const {
          semesterId: requestSemesterId,
          tahunAjaran: requestAcademicYear,
          semester: requestSemesterNumber,
          metadata: semesterMetadata,
        } = buildSemesterRequestPayload(semesterIdParam);

        const hasValidSemesterCombination = Boolean(requestSemesterId) ||
          (requestAcademicYear &&
            requestAcademicYear !== "" &&
            requestSemesterNumber !== null &&
            requestSemesterNumber !== undefined);

        if (isStrictModeActive && !hasValidSemesterCombination) {
          const message = hasEnforcedActiveSemester
            ? "Penegakan semester aktif membutuhkan semester aktif yang valid. Hubungi admin untuk memperbarui daftar semester."
            : "Penegakan semester aktif sedang berjalan. Hubungi admin untuk menetapkan semester aktif sebelum melanjutkan.";
          setUploadBlockedReason(message);
          setClassInfo(null);
          setStudents([]);
          setGrades([]);
          setAttendance([]);
          toast({
            title: "Penegakan semester",
            description: message,
            variant: "destructive",
          });
          return;
        }

        const metadataForCheck =
          semesterMetadata ?? enforcedActiveSemester ?? null;

        if (
          isStrictModeActive &&
          metadataForCheck &&
          isSemesterExpired(metadataForCheck)
        ) {
          const message =
            "Semester aktif telah berakhir. Hubungi admin untuk memperbarui semester aktif sebelum melanjutkan.";
          setUploadBlockedReason(message);
          setClassInfo(null);
          setStudents([]);
          setGrades([]);
          setAttendance([]);
          toast({
            title: "Penegakan semester",
            description: message,
            variant: "destructive",
          });
          return;
        }

        const walikelasId = currentUser?.teacherId;

        if (!walikelasId) {
          console.warn(
            "Walikelas ID tidak ditemukan pada data pengguna saat memuat dashboard wali kelas"
          );
          setClassInfo(null);
          setStudents([]);
          setGrades([]);
          setAttendance([]);
          notifyMissingTeacherId();
          return;
        }

        const [
          classesData,
          studentsData,
          gradesData,
          attendanceData,
          usersResponse,
          allStudentsResponse,
          teachersResponse,
        ] = await Promise.all([
          apiService.getClasses(),
          apiService.getClassStudents(walikelasId),
          apiService.getClassGrades(
            walikelasId,
            requestAcademicYear,
            requestSemesterNumber,
            requestSemesterId
          ),
          apiService.getClassAttendance(
            walikelasId,
            requestAcademicYear,
            requestSemesterNumber,
            requestSemesterId
          ),
          apiService.getUsers(),
          apiService.getStudents(),
          apiService.getTeachers(),
        ]);

        const normalizedGrades = Array.isArray(gradesData) ? gradesData : [];
        const normalizedAttendance = Array.isArray(attendanceData)
          ? attendanceData
          : [];

        const gradesWithMetadata = normalizedGrades.map((grade) => {
          const metadata = resolveSemesterMetadata(
            grade?.semesterId,
            grade?.semesterInfo
          );
          return {
            ...grade,
            semesterMetadata: metadata,
            semesterLabel: metadata ? buildSemesterTitle(metadata) : null,
          };
        });

        const attendanceWithMetadata = normalizedAttendance.map((record) => {
          const metadata = resolveSemesterMetadata(
            record?.semesterId,
            record?.semesterInfo
          );
          return {
            ...record,
            semesterMetadata: metadata,
            semesterLabel: metadata ? buildSemesterTitle(metadata) : null,
          };
        });

        const currentClass = Array.isArray(classesData)
          ? classesData.find((cls) => {
              const candidateWalikelasId =
                cls?.walikelasId ??
                (typeof cls?.walikelas === "object"
                  ? cls?.walikelas?.id
                  : cls?.walikelas);

              if (
                candidateWalikelasId !== undefined &&
                candidateWalikelasId !== null &&
                walikelasId
              ) {
                return String(candidateWalikelasId) === String(walikelasId);
              }
              return false;
            }) ??
            (currentUser?.kelasId
              ? classesData.find(
                  (cls) => String(cls?.id) === String(currentUser.kelasId)
                )
              : null)
          : null;

        setClassInfo(currentClass);

        const classStudents = Array.isArray(studentsData) ? studentsData : [];
        const usersArray = Array.isArray(usersResponse) ? usersResponse : [];
        const studentsArray = Array.isArray(allStudentsResponse)
          ? allStudentsResponse
          : [];
        const teachersArray = Array.isArray(teachersResponse)
          ? teachersResponse
          : [];

        const relevantUsers = usersArray.filter((user) =>
          classStudents.some(
            (student) =>
              String(student?.userId ?? student?.id) === String(user?.id)
          )
        );

        const mergedRecords = mergeUserData(
          relevantUsers,
          studentsArray,
          teachersArray
        );

        const normalizedStudentsMap = new Map<string, any>();

        mergedRecords.forEach((record) => {
          const key = String(record?.userId ?? record?.id ?? "");
          const classStudent = classStudents.find(
            (student) =>
              String(student?.userId ?? student?.id) ===
              String(record?.userId ?? record?.id)
          );

          const mergedStudent = {
            ...(classStudent ?? {}),
            ...record,
          };

          const resolvedTanggalLahir = normalizeDateValue(
            record?.tanggalLahir ??
              classStudent?.tanggalLahir ??
              mergedStudent?.tanggalLahir
          );

          normalizedStudentsMap.set(key, {
            ...mergedStudent,
            id: record?.userId ?? record?.id ?? key,
            userId: record?.userId ?? record?.id ?? key,
            studentId:
              classStudent?.id ??
              record?.studentId ??
              classStudent?.studentId ??
              null,
            kelasId:
              classStudent?.kelasId ??
              record?.kelasId ??
              mergedStudent?.kelasId ??
              null,
            jenisKelamin: normalizeGender(mergedStudent?.jenisKelamin),
            tanggalLahir: resolvedTanggalLahir,
            mergedUserData: record,
          });
        });

        classStudents.forEach((student, index) => {
          const key = String(student?.userId ?? student?.id ?? index);
          if (!normalizedStudentsMap.has(key)) {
            const fallbackStudent = {
              ...student,
              id: key,
              userId: key,
              studentId: student?.id ?? student?.studentId ?? null,
            };

            normalizedStudentsMap.set(key, {
              ...fallbackStudent,
              jenisKelamin: normalizeGender(fallbackStudent?.jenisKelamin),
              tanggalLahir: normalizeDateValue(fallbackStudent?.tanggalLahir),
              mergedUserData: null,
            });
          }
        });

        setStudents(Array.from(normalizedStudentsMap.values()));
        setGrades(gradesWithMetadata);
        setAttendance(attendanceWithMetadata);
        setUploadBlockedReason("");
      } catch (error: any) {
        console.error("Failed to load walikelas data", error);
        const errorCode = typeof error?.code === "string" ? error.code : "";
        const isSemesterNotFound =
          errorCode === "SEMESTER_NOT_FOUND" ||
          (typeof error?.message === "string" &&
            error.message.toLowerCase().includes("semester tidak ditemukan"));

        const description = (() => {
          if (errorCode === "SEMESTER_NOT_ACTIVE") {
            return "Semester yang dipilih belum aktif. Silakan gunakan semester aktif agar data wali kelas dapat ditampilkan.";
          }
          if (errorCode === "ACTIVE_SEMESTER_NOT_FOUND") {
            return "Belum ada semester aktif yang ditetapkan. Pilih atau tetapkan semester aktif untuk melihat data wali kelas.";
          }
          if (isSemesterNotFound) {
            return "Semester tidak ditemukan. Silakan pilih semester lain.";
          }
          return error?.message || "Gagal memuat data wali kelas";
        })();

        toast({
          title: "Error",
          description,
          variant: "destructive",
        });

        if (
          isSemesterNotFound ||
          errorCode === "SEMESTER_NOT_ACTIVE" ||
          errorCode === "ACTIVE_SEMESTER_NOT_FOUND"
        ) {
          setGrades([]);
          setAttendance([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      buildSemesterTitle,
      currentUser,
      enforcedActiveSemester,
      buildSemesterRequestPayload,
      hasEnforcedActiveSemester,
      isSemesterExpired,
      isStrictModeActive,
      notifyMissingTeacherId,
      resolveSemesterMetadata,
      toast,
    ]
  );

  const loadWalikelasSchedules = useCallback(
    async (semesterIdParam?: string | number | null) => {
      if (!currentUser?.teacherId) {
        setWalikelasSchedules([]);
        setWalikelasScheduleMetadata(null);
        setWalikelasScheduleError(null);
        setWalikelasScheduleConflicts(null);
        setIsWalikelasScheduleLoading(false);
        return;
      }

      setIsWalikelasScheduleLoading(true);
      setWalikelasScheduleError(null);
      setWalikelasScheduleConflicts(null);

      try {
        const {
          semesterId: requestSemesterId,
          tahunAjaran: requestAcademicYear,
          semester: requestSemesterNumber,
          metadata: semesterMetadata,
        } = buildSemesterRequestPayload(semesterIdParam);

        const hasValidSemesterCombination = Boolean(requestSemesterId) ||
          (requestAcademicYear &&
            requestAcademicYear !== "" &&
            requestSemesterNumber !== null &&
            requestSemesterNumber !== undefined);

        if (isStrictModeActive && !hasValidSemesterCombination) {
          const message = hasEnforcedActiveSemester
            ? "Penegakan semester aktif membutuhkan semester aktif yang valid. Hubungi admin untuk memperbarui daftar semester."
            : "Penegakan semester aktif sedang berjalan. Hubungi admin untuk menetapkan semester aktif sebelum melanjutkan.";
          setWalikelasSchedules([]);
          setWalikelasScheduleMetadata(null);
          setWalikelasScheduleError(message);
          setIsWalikelasScheduleLoading(false);
          return;
        }

        if (!hasValidSemesterCombination) {
          setWalikelasSchedules([]);
          setWalikelasScheduleMetadata(null);
          setWalikelasScheduleError(null);
          setIsWalikelasScheduleLoading(false);
          return;
        }

        const response = await apiService.getWalikelasSchedules(
          currentUser.teacherId,
          {
            semesterId: requestSemesterId ?? undefined,
            tahun: requestAcademicYear ?? undefined,
            semester:
              requestSemesterNumber !== null &&
              requestSemesterNumber !== undefined &&
              requestSemesterNumber !== ""
                ? requestSemesterNumber
                : undefined,
            kelasId:
              walikelasScheduleFilters.kelasId &&
              walikelasScheduleFilters.kelasId !== ""
                ? walikelasScheduleFilters.kelasId
                : undefined,
            hari:
              walikelasScheduleFilters.hari &&
              walikelasScheduleFilters.hari !== ""
                ? walikelasScheduleFilters.hari
                : undefined,
          }
        );

        const normalizeSchedules = (items: unknown): any[] => {
          if (!Array.isArray(items)) return [];
          return items.filter((item) => item !== null && item !== undefined);
        };

        let schedules: any[] = [];
        let metadata: UnknownRecord | null = null;

        if (Array.isArray(response)) {
          schedules = normalizeSchedules(response);
        } else if (isRecord(response)) {
          const record = response as UnknownRecord;
          const metadataCandidate = isRecord(record.metadata)
            ? (record.metadata as UnknownRecord)
            : isRecord(record.meta)
            ? (record.meta as UnknownRecord)
            : null;

          if (metadataCandidate) {
            metadata = metadataCandidate;
          } else {
            const fallbackMetadata: UnknownRecord = {};
            Object.entries(record).forEach(([key, value]) => {
              if (
                ["items", "data", "schedules", "records", "result"].includes(key)
              ) {
                return;
              }
              if (
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean" ||
                value === null
              ) {
                fallbackMetadata[key] = value;
              }
            });
            metadata =
              Object.keys(fallbackMetadata).length > 0 ? fallbackMetadata : null;
          }

          const potentialKeys = [
            "items",
            "data",
            "schedules",
            "records",
            "result",
          ] as const;

          let schedulesAssigned = false;
          for (const key of potentialKeys) {
            const candidate = record[key];
            if (Array.isArray(candidate)) {
              schedules = normalizeSchedules(candidate);
              schedulesAssigned = true;
              break;
            }
          }

          if (!schedulesAssigned) {
            const normalized = normalizeSchedules([record]);
            schedules = normalized;
          }
        }

        if (metadata && semesterMetadata) {
          metadata = {
            ...metadata,
            semesterLabel:
              (typeof metadata.semesterLabel === "string" &&
              metadata.semesterLabel !== ""
                ? metadata.semesterLabel
                : buildSemesterTitle(semesterMetadata)) ?? undefined,
            semesterTahunAjaran:
              metadata.semesterTahunAjaran ??
              metadata.tahunAjaran ??
              semesterMetadata.tahunAjaran ??
              null,
          } as UnknownRecord;
        }

        const combinedMetadata =
          metadata ??
          (semesterMetadata
            ? {
                semesterId: semesterMetadata.id,
                semesterNama: buildSemesterTitle(semesterMetadata),
                semesterTahunAjaran: semesterMetadata.tahunAjaran,
                semesterLabel: buildSemesterTitle(semesterMetadata),
              }
            : null);

        setWalikelasSchedules(schedules);
        setWalikelasScheduleMetadata(combinedMetadata);
        setWalikelasScheduleError(null);
        setWalikelasScheduleConflicts(null);
      } catch (error: any) {
        console.error("Failed to load walikelas schedules", error);
        const codeValue = error?.code;
        const codeString =
          typeof codeValue === "number"
            ? String(codeValue)
            : typeof codeValue === "string"
            ? codeValue
            : "";
        const message =
          error?.message ||
          (codeString === "404"
            ? "Jadwal tidak ditemukan untuk semester yang dipilih."
            : codeString === "409"
            ? "Terjadi konflik pada jadwal wali kelas."
            : "Gagal memuat jadwal wali kelas");

        setWalikelasSchedules([]);
        setWalikelasScheduleMetadata(null);
        setWalikelasScheduleError(message);

        if (codeString === "409") {
          const details = error?.details;
          const detailRecord = isRecord(details)
            ? (details as UnknownRecord)
            : null;
          const conflictScope =
            typeof detailRecord?.conflictScope === "string"
              ? detailRecord.conflictScope
              : null;
          const conflictsRaw = Array.isArray(detailRecord?.conflicts)
            ? (detailRecord?.conflicts as unknown[])
            : [];
          const conflicts = conflictsRaw
            .map((item) => toScheduleConflictDetail(item))
            .filter((item): item is ScheduleConflictDetail => item !== null);

          setWalikelasScheduleConflicts({
            conflictScope,
            conflicts,
          });
        } else {
          setWalikelasScheduleConflicts(null);
        }

        if (codeString !== "404") {
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
        }
      } finally {
        setIsWalikelasScheduleLoading(false);
      }
    },
    [
      buildSemesterRequestPayload,
      buildSemesterTitle,
      currentUser?.teacherId,
      hasEnforcedActiveSemester,
      isStrictModeActive,
      toast,
      walikelasScheduleFilters,
    ]
  );

  useEffect(() => {
    if (currentUser) {
      loadSemesters();
    }
  }, [currentUser, loadSemesters]);

  useEffect(() => {
    if (!currentUser) return;

    const hasSemesterSelection =
      semesters.length === 0 || selectedSemesterId || semesters.length === 1;

    if (hasSemesterSelection) {
      const effectiveSemesterId = getEffectiveSemesterId();
    loadWalikelasData(effectiveSemesterId);
    }
  }, [
    currentUser,
    getEffectiveSemesterId,
    loadWalikelasData,
    selectedSemesterId,
    semesters,
  ]);

  useEffect(() => {
    if (!currentUser?.teacherId) {
      setWalikelasSchedules([]);
      setWalikelasScheduleMetadata(null);
      setWalikelasScheduleError(null);
      setWalikelasScheduleConflicts(null);
      setIsWalikelasScheduleLoading(false);
      return;
    }

    loadWalikelasSchedules();
  }, [currentUser?.teacherId, loadWalikelasSchedules]);

  useEffect(() => {
    if (!isStrictModeActive) {
      setUploadBlockedReason("");
      return;
    }

    if (!hasEnforcedActiveSemester) {
      setUploadBlockedReason(
        "Penegakan semester aktif membutuhkan semester aktif yang valid. Hubungi admin untuk menetapkan semester aktif."
      );
      return;
    }

    if (enforcedActiveSemester && isSemesterExpired(enforcedActiveSemester)) {
      setUploadBlockedReason(
        "Semester aktif yang diberlakukan telah berakhir. Hubungi admin untuk memperbarui semester aktif sebelum melanjutkan."
      );
      return;
    }

    setUploadBlockedReason("");
  }, [
    enforcedActiveSemester,
    hasEnforcedActiveSemester,
    isSemesterExpired,
    isStrictModeActive,
  ]);

  useEffect(() => {
    let warningMessage = "";

    if (isRelaxedMode) {
      if (enforcedActiveSemester && isSemesterExpired(enforcedActiveSemester)) {
        warningMessage =
          "Semester aktif sebelumnya telah berakhir. Anda dapat memilih semester secara manual atau hubungi admin untuk memperbarui semester aktif.";
      } else if (!hasEnforcedActiveSemester) {
        warningMessage =
          "Belum ada semester aktif yang ditetapkan. Silakan pilih semester secara manual atau hubungi admin untuk bantuan lebih lanjut.";
      }
    }

    setSemesterWarning(warningMessage);

    if (warningMessage && semesterWarningRef.current !== warningMessage) {
      toast({
        title: "Informasi Semester",
        description: warningMessage,
      });
      semesterWarningRef.current = warningMessage;
    }

    if (!warningMessage) {
      semesterWarningRef.current = null;
    }
  }, [
    enforcedActiveSemester,
    hasEnforcedActiveSemester,
    isRelaxedMode,
    isSemesterExpired,
    toast,
  ]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return students.filter((student) => {
      const name = (student.nama ?? "").toLowerCase();
      const nis = (student.nis ?? "").toLowerCase();
      const nisn = (student.nisn ?? "").toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        nis.includes(normalizedSearch) ||
        nisn.includes(normalizedSearch)
      );
    });
  }, [searchTerm, students]);

  const unverifiedGrades = useMemo(
    () => grades.filter((grade) => !grade.verified),
    [grades]
  );

  const attendancePercentage = useMemo(() => {
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter((a) => a.status === "hadir").length;
    return totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;
  }, [attendance]);

  const studentsWithVerifiedGrades = useMemo(
    () =>
      students.filter((student) =>
        grades.some((grade) => {
          const identifiers = [
            student.studentId,
            student.userId,
            student.id,
          ].filter((value) => value !== undefined && value !== null);
          return (
            identifiers.some(
              (value) => String(value) === String(grade.studentId)
            ) && grade.verified
          );
        })
      ),
    [grades, students]
  );

  const handleStudentSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (
        !studentForm.nama ||
        !studentForm.nis ||
        !studentForm.nisn ||
        !studentForm.username
      ) {
        toast({
          title: "Error",
          description: "Mohon lengkapi field wajib",
          variant: "destructive",
        });
        return;
      }

      const editingIdentifiers = new Set(
        [editingStudent?.id, editingStudent?.studentId, editingStudent?.userId]
          .filter((value) => value !== undefined && value !== null)
          .map((value) => String(value))
      );

      const isSameStudent = (candidate: any) => {
        if (editingIdentifiers.size === 0) {
          return false;
        }

        const candidateIds = [candidate?.id, candidate?.studentId, candidate?.userId]
          .filter((value) => value !== undefined && value !== null)
          .map((value) => String(value));

        return candidateIds.some((value) => editingIdentifiers.has(value));
      };

      const trimmedNis = studentForm.nis.trim();
      const trimmedNisn = studentForm.nisn.trim();
      const trimmedUsername = studentForm.username.trim();

      const nisnExists =
        trimmedNisn !== "" &&
        students.some(
          (s) =>
            !isSameStudent(s) &&
            String(s?.nisn ?? "").trim() === trimmedNisn
        );

      const nisExists =
        trimmedNis !== "" &&
        students.some(
          (s) =>
            !isSameStudent(s) && String(s?.nis ?? "").trim() === trimmedNis
        );

      const usernameExists = students.some(
        (s) =>
          !isSameStudent(s) &&
          String(s?.username ?? "").trim() === trimmedUsername
      );

      if (nisnExists) {
        toast({
          title: "Error",
          description: "NISN sudah digunakan oleh siswa lain",
          variant: "destructive",
        });
        return;
      }

      if (nisExists) {
        toast({
          title: "Error",
          description: "NIS sudah digunakan oleh siswa lain",
          variant: "destructive",
        });
        return;
      }

      if (usernameExists) {
        toast({
          title: "Error",
          description: "Username sudah digunakan oleh siswa lain",
          variant: "destructive",
        });
        return;
      }

      try {
        const targetStudentId =
          editingStudent?.studentId ?? editingStudent?.id ?? null;

        const walikelasId = currentUser?.teacherId;
        if (!walikelasId) {
          notifyMissingTeacherId();
          return;
        }

        const studentData = {
          users: {
            username: studentForm.nisn,
            password: studentForm.password || "default123",
            role: "siswa",
            email: studentForm.email,
          },
          students: {
            ...(targetStudentId && { id: targetStudentId }),
            nama: studentForm.nama,
            nis: studentForm.nis,
            nisn: studentForm.nisn,
            kelasId: currentUser?.kelasId,
            alamat: studentForm.alamat,
            tanggalLahir: studentForm.tanggalLahir,
            jenisKelamin: studentForm.jenisKelamin,
            namaOrangTua: studentForm.namaOrangTua,
            pekerjaanOrangTua: studentForm.pekerjaanOrangTua,
            nomorHP: studentForm.nomorHP,
            tahunMasuk: studentForm.tahunMasuk,
          },
        };

        let result;
        if (editingStudent && targetStudentId) {
          result = await apiService.updateClassStudent(
            walikelasId,
            targetStudentId,
            studentData
          );
        } else {
          result = await apiService.addClassStudent(walikelasId, studentData);
        }

        if (result.success) {
          toast({
            title: "Berhasil",
            description: `Siswa berhasil ${
              editingStudent ? "diupdate" : "ditambahkan"
            }`,
          });

          resetStudentForm();
          loadWalikelasData();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Gagal ${
            editingStudent ? "mengupdate" : "menambahkan"
          } siswa`,
          variant: "destructive",
        });
      }
    },
    [
      currentUser,
      editingStudent,
      loadWalikelasData,
      notifyMissingTeacherId,
      resetStudentForm,
      studentForm,
      students,
      toast,
    ]
  );

  const handleDeleteStudent = useCallback(
    async (studentId: string) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
        try {
          const targetStudentId = (() => {
            const candidate = students.find((s) => {
              const identifiers = [s.studentId, s.userId, s.id].filter(
                (value) => value !== undefined && value !== null
              );
              return identifiers.some(
                (value) => String(value) === String(studentId)
              );
            });
            return candidate?.studentId ?? studentId;
          })();

          const walikelasId = currentUser?.teacherId;
          if (!walikelasId) {
            notifyMissingTeacherId();
            return;
          }

          const result = await apiService.deleteClassStudent(
            walikelasId,
            targetStudentId
          );
          if (result.success) {
            toast({
              title: "Berhasil",
              description: "Siswa berhasil dihapus",
            });
            loadWalikelasData();
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Gagal menghapus siswa",
            variant: "destructive",
          });
        }
      }
    },
    [currentUser, loadWalikelasData, notifyMissingTeacherId, students, toast]
  );

  const handleVerifyGrade = useCallback(
    async (gradeId: string) => {
      try {
        const walikelasId = currentUser?.teacherId;
        if (!walikelasId) {
          notifyMissingTeacherId();
          return;
        }

        const result = await apiService.verifyGrade(walikelasId, gradeId);
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Nilai berhasil diverifikasi",
          });
          loadWalikelasData();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memverifikasi nilai",
          variant: "destructive",
        });
      }
    },
    [currentUser, loadWalikelasData, notifyMissingTeacherId, toast]
  );

  const handleVerifyAll = useCallback(async () => {
    if (unverifiedGrades.length === 0) return;

    if (
      window.confirm(
        `Apakah Anda yakin ingin memverifikasi semua ${unverifiedGrades.length} nilai yang belum diverifikasi?`
      )
    ) {
      setLoading(true);
      try {
        const walikelasId = currentUser?.teacherId;
        if (!walikelasId) {
          notifyMissingTeacherId();
          return;
        }

        const verifyPromises = unverifiedGrades.map((grade) =>
          apiService.verifyGrade(walikelasId, grade.id)
        );

        await Promise.all(verifyPromises);

        toast({
          title: "Berhasil",
          description: `${unverifiedGrades.length} nilai berhasil diverifikasi`,
        });

        loadWalikelasData();
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memverifikasi beberapa nilai",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [
    currentUser,
    loadWalikelasData,
    notifyMissingTeacherId,
    toast,
    unverifiedGrades,
  ]);

  const handlePrintReport = useCallback(
    async (student: any) => {
      try {
        const {
          semesterId: requestSemesterId,
          tahunAjaran: requestAcademicYear,
          semester: requestSemesterNumber,
          metadata: semesterMetadata,
        } = buildSemesterRequestPayload();

        const hasValidSemesterCombination = Boolean(requestSemesterId) ||
          (requestAcademicYear &&
            requestAcademicYear !== "" &&
            requestSemesterNumber !== null &&
            requestSemesterNumber !== undefined);

        if (isStrictModeActive && !hasValidSemesterCombination) {
          toast({
            title: "Penegakan semester",
            description:
              "Penegakan semester aktif membutuhkan semester aktif yang valid. Hubungi admin untuk menetapkan semester aktif sebelum mencetak raport.",
            variant: "destructive",
          });
          return;
        }

        const metadataForCheck =
          semesterMetadata ?? enforcedActiveSemester ?? null;

        if (
          isStrictModeActive &&
          metadataForCheck &&
          isSemesterExpired(metadataForCheck)
        ) {
          toast({
            title: "Penegakan semester",
            description:
              "Semester aktif telah berakhir. Hubungi admin untuk memperbarui semester aktif sebelum mencetak raport.",
            variant: "destructive",
          });
          return;
        }

        const walikelasId = currentUser?.teacherId;
        if (!walikelasId) {
          notifyMissingTeacherId();
          return;
        }

        const normalizedStudentId = String(
          student?.studentId ?? student?.id ?? student?.userId ?? ""
        ).trim();

        if (!normalizedStudentId) {
          toast({
            title: "Error",
            description: "ID siswa tidak ditemukan",
            variant: "destructive",
          });
          return;
        }

        const reportData = await apiService.getClassStudentReport(
          walikelasId,
          normalizedStudentId,
          requestAcademicYear,
          requestSemesterNumber,
          requestSemesterId
        );

        if (!reportData) {
          toast({
            title: "Error",
            description: "Data raport tidak ditemukan",
            variant: "destructive",
          });
          return;
        }

        const fallbackSemesterId =
          requestSemesterId ??
          (semesterMetadata?.id ? String(semesterMetadata.id) : getEffectiveSemesterId());

        const resolvedSemesterMetadata = resolveSemesterMetadata(
          reportData?.semesterId ?? fallbackSemesterId,
          reportData?.semesterInfo
        );

        const enrichedReportData = {
          ...reportData,
          semesterInfo:
            resolvedSemesterMetadata || reportData?.semesterInfo || undefined,
          semesterTanggalMulai:
            reportData?.semesterTanggalMulai ??
            resolvedSemesterMetadata?.tanggalMulai ??
            reportData?.semesterInfo?.tanggalMulai ??
            reportData?.semesterInfo?.startDate ??
            null,
          semesterTanggalSelesai:
            reportData?.semesterTanggalSelesai ??
            resolvedSemesterMetadata?.tanggalSelesai ??
            reportData?.semesterInfo?.tanggalSelesai ??
            reportData?.semesterInfo?.endDate ??
            null,
          semesterJumlahHariBelajar:
            reportData?.semesterJumlahHariBelajar ??
            resolvedSemesterMetadata?.jumlahHariBelajar ??
            reportData?.semesterInfo?.jumlahHariBelajar ??
            reportData?.semesterInfo?.learningDays ??
            null,
          semesterCatatan:
            reportData?.semesterCatatan ??
            resolvedSemesterMetadata?.catatan ??
            reportData?.semesterInfo?.catatan ??
            reportData?.semesterInfo?.notes ??
            null,
        };

        printReport(enrichedReportData);
      } catch (error: any) {
        console.error("Failed to print report", error);
        const isSemesterNotFound =
          error?.code === "SEMESTER_NOT_FOUND" ||
          (typeof error?.message === "string" &&
            error.message.toLowerCase().includes("semester tidak ditemukan"));

        toast({
          title: "Error",
          description: isSemesterNotFound
            ? "Semester tidak ditemukan. Silakan pilih semester lain."
            : "Gagal mencetak raport",
          variant: "destructive",
        });
      }
    },
    [
      buildSemesterRequestPayload,
      currentUser,
      enforcedActiveSemester,
      getEffectiveSemesterId,
      isSemesterExpired,
      isStrictModeActive,
      notifyMissingTeacherId,
      resolveSemesterMetadata,
      toast,
    ]
  );

  const handleSemesterChange = useCallback((value: string) => {
    setSelectedSemesterId(String(value));
  }, []);

  return {
    students,
    grades,
    attendance,
    classInfo,
    loading,
    activeSection,
    setActiveSection,
    searchTerm,
    setSearchTerm,
    semesters,
    selectedSemesterId,
    handleSemesterChange,
    selectedSemesterMetadata,
    walikelasSchedules,
    walikelasScheduleMetadata,
    walikelasScheduleError,
    walikelasScheduleConflicts,
    walikelasScheduleFilters,
    updateWalikelasScheduleFilters,
    isWalikelasScheduleLoading,
    loadWalikelasSchedules,
    enforcementMode,
    enforcedActiveSemester,
    hasEnforcedActiveSemester,
    isStrictMode,
    isStrictModeActive,
    isRelaxedMode,
    semesterWarning,
    uploadBlockedReason,
    showStudentDialog,
    handleStudentDialogChange,
    startAddStudent,
    editingStudent,
    studentForm,
    updateStudentForm,
    handleStudentSubmit,
    handleDeleteStudent,
    filteredStudents,
    unverifiedGrades,
    handleVerifyGrade,
    handleVerifyAll,
    attendancePercentage,
    studentsWithVerifiedGrades,
    handlePrintReport,
    resetStudentForm,
    editStudent,
  };
};

export default useWalikelasDashboard;
