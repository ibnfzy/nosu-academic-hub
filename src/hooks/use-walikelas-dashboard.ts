import { useCallback, useEffect, useMemo, useState } from "react";
import apiService from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import {
  formatAcademicPeriod,
  formatDate,
  printReport,
} from "@/utils/helpers";

interface CurrentUser {
  id: string;
  nama?: string;
  kelasId?: string;
}

interface SemesterRecord {
  id?: string | number;
  tahunAjaran?: string | null;
  tahun?: string | null;
  academicYear?: string | null;
  year?: string | null;
  semester?: number | string | null;
  semesterNumber?: number | string | null;
  term?: number | string | null;
  tanggalMulai?: string | null;
  startDate?: string | null;
  tanggalSelesai?: string | null;
  endDate?: string | null;
  jumlahHariBelajar?: number | null;
  learningDays?: number | null;
  totalSchoolDays?: number | null;
  hariEfektif?: number | null;
  catatan?: string | null;
  notes?: string | null;
  keterangan?: string | null;
  isActive?: boolean;
}

interface StudentFormState {
  id?: string;
  userId?: string;
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

const createDefaultStudentForm = (): StudentFormState => ({
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
  username: "",
  password: "",
  email: "",
});

const formatSemesterNumberLabel = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    if (numericValue === 1) return "Semester Ganjil";
    if (numericValue === 2) return "Semester Genap";
    return `Semester ${numericValue}`;
  }
  return typeof value === "string" ? value : null;
};

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
  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [studentForm, setStudentForm] = useState<StudentFormState>(
    createDefaultStudentForm
  );

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
      [field]: value,
    }));
  }, []);

  const resetStudentForm = useCallback(() => {
    clearStudentForm();
    setShowStudentDialog(false);
  }, [clearStudentForm]);

  const editStudent = useCallback((student: any) => {
    setStudentForm({
      ...createDefaultStudentForm(),
      ...student,
    });
    setEditingStudent(student);
    setShowStudentDialog(true);
  }, []);

  const normalizeSemesterMetadata = useCallback((semesterItem: SemesterRecord | null | undefined) => {
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
      catatan:
        semesterItem.catatan || semesterItem.notes || semesterItem.keterangan || "",
      isActive: Boolean(semesterItem.isActive),
    };
  }, []);

  const getSemesterRecordById = useCallback(
    (semesterId: string | number | null | undefined) => {
      if (!semesterId) return null;
      return semesters.find((item) => String(item.id) === String(semesterId)) || null;
    },
    [semesters]
  );

  const resolveSemesterMetadata = useCallback(
    (semesterId: string | number | null | undefined, fallback: SemesterRecord | null | undefined = null) => {
      const record = getSemesterRecordById(semesterId) || fallback;
      return normalizeSemesterMetadata(record ?? null);
    },
    [getSemesterRecordById, normalizeSemesterMetadata]
  );

  const getEffectiveSemesterId = useCallback(
    (customId?: string | number | null) => {
      if (customId) return String(customId);
      if (selectedSemesterId) return String(selectedSemesterId);
      if (semesters.length === 1 && semesters[0]?.id) {
        return String(semesters[0].id);
      }
      return "";
    },
    [selectedSemesterId, semesters]
  );

  const buildSemesterTitle = useCallback(
    (metadata: ReturnType<typeof normalizeSemesterMetadata> | null, includeActiveFlag = false) => {
      if (!metadata) return "-";

      const semesterLabel = formatSemesterNumberLabel(metadata.semesterNumber);
      const parts: string[] = [];

      if (metadata.tahunAjaran) {
        parts.push(metadata.tahunAjaran as string);
      }

      if (semesterLabel) {
        parts.push(semesterLabel);
      }

      const baseLabel = parts.join(" - ") || "Semester";
      const activeSuffix = includeActiveFlag && metadata.isActive ? " (Aktif)" : "";

      return `${baseLabel}${activeSuffix}`;
    },
    []
  );

  const buildSemesterDateRange = useCallback(
    (metadata: ReturnType<typeof normalizeSemesterMetadata> | null) => {
      if (!metadata) return null;
      if (!metadata.tanggalMulai || !metadata.tanggalSelesai) return null;
      return `${formatDate(metadata.tanggalMulai)} - ${formatDate(
        metadata.tanggalSelesai
      )}`;
    },
    []
  );

  const getSemesterOptionLabel = useCallback(
    (semesterItem: SemesterRecord) => {
      const metadata = normalizeSemesterMetadata(semesterItem);
      if (!metadata) return "Semester";

      const baseLabel = buildSemesterTitle(metadata, true);
      const dateRange = buildSemesterDateRange(metadata);

      return dateRange ? `${baseLabel} (${dateRange})` : baseLabel;
    },
    [buildSemesterTitle, buildSemesterDateRange, normalizeSemesterMetadata]
  );

  const selectedSemesterMetadata = useMemo(() => {
    if (selectedSemesterId) {
      return resolveSemesterMetadata(selectedSemesterId);
    }
    if (semesters.length === 1) {
      return normalizeSemesterMetadata(semesters[0]);
    }
    return null;
  }, [normalizeSemesterMetadata, resolveSemesterMetadata, selectedSemesterId, semesters]);

  const selectedSemesterPeriodLabel = useMemo(() => {
    if (!selectedSemesterMetadata) return "-";

    const numericValue = Number(selectedSemesterMetadata.semesterNumber);
    const hasNumericSemester = !Number.isNaN(numericValue);

    if (selectedSemesterMetadata.tahunAjaran && hasNumericSemester) {
      return formatAcademicPeriod(
        selectedSemesterMetadata.tahunAjaran as string,
        numericValue
      );
    }

    return buildSemesterTitle(selectedSemesterMetadata);
  }, [buildSemesterTitle, selectedSemesterMetadata]);

  const selectedSemesterDateRange = useMemo(
    () => buildSemesterDateRange(selectedSemesterMetadata),
    [buildSemesterDateRange, selectedSemesterMetadata]
  );

  const loadSemesters = useCallback(async () => {
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
  }, [selectedSemesterId, toast]);

  const loadWalikelasData = useCallback(
    async (semesterIdParam?: string | number | null) => {
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
      } catch (error: any) {
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
    },
    [
      buildSemesterTitle,
      currentUser,
      getEffectiveSemesterId,
      resolveSemesterMetadata,
      toast,
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

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.nisn?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, students]
  );

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
        grades.some(
          (grade) => grade.studentId === student.id && grade.verified
        )
      ),
    [grades, students]
  );

  const handleStudentSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!studentForm.nama || !studentForm.nisn || !studentForm.username) {
        toast({
          title: "Error",
          description: "Mohon lengkapi field wajib",
          variant: "destructive",
        });
        return;
      }

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
            username: studentForm.nisn,
            password: studentForm.password || "default123",
            role: "siswa",
            email: studentForm.email,
          },
          students: {
            ...(editingStudent?.id && { id: editingStudent.id }),
            nama: studentForm.nama,
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
        if (editingStudent) {
          result = await apiService.updateClassStudent(
            currentUser?.id,
            studentData.students.id,
            studentData
          );
        } else {
          result = await apiService.addClassStudent(currentUser?.id, studentData);
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
          const result = await apiService.deleteClassStudent(
            currentUser?.id,
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
    },
    [currentUser, loadWalikelasData, toast]
  );

  const handleVerifyGrade = useCallback(
    async (gradeId: string) => {
      try {
        const result = await apiService.verifyGrade(currentUser?.id, gradeId);
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
    [currentUser, loadWalikelasData, toast]
  );

  const handleVerifyAll = useCallback(async () => {
    if (unverifiedGrades.length === 0 || !currentUser?.id) return;

    if (
      window.confirm(
        `Apakah Anda yakin ingin memverifikasi semua ${unverifiedGrades.length} nilai yang belum diverifikasi?`
      )
    ) {
      setLoading(true);
      try {
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
  }, [currentUser, loadWalikelasData, toast, unverifiedGrades]);

  const handlePrintReport = useCallback(
    async (student: any) => {
      try {
        const semesterIdForReport = getEffectiveSemesterId();
        const reportData = await apiService.getClassStudentReport(
          currentUser?.id,
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
    }, [currentUser, getEffectiveSemesterId, resolveSemesterMetadata, toast]);

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
    getSemesterOptionLabel,
    selectedSemesterMetadata,
    selectedSemesterPeriodLabel,
    selectedSemesterDateRange,
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
