/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Calendar,
  Plus,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { formatDate, getGradeColor, formatAcademicPeriod } from "@/utils/helpers";

const TeacherDashboard = ({ currentUser, onLogout }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showStudentListDialog, setShowStudentListDialog] = useState(false);
  const [showGradeTableDialog, setShowGradeTableDialog] = useState(false);
  const [showAttendanceTableDialog, setShowAttendanceTableDialog] =
    useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSubjectKelasId, setSelectedSubjectKelasId] = useState("");
  const [selectedSubjectForGrades, setSelectedSubjectForGrades] = useState("");
  const [selectedSubjectForAttendance, setSelectedSubjectForAttendance] =
    useState("");
  const [editingGrade, setEditingGrade] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  const [gradeForm, setGradeForm] = useState({
    studentId: "",
    subjectId: "",
    jenis: "",
    nilai: "",
    kelasId: "",
    tanggal: new Date().toISOString().split("T")[0],
    semesterId: "",
  });

  const [attendanceForm, setAttendanceForm] = useState({
    studentId: "",
    subjectId: "",
    status: "",
    keterangan: "",
    kelasId: "",
    tanggal: new Date().toISOString().split("T")[0],
    semesterId: "",
  });

  const { toast } = useToast();

  const gradeTypes = ["Ulangan Harian", "UTS", "UAS", "Kuis", "Tugas"];
  const attendanceStatuses = [
    { value: "hadir", label: "Hadir" },
    { value: "sakit", label: "Sakit" },
    { value: "alfa", label: "Alfa" },
    { value: "izin", label: "Izin" },
  ];

  const loadSemesters = async () => {
    try {
      const semestersData = await apiService.getSemesters();
      const normalizedSemesters = Array.isArray(semestersData)
        ? semestersData
        : [];

      setSemesters(normalizedSemesters);

      if (normalizedSemesters.length > 0) {
        const activeSemester = normalizedSemesters.find(
          (item) => item?.isActive
        );
        const initialSemesterId = activeSemester?.id ?? normalizedSemesters[0]?.id;

        if (initialSemesterId && !selectedSemesterId) {
          setSelectedSemesterId(String(initialSemesterId));
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Gagal memuat data semester",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadSemesters();
      loadTeacherData();
    }
  }, [currentUser]);

  useEffect(() => {
    const hasSemesterSelection = semesters.length === 0 || selectedSemesterId;
    if (students.length > 0 && subjects.length > 0 && hasSemesterSelection) {
      loadGradesData();
      loadAttendanceData();
    }
  }, [students, subjects, selectedSemesterId, semesters.length]);

  useEffect(() => {
    if (!editingGrade) {
      setGradeForm((prev) => ({
        ...prev,
        semesterId: selectedSemesterId || "",
      }));
    }

    if (!editingAttendance) {
      setAttendanceForm((prev) => ({
        ...prev,
        semesterId: selectedSemesterId || "",
      }));
    }
  }, [selectedSemesterId, editingGrade, editingAttendance]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      // apiService.forceInitializeData();

      // Ambil mapel guru
      const subjectsData = await apiService.getTeacherSubjects(
        currentUser.teacherId
      );
      const allSubjects = await apiService.getSubjects();
      const classesData = await apiService.getClasses();

      // Jika local pakai objek langsung, kalau API mungkin array relasi
      const subjectIds = Array.isArray(subjectsData)
        ? subjectsData
            .map((s) =>
              typeof s === "object" && s !== null ? s.subjectId || s.id : s
            )
            .filter(Boolean)
        : [];

      // Dapatkan detail subject dari allSubjects
      const teacherSubjects = allSubjects.filter((subj) =>
        subjectIds.includes(subj.id)
      );

      setSubjects(teacherSubjects);
      setClasses(classesData);

      // Ambil semua siswa
      const allUsers = await apiService.getUsers();
      const studentsData = allUsers.filter((user) => user.role === "siswa");
      console.log("All Student : ", studentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Gagal memuat data guru",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSemesterRecordById = (id) => {
    if (!id) return null;
    return semesters.find((semester) => String(semester.id) === String(id));
  };

  const buildSemesterLabel = (semesterItem) => {
    if (!semesterItem) return null;
    if (semesterItem.label) return semesterItem.label;

    const tahunAjaran =
      semesterItem.tahunAjaran ||
      semesterItem.tahun ||
      semesterItem.academicYear ||
      semesterItem.year ||
      null;
    const semesterNumber =
      semesterItem.semester ??
      semesterItem.semesterNumber ??
      semesterItem.term ??
      null;

    if (!tahunAjaran && (semesterNumber === null || semesterNumber === undefined)) {
      return null;
    }

    const parsedSemester =
      semesterNumber === null || semesterNumber === undefined
        ? null
        : Number(semesterNumber);
    const normalizedSemester =
      parsedSemester !== null && !Number.isNaN(parsedSemester)
        ? parsedSemester
        : semesterNumber;

    return formatAcademicPeriod(tahunAjaran, normalizedSemester);
  };

  const getSemesterLabelById = (id, fallback) => {
    const semesterRecord = getSemesterRecordById(id);
    return (
      buildSemesterLabel(semesterRecord) ||
      buildSemesterLabel(fallback) ||
      "-"
    );
  };

  const resolveSemesterDetails = (semesterId, fallback) => {
    return getSemesterRecordById(semesterId) || fallback || null;
  };

  const loadGradesData = async (semesterIdParam = selectedSemesterId) => {
    try {
      const semesterIdToUse =
        semesterIdParam ||
        (semesters.length === 1 ? String(semesters[0].id) : null);
      const allGrades = await apiService.getGrades(semesterIdToUse || null);

      const teacherSubjectIds = subjects
        .map((s) => (s && typeof s === "object" ? s.id : s))
        .filter(Boolean);

      const teacherGrades = allGrades.filter((grade) => {
        const subjectId =
          grade &&
          typeof grade.subjectId === "object" &&
          grade.subjectId !== null
            ? grade.subjectId.id
            : grade.subjectId;
        return (
          grade.teacherId === currentUser.teacherId &&
          teacherSubjectIds.includes(subjectId)
        );
      });

      const gradesWithNames = teacherGrades.map((grade) => {
        const student = students.find((s) => s.id === grade.studentId);
        const semesterDetails = resolveSemesterDetails(
          grade.semesterId,
          grade.semesterInfo
        );
        const semesterLabel = getSemesterLabelById(
          grade.semesterId,
          semesterDetails || grade.semesterInfo
        );
        const tahunAjaranValue =
          semesterDetails?.tahunAjaran ||
          semesterDetails?.tahun ||
          grade.tahunAjaran ||
          grade.tahun ||
          null;
        const semesterNumberValue =
          semesterDetails?.semester ?? grade.semester ?? null;
        return {
          ...grade,
          studentName: student?.nama || "Unknown Student",
          semesterLabel,
          tahunAjaran: tahunAjaranValue ?? grade.tahunAjaran,
          semester:
            semesterNumberValue === undefined || semesterNumberValue === null
              ? grade.semester
              : semesterNumberValue,
        };
      });

      setGrades(gradesWithNames);
    } catch (error) {
      console.error("Error loading grades:", error);
      toast({
        title: "Error",
        description:
          error?.code === "SEMESTER_NOT_FOUND"
            ? "Semester tidak ditemukan. Silakan pilih semester lain."
            : error?.message || "Gagal memuat data nilai",
        variant: "destructive",
      });
    }
  };

  const loadAttendanceData = async (semesterIdParam = selectedSemesterId) => {
    try {
      const semesterIdToUse =
        semesterIdParam ||
        (semesters.length === 1 ? String(semesters[0].id) : null);
      const allAttendance = await apiService.getAttendance(
        semesterIdToUse || null
      );

      const teacherSubjectIds = subjects
        .map((s) => (s && typeof s === "object" ? s.id : s))
        .filter(Boolean);

      const teacherAttendance = allAttendance.filter((att) => {
        const attSubjectId =
          att && typeof att.subjectId === "object" && att.subjectId !== null
            ? att.subjectId.id
            : att.subjectId;
        return (
          att.teacherId === currentUser.teacherId &&
          teacherSubjectIds.includes(attSubjectId)
        );
      });

      const attendanceWithNames = teacherAttendance.map((att) => {
        const student = students.find((s) => s.id === att.studentId);
        const semesterDetails = resolveSemesterDetails(
          att.semesterId,
          att.semesterInfo
        );
        const semesterLabel = getSemesterLabelById(
          att.semesterId,
          semesterDetails || att.semesterInfo
        );
        const tahunAjaranValue =
          semesterDetails?.tahunAjaran ||
          semesterDetails?.tahun ||
          att.tahunAjaran ||
          att.tahun ||
          null;
        const semesterNumberValue =
          semesterDetails?.semester ?? att.semester ?? null;
        return {
          ...att,
          studentName: student?.nama || "Unknown Student",
          semesterLabel,
          tahunAjaran: tahunAjaranValue ?? att.tahunAjaran,
          semester:
            semesterNumberValue === undefined || semesterNumberValue === null
              ? att.semester
              : semesterNumberValue,
        };
      });

      setAttendance(attendanceWithNames);
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast({
        title: "Error",
        description:
          error?.code === "SEMESTER_NOT_FOUND"
            ? "Semester tidak ditemukan. Silakan pilih semester lain."
            : error?.message || "Gagal memuat data kehadiran",
        variant: "destructive",
      });
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();

    if (
      !gradeForm.studentId ||
      !gradeForm.subjectId ||
      !gradeForm.nilai ||
      !gradeForm.jenis
    ) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field wajib",
        variant: "destructive",
      });
      return;
    }

    const nilaiNumber = Number(gradeForm.nilai);
    if (isNaN(nilaiNumber) || nilaiNumber < 0 || nilaiNumber > 100) {
      toast({
        title: "Error",
        description: "Nilai harus antara 0-100",
        variant: "destructive",
      });
      return;
    }

    if (
      (gradeForm.jenis === "UTS" || gradeForm.jenis === "UAS") &&
      !editingGrade
    ) {
      const existingGrade = grades.find(
        (g) =>
          g.studentId === gradeForm.studentId &&
          g.subjectId === gradeForm.subjectId &&
          g.jenis === gradeForm.jenis
      );
      if (existingGrade) {
        toast({
          title: "Error",
          description: `${gradeForm.jenis} untuk mata pelajaran ini sudah ada. Gunakan edit untuk mengubah nilai.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const studentData = students.find(
        (s) => String(s.id) === String(gradeForm.studentId)
      );

      const semesterIdToUse =
        gradeForm.semesterId || selectedSemesterId || editingGrade?.semesterId;
      const semesterDetails = resolveSemesterDetails(
        semesterIdToUse,
        editingGrade?.semesterInfo
      );
      const tahunAjaranValue =
        semesterDetails?.tahunAjaran ||
        semesterDetails?.tahun ||
        gradeForm.tahunAjaran ||
        gradeForm.tahun ||
        editingGrade?.tahunAjaran ||
        editingGrade?.tahun ||
        null;
      const semesterNumberValue =
        semesterDetails?.semester ??
        gradeForm.semester ??
        editingGrade?.semester ??
        null;

      const gradeData = {
        ...(editingGrade?.id && { id: editingGrade.id }), // hanya ada saat edit
        studentId: gradeForm.studentId,
        subjectId: gradeForm.subjectId,
        jenis: gradeForm.jenis,
        nilai: nilaiNumber,
        kelasId:
          studentData?.kelasId ||
          gradeForm.kelasId ||
          editingGrade?.kelasId ||
          "1",
        tanggal: gradeForm.tanggal,
        teacherId: currentUser.teacherId,
        semesterId: semesterIdToUse ? String(semesterIdToUse) : null,
        verified: editingGrade?.verified ?? false,
      };

      if (tahunAjaranValue) {
        gradeData.tahunAjaran = tahunAjaranValue;
      }

      if (semesterNumberValue !== null && semesterNumberValue !== undefined) {
        gradeData.semester = semesterNumberValue;
      }

      let result;
      if (editingGrade) {
        result = await apiService.editGrade(
          currentUser.teacherId,
          gradeData,
          gradeData.semesterId
        );
      } else {
        result = await apiService.addGrade(
          currentUser.teacherId,
          gradeData,
          gradeData.semesterId
        );
      }

      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Nilai berhasil ${
            editingGrade ? "diupdate" : "ditambahkan"
          }`,
        });
        setShowGradeDialog(false);
        setGradeForm({
          studentId: "",
          subjectId: "",
          jenis: "",
          nilai: "",
          kelasId: "",
          tanggal: new Date().toISOString().split("T")[0],
          semesterId: selectedSemesterId || "",
        });
        setEditingGrade(null);
        await loadGradesData();
      } else {
        toast({
          title: "Error",
          description:
            result.code === "SEMESTER_NOT_FOUND"
              ? "Semester tidak ditemukan. Silakan pilih semester yang valid."
              : result.message || "Gagal menyimpan nilai",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.code === "SEMESTER_NOT_FOUND"
            ? "Semester tidak ditemukan. Silakan pilih semester yang valid."
            : error?.message || "Gagal menyimpan nilai",
        variant: "destructive",
      });

      console.log(error);
    }
  };

  const handleAddAttendance = async (e) => {
    e.preventDefault();

    if (
      !attendanceForm.studentId ||
      !attendanceForm.subjectId ||
      !attendanceForm.status
    ) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive",
      });
      return;
    }

    try {
      const studentData = students.find(
        (s) => String(s.id) === String(attendanceForm.studentId)
      );

      const semesterIdToUse =
        attendanceForm.semesterId ||
        selectedSemesterId ||
        editingAttendance?.semesterId;
      const semesterDetails = resolveSemesterDetails(
        semesterIdToUse,
        editingAttendance?.semesterInfo
      );
      const tahunAjaranValue =
        semesterDetails?.tahunAjaran ||
        semesterDetails?.tahun ||
        attendanceForm.tahunAjaran ||
        attendanceForm.tahun ||
        editingAttendance?.tahunAjaran ||
        editingAttendance?.tahun ||
        null;
      const semesterNumberValue =
        semesterDetails?.semester ??
        attendanceForm.semester ??
        editingAttendance?.semester ??
        null;

      const attendanceData = {
        ...(editingAttendance?.id && { id: editingAttendance.id }),
        studentId: attendanceForm.studentId,
        subjectId: attendanceForm.subjectId,
        status: attendanceForm.status,
        keterangan: attendanceForm.keterangan,
        tanggal: attendanceForm.tanggal,
        teacherId: currentUser.teacherId,
        kelasId:
          studentData?.kelasId ||
          attendanceForm.kelasId ||
          editingAttendance?.kelasId ||
          "1",
        semesterId: semesterIdToUse ? String(semesterIdToUse) : null,
      };

      if (tahunAjaranValue) {
        attendanceData.tahunAjaran = tahunAjaranValue;
      }

      if (semesterNumberValue !== null && semesterNumberValue !== undefined) {
        attendanceData.semester = semesterNumberValue;
      }

      let result;
      if (editingAttendance) {
        result = await apiService.editAttendance(
          currentUser.teacherId,
          attendanceData,
          attendanceData.semesterId
        );
      } else {
        result = await apiService.addAttendance(
          currentUser.teacherId,
          attendanceData,
          attendanceData.semesterId
        );
      }

      console.log(result);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Kehadiran berhasil ${
            editingAttendance ? "diupdate" : "dicatat"
          }`,
        });
        setShowAttendanceDialog(false);
        setAttendanceForm({
          studentId: "",
          subjectId: "",
          status: "",
          keterangan: "",
          kelasId: "",
          tanggal: new Date().toISOString().split("T")[0],
          semesterId: selectedSemesterId || "",
        });
        setEditingAttendance(null);
        await loadAttendanceData();
      } else {
        toast({
          title: "Error",
          description:
            result.code === "SEMESTER_NOT_FOUND"
              ? "Semester tidak ditemukan. Silakan pilih semester yang valid."
              : result.message || "Gagal menyimpan kehadiran",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.code === "SEMESTER_NOT_FOUND"
            ? "Semester tidak ditemukan. Silakan pilih semester yang valid."
            : error?.message || "Gagal menyimpan kehadiran",
        variant: "destructive",
      });

      console.log(error);
    }
  };

  const handleEditGrade = (grade) => {
    setGradeForm({
      studentId: grade.studentId,
      kelasId: grade.kelasId,
      subjectId:
        grade && typeof grade.subjectId === "object" && grade.subjectId !== null
          ? grade.subjectId.id
          : grade.subjectId,
      jenis: grade.jenis,
      nilai: grade.nilai.toString(),
      tanggal: grade.tanggal
        ? new Date(grade.tanggal).toISOString().split("T")[0]
        : "",
      semesterId:
        grade.semesterId
          ? String(grade.semesterId)
          : grade.semesterInfo?.id
          ? String(grade.semesterInfo.id)
          : selectedSemesterId || "",
    });
    setEditingGrade(grade);
    setShowGradeDialog(true);
  };

  const handleDeleteGrade = async (gradeId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus nilai ini?")) {
      try {
        const result = await apiService.deleteGrade(
          currentUser.teacherId,
          gradeId
        );

        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Nilai berhasil dihapus",
          });
          await loadGradesData();
        } else {
          toast({
            title: "Error",
            description: result.message || "Gagal menghapus nilai",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus nilai",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditAttendance = (attendance) => {
    setAttendanceForm({
      studentId: attendance.studentId,
      kelasId: attendance.kelasId,
      subjectId:
        attendance &&
        typeof attendance.subjectId === "object" &&
        attendance.subjectId !== null
          ? attendance.subjectId.id
          : attendance.subjectId,
      status: attendance.status,
      keterangan: attendance.keterangan,
      tanggal: attendance.tanggal
        ? new Date(attendance.tanggal).toISOString().split("T")[0]
        : "",
      semesterId:
        attendance.semesterId
          ? String(attendance.semesterId)
          : attendance.semesterInfo?.id
          ? String(attendance.semesterInfo.id)
          : selectedSemesterId || "",
    });
    setEditingAttendance(attendance);
    setShowAttendanceDialog(true);
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (
      window.confirm("Apakah Anda yakin ingin menghapus data kehadiran ini?")
    ) {
      try {
        const result = await apiService.deleteAttendance(
          currentUser.teacherId,
          attendanceId
        );

        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Data kehadiran berhasil dihapus",
          });
          await loadAttendanceData();
        } else {
          toast({
            title: "Error",
            description: result.message || "Gagal menghapus data kehadiran",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus data kehadiran",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewStudentList = (subject, kelasId) => {
    setSelectedSubjectId(subject);
    setSelectedSubjectKelasId(kelasId);
    setShowStudentListDialog(true);
  };

  const handleViewAllGrades = (subjectId, kelasId) => {
    setSelectedSubjectForGrades(subjectId);
    setSelectedSubjectKelasId(kelasId);
    setShowGradeTableDialog(true);
  };

  const handleViewAllAttendance = (subjectId, kelasId) => {
    setSelectedSubjectForAttendance(subjectId);
    setSelectedSubjectKelasId(kelasId);
    setShowAttendanceTableDialog(true);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => String(s.id) === String(subjectId));
    return subject ? `${subject.nama}` : "Pilih Mata Pelajaran";
  };

  const getStudentName = (id: string | number) => {
    const student = students.find((s) => String(s.id) === String(id));
    return student ? `${student.nama} (${student.nisn})` : "Pilih siswa";
  };

  const getClassesName = (id: string | number) => {
    const kelas = classes.find((c) => String(c.id) === String(id));
    return kelas ? kelas.nama : "";
  };

  const filteredStudents = students.filter(
    (student) => String(student.kelasId) === String(selectedSubjectKelasId)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-accent text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  Dashboard Guru
                </h1>
                <p className="opacity-90 text-sm md:text-base">
                  Selamat datang, {currentUser?.nama}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Periode Akademik
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedSemesterId
                ? `Menampilkan data untuk ${getSemesterLabelById(
                    selectedSemesterId
                  )}`
                : semesters.length > 0
                ? "Silakan pilih semester untuk menampilkan data."
                : "Data semester belum tersedia."}
            </p>
          </div>
          <div className="w-full md:w-64">
            <Select
              value={selectedSemesterId || ""}
              onValueChange={(value) => setSelectedSemesterId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester">
                  {selectedSemesterId
                    ? getSemesterLabelById(selectedSemesterId)
                    : semesters.length > 0
                    ? "Pilih semester"
                    : "Semester belum tersedia"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {semesters.length > 0 ? (
                  semesters.map((semester) => (
                    <SelectItem
                      key={semester.id}
                      value={String(semester.id)}
                    >
                      {buildSemesterLabel(semester) ||
                        `Semester ${semester.semester}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Data semester belum tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog
            open={showGradeDialog}
            onOpenChange={(open) => {
              setShowGradeDialog(open);
              if (!open) {
                setEditingGrade(null);
                setGradeForm({
                  studentId: "",
                  subjectId: "",
                  jenis: "",
                  nilai: "",
                  kelasId: "",
                  tanggal: new Date().toISOString().split("T")[0],
                  semesterId: selectedSemesterId || "",
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Input Nilai
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGrade ? "Edit Nilai Siswa" : "Input Nilai Siswa"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select
                    value={
                      gradeForm.subjectId && gradeForm.kelasId
                        ? `${gradeForm.subjectId}-${gradeForm.kelasId}`
                        : ""
                    }
                    onValueChange={(value) => {
                      const [subjectId, kelasId] = value.split("-");
                      setGradeForm((prev) => ({
                        ...prev,
                        subjectId,
                        kelasId,
                        studentId: "", // reset student kalau ganti subject
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject, idx) => (
                        <SelectItem
                          key={`${subject.id}-${subject.kelasId}-${idx}`}
                          value={`${subject.id}-${subject.kelasId}`}
                        >
                          {subject.nama} ({getClassesName(subject.kelasId)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Siswa</Label>
                  <Select
                    value={gradeForm.studentId}
                    onValueChange={(value) =>
                      setGradeForm((prev) => ({ ...prev, studentId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa">
                        {getStudentName(gradeForm.studentId)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {students
                        .filter(
                          (s) => String(s.kelasId) === String(gradeForm.kelasId)
                        )
                        .map((student) => (
                          <SelectItem
                            key={student.id}
                            value={String(student.id)}
                          >
                            {student.nama} ({student.nisn})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={gradeForm.semesterId || ""}
                    onValueChange={(value) =>
                      setGradeForm((prev) => ({
                        ...prev,
                        semesterId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih semester">
                        {gradeForm.semesterId
                          ? getSemesterLabelById(gradeForm.semesterId)
                          : semesters.length > 0
                          ? "Pilih semester"
                          : "Semester belum tersedia"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.length > 0 ? (
                        semesters.map((semester) => (
                          <SelectItem
                            key={semester.id}
                            value={String(semester.id)}
                          >
                            {buildSemesterLabel(semester) ||
                              `Semester ${semester.semester}`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Data semester belum tersedia
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jenis Penilaian</Label>
                    <Select
                      value={gradeForm.jenis}
                      onValueChange={(value) =>
                        setGradeForm((prev) => ({ ...prev, jenis: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nilai (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={gradeForm.nilai}
                      onChange={(e) =>
                        setGradeForm((prev) => ({
                          ...prev,
                          nilai: e.target.value,
                        }))
                      }
                      placeholder="Masukkan nilai"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={gradeForm.tanggal}
                    onChange={(e) =>
                      setGradeForm((prev) => ({
                        ...prev,
                        tanggal: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingGrade ? "Update Nilai" : "Simpan Nilai"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showAttendanceDialog}
            onOpenChange={(open) => {
              setShowAttendanceDialog(open);
              if (!open) {
                setEditingAttendance(null);
                setAttendanceForm({
                  studentId: "",
                  kelasId: "",
                  subjectId: "",
                  status: "",
                  keterangan: "",
                  tanggal: new Date().toISOString().split("T")[0],
                  semesterId: selectedSemesterId || "",
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Input Kehadiran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAttendance
                    ? "Edit Kehadiran Siswa"
                    : "Input Kehadiran Siswa"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAttendance} className="space-y-4">
                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select
                    value={
                      attendanceForm.subjectId && attendanceForm.kelasId
                        ? `${attendanceForm.subjectId}-${attendanceForm.kelasId}`
                        : ""
                    }
                    onValueChange={(value) => {
                      const [subjectId, kelasId] = value.split("-");
                      setAttendanceForm((prev) => ({
                        ...prev,
                        subjectId,
                        kelasId,
                        studentId: "", // reset student kalau ganti subject
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran">
                        {attendanceForm.subjectId
                          ? `${getSubjectName(
                              attendanceForm.subjectId
                            )} (${getClassesName(attendanceForm.kelasId)})`
                          : "Pilih mata pelajaran"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject, idx) => (
                        <SelectItem
                          key={`${subject.id}-${subject.kelasId}-${idx}`}
                          value={`${subject.id}-${subject.kelasId}`}
                        >
                          {subject.nama} ({getClassesName(subject.kelasId)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Student */}
                <div className="space-y-2">
                  <Label>Siswa</Label>
                  <Select
                    value={attendanceForm.studentId}
                    onValueChange={(value) =>
                      setAttendanceForm((prev) => ({
                        ...prev,
                        studentId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa">
                        {getStudentName(attendanceForm.studentId)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {students
                        .filter(
                          (s) =>
                            String(s.kelasId) === String(attendanceForm.kelasId)
                        )
                        .map((student) => (
                          <SelectItem
                            key={student.id}
                            value={String(student.id)}
                          >
                            {student.nama} ({student.nisn})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={attendanceForm.semesterId || ""}
                    onValueChange={(value) =>
                      setAttendanceForm((prev) => ({
                        ...prev,
                        semesterId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih semester">
                        {attendanceForm.semesterId
                          ? getSemesterLabelById(attendanceForm.semesterId)
                          : semesters.length > 0
                          ? "Pilih semester"
                          : "Semester belum tersedia"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.length > 0 ? (
                        semesters.map((semester) => (
                          <SelectItem
                            key={semester.id}
                            value={String(semester.id)}
                          >
                            {buildSemesterLabel(semester) ||
                              `Semester ${semester.semester}`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Data semester belum tersedia
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status Kehadiran</Label>
                    <Select
                      value={attendanceForm.status}
                      onValueChange={(value) =>
                        setAttendanceForm((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        {attendanceStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={attendanceForm.tanggal}
                      onChange={(e) =>
                        setAttendanceForm((prev) => ({
                          ...prev,
                          tanggal: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Keterangan (Opsional)</Label>
                  <Input
                    type="text"
                    value={attendanceForm.keterangan}
                    onChange={(e) =>
                      setAttendanceForm((prev) => ({
                        ...prev,
                        keterangan: e.target.value,
                      }))
                    }
                    placeholder="Masukkan keterangan jika diperlukan"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingAttendance ? "Update Kehadiran" : "Simpan Kehadiran"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grades Table Dialog */}
        <Dialog
          open={showGradeTableDialog}
          onOpenChange={setShowGradeTableDialog}
        >
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                Daftar Semua Nilai - {getSubjectName(selectedSubjectForGrades)}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Jenis Penilaian</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades
                    .filter(
                      (grade) =>
                        grade.subjectId === selectedSubjectForGrades &&
                        grade.kelasId === selectedSubjectKelasId
                    )
                    .map((grade) => {
                      const student = students.find(
                        (s) => s.id === grade.studentId
                      );
                      return (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">
                            {grade.studentName || student?.nama}
                          </TableCell>
                          <TableCell>{student?.nisn || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{grade.jenis}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getGradeColor(
                                grade.nilai
                              )} border-current`}
                            >
                              {grade.nilai}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(grade.tanggal)}
                          </TableCell>
                          <TableCell>{grade.semesterLabel || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={grade.verified ? "default" : "secondary"}
                            >
                              {grade.verified
                                ? "Terverifikasi"
                                : "Belum Verifikasi"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditGrade(grade)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteGrade(grade.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              {grades.filter(
                (grade) => grade.subjectId === selectedSubjectForGrades
              ).length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Belum ada nilai yang diinput untuk mata pelajaran ini
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance Table Dialog */}
        <Dialog
          open={showAttendanceTableDialog}
          onOpenChange={setShowAttendanceTableDialog}
        >
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                Daftar Semua Kehadiran -{" "}
                {getSubjectName(selectedSubjectForAttendance)}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Status Kehadiran</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance
                    .filter(
                      (att) =>
                        String(att.subjectId) ===
                          String(selectedSubjectForAttendance) &&
                        String(att.kelasId) === String(selectedSubjectKelasId)
                    )
                    .map((att) => {
                      const student = students.find(
                        (s) => s.id === att.studentId
                      );
                      return (
                        <TableRow key={att.id}>
                          <TableCell className="font-medium">
                            {att.studentName || student?.nama}
                          </TableCell>
                          <TableCell>{student?.nisn || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                att.status === "hadir" ? "default" : "secondary"
                              }
                              className={
                                att.status === "hadir"
                                  ? "bg-green-100 text-green-800"
                                  : att.status === "sakit"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : att.status === "izin"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {att.status === "hadir"
                                ? "Hadir"
                                : att.status === "sakit"
                                ? "Sakit"
                                : att.status === "izin"
                                ? "Izin"
                                : "Alfa"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(att.tanggal)}
                          </TableCell>
                          <TableCell>{att.semesterLabel || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {att.keterangan || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAttendance(att)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAttendance(att.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              {attendance.filter(
                (att) => att.subjectId === selectedSubjectForAttendance
              ).length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Belum ada data kehadiran untuk mata pelajaran ini
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Student List Dialog */}
        <Dialog
          open={showStudentListDialog}
          onOpenChange={setShowStudentListDialog}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Daftar Siswa - {getSubjectName(selectedSubjectId)} - Kelas{" "}
                {getClassesName(selectedSubjectKelasId)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex justify-between items-center p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {student.nama}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>NISN: {student.nisn}</span>
                          <span>Kelas: {student.kelasId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setGradeForm((prev) => ({
                            ...prev,
                            studentId: student.id,
                            subjectId: selectedSubjectId,
                          }));
                          setShowStudentListDialog(false);
                          setShowGradeDialog(true);
                        }}
                      >
                        Input Nilai
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAttendanceForm((prev) => ({
                            ...prev,
                            studentId: student.id,
                            subjectId: selectedSubjectId,
                          }));
                          setShowStudentListDialog(false);
                          setShowAttendanceDialog(true);
                        }}
                      >
                        Input Kehadiran
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Belum ada data siswa untuk kelas ini
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {subjects.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mata Pelajaran
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {students.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Siswa Diajar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <FileText className="h-8 w-8 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {grades.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Nilai Input</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="matapelajaran" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="matapelajaran"
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Mata Pelajaran</span>
            </TabsTrigger>
            <TabsTrigger value="siswa" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Daftar Siswa</span>
            </TabsTrigger>
          </TabsList>

          {/* Mata Pelajaran Tab */}
          <TabsContent value="matapelajaran" className="space-y-6">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : subjects.length > 0 ? (
              <div className="grid gap-6">
                {subjects.map((subject) => {
                  const subjectGrades = grades.filter(
                    (grade) =>
                      grade.subjectId === subject.id &&
                      grade.kelasId === subject.kelasId
                  );
                  const subjectAttendance = attendance.filter(
                    (att) =>
                      att.subjectId === subject.id &&
                      att.kelasId === subject.kelasId
                  );

                  return (
                    <Card key={subject.id} className="shadow-soft">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <span>
                                {getSubjectName(subject.id)} Kelas{" "}
                                {getClassesName(subject.kelasId)}
                              </span>
                            </CardTitle>
                            <p className="text-muted-foreground">
                              Nilai: {subjectGrades.length} | Kehadiran:{" "}
                              {subjectAttendance.length}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewStudentList(
                                  subject.id,
                                  subject.kelasId
                                )
                              }
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Lihat Siswa
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setGradeForm((prev) => ({
                                  ...prev,
                                  subjectId: subject.id,
                                }));
                                setShowGradeDialog(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Input Nilai
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAttendanceForm((prev) => ({
                                  ...prev,
                                  subjectId: subject.id,
                                }));
                                setShowAttendanceDialog(true);
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Input Kehadiran
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Grades Section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Nilai ({subjectGrades.length})
                              </h4>
                              {subjectGrades.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleViewAllGrades(
                                      subject.id,
                                      subject.kelasId
                                    )
                                  }
                                >
                                  Lihat Semua
                                </Button>
                              )}
                            </div>
                            {subjectGrades.length > 0 ? (
                              <div className="space-y-2">
                                {subjectGrades.slice(-3).map((grade) => (
                                  <div
                                    key={grade.id}
                                    className="flex justify-between items-center p-2 bg-muted/20 rounded"
                                  >
                                    <span className="text-sm">
                                      {grade.studentName}
                                    </span>
                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                      {grade.semesterLabel && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {grade.semesterLabel}
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {grade.jenis}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getGradeColor(
                                          grade.nilai
                                        )}`}
                                      >
                                        {grade.nilai}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                                {subjectGrades.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{subjectGrades.length - 3} nilai lainnya
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-xs">Belum ada nilai</p>
                              </div>
                            )}
                          </div>

                          {/* Attendance Section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Kehadiran ({subjectAttendance.length})
                              </h4>
                              {subjectAttendance.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleViewAllAttendance(
                                      subject.id,
                                      subject.kelasId
                                    )
                                  }
                                >
                                  Lihat Semua
                                </Button>
                              )}
                            </div>
                            {subjectAttendance.length > 0 ? (
                              <div className="space-y-2">
                                {subjectAttendance.slice(-3).map((att) => (
                                  <div
                                    key={att.id}
                                    className="flex justify-between items-center p-2 bg-muted/20 rounded"
                                  >
                                    <span className="text-sm">
                                      {att.studentName}
                                    </span>
                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                      {att.semesterLabel && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {att.semesterLabel}
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          att.status === "hadir"
                                            ? "bg-green-100 text-green-800"
                                            : att.status === "sakit"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : att.status === "izin"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {att.status === "hadir"
                                          ? "Hadir"
                                          : att.status === "sakit"
                                          ? "Sakit"
                                          : att.status === "izin"
                                          ? "Izin"
                                          : "Alfa"}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                                {subjectAttendance.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{subjectAttendance.length - 3} record
                                    lainnya
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <Calendar className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-xs">Belum ada kehadiran</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Belum ada mata pelajaran yang diampu
                </p>
              </div>
            )}
          </TabsContent>

          {/* Siswa Tab */}
          <TabsContent value="siswa">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Daftar Siswa yang Diajar</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex justify-between items-center p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {student.nama}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>NISN: {student.nisn}</span>
                              <span>Username: {student.username}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setGradeForm((prev) => ({
                                ...prev,
                                studentId: student.id,
                              }));
                              setShowGradeDialog(true);
                            }}
                          >
                            Input Nilai
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAttendanceForm((prev) => ({
                                ...prev,
                                studentId: student.id,
                              }));
                              setShowAttendanceDialog(true);
                            }}
                          >
                            Input Kehadiran
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Belum ada data siswa
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
