import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import {
  calculateAttendanceStats,
  calculateAverage,
  formatDate,
  printReport,
} from "@/utils/helpers";

export interface StudentUser {
  id: number | string;
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
  semesterInfo?: SemesterRecord;
  [key: string]: unknown;
}

export type SemesterRecord = {
  id?: string | number;
  tahun?: string;
  tahunAjaran?: string;
  academicYear?: string;
  year?: string;
  semester?: number | string;
  semesterNumber?: number | string;
  term?: number | string;
  startDate?: string;
  endDate?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  jumlahHariBelajar?: number | string;
  learningDays?: number | string;
  totalSchoolDays?: number | string;
  hariEfektif?: number | string;
  catatan?: string;
  notes?: string;
  keterangan?: string;
  isActive?: boolean;
  [key: string]: unknown;
};

export interface SemesterMetadata {
  id: string | null;
  tahunAjaran: string | null;
  semesterNumber: number | string | null;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  jumlahHariBelajar: number | string | null;
  catatan: string;
  isActive: boolean;
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
  const userId = currentUser?.id ?? null;

  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedSemesterMetadata, setSelectedSemesterMetadata] =
    useState<SemesterMetadata | null>(null);
  const [semesterError, setSemesterError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const normalizeSemesterMetadata = useCallback(
    (semesterItem?: SemesterRecord | null): SemesterMetadata | null => {
      if (!semesterItem) return null;

      const semesterRaw =
        semesterItem.semester ?? semesterItem.semesterNumber ?? semesterItem.term;
      let semesterNumber: number | string | null = null;

      if (semesterRaw !== null && semesterRaw !== undefined) {
        const parsed = Number(semesterRaw);
        semesterNumber = Number.isNaN(parsed) ? semesterRaw : parsed;
      }

      return {
        id: semesterItem.id ? String(semesterItem.id) : null,
        tahunAjaran:
          semesterItem.tahunAjaran ||
          semesterItem.tahun ||
          semesterItem.academicYear ||
          semesterItem.year ||
          null,
        semesterNumber: semesterNumber ?? null,
        tanggalMulai: semesterItem.tanggalMulai || semesterItem.startDate || null,
        tanggalSelesai:
          semesterItem.tanggalSelesai || semesterItem.endDate || null,
        jumlahHariBelajar:
          semesterItem.jumlahHariBelajar ??
          semesterItem.learningDays ??
          semesterItem.totalSchoolDays ??
          semesterItem.hariEfektif ??
          null,
        catatan:
          (semesterItem.catatan ||
            semesterItem.notes ||
            semesterItem.keterangan ||
            "") ?? "",
        isActive: Boolean(semesterItem.isActive),
      };
    },
    []
  );

  const getSemesterRecordById = useCallback(
    (semesterId: string | number | null): SemesterRecord | null => {
      if (!semesterId) return null;
      return (
        semesters.find((item) => String(item.id) === String(semesterId)) || null
      );
    },
    [semesters]
  );

  const resolveSemesterMetadata = useCallback(
    (
      semesterId: string | number | null,
      fallback: SemesterRecord | null = null
    ): SemesterMetadata | null => {
      const record = getSemesterRecordById(semesterId) || fallback;
      return normalizeSemesterMetadata(record);
    },
    [getSemesterRecordById, normalizeSemesterMetadata]
  );

  const formatSemesterNumberLabel = useCallback(
    (value: number | string | null | undefined): string | null => {
      if (value === null || value === undefined || value === "") return null;
      const numericValue = Number(value);
      if (!Number.isNaN(numericValue)) {
        if (numericValue === 1) return "Semester Ganjil";
        if (numericValue === 2) return "Semester Genap";
        return `Semester ${numericValue}`;
      }
      return typeof value === "string" ? value : null;
    },
    []
  );

  const buildSemesterTitle = useCallback(
    (metadata: SemesterMetadata | null, includeActiveFlag = false): string => {
      if (!metadata) return "Semester";
      const parts: string[] = [];

      if (metadata.tahunAjaran) {
        parts.push(metadata.tahunAjaran);
      }

      const semesterLabel = formatSemesterNumberLabel(metadata.semesterNumber);
      if (semesterLabel) {
        parts.push(semesterLabel);
      }

      const baseLabel = parts.join(" - ") || "Semester";
      const suffix = includeActiveFlag && metadata.isActive ? " (Aktif)" : "";
      return `${baseLabel}${suffix}`;
    },
    [formatSemesterNumberLabel]
  );

  const buildSemesterDateRange = useCallback(
    (metadata: SemesterMetadata | null): string | null => {
      if (!metadata) return null;
      if (!metadata.tanggalMulai || !metadata.tanggalSelesai) return null;
      return `${formatDate(metadata.tanggalMulai)} - ${formatDate(
        metadata.tanggalSelesai
      )}`;
    },
    []
  );

  const getSemesterMetadata = useCallback(
    (semester: SemesterRecord | null | undefined): SemesterMetadata | null =>
      normalizeSemesterMetadata(semester ?? null),
    [normalizeSemesterMetadata]
  );

  const formatStudyDays = useCallback((metadata: SemesterMetadata | null): string => {
    if (!metadata || metadata.jumlahHariBelajar === null) return "-";
    const numericValue = Number(metadata.jumlahHariBelajar);
    if (!Number.isNaN(numericValue)) {
      return `${numericValue} hari`;
    }
    return String(metadata.jumlahHariBelajar);
  }, []);

  const getEffectiveSemesterId = useCallback(
    (customId?: string | null): string => {
      if (customId) return String(customId);
      if (selectedSemesterId) return String(selectedSemesterId);
      if (semesters.length === 1 && semesters[0]?.id) {
        return String(semesters[0].id);
      }
      return "";
    },
    [selectedSemesterId, semesters]
  );

  const loadSemesters = useCallback(async () => {
    if (!userId) return;

    try {
      const semestersResponse = await apiService.getSemesters();
      const normalizedSemesters = Array.isArray(semestersResponse)
        ? semestersResponse
        : Object.values(semestersResponse || {}).filter(
            (item): item is SemesterRecord =>
              item !== null && typeof item === "object"
          );

      setSemesters(normalizedSemesters);

      if (normalizedSemesters.length > 0) {
        const activeSemester = normalizedSemesters.find((item) => item?.isActive);
        const initialRecord = activeSemester || normalizedSemesters[0];
        const initialId = initialRecord?.id ? String(initialRecord.id) : "";

        if (initialId) {
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
  }, [normalizeSemesterMetadata, toast, userId]);

  const loadStudentData = useCallback(
    async (semesterIdParam?: string | null) => {
      if (!userId) return;

      const hasSemesters = semesters.length > 0;
      const effectiveSemesterId = hasSemesters
        ? getEffectiveSemesterId(semesterIdParam)
        : "";

      if (hasSemesters && !effectiveSemesterId) {
        setGrades([]);
        setAttendance([]);
        setSemesterError("Silakan pilih semester untuk menampilkan data.");
        return;
      }

      setLoading(true);
      setSemesterError("");

      const semesterMetadata = effectiveSemesterId
        ? resolveSemesterMetadata(effectiveSemesterId)
        : null;
      if (semesterMetadata) {
        setSelectedSemesterMetadata(semesterMetadata);
      } else if (!hasSemesters) {
        setSelectedSemesterMetadata(null);
      }

      try {
        const tahunParam = semesterMetadata?.tahunAjaran ?? null;
        const semesterNumberParam = semesterMetadata?.semesterNumber ?? null;

        const [gradesResponse, attendanceResponse] = await Promise.all([
          apiService.getStudentGrades(
            userId,
            tahunParam,
            semesterNumberParam,
            effectiveSemesterId || null
          ),
          apiService.getStudentAttendance(
            userId,
            tahunParam,
            semesterNumberParam,
            effectiveSemesterId || null
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

        if (!semesterMetadata) {
          const gradeSemesterInfo = (
            gradesData.find(
              (item) =>
                (item as unknown as { semesterInfo?: SemesterRecord })?.semesterInfo
            ) as unknown as { semesterInfo?: SemesterRecord }
          )?.semesterInfo;
          const attendanceSemesterInfo = (
            (attendanceData as Array<{
              semesterInfo?: SemesterRecord;
            }>).find((item) => item?.semesterInfo) || null
          )?.semesterInfo;
          const fallbackRecord =
            (gradeSemesterInfo || attendanceSemesterInfo || null) as
              | SemesterRecord
              | null;
          const fallbackMetadata = resolveSemesterMetadata(
            effectiveSemesterId,
            fallbackRecord
          );
          if (fallbackMetadata) {
            setSelectedSemesterMetadata(fallbackMetadata);
          }
        }
      } catch (error: any) {
        console.error("Failed to load student data", error);
        const isSemesterNotFound =
          error?.code === "SEMESTER_NOT_FOUND" ||
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

        const friendlyMessage = isSemesterNotFound
          ? "Semester tidak ditemukan. Silakan pilih semester lain."
          : semesterValidationMessage || "Gagal memuat data siswa";

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
    [getEffectiveSemesterId, resolveSemesterMetadata, semesters, toast, userId]
  );

  const handlePrintReport = useCallback(async () => {
    if (!userId) return;

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
        userId,
        metadata?.tahunAjaran ?? null,
        metadata?.semesterNumber ?? null,
        effectiveSemesterId || null
      );

      const resolvedSemesterMetadata = resolveSemesterMetadata(
        (reportData as SemesterRecord)?.semesterId ?? effectiveSemesterId,
        (reportData as SemesterRecord)?.semesterInfo ?? null
      );

      const enrichedReportData = {
        ...reportData,
        semesterInfo:
          resolvedSemesterMetadata || metadata || reportData?.semesterInfo || undefined,
        semesterTanggalMulai:
          reportData?.semesterTanggalMulai ??
          resolvedSemesterMetadata?.tanggalMulai ??
          metadata?.tanggalMulai ??
          (reportData as SemesterRecord)?.startDate ??
          null,
        semesterTanggalSelesai:
          reportData?.semesterTanggalSelesai ??
          resolvedSemesterMetadata?.tanggalSelesai ??
          metadata?.tanggalSelesai ??
          (reportData as SemesterRecord)?.endDate ??
          null,
        semesterJumlahHariBelajar:
          reportData?.semesterJumlahHariBelajar ??
          resolvedSemesterMetadata?.jumlahHariBelajar ??
          metadata?.jumlahHariBelajar ??
          (reportData as SemesterRecord)?.jumlahHariBelajar ??
          null,
        semesterCatatan:
          reportData?.semesterCatatan ??
          resolvedSemesterMetadata?.catatan ??
          metadata?.catatan ??
          (reportData as SemesterRecord)?.catatan ??
          null,
      };

      printReport(enrichedReportData);
    } catch (error: any) {
      console.error("Failed to print report", error);
      const isSemesterNotFound =
        error?.code === "SEMESTER_NOT_FOUND" ||
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

      const friendlyMessage = isSemesterNotFound
        ? "Semester tidak ditemukan. Silakan pilih semester lain."
        : semesterValidationMessage || "Gagal mencetak raport";

      toast({
        title: "Error",
        description: friendlyMessage,
        variant: "destructive",
      });
    }
  }, [getEffectiveSemesterId, resolveSemesterMetadata, semesters, toast, userId]);

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
    if (!userId) return;
    loadSemesters();
  }, [loadSemesters, userId]);

  useEffect(() => {
    if (!userId) return;
    const shouldLoadWithoutSemester = semesters.length === 0;
    if (shouldLoadWithoutSemester || selectedSemesterId) {
      loadStudentData();
    }
  }, [loadStudentData, selectedSemesterId, semesters.length, userId]);

  const averageGrade = useMemo(() => calculateAverage(grades), [grades]);
  const attendanceStats = useMemo<AttendanceStats>(
    () => calculateAttendanceStats(attendance) as AttendanceStats,
    [attendance]
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
    grades,
    getSemesterMetadata,
    handlePrintReport,
    handleSemesterChange,
    loading,
    selectedSemesterId,
    selectedSemesterMetadata,
    semesterError,
    semesters,
    subjectGrades,
  };
};

export type UseStudentDashboardReturn = ReturnType<typeof useStudentDashboard>;
