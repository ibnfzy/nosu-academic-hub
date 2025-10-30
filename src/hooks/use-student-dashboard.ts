import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useDashboardSemester,
  type DashboardSemesterMetadata,
  type DashboardSemesterRecord,
} from "@/hooks/use-dashboard-semester";
import { useSemesterEnforcement } from "@/hooks/use-semester-enforcement";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import {
  calculateAttendanceStats,
  calculateAverage,
  printReport,
} from "@/utils/helpers";

export interface StudentUser {
  id: number | string;
  studentId?: number | string | null;
  nama?: string;
  [key: string]: unknown;
}

export interface StudentGrade {
  id: number;
  studentId: number;
  kelasId: number;
  subjectId: number;
  teacherId: number;
  tahunAjaran: string;
  semester: number;
  tanggal: string;
  status?: string;
  keterangan?: string;
  createdAt?: string;
  subjectName: string;
  jenis?: string;
  verified?: number;
  nilai?: string | number;
  [key: string]: unknown;
}

export interface StudentAttendanceRecord {
  id: number | string;
  subjectName: string;
  tanggal: string;
  status: string;
  keterangan?: string | null;
  semesterInfo?: DashboardSemesterRecord;
  [key: string]: unknown;
}

export interface SubjectGradeGroup {
  subjectId: number;
  subjectName: string;
  grades: StudentGrade[];
}

export interface AttendanceStats {
  hadir: number;
  sakit: number;
  alfa: number;
  izin: number;
  total: number;
  persentase: number;
}

interface UseStudentDashboardParams {
  currentUser?: StudentUser | null;
}

