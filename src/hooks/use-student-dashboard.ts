import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useDashboardSemester,
  type DashboardSemesterMetadata,
  type DashboardSemesterRecord,
} from "@/hooks/use-dashboard-semester";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import {
  calculateAttendanceStats,
  calculateAverage,
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
  const userId = currentUser?.id ?? null;

  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [semesters, setSemesters] = useState<DashboardSemesterRecord[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedSemesterMetadata, setSelectedSemesterMetadata] =
    useState<DashboardSemesterMetadata | null>(null);
  const [semesterError, setSemesterError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { normalizeSemesterMetadata, resolveSemesterMetadata } =
    useDashboardSemester({ semesters });

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
            (item): item is DashboardSemesterRecord =>
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
