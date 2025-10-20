import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { formatAcademicPeriod } from "@/utils/helpers";

type Identifier = string | number;
type UnknownRecord = Record<string, unknown>;

export type TeacherDashboardUser = UnknownRecord & {
  teacherId?: Identifier;
  nama?: string;
};

export type Semester = UnknownRecord & {
  id: Identifier;
  label?: string;
  semester?: number;
  semesterNumber?: number;
  term?: number;
  tahunAjaran?: string;
  tahun?: string;
  academicYear?: string;
  year?: string;
  isActive?: boolean;
};

export type ClassInfo = UnknownRecord & {
  id: Identifier;
  nama?: string;
};

export type Subject = UnknownRecord & {
  id: Identifier;
  nama?: string;
  kelasId?: Identifier;
};

export type Student = UnknownRecord & {
  id: Identifier;
  nama?: string;
  nisn?: string;
  kelasId?: Identifier;
  username?: string;
  role?: string;
};

export type GradeRecord = UnknownRecord & {
  id?: Identifier;
  studentId: Identifier;
  subjectId: Identifier;
  jenis: string;
  nilai: number;
  kelasId?: Identifier;
  tanggal?: string;
  teacherId?: Identifier;
  semesterId?: Identifier | null;
  verified?: boolean;
  semesterInfo?: Semester;
  tahunAjaran?: string;
  tahun?: string;
  semester?: number;
  studentName?: string;
  semesterLabel?: string;
};

export type AttendanceRecord = UnknownRecord & {
  id?: Identifier;
  studentId: Identifier;
  subjectId: Identifier;
  kelasId?: Identifier;
  status: string;
  tanggal?: string;
  teacherId?: Identifier;
  semesterId?: Identifier | null;
  semesterInfo?: Semester;
  tahunAjaran?: string;
  tahun?: string;
  semester?: number;
  studentName?: string;
  semesterLabel?: string;
  keterangan?: string;
};

type GradeFormState = {
  studentId: string;
  subjectId: string;
  jenis: string;
  nilai: string;
  kelasId: string;
  tanggal: string;
  semesterId: string;
  tahunAjaran?: string;
  tahun?: string;
  semester?: number | string;
};

type AttendanceFormState = {
  studentId: string;
  subjectId: string;
  status: string;
  keterangan: string;
  kelasId: string;
  tanggal: string;
  semesterId: string;
  tahunAjaran?: string;
  tahun?: string;
  semester?: number | string;
};

