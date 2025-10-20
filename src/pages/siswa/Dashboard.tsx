/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import {
  calculateAverage,
  calculateAttendanceStats,
  getGradeColor,
  getAttendanceStatus,
  formatDate,
  printReport,
  getSubjectName,
} from "@/utils/helpers";
import SiswaNavbar from "@/components/SiswaNavbar";

interface Grade {
  id: number;
  studentId: number;
  kelasId: number;
  subjectId: number;
  teacherId: number;
  tahunAjaran: string;
  semester: number;
  tanggal: string;
  status: string;
  keterangan: string;
  createdAt: string;
  subjectName: string;
  nilai?: string | number;
}

type SemesterRecord = {
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

interface SemesterMetadata {
  id: string | null;
  tahunAjaran: string | null;
  semesterNumber: number | string | null;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  jumlahHariBelajar: number | string | null;
  catatan: string;
  isActive: boolean;
}

const StudentDashboard = ({ currentUser, onLogout }) => {
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeSection, setActiveSection] = useState("nilai");
  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedSemesterMetadata, setSelectedSemesterMetadata] =
    useState<SemesterMetadata | null>(null);
  const [semesterError, setSemesterError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const normalizeSemesterMetadata = (
    semesterItem?: SemesterRecord | null
  ): SemesterMetadata | null => {
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
      tanggalMulai:
        semesterItem.tanggalMulai || semesterItem.startDate || null,
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
  };

  const getSemesterRecordById = (
    semesterId: string | number | null
  ): SemesterRecord | null => {
    if (!semesterId) return null;
    return (
      semesters.find((item) => String(item.id) === String(semesterId)) || null
    );
  };

  const resolveSemesterMetadata = (
    semesterId: string | number | null,
    fallback: SemesterRecord | null = null
  ): SemesterMetadata | null => {
    const record = getSemesterRecordById(semesterId) || fallback;
    return normalizeSemesterMetadata(record);
  };

  const formatSemesterNumberLabel = (
    value: number | string | null | undefined
  ): string | null => {
    if (value === null || value === undefined || value === "") return null;
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) {
      if (numericValue === 1) return "Semester Ganjil";
      if (numericValue === 2) return "Semester Genap";
      return `Semester ${numericValue}`;
    }
    return typeof value === "string" ? value : null;
  };

  const buildSemesterTitle = (
    metadata: SemesterMetadata | null,
    includeActiveFlag = false
  ): string => {
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
  };

  const buildSemesterDateRange = (
    metadata: SemesterMetadata | null
  ): string | null => {
    if (!metadata) return null;
    if (!metadata.tanggalMulai || !metadata.tanggalSelesai) return null;
    return `${formatDate(metadata.tanggalMulai)} - ${formatDate(
      metadata.tanggalSelesai
    )}`;
  };

  const formatStudyDays = (metadata: SemesterMetadata | null): string => {
    if (!metadata || metadata.jumlahHariBelajar === null) return "-";
    const numericValue = Number(metadata.jumlahHariBelajar);
    if (!Number.isNaN(numericValue)) {
      return `${numericValue} hari`;
    }
    return String(metadata.jumlahHariBelajar);
  };

  const getEffectiveSemesterId = (customId?: string | null): string => {
    if (customId) return String(customId);
    if (selectedSemesterId) return String(selectedSemesterId);
    if (semesters.length === 1 && semesters[0]?.id) {
      return String(semesters[0].id);
    }
    return "";
  };

  const loadSemesters = async () => {
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
  };

  useEffect(() => {
    if (currentUser) {
      loadSemesters();
    }
  }, [currentUser]);

  const loadStudentData = async (semesterIdParam?: string | null) => {
    if (!currentUser) return;

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
          currentUser.id,
          tahunParam,
          semesterNumberParam,
          effectiveSemesterId || null
        ),
        apiService.getStudentAttendance(
          currentUser.id,
          tahunParam,
          semesterNumberParam,
          effectiveSemesterId || null
        ),
      ]);

      const gradesData: Grade[] = Array.isArray(gradesResponse)
        ? (gradesResponse as Grade[])
        : (
            Object.values(gradesResponse || {}).filter(
              (item): item is Grade => typeof item === "object"
            ) as Grade[]
          ).map((item) => ({
            ...item,
            nilai: item.nilai ? parseFloat(item.nilai as string) : 0,
          }));

      const attendanceData = Array.isArray(attendanceResponse)
        ? attendanceResponse
        : Object.values(attendanceResponse || {}).filter(
            (item) => typeof item === "object"
          );

      setGrades(gradesData);
      setAttendance(attendanceData);

      if (!semesterMetadata) {
        const gradeSemesterInfo = (
          gradesData.find(
            (item) => (item as unknown as { semesterInfo?: SemesterRecord })?.semesterInfo
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
    } catch (error) {
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
  };

  useEffect(() => {
    if (!currentUser) return;
    const shouldLoadWithoutSemester = semesters.length === 0;
    if (shouldLoadWithoutSemester || selectedSemesterId) {
      loadStudentData();
    }
  }, [currentUser, selectedSemesterId, semesters.length]);

  const handlePrintReport = async () => {
    if (!currentUser) return;

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
        currentUser.id,
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
    } catch (error) {
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
  };

  const averageGrade = calculateAverage(grades);
  const attendanceStats = calculateAttendanceStats(attendance);

  const subjectGrades = grades.reduce((acc, grade) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg">
              <User className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                Panel Orang Tua Siswa
              </h1>
              <p className="opacity-90 text-sm md:text-base">
                Selamat datang, Orang Tua Siswa {currentUser?.nama}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <SiswaNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
        onPrintReport={handlePrintReport}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Period Selector */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h3 className="font-semibold text-foreground">
                  Filter Periode Akademik
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pilih tahun ajaran dan semester yang ingin dilihat
                </p>
              </div>
              <Select
                value={selectedSemesterId || ""}
                onValueChange={(value) => {
                  setSelectedSemesterId(value);
                  setSemesterError("");
                  const metadata = resolveSemesterMetadata(value);
                  if (metadata) {
                    setSelectedSemesterMetadata(metadata);
                  } else {
                    setSelectedSemesterMetadata(null);
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue
                    placeholder={
                      semesters.length > 0
                        ? "Pilih semester"
                        : "Semester belum tersedia"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {semesters.length > 0 ? (
                    semesters.map((semester) => {
                      const metadata = normalizeSemesterMetadata(semester);
                      return (
                        <SelectItem
                          key={semester.id}
                          value={semester.id ? String(semester.id) : ""}
                          disabled={!semester.id}
                        >
                          {buildSemesterTitle(metadata, true)}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="" disabled>
                      Data semester belum tersedia
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedSemesterMetadata && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Rentang Tanggal
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {buildSemesterDateRange(selectedSemesterMetadata) || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Jumlah Hari Belajar
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatStudyDays(selectedSemesterMetadata)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Status Semester
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedSemesterMetadata.isActive ? "Aktif" : "Tidak aktif"}
                    </p>
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-3 text-sm">
                  <p className="font-medium text-foreground">Catatan Semester</p>
                  <p className="text-muted-foreground">
                    {selectedSemesterMetadata.catatan || "Tidak ada catatan khusus."}
                  </p>
                </div>
              </div>
            )}

            {semesterError && (
              <p className="text-sm text-destructive">{semesterError}</p>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="space-y-4 mb-8">
          {selectedSemesterMetadata && (
            <Card className="shadow-soft border border-dashed border-primary/20">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground">
                      Ringkasan Raport
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {buildSemesterTitle(selectedSemesterMetadata, true)}
                    </Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Periode</p>
                      <p className="text-muted-foreground">
                        {buildSemesterDateRange(selectedSemesterMetadata) || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Hari Belajar</p>
                      <p className="text-muted-foreground">
                        {formatStudyDays(selectedSemesterMetadata)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Catatan</p>
                      <p className="text-muted-foreground">
                        {selectedSemesterMetadata.catatan || "Tidak ada catatan khusus."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {averageGrade}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nilai Rata-rata
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {attendanceStats.persentase}%
                  </p>
                  <p className="text-sm text-muted-foreground">Kehadiran</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {subjectGrades.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mata Pelajaran
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Nilai Section */}
          {activeSection === "nilai" && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Daftar Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <div className="flex items-center space-x-3">
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-12" />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Memuat data nilai...</span>
                    </div>
                  </div>
                ) : grades.length > 0 ? (
                  <div className="space-y-4">
                    {grades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex justify-between items-center p-4 border border-border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-foreground">
                            {grade.subjectName}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {grade.jenis}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(grade.tanggal)}
                            </span>
                            {grade.verified === 1 ? (
                              <Badge className="text-xs bg-success text-success-foreground">
                                Terverifikasi
                              </Badge>
                            ) : (
                              <Badge className="text-xs bg-destructive text-destructive-foreground">
                                Belum Diverifikasi
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xl font-bold ${getGradeColor(
                              grade.nilai
                            )}`}
                          >
                            {grade.nilai}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Belum ada data nilai
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Kehadiran Section */}
          {activeSection === "kehadiran" && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Rekap Kehadiran</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSemesterMetadata && (
                  <div className="mb-6 rounded-lg bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">
                        Statistik hadir untuk {" "}
                        {buildSemesterTitle(selectedSemesterMetadata)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {buildSemesterDateRange(selectedSemesterMetadata) ||
                          "Rentang tidak tersedia"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs md:text-sm text-muted-foreground">
                      <span>
                        Rentang: {" "}
                        {buildSemesterDateRange(selectedSemesterMetadata) || "-"}
                      </span>
                      <span>
                        Hari Belajar: {" "}
                        {formatStudyDays(selectedSemesterMetadata)}
                      </span>
                      <span>
                        Catatan: {" "}
                        {selectedSemesterMetadata.catatan || "Tidak ada catatan."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Attendance Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-success/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-success">
                      {attendanceStats.hadir}
                    </p>
                    <p className="text-sm text-muted-foreground">Hadir</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-warning">
                      {attendanceStats.sakit}
                    </p>
                    <p className="text-sm text-muted-foreground">Sakit</p>
                  </div>
                  <div className="p-4 bg-destructive/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-destructive">
                      {attendanceStats.alfa}
                    </p>
                    <p className="text-sm text-muted-foreground">Alfa</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">
                      {attendanceStats.izin}
                    </p>
                    <p className="text-sm text-muted-foreground">Izin</p>
                  </div>
                </div>

                {/* Attendance List */}
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 border border-border rounded-lg"
                      >
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Memuat data kehadiran...</span>
                    </div>
                  </div>
                ) : attendance.length > 0 ? (
                  <div className="space-y-4">
                    {attendance.map((record) => {
                      const status = getAttendanceStatus(record.status);
                      return (
                        <div
                          key={record.id}
                          className="flex justify-between items-center p-4 border border-border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-foreground">
                              {record.subjectName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(record.tanggal)}
                            </p>
                            {record.keterangan && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {record.keterangan}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={`${status.bgColor} ${status.color}`}
                          >
                            {status.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Belum ada data kehadiran
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mata Pelajaran Section */}
          {activeSection === "matapelajaran" && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Mata Pelajaran & Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                {subjectGrades.length > 0 ? (
                  <div className="space-y-6">
                    {subjectGrades.map((subject) => {
                      const avgGrade = calculateAverage(subject.grades);
                      return (
                        <div
                          key={subject.subjectId}
                          className="p-6 border border-border rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                {subject.subjectName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {subject.grades.length} nilai tercatat
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-xl font-bold ${getGradeColor(
                                  avgGrade
                                )}`}
                              >
                                {avgGrade}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Rata-rata
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {subject.grades.map((grade) => (
                              <div
                                key={grade.id}
                                className="p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {grade.jenis}
                                  </span>
                                  <span
                                    className={`font-bold ${getGradeColor(
                                      grade.nilai
                                    )}`}
                                  >
                                    {grade.nilai}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(grade.tanggal)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Belum ada data mata pelajaran
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

