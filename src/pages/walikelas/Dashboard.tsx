import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  CheckCircle,
  Calendar,
  UserPlus,
  Edit,
  Trash2,
  Search,
  GraduationCap,
  BarChart3,
  Clock,
  FileText,
  Printer,
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import {
  formatDate,
  getGradeColor,
  getAttendanceStatus,
  printReport,
  formatAcademicPeriod,
} from "@/utils/helpers";
import { useIsMobile } from "@/hooks/use-mobile";
import WalikelasNavbar from "@/components/WalikelasNavbar";

const WalikelasaDashboard = ({ currentUser, onLogout }) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("students");
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  const [studentForm, setStudentForm] = useState({
    // Data dari tabel students
    id: "", // untuk edit (opsional)
    userId: "", // relasi ke tabel users
    nisn: "",
    nama: "", // otomatis dari wali kelas (bisa diisi backend, tidak tampil di form)
    jenisKelamin: "",
    tanggalLahir: "",
    alamat: "",
    nomorHP: "",
    namaOrangTua: "",
    pekerjaanOrangTua: "",
    tahunMasuk: new Date().getFullYear().toString(), // default tahun sekarang

    // Data dari tabel users
    username: "",
    password: "",
    email: "",
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (currentUser) {
      loadSemesters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const hasSemesterSelection =
      semesters.length === 0 || selectedSemesterId || semesters.length === 1;

    if (hasSemesterSelection) {
      const effectiveSemesterId = getEffectiveSemesterId();
      loadWalikelasData(effectiveSemesterId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedSemesterId, semesters.length]);

  const loadSemesters = async () => {
    try {
      const semestersData = await apiService.getSemesters();
      const normalizedSemesters = Array.isArray(semestersData)
        ? semestersData
        : [];

      setSemesters(normalizedSemesters);

      if (normalizedSemesters.length > 0) {
        const activeSemester = normalizedSemesters.find((item) => item?.isActive);
        const initialSemesterId = activeSemester?.id ?? normalizedSemesters[0]?.id;

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
  };

  const normalizeSemesterMetadata = (semesterItem) => {
    if (!semesterItem) return null;

    return {
      id: semesterItem.id ?? null,
      tahunAjaran:
        semesterItem.tahunAjaran ||
        semesterItem.tahun ||
        semesterItem.academicYear ||
        semesterItem.year ||
        null,
      semesterNumber:
        semesterItem.semester ??
        semesterItem.semesterNumber ??
        semesterItem.term ??
        null,
      tanggalMulai: semesterItem.tanggalMulai || semesterItem.startDate || null,
      tanggalSelesai:
        semesterItem.tanggalSelesai || semesterItem.endDate || null,
      jumlahHariBelajar:
        semesterItem.jumlahHariBelajar ??
        semesterItem.learningDays ??
        semesterItem.totalSchoolDays ??
        semesterItem.hariEfektif ??
        null,
      catatan: semesterItem.catatan || semesterItem.notes || semesterItem.keterangan || "",
      isActive: Boolean(semesterItem.isActive),
    };
  };

  const getSemesterRecordById = (semesterId) => {
    if (!semesterId) return null;
    return semesters.find((item) => String(item.id) === String(semesterId));
  };

  const resolveSemesterMetadata = (semesterId, fallback = null) => {
    const record = getSemesterRecordById(semesterId) || fallback;
    return normalizeSemesterMetadata(record);
  };

  const getEffectiveSemesterId = (customId) => {
    if (customId) return String(customId);
    if (selectedSemesterId) return String(selectedSemesterId);
    if (semesters.length === 1) return String(semesters[0].id);
    return "";
  };

  const formatSemesterNumberLabel = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) {
      if (numericValue === 1) return "Semester Ganjil";
      if (numericValue === 2) return "Semester Genap";
      return `Semester ${numericValue}`;
    }
    return typeof value === "string" ? value : null;
  };

  const buildSemesterTitle = (metadata, includeActiveFlag = false) => {
    if (!metadata) return "-";

    const semesterLabel = formatSemesterNumberLabel(metadata.semesterNumber);
    const parts = [];

    if (metadata.tahunAjaran) {
      parts.push(metadata.tahunAjaran);
    }

    if (semesterLabel) {
      parts.push(semesterLabel);
    }

    const baseLabel = parts.join(" - ") || "Semester";
    const activeSuffix = includeActiveFlag && metadata.isActive ? " (Aktif)" : "";

    return `${baseLabel}${activeSuffix}`;
  };

  const buildSemesterDateRange = (metadata) => {
    if (!metadata) return null;
    if (!metadata.tanggalMulai || !metadata.tanggalSelesai) return null;
    return `${formatDate(metadata.tanggalMulai)} - ${formatDate(
      metadata.tanggalSelesai
    )}`;
  };

  const getSemesterOptionLabel = (semesterItem) => {
    const metadata = normalizeSemesterMetadata(semesterItem);
    if (!metadata) return "Semester";

    const baseLabel = buildSemesterTitle(metadata, true);
    const dateRange = buildSemesterDateRange(metadata);

    return dateRange ? `${baseLabel} (${dateRange})` : baseLabel;
  };

  const selectedSemesterMetadata = selectedSemesterId
    ? resolveSemesterMetadata(selectedSemesterId)
    : semesters.length === 1
    ? normalizeSemesterMetadata(semesters[0])
    : null;

  const selectedSemesterPeriodLabel = (() => {
    if (!selectedSemesterMetadata) return "-";

    const numericValue = Number(selectedSemesterMetadata.semesterNumber);
    const hasNumericSemester = !Number.isNaN(numericValue);

    if (selectedSemesterMetadata.tahunAjaran && hasNumericSemester) {
      return formatAcademicPeriod(
        selectedSemesterMetadata.tahunAjaran,
        numericValue
      );
    }

    return buildSemesterTitle(selectedSemesterMetadata);
  })();

  const selectedSemesterDateRange = buildSemesterDateRange(
    selectedSemesterMetadata
  );

  const loadWalikelasData = async (
    semesterIdParam = getEffectiveSemesterId()
  ) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const effectiveSemesterId = getEffectiveSemesterId(semesterIdParam);

      const [classesData, studentsData, gradesData, attendanceData] =
        await Promise.all([
          apiService.getClasses(),
          apiService.getClassStudents(currentUser.kelasId),
          apiService.getClassGrades(
            currentUser.kelasId,
            null,
            null,
            effectiveSemesterId || null
          ),
          apiService.getClassAttendance(
            currentUser.kelasId,
            null,
            null,
            effectiveSemesterId || null
          ),
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
        ? classesData.find((cls) => cls.walikelas === currentUser.id)
        : null;

      setClassInfo(currentClass);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setGrades(gradesWithMetadata);
      setAttendance(attendanceWithMetadata);
    } catch (error) {
      console.error("Failed to load walikelas data", error);
      const isSemesterNotFound =
        error?.code === "SEMESTER_NOT_FOUND" ||
        (typeof error?.message === "string" &&
          error.message.toLowerCase().includes("semester tidak ditemukan"));

      toast({
        title: "Error",
        description: isSemesterNotFound
          ? "Semester tidak ditemukan. Silakan pilih semester lain."
          : error?.message || "Gagal memuat data wali kelas",
        variant: "destructive",
      });

      if (isSemesterNotFound) {
        setGrades([]);
        setAttendance([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    if (!studentForm.nama || !studentForm.nisn || !studentForm.username) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive",
      });
      return;
    }

    // 🔹 Validasi duplikasi NISN & Username
    const nisnExists = students.some(
      (s) => s.nisn === studentForm.nisn && s.id !== editingStudent?.id
    );
    const usernameExists = students.some(
      (s) => s.username === studentForm.username && s.id !== editingStudent?.id
    );

    if (nisnExists) {
      toast({
        title: "Error",
        description: "NISN sudah digunakan oleh siswa lain",
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
      const studentData = {
        users: {
          // data akun untuk tabel users
          username: studentForm.nisn, // misalnya pakai NISN sebagai username
          password: studentForm.password || "default123", // bisa pakai default
          role: "siswa",
          email: studentForm.email,
        },
        students: {
          // data detail siswa untuk tabel students
          ...(editingStudent?.id && { id: editingStudent.id }),
          nama: studentForm.nama,
          nisn: studentForm.nisn,
          kelasId: currentUser.kelasId, // dari walikelas
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
      if (editingStudent) {
        result = await apiService.updateClassStudent(
          currentUser.id,
          studentData.students.id,
          studentData
        );
      } else {
        result = await apiService.addClassStudent(currentUser.id, studentData);
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
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      try {
        const result = await apiService.deleteClassStudent(
          currentUser.id,
          studentId
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
  };

  const handleVerifyGrade = async (gradeId) => {
    try {
      const result = await apiService.verifyGrade(currentUser.id, gradeId);
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
  };

  const handleVerifyAll = async () => {
    if (unverifiedGrades.length === 0) return;

    if (
      window.confirm(
        `Apakah Anda yakin ingin memverifikasi semua ${unverifiedGrades.length} nilai yang belum diverifikasi?`
      )
    ) {
      setLoading(true);
      try {
        // Verify all unverified grades
        const verifyPromises = unverifiedGrades.map((grade) =>
          apiService.verifyGrade(currentUser.id, grade.id)
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
  };

  const resetStudentForm = () => {
    setStudentForm({
      // Data dari tabel students
      id: "",
      userId: "",
      nisn: "",
      nama: "",
      jenisKelamin: "",
      tanggalLahir: "",
      alamat: "",
      nomorHP: "",
      namaOrangTua: "",
      pekerjaanOrangTua: "",
      tahunMasuk: new Date().getFullYear().toString(),

      // Data dari tabel users
      username: "",
      password: "",
      email: "",
    });
    setEditingStudent(null);
    setShowStudentDialog(false);
  };

  const editStudent = (student) => {
    setStudentForm(student);
    setEditingStudent(student);
    setShowStudentDialog(true);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unverifiedGrades = grades.filter((grade) => !grade.verified);
  const totalAttendance = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "hadir").length;
  const attendancePercentage =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;

  // Get students with verified grades for reports
  const studentsWithVerifiedGrades = students.filter((student) => {
    const studentGrades = grades.filter(
      (grade) => grade.studentId === student.id && grade.verified
    );
    return studentGrades.length > 0;
  });

  const handlePrintReport = async (student) => {
    try {
      const semesterIdForReport = getEffectiveSemesterId();
      const reportData = await apiService.getClassStudentReport(
        currentUser.id, // walikelasId
        student.id,
        null,
        null,
        semesterIdForReport || null
      );

      if (!reportData) {
        toast({
          title: "Error",
          description: "Data raport tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      const resolvedSemesterMetadata = resolveSemesterMetadata(
        reportData?.semesterId ?? semesterIdForReport,
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

      printReport(enrichedReportData); // langsung kirim ke printer/pdf
    } catch (error) {
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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  Dashboard Wali Kelas
                </h1>
                <p className="opacity-90 text-sm md:text-base">
                  Selamat datang, {currentUser?.nama}
                </p>
              </div>
            </div>

            {/* Class Information */}
            {classInfo && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <div className="text-center md:text-right">
                  <h2 className="text-lg font-semibold">{classInfo.nama}</h2>
                  <p className="text-sm opacity-90">
                    Tingkat {classInfo.tingkat} - {classInfo.jurusan || "Umum"}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Total Siswa: {students.length} orang
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <WalikelasNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Period Selector */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h3 className="font-semibold text-foreground">
                  Filter Periode Akademik
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pilih tahun ajaran dan semester yang ingin dilihat
                </p>
                {selectedSemesterPeriodLabel !== "-" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Saat ini: {selectedSemesterPeriodLabel}
                    {selectedSemesterDateRange
                      ? ` • ${selectedSemesterDateRange}`
                      : ""}
                  </p>
                )}
              </div>
              <Select
                value={
                  selectedSemesterId ||
                  (semesters.length === 1
                    ? String(semesters[0].id)
                    : undefined)
                }
                onValueChange={(value) => {
                  setSelectedSemesterId(String(value));
                }}
                disabled={semesters.length === 0}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.length > 0 ? (
                    semesters.map((semesterItem) => (
                      <SelectItem
                        key={semesterItem.id}
                        value={String(semesterItem.id)}
                      >
                        {getSemesterOptionLabel(semesterItem)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty" disabled>
                      Tidak ada data semester
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedSemesterMetadata && (
          <Card className="mb-6 shadow-soft">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Informasi Semester
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {buildSemesterTitle(selectedSemesterMetadata, true)}
                  </p>
                  {selectedSemesterDateRange && (
                    <p className="text-xs text-muted-foreground">
                      {selectedSemesterDateRange}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tanggal Mulai
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedSemesterMetadata.tanggalMulai
                      ? formatDate(selectedSemesterMetadata.tanggalMulai)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tanggal Selesai
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedSemesterMetadata.tanggalSelesai
                      ? formatDate(selectedSemesterMetadata.tanggalSelesai)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Jumlah Hari Belajar
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedSemesterMetadata.jumlahHariBelajar ?? "-"}
                  </p>
                </div>
              </div>
              {selectedSemesterMetadata.catatan && (
                <div className="border border-border bg-muted/30 rounded-lg p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">
                    Catatan Semester
                  </p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedSemesterMetadata.catatan}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {selectedSemesterMetadata && (
          <div className="text-sm text-muted-foreground mb-3">
            Statistik periode: {selectedSemesterPeriodLabel}
            {selectedSemesterDateRange ? ` • ${selectedSemesterDateRange}` : ""}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {students.length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Siswa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-warning/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 md:h-8 md:w-8 text-warning" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {unverifiedGrades.length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Nilai Belum Verifikasi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-success/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 md:h-8 md:w-8 text-success" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {attendancePercentage}%
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Kehadiran Rata-rata
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-accent/10 rounded-lg">
                  <Calendar className="h-5 w-5 md:h-8 md:w-8 text-accent" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {grades.length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Nilai
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Students Management Section */}
          {activeSection === "students" && (
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <CardTitle>Manajemen Siswa Kelas</CardTitle>
                  <Dialog
                    open={showStudentDialog}
                    onOpenChange={setShowStudentDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="bg-primary text-primary-foreground w-full md:w-auto"
                        onClick={() => setEditingStudent(null)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Tambah Siswa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4 md:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingStudent ? "Edit Siswa" : "Tambah Siswa Baru"}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleStudentSubmit}
                        className="space-y-4"
                      >
                        {/* Baris 1: Nama & NISN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nama Lengkap</Label>
                            <Input
                              value={studentForm.nama}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  nama: e.target.value,
                                }))
                              }
                              placeholder="Nama Lengkap"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>NISN</Label>
                            <Input
                              value={studentForm.nisn}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  nisn: e.target.value,
                                }))
                              }
                              placeholder="10 digit NISN"
                              maxLength={10}
                              required
                            />
                          </div>
                        </div>

                        {/* Baris 2: Username & Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                              value={studentForm.username}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  username: e.target.value,
                                }))
                              }
                              placeholder="Username"
                              required
                            />
                          </div>

                          {!editingStudent && (
                            <div className="space-y-2">
                              <Label>Password</Label>
                              <Input
                                type="password"
                                value={studentForm.password}
                                onChange={(e) =>
                                  setStudentForm((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                  }))
                                }
                                placeholder="Password"
                                required
                              />
                            </div>
                          )}
                        </div>

                        {/* Baris 3: Email & No HP */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={studentForm.email}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              placeholder="email@example.com"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>No. HP</Label>
                            <Input
                              type="tel"
                              value={studentForm.nomorHP}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  nomorHP: e.target.value,
                                }))
                              }
                              placeholder="08xxxxxxxx"
                            />
                          </div>
                        </div>

                        {/* Baris 4: Jenis Kelamin & Tanggal Lahir */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Jenis Kelamin</Label>
                            <select
                              className="border rounded-md p-2 w-full"
                              value={studentForm.jenisKelamin}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  jenisKelamin: e.target.value,
                                }))
                              }
                              required
                            >
                              <option value="">Pilih</option>
                              <option value="L">Laki-laki</option>
                              <option value="P">Perempuan</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label>Tanggal Lahir</Label>
                            <Input
                              type="date"
                              value={studentForm.tanggalLahir}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  tanggalLahir: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        {/* Baris 5: Tahun Masuk */}
                        <div className="space-y-2">
                          <Label>Tahun Masuk</Label>
                          <Input
                            type="number"
                            value={studentForm.tahunMasuk}
                            onChange={(e) =>
                              setStudentForm((prev) => ({
                                ...prev,
                                tahunMasuk: e.target.value,
                              }))
                            }
                            placeholder="2024"
                          />
                        </div>

                        {/* Baris 6: Orang Tua */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nama Orang Tua</Label>
                            <Input
                              value={studentForm.namaOrangTua}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  namaOrangTua: e.target.value,
                                }))
                              }
                              placeholder="Nama Ayah/Ibu"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Pekerjaan Orang Tua</Label>
                            <Input
                              value={studentForm.pekerjaanOrangTua}
                              onChange={(e) =>
                                setStudentForm((prev) => ({
                                  ...prev,
                                  pekerjaanOrangTua: e.target.value,
                                }))
                              }
                              placeholder="Petani, Guru, dsb."
                            />
                          </div>
                        </div>

                        {/* Baris 7: Alamat */}
                        <div className="space-y-2">
                          <Label>Alamat</Label>
                          <Input
                            value={studentForm.alamat}
                            onChange={(e) =>
                              setStudentForm((prev) => ({
                                ...prev,
                                alamat: e.target.value,
                              }))
                            }
                            placeholder="Alamat lengkap"
                          />
                        </div>

                        {/* Tombol */}
                        <div className="flex flex-col md:flex-row gap-2">
                          <Button type="submit" className="flex-1">
                            {editingStudent ? "Update" : "Simpan"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={resetStudentForm}
                          >
                            Batal
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>NISN</TableHead>
                        {!isMobile && <TableHead>Username</TableHead>}
                        {!isMobile && <TableHead>Email</TableHead>}
                        {!isMobile && <TableHead>No. HP</TableHead>}
                        {!isMobile && <TableHead>Orang Tua</TableHead>}
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.nama}
                          </TableCell>
                          <TableCell>{student.nisn}</TableCell>
                          {!isMobile && (
                            <TableCell className="text-muted-foreground">
                              {student.username}
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell className="text-muted-foreground">
                              {student.email || "-"}
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell className="text-muted-foreground">
                              {student.nomorHP || "-"}
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell className="text-muted-foreground">
                              {student.namaOrangTua || "-"}
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => editStudent(student)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grades Verification Section */}
          {activeSection === "grades" && (
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <CardTitle>Verifikasi Nilai Siswa</CardTitle>
                  {unverifiedGrades.length > 0 && (
                    <Button
                      onClick={handleVerifyAll}
                      disabled={loading}
                      className="bg-success text-success-foreground w-full md:w-auto"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Verifikasi Semua ({unverifiedGrades.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Memuat data nilai...
                    </p>
                  </div>
                ) : unverifiedGrades.length > 0 ? (
                  <div className="space-y-4">
                    {unverifiedGrades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-4 md:space-y-0"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {students.find((s) => s.id === grade.studentId)
                              ?.nama || "Siswa"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Mata Pelajaran {grade.subjectId}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {grade.jenis}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(grade.tanggal)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p
                              className={`text-xl font-bold ${getGradeColor(
                                grade.nilai
                              )}`}
                            >
                              {grade.nilai}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleVerifyGrade(grade.id)}
                            className="bg-success text-success-foreground"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verifikasi
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Semua nilai sudah diverifikasi
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attendance Section */}
          {activeSection === "attendance" && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Kehadiran Kelas</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length > 0 ? (
                  <div className="space-y-4">
                    {attendance.map((record) => {
                      const status = getAttendanceStatus(record.status);
                      const student = students.find(
                        (s) => s.id === record.studentId
                      );
                      return (
                        <div
                          key={record.id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-2 md:space-y-0"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {student?.nama || "Siswa"}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Mata Pelajaran {record.subjectId}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(record.tanggal)}
                              </span>
                            </div>
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

          {/* Reports Section */}
          {activeSection === "reports" && (
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle>Laporan Raport Siswa</CardTitle>
                    {selectedSemesterMetadata && (
                      <div className="mt-1 text-xs text-muted-foreground space-y-1">
                        <p>
                          Periode: {selectedSemesterPeriodLabel}
                          {selectedSemesterDateRange
                            ? ` • ${selectedSemesterDateRange}`
                            : ""}
                        </p>
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0">
                          {selectedSemesterMetadata.jumlahHariBelajar !== null &&
                            selectedSemesterMetadata.jumlahHariBelajar !== undefined && (
                              <span>
                                Hari belajar: {selectedSemesterMetadata.jumlahHariBelajar}
                              </span>
                            )}
                          {selectedSemesterMetadata.catatan && (
                            <span className="block truncate md:max-w-sm">
                              Catatan: {selectedSemesterMetadata.catatan}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">
                      {studentsWithVerifiedGrades.length}
                    </span>{" "}
                    siswa siap cetak raport
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {studentsWithVerifiedGrades.length > 0 ? (
                  <div className="space-y-4">
                    {studentsWithVerifiedGrades.map((student) => {
                      const studentGrades = grades.filter(
                        (grade) =>
                          grade.studentId === student.id && grade.verified
                      );
                      const verifiedSubjects = studentGrades.length;
                      const averageGrade =
                        studentGrades.length > 0
                          ? (
                              studentGrades.reduce(
                                (sum, grade) => sum + parseFloat(grade.nilai),
                                0
                              ) / studentGrades.length
                            ).toFixed(1)
                          : 0;

                      return (
                        <div
                          key={student.id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-3 md:space-y-0"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">
                                  {student.nama}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  NISN: {student.nisn}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2 ml-11">
                              <Badge variant="secondary" className="text-xs">
                                {verifiedSubjects} Mata Pelajaran
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Rata-rata: {averageGrade}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Periode: {selectedSemesterPeriodLabel}
                                {selectedSemesterDateRange
                                  ? ` • ${selectedSemesterDateRange}`
                                  : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintReport(student)}
                              className="w-full md:w-auto"
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Cetak Raport
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium mb-2">
                      Belum Ada Siswa dengan Nilai Terverifikasi
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Verifikasi nilai siswa terlebih dahulu untuk dapat
                      mencetak raport
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

export default WalikelasaDashboard;