type AttendanceStatusOption = {
  value: string;
  label: string;
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const isIdentifier = (value: unknown): value is Identifier =>
  typeof value === "string" || typeof value === "number";

const extractIdentifier = (value: unknown): Identifier | null => {
  if (isIdentifier(value)) {
    return value;
  }
  if (isRecord(value) && isIdentifier(value.id)) {
    return value.id;
  }
  return null;
};

const toSemester = (value: unknown): Semester | null => {
  if (!isRecord(value) || !isIdentifier(value.id)) {
    return null;
  }
  return value as Semester;
};

const toClassInfo = (value: unknown): ClassInfo | null => {
  if (!isRecord(value) || !isIdentifier(value.id)) {
    return null;
  }
  return value as ClassInfo;
};

const toSubject = (value: unknown): Subject | null => {
  if (!isRecord(value) || !isIdentifier(value.id)) {
    return null;
  }
  return value as Subject;
};

const toStudent = (value: unknown): Student | null => {
  if (!isRecord(value) || !isIdentifier(value.id)) {
    return null;
  }
  return value as Student;
};

const toGradeRecord = (value: unknown): GradeRecord | null => {
  if (!isRecord(value)) {
    return null;
  }
  const record = value as UnknownRecord;
  const studentId = extractIdentifier(record.studentId);
  const subjectId = extractIdentifier(record.subjectId);
  if (!studentId || !subjectId) {
    return null;
  }
  const nilaiValue = record.nilai;
  if (
    nilaiValue !== undefined &&
    typeof nilaiValue !== "number" &&
    typeof nilaiValue !== "string"
  ) {
    return null;
  }
  return {
    ...record,
    nilai: typeof nilaiValue === "string" ? Number(nilaiValue) : (nilaiValue as number),
    studentId,
    subjectId,
  } as GradeRecord;
};

const toAttendanceRecord = (value: unknown): AttendanceRecord | null => {
  if (!isRecord(value)) {
    return null;
  }
  const record = value as UnknownRecord;
  const studentId = extractIdentifier(record.studentId);
  const subjectId = extractIdentifier(record.subjectId);
  if (!studentId || !subjectId) {
    return null;
  }
  const statusValue = record.status;
  if (typeof statusValue !== "string") {
    return null;
  }
  return {
    ...record,
    studentId,
    subjectId,
    status: statusValue,
  } as AttendanceRecord;
};

export function useTeacherDashboard(currentUser: TeacherDashboardUser | null) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showStudentListDialog, setShowStudentListDialog] = useState(false);
  const [showGradeTableDialog, setShowGradeTableDialog] = useState(false);
  const [showAttendanceTableDialog, setShowAttendanceTableDialog] =
    useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<Identifier | "">(
    ""
  );
  const [selectedSubjectKelasId, setSelectedSubjectKelasId] = useState<
    Identifier | ""
  >(""
  );
  const [selectedSubjectForGrades, setSelectedSubjectForGrades] = useState<
    Identifier | ""
  >(""
  );
  const [selectedSubjectForAttendance, setSelectedSubjectForAttendance] =
    useState<Identifier | "">("");
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<
    AttendanceRecord | null
  >(null);
  const { toast } = useToast();

  const [gradeForm, setGradeForm] = useState<GradeFormState>({
    studentId: "",
    subjectId: "",
    jenis: "",
    nilai: "",
    kelasId: "",
    tanggal: new Date().toISOString().split("T")[0],
    semesterId: "",
  });

  const [attendanceForm, setAttendanceForm] = useState<AttendanceFormState>({
    studentId: "",
    subjectId: "",
    status: "",
    keterangan: "",
    kelasId: "",
    tanggal: new Date().toISOString().split("T")[0],
    semesterId: "",
  });

  const gradeTypes = useMemo<string[]>(
    () => ["Ulangan Harian", "UTS", "UAS", "Kuis", "Tugas"],
    []
  );

  const attendanceStatuses = useMemo<AttendanceStatusOption[]>(
    () => [
      { value: "hadir", label: "Hadir" },
      { value: "sakit", label: "Sakit" },
      { value: "alfa", label: "Alfa" },
      { value: "izin", label: "Izin" },
    ],
    []
  );

  const resetGradeForm = useCallback(
    () =>
      setGradeForm({
        studentId: "",
        subjectId: "",
        jenis: "",
        nilai: "",
        kelasId: "",
        tanggal: new Date().toISOString().split("T")[0],
        semesterId: selectedSemesterId || "",
      }),
    [selectedSemesterId]
  );

  const resetAttendanceForm = useCallback(
    () =>
      setAttendanceForm({
        studentId: "",
        subjectId: "",
        status: "",
        keterangan: "",
        kelasId: "",
        tanggal: new Date().toISOString().split("T")[0],
        semesterId: selectedSemesterId || "",
      }),
    [selectedSemesterId]
  );

  const handleGradeDialogOpenChange = useCallback(
    (open: boolean) => {
      setShowGradeDialog(open);
      if (!open) {
        setEditingGrade(null);
        resetGradeForm();
      }
    },
    [resetGradeForm]
  );

  const handleAttendanceDialogOpenChange = useCallback(
    (open: boolean) => {
      setShowAttendanceDialog(open);
      if (!open) {
        setEditingAttendance(null);
        resetAttendanceForm();
      }
    },
    [resetAttendanceForm]
  );

  const getSemesterRecordById = useCallback(
    (id: Identifier | null) => {
      if (!id) return null;
      return semesters.find((semester) => String(semester.id) === String(id));
    },
    [semesters]
  );

  const buildSemesterLabel = useCallback((semesterItem: Semester | null) => {
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

    if (
      !tahunAjaran &&
      (semesterNumber === null || semesterNumber === undefined)
    ) {
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
  }, []);

  const getSemesterLabelById = useCallback(
    (id: Identifier | null, fallback?: Semester | null) => {
      const semesterRecord = getSemesterRecordById(id);
      return (
        buildSemesterLabel(semesterRecord) ||
        buildSemesterLabel(fallback) ||
        "-"
      );
    },
    [buildSemesterLabel, getSemesterRecordById]
  );

  const resolveSemesterDetails = useCallback(
    (semesterId: Identifier | null, fallback: Semester | null | undefined) => {
      return getSemesterRecordById(semesterId) || fallback || null;
    },
    [getSemesterRecordById]
  );

  const loadSemesters = useCallback(async () => {
    try {
      const semestersData = await apiService.getSemesters();
      const normalizedSemesters = Array.isArray(semestersData)
        ? semestersData
            .map((item) => toSemester(item))
            .filter((item): item is Semester => item !== null)
        : [];

      setSemesters(normalizedSemesters);

      if (normalizedSemesters.length > 0) {
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
      console.error(error);
      toast({
        title: "Error",
        description: "Gagal memuat data semester",
        variant: "destructive",
      });
    }
  }, [selectedSemesterId, toast]);

  const loadTeacherData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const subjectsData = await apiService.getTeacherSubjects(
        currentUser.teacherId
      );
      const allSubjectsResponse = await apiService.getSubjects();
      const classesResponse = await apiService.getClasses();

      const subjectIds: Identifier[] = Array.isArray(subjectsData)
        ? subjectsData
            .map((item) => {
              if (isIdentifier(item)) {
                return item;
              }
              if (isRecord(item)) {
                const candidate =
                  (item.subjectId as unknown) ?? (item.id as unknown);
                return isIdentifier(candidate) ? candidate : null;
              }
              return null;
            })
            .filter((value): value is Identifier => value !== null)
        : [];

      const allSubjects = Array.isArray(allSubjectsResponse)
        ? allSubjectsResponse
            .map((item) => toSubject(item))
            .filter((item): item is Subject => item !== null)
        : [];

      const classesData = Array.isArray(classesResponse)
        ? classesResponse
            .map((item) => toClassInfo(item))
            .filter((item): item is ClassInfo => item !== null)
        : [];

      const teacherSubjects = allSubjects.filter((subj) =>
        subjectIds.includes(subj.id)
      );

      setSubjects(teacherSubjects);
      setClasses(classesData);

      const allUsers = await apiService.getUsers();
      const studentsData = Array.isArray(allUsers)
        ? allUsers
            .map((item) => toStudent(item))
            .filter(
              (student): student is Student =>
                student !== null && student.role === "siswa"
            )
        : [];
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
  }, [currentUser, toast]);

  const loadGradesData = useCallback(
    async (semesterIdParam?: string | number | null) => {
      try {
        const semesterIdToUse =
          semesterIdParam ||
          (semesters.length === 1 ? String(semesters[0].id) : null);
        const allGradesResponse = await apiService.getGrades(
          semesterIdToUse || null
        );

        const allGrades = Array.isArray(allGradesResponse)
          ? allGradesResponse
              .map((item) => toGradeRecord(item))
              .filter((item): item is GradeRecord => item !== null)
          : [];

        const teacherSubjectIds = subjects.map((s) => s.id);

        const teacherGrades = allGrades.filter(
          (grade) =>
            grade.teacherId === currentUser?.teacherId &&
            teacherSubjectIds.includes(grade.subjectId)
        );

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
      } catch (error: unknown) {
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
    }, [
      currentUser?.teacherId,
      getSemesterLabelById,
      resolveSemesterDetails,
      semesters,
      students,
      subjects,
      toast,
    ]);

  const loadAttendanceData = useCallback(
    async (semesterIdParam?: string | number | null) => {
      try {
        const semesterIdToUse =
          semesterIdParam ||
          (semesters.length === 1 ? String(semesters[0].id) : null);
        const allAttendanceResponse = await apiService.getAttendance(
          semesterIdToUse || null
        );

        const allAttendance = Array.isArray(allAttendanceResponse)
          ? allAttendanceResponse
              .map((item) => toAttendanceRecord(item))
              .filter((item): item is AttendanceRecord => item !== null)
          : [];

        const teacherSubjectIds = subjects.map((s) => s.id);

        const teacherAttendance = allAttendance.filter(
          (att) =>
            att.teacherId === currentUser?.teacherId &&
            teacherSubjectIds.includes(att.subjectId)
        );

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
      } catch (error: unknown) {
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
    }, [
      currentUser?.teacherId,
      getSemesterLabelById,
      resolveSemesterDetails,
      semesters,
      students,
      subjects,
      toast,
    ]);

  useEffect(() => {
    if (currentUser) {
      loadSemesters();
      loadTeacherData();
    }
  }, [currentUser, loadSemesters, loadTeacherData]);

  useEffect(() => {
    const hasSemesterSelection = semesters.length === 0 || selectedSemesterId;
    if (students.length > 0 && subjects.length > 0 && hasSemesterSelection) {
      loadGradesData();
      loadAttendanceData();
    }
  }, [
    loadAttendanceData,
    loadGradesData,
    semesters.length,
    selectedSemesterId,
    students.length,
    subjects.length,
  ]);

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
  }, [editingAttendance, editingGrade, selectedSemesterId]);

  const handleAddGrade = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!gradeForm.studentId || !gradeForm.subjectId || !gradeForm.nilai || !gradeForm.jenis) {
        toast({
          title: "Error",
          description: "Mohon lengkapi semua field wajib",
          variant: "destructive",
        });
        return;
      }

      const nilaiNumber = Number(gradeForm.nilai);
      if (Number.isNaN(nilaiNumber) || nilaiNumber < 0 || nilaiNumber > 100) {
        toast({
          title: "Error",
          description: "Nilai harus antara 0-100",
          variant: "destructive",
        });
        return;
      }

      if ((gradeForm.jenis === "UTS" || gradeForm.jenis === "UAS") && !editingGrade) {
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

        const semesterIdToUse: string | null =
          gradeForm.semesterId ||
          selectedSemesterId ||
          (editingGrade?.semesterId ? String(editingGrade.semesterId) : null);

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

        const kelasIdValue: Identifier =
          (studentData?.kelasId as Identifier | undefined) ||
          (gradeForm.kelasId ? (gradeForm.kelasId as Identifier) : undefined) ||
          (editingGrade?.kelasId as Identifier | undefined) ||
          "1";

        const gradeData: GradeRecord = {
          ...(editingGrade?.id ? { id: editingGrade.id } : {}),
          studentId: gradeForm.studentId,
          subjectId: gradeForm.subjectId,
          jenis: gradeForm.jenis,
          nilai: nilaiNumber,
          kelasId: kelasIdValue,
          tanggal: gradeForm.tanggal,
          teacherId: currentUser?.teacherId,
          semesterId: semesterIdToUse ? semesterIdToUse : null,
          verified: editingGrade?.verified ?? false,
        };

        if (tahunAjaranValue) {
          gradeData.tahunAjaran = tahunAjaranValue;
        }

        if (semesterNumberValue !== null && semesterNumberValue !== undefined) {
          gradeData.semester = semesterNumberValue;
        }

        let result: unknown;
        if (editingGrade) {
          result = await apiService.editGrade(
            currentUser?.teacherId,
            gradeData,
            gradeData.semesterId
          );
        } else {
          result = await apiService.addGrade(
            currentUser?.teacherId,
            gradeData,
            gradeData.semesterId
          );
        }

        const success =
          isRecord(result) && typeof result.success === "boolean"
            ? result.success
            : false;

        if (success) {
          toast({
            title: "Berhasil",
            description: `Nilai berhasil ${editingGrade ? "diupdate" : "ditambahkan"}`,
          });
          handleGradeDialogOpenChange(false);
          await loadGradesData();
        } else {
          toast({
            title: "Error",
            description:
              isRecord(result) && typeof result.message === "string"
                ? result.message
                : "Gagal menyimpan nilai",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menyimpan nilai",
          variant: "destructive",
        });
      }
    }, [
      currentUser?.teacherId,
      editingGrade,
      gradeForm,
      grades,
      handleGradeDialogOpenChange,
      loadGradesData,
      resolveSemesterDetails,
      selectedSemesterId,
      students,
      toast,
    ]);

  const handleAddAttendance = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!attendanceForm.studentId || !attendanceForm.subjectId || !attendanceForm.status) {
        toast({
          title: "Error",
          description: "Mohon lengkapi semua field wajib",
          variant: "destructive",
        });
        return;
      }

      try {
        const semesterIdToUse: string | null =
          attendanceForm.semesterId ||
          selectedSemesterId ||
          (editingAttendance?.semesterId
            ? String(editingAttendance.semesterId)
            : null);
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

        const attendanceData: AttendanceRecord = {
          ...(editingAttendance?.id ? { id: editingAttendance.id } : {}),
          studentId: attendanceForm.studentId,
          kelasId:
            (attendanceForm.kelasId as Identifier | undefined) ||
            (editingAttendance?.kelasId as Identifier | undefined) ||
            "1",
          subjectId: attendanceForm.subjectId,
          status: attendanceForm.status,
          keterangan: attendanceForm.keterangan,
          tanggal: attendanceForm.tanggal,
          teacherId: currentUser?.teacherId,
          semesterId: semesterIdToUse ? semesterIdToUse : null,
        };

        if (tahunAjaranValue) {
          attendanceData.tahunAjaran = tahunAjaranValue;
        }

        if (semesterNumberValue !== null && semesterNumberValue !== undefined) {
          attendanceData.semester = semesterNumberValue;
        }

        let result: unknown;
        if (editingAttendance) {
          result = await apiService.editAttendance(
            currentUser?.teacherId,
            attendanceData,
            attendanceData.semesterId
          );
        } else {
          result = await apiService.addAttendance(
            currentUser?.teacherId,
            attendanceData,
            attendanceData.semesterId
          );
        }

        const success =
          isRecord(result) && typeof result.success === "boolean"
            ? result.success
            : false;

        if (success) {
          toast({
            title: "Berhasil",
            description: `Data kehadiran berhasil ${
              editingAttendance ? "diupdate" : "ditambahkan"
            }`,
          });
          handleAttendanceDialogOpenChange(false);
          await loadAttendanceData();
        } else {
          toast({
            title: "Error",
            description:
              isRecord(result) && typeof result.message === "string"
                ? result.message
                : "Gagal menyimpan kehadiran",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menyimpan kehadiran",
          variant: "destructive",
        });
      }
    }, [
      attendanceForm,
      currentUser?.teacherId,
      editingAttendance,
      handleAttendanceDialogOpenChange,
      loadAttendanceData,
      resolveSemesterDetails,
      selectedSemesterId,
      toast,
    ]);

  const handleEditGrade = useCallback(
    (grade: GradeRecord) => {
      setGradeForm({
        studentId: String(grade.studentId),
        subjectId: String(grade.subjectId),
        jenis: grade.jenis,
        nilai: grade.nilai.toString(),
        tanggal: grade.tanggal
          ? new Date(grade.tanggal).toISOString().split("T")[0]
          : "",
        semesterId:
          grade.semesterId !== null && grade.semesterId !== undefined
            ? String(grade.semesterId)
            : grade.semesterInfo?.id
            ? String(grade.semesterInfo.id)
            : selectedSemesterId || "",
        kelasId: grade.kelasId ? String(grade.kelasId) : "",
      });
      setEditingGrade(grade);
      setShowGradeDialog(true);
    }, [selectedSemesterId]);

  const handleDeleteGrade = useCallback(
    async (gradeId: Identifier) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus nilai ini?")) {
        try {
          const result = await apiService.deleteGrade(
            currentUser?.teacherId,
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
    }, [currentUser?.teacherId, loadGradesData, toast]);

  const handleEditAttendance = useCallback(
    (attendanceItem: AttendanceRecord) => {
      setAttendanceForm({
        studentId: String(attendanceItem.studentId),
        kelasId: attendanceItem.kelasId ? String(attendanceItem.kelasId) : "",
        subjectId: String(attendanceItem.subjectId),
        status: attendanceItem.status,
        keterangan: attendanceItem.keterangan ?? "",
        tanggal: attendanceItem.tanggal
          ? new Date(attendanceItem.tanggal).toISOString().split("T")[0]
          : "",
        semesterId:
          attendanceItem.semesterId !== null && attendanceItem.semesterId !== undefined
            ? String(attendanceItem.semesterId)
            : attendanceItem.semesterInfo?.id
            ? String(attendanceItem.semesterInfo.id)
            : selectedSemesterId || "",
      });
      setEditingAttendance(attendanceItem);
      setShowAttendanceDialog(true);
    }, [selectedSemesterId]);

  const handleDeleteAttendance = useCallback(
    async (attendanceId: Identifier) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus data kehadiran ini?")) {
        try {
          const result = await apiService.deleteAttendance(
            currentUser?.teacherId,
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
    }, [currentUser?.teacherId, loadAttendanceData, toast]);

  const handleViewStudentList = useCallback((subject: Identifier, kelasId: Identifier) => {
    setSelectedSubjectId(subject);
    setSelectedSubjectKelasId(kelasId);
    setShowStudentListDialog(true);
  }, []);

  const handleViewAllGrades = useCallback((subjectId: Identifier, kelasId: Identifier) => {
    setSelectedSubjectForGrades(subjectId);
    setSelectedSubjectKelasId(kelasId);
    setShowGradeTableDialog(true);
  }, []);

  const handleViewAllAttendance = useCallback(
    (subjectId: Identifier, kelasId: Identifier) => {
      setSelectedSubjectForAttendance(subjectId);
      setSelectedSubjectKelasId(kelasId);
      setShowAttendanceTableDialog(true);
    },
    []
  );

  const getSubjectName = useCallback(
    (subjectId: Identifier | "") => {
      const subject = subjects.find((s) => String(s.id) === String(subjectId));
      return subject ? `${subject.nama}` : "Pilih Mata Pelajaran";
    },
    [subjects]
  );

  const getStudentName = useCallback(
    (id: Identifier | "") => {
      const student = students.find((s) => String(s.id) === String(id));
      return student ? `${student.nama} (${student.nisn})` : "Pilih siswa";
    },
    [students]
  );

  const getClassesName = useCallback(
    (id: Identifier | "") => {
      const kelas = classes.find((c) => String(c.id) === String(id));
      return kelas ? kelas.nama : "";
    },
    [classes]
  );

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) => String(student.kelasId) === String(selectedSubjectKelasId)
      ),
    [selectedSubjectKelasId, students]
  );

  return {
    subjects,
    students,
    grades,
    attendance,
    loading,
    semesters,
    selectedSemesterId,
    setSelectedSemesterId,
    gradeForm,
    setGradeForm,
    attendanceForm,
    setAttendanceForm,
    gradeTypes,
    attendanceStatuses,
    showGradeDialog,
    setShowGradeDialog,
    handleGradeDialogOpenChange,
    showAttendanceDialog,
    setShowAttendanceDialog,
    handleAttendanceDialogOpenChange,
    showStudentListDialog,
    setShowStudentListDialog,
    showGradeTableDialog,
    setShowGradeTableDialog,
    showAttendanceTableDialog,
    setShowAttendanceTableDialog,
    editingGrade,
    editingAttendance,
    handleAddGrade,
    handleAddAttendance,
    handleEditGrade,
    handleDeleteGrade,
    handleEditAttendance,
    handleDeleteAttendance,
    handleViewStudentList,
    handleViewAllGrades,
    handleViewAllAttendance,
    getSubjectName,
    getStudentName,
    getClassesName,
    filteredStudents,
    selectedSubjectId,
    selectedSubjectKelasId,
    selectedSubjectForGrades,
    selectedSubjectForAttendance,
    buildSemesterLabel,
    getSemesterLabelById,
  };
}

export type UseTeacherDashboardReturn = ReturnType<typeof useTeacherDashboard>;