export const useStudentDashboard = ({
  currentUser,
}: UseStudentDashboardParams) => {
  const { toast } = useToast();
  const studentId = currentUser?.studentId ?? currentUser?.id ?? null;

  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [semesters, setSemesters] = useState<DashboardSemesterRecord[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedSemesterMetadata, setSelectedSemesterMetadata] =
    useState<DashboardSemesterMetadata | null>(null);
  const [semesterError, setSemesterError] = useState<string>("");
  const [semesterWarning, setSemesterWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const {
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
    buildSemesterDateRange,
    buildSemesterTitle,
    formatStudyDays,
  } = useDashboardSemester({ semesters });

  const {
    mode: enforcementMode,
    isStrictMode,
    isStrictModeActive,
    isRelaxedMode,
    activeSemesterMetadata: enforcedActiveSemester,
    hasActiveSemester: hasEnforcedActiveSemester,
    loading: enforcementLoading,
    shouldAttachSemesterId,
    isSemesterExpired,
  } = useSemesterEnforcement();

  const semesterWarningRef = useRef<string | null>(null);

  const getSemesterMetadata = useCallback(
    (semesterId?: string | number | null) => {
      if (semesterId) {
        return resolveSemesterMetadata(semesterId);
      }
      if (selectedSemesterId) {
        return resolveSemesterMetadata(selectedSemesterId);
      }
      return null;
    },
    [resolveSemesterMetadata, selectedSemesterId]
  );

  const getEffectiveSemesterId = useCallback(
    (customId?: string | null): string => {
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

  const loadSemesters = useCallback(async () => {
    if (!studentId) return;

    try {
      const semestersResponse = await apiService.getSemesters();
      const normalizedSemesters = Array.isArray(semestersResponse)
        ? semestersResponse
        : Object.values(semestersResponse || {}).filter(
            (item): item is DashboardSemesterRecord =>
              item !== null && typeof item === "object"
          );

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
        setSelectedSemesterMetadata(enforcedActiveSemester);
      } else if (normalizedSemesters.length > 0) {
        const activeSemester = normalizedSemesters.find((item) => item?.isActive);
        const initialRecord = activeSemester || normalizedSemesters[0];
        const initialId = initialRecord?.id ? String(initialRecord.id) : "";

        if (initialId && !selectedSemesterId) {
          setSelectedSemesterId(initialId);
          setSelectedSemesterMetadata(normalizeSemesterMetadata(initialRecord));
        }
      } else {
        setSelectedSemesterId("");
        setSelectedSemesterMetadata(null);
      }
    } catch (error) {
      console.error("Failed to load semesters", error);
      toast({
        title: "Error",
        description: "Gagal memuat daftar semester",
        variant: "destructive",
      });
    }
  }, [
    enforcedActiveSemester,
    isStrictModeActive,
    normalizeSemesterMetadata,
    selectedSemesterId,
    toast,
    studentId,
  ]);

  const loadStudentData = useCallback(
    async (semesterIdParam?: string | null) => {
      if (!studentId) return;

      if (enforcementLoading) {
        return;
      }

      const hasSemesters = semesters.length > 0;
      const effectiveSemesterId = hasSemesters
        ? getEffectiveSemesterId(semesterIdParam)
        : "";

      const enforcedId =
        enforcedActiveSemester?.id !== undefined &&
        enforcedActiveSemester?.id !== null
          ? String(enforcedActiveSemester.id)
          : null;

      const candidateSemesterId =
        (effectiveSemesterId && effectiveSemesterId !== ""
          ? effectiveSemesterId
          : null) ?? enforcedId;

      const shouldUseSemesterId = shouldAttachSemesterId(candidateSemesterId);
      const requestSemesterId = shouldUseSemesterId
        ? candidateSemesterId
        : null;

      if (isStrictModeActive && !requestSemesterId) {
        const message = hasEnforcedActiveSemester
          ? "Penegakan semester aktif membutuhkan semester aktif yang valid. Silakan hubungi admin untuk memperbarui daftar semester."
          : "Penegakan semester aktif sedang berjalan. Silakan hubungi admin untuk menetapkan semester aktif sebelum melanjutkan.";
        setGrades([]);
        setAttendance([]);
        setSemesterError(message);
        toast({
          title: "Penegakan semester",
          description: message,
          variant: "destructive",
        });
        return;
      }

      if (!isStrictModeActive && hasSemesters && !candidateSemesterId) {
        setGrades([]);
        setAttendance([]);
        setSemesterError("Silakan pilih semester untuk menampilkan data.");
        return;
      }

      setLoading(true);
      setSemesterError("");

      const selectionMetadata = candidateSemesterId
        ? resolveSemesterMetadata(candidateSemesterId)
        : null;
      const effectiveMetadata = selectionMetadata ?? enforcedActiveSemester ?? null;

      if (selectionMetadata) {
        setSelectedSemesterMetadata(selectionMetadata);
      } else if (!hasSemesters) {
        setSelectedSemesterMetadata(enforcedActiveSemester ?? null);
      }

      if (isStrictModeActive && effectiveMetadata && isSemesterExpired(effectiveMetadata)) {
        const message =
          "Semester aktif telah berakhir. Hubungi admin untuk memperbarui semester aktif sebelum melanjutkan.";
        setGrades([]);
        setAttendance([]);
        setSemesterError(message);
        setLoading(false);
        toast({
          title: "Penegakan semester",
          description: message,
          variant: "destructive",
        });
        return;
      }

      try {
        const tahunParam = effectiveMetadata?.tahunAjaran ?? null;
        const semesterNumberParam = effectiveMetadata?.semesterNumber ?? null;

        const [gradesResponse, attendanceResponse] = await Promise.all([
          apiService.getStudentGrades(
            studentId,
            tahunParam,
            semesterNumberParam,
            requestSemesterId
          ),
          apiService.getStudentAttendance(
            studentId,
            tahunParam,
            semesterNumberParam,
            requestSemesterId
          ),
        ]);

        const gradesData: StudentGrade[] = Array.isArray(gradesResponse)
          ? (gradesResponse as StudentGrade[])
          : (Object.values(gradesResponse || {}).filter(
              (item): item is StudentGrade => typeof item === "object"
            ) as StudentGrade[]).map((item) => ({
              ...item,
              nilai: item.nilai ? parseFloat(item.nilai as string) : 0,
            }));

        const attendanceData: StudentAttendanceRecord[] = Array.isArray(
          attendanceResponse
        )
          ? (attendanceResponse as StudentAttendanceRecord[])
          : Object.values(attendanceResponse || {}).filter(
              (item): item is StudentAttendanceRecord => typeof item === "object"
            );

        setGrades(gradesData);
        setAttendance(attendanceData);

        if (!selectionMetadata) {
          const gradeSemesterInfo = (
            gradesData.find(
              (item) =>
                (item as unknown as { semesterInfo?: DashboardSemesterRecord })
                  ?.semesterInfo
            ) as unknown as { semesterInfo?: DashboardSemesterRecord }
          )?.semesterInfo;
          const attendanceSemesterInfo = (
            (attendanceData as Array<{
              semesterInfo?: DashboardSemesterRecord;
            }>).find((item) => item?.semesterInfo) || null
          )?.semesterInfo;
          const fallbackRecord =
            (gradeSemesterInfo || attendanceSemesterInfo || null) as
              | DashboardSemesterRecord
              | null;
          const fallbackMetadata = candidateSemesterId
            ? resolveSemesterMetadata(candidateSemesterId, fallbackRecord)
            : resolveSemesterMetadata(requestSemesterId, fallbackRecord);
          if (fallbackMetadata) {
            setSelectedSemesterMetadata(fallbackMetadata);
          }
        }
      } catch (error: any) {
        console.error("Failed to load student data", error);
        const errorCode = typeof error?.code === "string" ? error.code : "";
        const isSemesterNotFound =
          errorCode === "SEMESTER_NOT_FOUND" ||
          (typeof error?.message === "string" &&
            error.message.toLowerCase().includes("semester tidak ditemukan"));

        const semesterValidationMessage = (() => {
          if (!error?.errors) return "";
          const semesterIdError = error.errors.semesterId;
          if (Array.isArray(semesterIdError)) {
            return semesterIdError.join(" ");
          }
          if (semesterIdError && typeof semesterIdError === "string") {
            return semesterIdError;
          }
          return "";
        })();

        const friendlyMessage = (() => {
          if (errorCode === "SEMESTER_NOT_ACTIVE") {
            return "Semester yang dipilih belum aktif. Silakan gunakan semester aktif yang berlaku.";
          }
          if (errorCode === "ACTIVE_SEMESTER_NOT_FOUND") {
            return "Belum ada semester aktif yang ditetapkan. Silakan pilih semester aktif terlebih dahulu.";
          }
          if (isSemesterNotFound) {
            return "Semester tidak ditemukan. Silakan pilih semester lain.";
          }
          return semesterValidationMessage || "Gagal memuat data siswa";
        })();

        setGrades([]);
        setAttendance([]);
        setSemesterError(friendlyMessage);

        toast({
          title: "Error",
          description: friendlyMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      enforcementLoading,
      enforcedActiveSemester,
      getEffectiveSemesterId,
      hasEnforcedActiveSemester,
      isSemesterExpired,
      isStrictModeActive,
      resolveSemesterMetadata,
      semesters,
      shouldAttachSemesterId,
      toast,
      studentId,
    ]
  );

  const handlePrintReport = useCallback(async () => {
    if (!studentId) return;

    const hasSemesters = semesters.length > 0;
    const effectiveSemesterId = hasSemesters
      ? getEffectiveSemesterId()
      : "";

    if (hasSemesters && !effectiveSemesterId) {
      const message = "Silakan pilih semester yang valid sebelum mencetak raport.";
      setSemesterError(message);
      toast({
        title: "Peringatan",
        description: message,
        variant: "destructive",
      });
      return;
    }

    try {
      const metadata = effectiveSemesterId
        ? resolveSemesterMetadata(effectiveSemesterId)
        : null;

      const reportData = await apiService.getStudentReport(
        studentId,
        metadata?.tahunAjaran ?? null,
        metadata?.semesterNumber ?? null,
        effectiveSemesterId || null
      );

      const resolvedSemesterMetadata = resolveSemesterMetadata(
        (reportData as DashboardSemesterRecord)?.semesterId ?? effectiveSemesterId,
        (reportData as DashboardSemesterRecord)?.semesterInfo ?? null
      );

      const enrichedReportData = {
        ...reportData,
        semesterInfo:
          resolvedSemesterMetadata || metadata || reportData?.semesterInfo || undefined,
        semesterTanggalMulai:
          reportData?.semesterTanggalMulai ??
          resolvedSemesterMetadata?.tanggalMulai ??
          metadata?.tanggalMulai ??
          (reportData as DashboardSemesterRecord)?.startDate ??
          null,
        semesterTanggalSelesai:
          reportData?.semesterTanggalSelesai ??
          resolvedSemesterMetadata?.tanggalSelesai ??
          metadata?.tanggalSelesai ??
          (reportData as DashboardSemesterRecord)?.endDate ??
          null,
        semesterJumlahHariBelajar:
          reportData?.semesterJumlahHariBelajar ??
          resolvedSemesterMetadata?.jumlahHariBelajar ??
          metadata?.jumlahHariBelajar ??
          (reportData as DashboardSemesterRecord)?.jumlahHariBelajar ??
          null,
        semesterCatatan:
          reportData?.semesterCatatan ??
          resolvedSemesterMetadata?.catatan ??
          metadata?.catatan ??
          (reportData as DashboardSemesterRecord)?.catatan ??
          null,
      };

      printReport(enrichedReportData);
    } catch (error: any) {
      console.error("Failed to print report", error);
      const errorCode = typeof error?.code === "string" ? error.code : "";
      const isSemesterNotFound =
        errorCode === "SEMESTER_NOT_FOUND" ||
        (typeof error?.message === "string" &&
          error.message.toLowerCase().includes("semester tidak ditemukan"));

      const semesterValidationMessage = (() => {
        if (!error?.errors) return "";
        const semesterIdError = error.errors.semesterId;
        if (Array.isArray(semesterIdError)) {
          return semesterIdError.join(" ");
        }
        if (semesterIdError && typeof semesterIdError === "string") {
          return semesterIdError;
        }
        return "";
      })();

      const friendlyMessage = (() => {
        if (errorCode === "SEMESTER_NOT_ACTIVE") {
          return "Semester yang dipilih belum aktif. Cetak raport hanya bisa dilakukan pada semester aktif.";
        }
        if (errorCode === "ACTIVE_SEMESTER_NOT_FOUND") {
          return "Belum ada semester aktif yang ditetapkan. Pilih semester aktif sebelum mencetak raport.";
        }
        if (isSemesterNotFound) {
          return "Semester tidak ditemukan. Silakan pilih semester lain.";
        }
        return semesterValidationMessage || "Gagal mencetak raport";
      })();

      toast({
        title: "Error",
        description: friendlyMessage,
        variant: "destructive",
      });
    }
  }, [
    getEffectiveSemesterId,
    resolveSemesterMetadata,
    semesters,
    toast,
    studentId,
  ]);

  const handleSemesterChange = useCallback(
    (semesterId: string) => {
      setSelectedSemesterId(semesterId);
      setSemesterError("");
      const metadata = resolveSemesterMetadata(semesterId);
      setSelectedSemesterMetadata(metadata);
    },
    [resolveSemesterMetadata]
  );

  useEffect(() => {
    if (!studentId) return;
    loadSemesters();
  }, [loadSemesters, studentId]);

  useEffect(() => {
    if (!studentId) return;
    const shouldLoadWithoutSemester = semesters.length === 0;
    if (shouldLoadWithoutSemester || selectedSemesterId) {
      loadStudentData();
    }
  }, [loadStudentData, selectedSemesterId, semesters.length, studentId]);

  useEffect(() => {
    if (enforcementLoading) {
      return;
    }

    let warningMessage = "";

    if (isRelaxedMode) {
      if (enforcedActiveSemester && isSemesterExpired(enforcedActiveSemester)) {
        warningMessage =
          "Semester aktif sebelumnya telah berakhir. Anda dapat memilih semester secara manual atau hubungi admin untuk memperbarui semester aktif. Catatan: semester aktif sebelumnya tidak lagi berlaku.";
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
    enforcementLoading,
    enforcedActiveSemester,
    hasEnforcedActiveSemester,
    isRelaxedMode,
    isSemesterExpired,
    toast,
  ]);

  const averageGrade = useMemo(() => calculateAverage(grades), [grades]);
  const attendanceStats = useMemo<AttendanceStats>(
    () =>
      calculateAttendanceStats(attendance, {
        semesterMetadata: selectedSemesterMetadata,
      }) as AttendanceStats,
    [attendance, selectedSemesterMetadata]
  );

  const subjectGrades = useMemo<SubjectGradeGroup[]>(() => {
    return grades.reduce<SubjectGradeGroup[]>((acc, grade) => {
      const subject = acc.find((s) => s.subjectId === grade.subjectId);
      if (subject) {
        subject.grades.push(grade);
      } else {
        acc.push({
          subjectId: grade.subjectId,
          subjectName: grade.subjectName,
          grades: [grade],
        });
      }
      return acc;
    }, []);
  }, [grades]);

  return {
    attendance,
    attendanceStats,
    averageGrade,
    buildSemesterDateRange,
    buildSemesterTitle,
    formatStudyDays,
    enforcementMode,
    enforcedActiveSemester,
    hasEnforcedActiveSemester,
    grades,
    getSemesterMetadata,
    handlePrintReport,
    handleSemesterChange,
    isRelaxedMode,
    isStrictMode,
    isStrictModeActive,
    loading,
    selectedSemesterId,
    selectedSemesterMetadata,
    semesterError,
    semesterWarning,
    semesters,
    subjectGrades,
  };
};

export type UseStudentDashboardReturn = ReturnType<typeof useStudentDashboard>;
