import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardSemester } from "@/hooks/use-dashboard-semester";
import { useSemesterEnforcement } from "@/hooks/use-semester-enforcement";
import apiService from "@/services/apiService";
import { mergeUserData } from "@/utils/mergeUserData";
import { getStudyDayNumber } from "@/utils/helpers";

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
  userId?: Identifier | null;
  studentId?: Identifier | null;
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
  studyDayNumber?: number | null;
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
  studyDayNumber?: number | null;
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
  const findStudentByAnyId = useCallback(
    (candidateId: Identifier | null | undefined) => {
      if (candidateId === undefined || candidateId === null) {
        return undefined;
      }
      const target = String(candidateId);
      return students.find((student) => {
        if (!student) return false;
        const identifiers: Array<Identifier | null | undefined> = [
          student.studentId,
          student.userId,
          student.id,
        ];
        return identifiers.some((value) =>
          value !== undefined && value !== null
            ? String(value) === target
            : false
        );
      });
    },
    [students]
  );
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const { buildSemesterLabel, getSemesterLabelById, resolveSemesterMetadata } =
    useDashboardSemester({
      semesters,
    });
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showStudentListDialog, setShowStudentListDialog] = useState(false);
  const [showGradeTableDialog, setShowGradeTableDialog] = useState(false);
  const [selectedGradeTypeFilter, setSelectedGradeTypeFilter] =
    useState<string>("all");
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
  const [gradeContextLock, setGradeContextLock] = useState<
    | {
        subjectId?: string;
        kelasId?: string;
      }
    | null
  >(null);
  const [attendanceContextLock, setAttendanceContextLock] = useState<
    | {
        subjectId?: string;
        kelasId?: string;
      }
    | null
  >(null);
  const { toast } = useToast();
  const [semesterWarning, setSemesterWarning] = useState<string>("");
  const [uploadBlockedReason, setUploadBlockedReason] = useState<string>("");
  const semesterWarningRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (!showGradeTableDialog) {
      setSelectedGradeTypeFilter("all");
    }
  }, [showGradeTableDialog]);

  const attendanceStatuses = useMemo<AttendanceStatusOption[]>(
    () => [
      { value: "hadir", label: "Hadir" },
      { value: "sakit", label: "Sakit" },
      { value: "alfa", label: "Alfa" },
      { value: "izin", label: "Izin" },
    ],
    []
  );

  const resetGradeForm = useCallback(() => {
    setGradeForm({
      studentId: "",
      subjectId: "",
      jenis: "",
      nilai: "",
      kelasId: "",
      tanggal: new Date().toISOString().split("T")[0],
      semesterId: selectedSemesterId || "",
    });
    setGradeContextLock(null);
  }, [selectedSemesterId]);

  const resetAttendanceForm = useCallback(() => {
    setAttendanceForm({
      studentId: "",
      subjectId: "",
      status: "",
      keterangan: "",
      kelasId: "",
      tanggal: new Date().toISOString().split("T")[0],
      semesterId: selectedSemesterId || "",
    });
    setAttendanceContextLock(null);
  }, [selectedSemesterId]);

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
      console.error(error);
      toast({
        title: "Error",
        description: "Gagal memuat data semester",
        variant: "destructive",
      });
    }
  }, [enforcedActiveSemester, isStrictModeActive, selectedSemesterId, toast]);

  const loadTeacherData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const subjectsData = await apiService.getTeacherSubjects(
        currentUser.teacherId
      );
      const [
        allSubjectsResponse,
        classesResponse,
        usersResponse,
        studentsResponse,
        teachersResponse,
      ] = await Promise.all([
        apiService.getSubjects(),
        apiService.getClasses(),
        apiService.getUsers(),
        apiService.getStudents(),
        apiService.getTeachers(),
      ]);

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

      const mergedUsers = mergeUserData(
        Array.isArray(usersResponse) ? usersResponse : [],
        Array.isArray(studentsResponse) ? studentsResponse : [],
        Array.isArray(teachersResponse) ? teachersResponse : []
      );
      const studentRecords = mergedUsers.filter(
        (record) => record?.role === "siswa"
      );
      const studentsData = studentRecords.map((record) => ({
        ...record,
        id: record?.id as Identifier,
        userId: (record?.userId as Identifier | null) ?? null,
        studentId: (record?.studentId as Identifier | null) ?? null,
      })) as Student[];
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
        const explicitId =
          semesterIdParam !== undefined && semesterIdParam !== null
            ? String(semesterIdParam)
            : "";
        const defaultSemesterId = selectedSemesterId
          ? String(selectedSemesterId)
          : semesters.length === 1 && semesters[0]?.id
          ? String(semesters[0].id)
          : "";
        const enforcedId =
          enforcedActiveSemester?.id !== undefined &&
          enforcedActiveSemester?.id !== null
            ? String(enforcedActiveSemester.id)
            : "";

        const resolvedCandidateId =
          explicitId || defaultSemesterId || (isStrictModeActive ? enforcedId : "");
        const normalizedCandidateId =
          resolvedCandidateId && resolvedCandidateId !== ""
            ? resolvedCandidateId
            : null;

        const shouldUseId = shouldAttachSemesterId(normalizedCandidateId);

        if (isStrictModeActive && !shouldUseId) {
          const message = hasEnforcedActiveSemester
            ? "Penegakan semester aktif membutuhkan semester aktif yang valid. Hubungi admin untuk memperbarui daftar semester."
            : "Penegakan semester aktif sedang berjalan namun belum ada semester aktif. Hubungi admin untuk menetapkan semester aktif.";
          setUploadBlockedReason(message);
          setGrades([]);
          toast({
            title: "Penegakan semester aktif",
            description: message,
            variant: "destructive",
          });
          return;
        }

        const requestSemesterId = shouldUseId ? normalizedCandidateId : null;

        const metadataForCheck =
          (requestSemesterId
            ? resolveSemesterMetadata(requestSemesterId)
            : null) ?? enforcedActiveSemester;

        if (
          isStrictModeActive &&
          metadataForCheck &&
          isSemesterExpired(metadataForCheck)
        ) {
          const message =
            "Data semester aktif telah berakhir. Hubungi admin untuk memperbarui semester aktif sebelum melanjutkan.";
          setUploadBlockedReason(message);
          setGrades([]);
          toast({
            title: "Penegakan semester aktif",
            description: message,
            variant: "destructive",
          });
          return;
        }

        const allGradesResponse = await apiService.getGrades(requestSemesterId);

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
          const student = findStudentByAnyId(grade.studentId);
          const semesterDetails = resolveSemesterDetails(
            grade.semesterId,
            grade.semesterInfo
          );
          const semesterMetadata = resolveSemesterMetadata(
            grade.semesterId ?? null,
            semesterDetails || grade.semesterInfo
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
          const studyDayNumber = getStudyDayNumber(grade.tanggal, {
            semesterMetadata,
            semesterInfo: semesterDetails || grade.semesterInfo,
          });
          return {
            ...grade,
            studentName: student?.nama || "Unknown Student",
            semesterLabel,
            tahunAjaran: tahunAjaranValue ?? grade.tahunAjaran,
            semester:
              semesterNumberValue === undefined || semesterNumberValue === null
                ? grade.semester
                : semesterNumberValue,
            studyDayNumber,
          };
        });

        setGrades(gradesWithNames);
        setUploadBlockedReason("");
      } catch (error: unknown) {
        console.error("Error loading grades:", error);
        const { code, message } = (error as { code?: string; message?: string }) ?? {};
        let description = message || "Gagal memuat data nilai";

        if (code === "SEMESTER_NOT_ACTIVE") {
          description =
            "Semester yang dipilih belum aktif. Silakan pilih semester aktif untuk melihat data nilai.";
          setGrades([]);
        } else if (code === "ACTIVE_SEMESTER_NOT_FOUND") {
          description =
            "Belum ada semester aktif yang ditetapkan. Pilih semester aktif sebelum melihat data nilai.";
          setGrades([]);
        } else if (code === "SEMESTER_NOT_FOUND") {
          description = "Semester tidak ditemukan. Silakan pilih semester lain.";
        }

        toast({
          title: "Error",
          description,
          variant: "destructive",
        });
      }
    }, [
      currentUser?.teacherId,
      enforcedActiveSemester,
      getSemesterLabelById,
      hasEnforcedActiveSemester,
      isSemesterExpired,
      isStrictModeActive,
      resolveSemesterDetails,
      resolveSemesterMetadata,
      semesters,
      selectedSemesterId,
      shouldAttachSemesterId,
      students,
      subjects,
      toast,
    ]);

  const loadAttendanceData = useCallback(
    async (semesterIdParam?: string | number | null) => {
      try {
        const explicitId =
          semesterIdParam !== undefined && semesterIdParam !== null
            ? String(semesterIdParam)
            : "";
        const defaultSemesterId = selectedSemesterId
          ? String(selectedSemesterId)
          : semesters.length === 1 && semesters[0]?.id
          ? String(semesters[0].id)
          : "";
        const enforcedId =
          enforcedActiveSemester?.id !== undefined &&
          enforcedActiveSemester?.id !== null
            ? String(enforcedActiveSemester.id)
            : "";

        const resolvedCandidateId =
          explicitId || defaultSemesterId || (isStrictModeActive ? enforcedId : "");
        const normalizedCandidateId =
          resolvedCandidateId && resolvedCandidateId !== ""
            ? resolvedCandidateId
            : null;

        const shouldUseId = shouldAttachSemesterId(normalizedCandidateId);

        if (isStrictModeActive && !shouldUseId) {
          const message = hasEnforcedActiveSemester
            ? "Penegakan semester aktif membutuhkan semester aktif yang valid. Hubungi admin untuk memperbarui daftar semester."
            : "Penegakan semester aktif sedang berjalan namun belum ada semester aktif. Hubungi admin untuk menetapkan semester aktif.";
          setUploadBlockedReason(message);
          setAttendance([]);
          toast({
            title: "Penegakan semester aktif",
            description: message,
            variant: "destructive",
          });
          return;
        }

        const requestSemesterId = shouldUseId ? normalizedCandidateId : null;

        const metadataForCheck =
          (requestSemesterId
            ? resolveSemesterMetadata(requestSemesterId)
            : null) ?? enforcedActiveSemester;

        if (
          isStrictModeActive &&
          metadataForCheck &&
          isSemesterExpired(metadataForCheck)
        ) {
          const message =
            "Data semester aktif telah berakhir. Hubungi admin untuk memperbarui semester aktif sebelum melanjutkan.";
          setUploadBlockedReason(message);
          setAttendance([]);
          toast({
            title: "Penegakan semester aktif",
            description: message,
            variant: "destructive",
          });
          return;
        }

        const allAttendanceResponse = await apiService.getAttendance(
          requestSemesterId
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
          const student = findStudentByAnyId(att.studentId);
          const semesterDetails = resolveSemesterDetails(
            att.semesterId,
            att.semesterInfo
          );
          const semesterMetadata = resolveSemesterMetadata(
            att.semesterId ?? null,
            semesterDetails || att.semesterInfo
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
          const studyDayNumber = getStudyDayNumber(att.tanggal, {
            semesterMetadata,
            semesterInfo: semesterDetails || att.semesterInfo,
          });
          return {
            ...att,
            studentName: student?.nama || "Unknown Student",
            semesterLabel,
            tahunAjaran: tahunAjaranValue ?? att.tahunAjaran,
            semester:
              semesterNumberValue === undefined || semesterNumberValue === null
                ? att.semester
                : semesterNumberValue,
            studyDayNumber,
          };
        });

        setAttendance(attendanceWithNames);
        setUploadBlockedReason("");
      } catch (error: unknown) {
        console.error("Error loading attendance:", error);
        const { code, message } = (error as { code?: string; message?: string }) ?? {};
        let description = message || "Gagal memuat data kehadiran";

        if (code === "SEMESTER_NOT_ACTIVE") {
          description =
            "Semester yang dipilih belum aktif. Silakan pilih semester aktif untuk melihat data kehadiran.";
          setAttendance([]);
        } else if (code === "ACTIVE_SEMESTER_NOT_FOUND") {
          description =
            "Belum ada semester aktif yang ditetapkan. Pilih semester aktif sebelum melihat data kehadiran.";
          setAttendance([]);
        } else if (code === "SEMESTER_NOT_FOUND") {
          description = "Semester tidak ditemukan. Silakan pilih semester lain.";
        }

        toast({
          title: "Error",
          description,
          variant: "destructive",
        });
      }
    }, [
      currentUser?.teacherId,
      enforcedActiveSemester,
      getSemesterLabelById,
      hasEnforcedActiveSemester,
      isSemesterExpired,
      isStrictModeActive,
      resolveSemesterDetails,
      resolveSemesterMetadata,
      semesters,
      selectedSemesterId,
      shouldAttachSemesterId,
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
        const studentData = findStudentByAnyId(gradeForm.studentId);

        const semesterIdToUse: string | null =
          gradeForm.semesterId ||
          selectedSemesterId ||
          (editingGrade?.semesterId ? String(editingGrade.semesterId) : null);

        const semesterDetails = resolveSemesterDetails(
          semesterIdToUse,
          editingGrade?.semesterInfo
        );
        const enforcedId =
          enforcedActiveSemester?.id !== undefined &&
          enforcedActiveSemester?.id !== null
            ? String(enforcedActiveSemester.id)
            : null;
        const candidateSemesterId =
          semesterIdToUse || (isStrictModeActive ? enforcedId : null);
        const shouldUseSemesterId = shouldAttachSemesterId(candidateSemesterId);

        if (isStrictModeActive && !shouldUseSemesterId) {
          const message = hasEnforcedActiveSemester
            ? "Pengunggahan nilai diblokir karena semester aktif tidak tersedia. Hubungi admin untuk memperbarui daftar semester."
            : "Pengunggahan nilai diblokir karena belum ada semester aktif yang ditetapkan. Hubungi admin untuk bantuan lebih lanjut.";
          setUploadBlockedReason(message);
          toast({
            title: "Penegakan semester aktif",
            description: message,
            variant: "destructive",
          });
          handleGradeDialogOpenChange(false);
          return;
        }

        const requestSemesterId = shouldUseSemesterId
          ? candidateSemesterId
          : null;

        const semesterMetadataForCheck =
          (requestSemesterId
            ? resolveSemesterMetadata(requestSemesterId, semesterDetails)
            : null) ?? enforcedActiveSemester;

        if (
          isStrictModeActive &&
          semesterMetadataForCheck &&
          isSemesterExpired(semesterMetadataForCheck)
        ) {
          const message =
            "Pengunggahan nilai diblokir karena semester aktif telah berakhir. Hubungi admin untuk memperbarui semester aktif.";
          setUploadBlockedReason(message);
          toast({
            title: "Penegakan semester aktif",
            description: message,
            variant: "destructive",
          });
          handleGradeDialogOpenChange(false);
          return;
        }

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
          semesterId: requestSemesterId ? requestSemesterId : null,
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
          const resultCode =
            isRecord(result) && typeof result.code === "string"
              ? (result.code as string)
              : undefined;
          if (resultCode === "SEMESTER_NOT_ACTIVE") {
            toast({
              title: "Penegakan semester aktif",
              description:
                "Pengunggahan nilai diblokir karena semester yang dipilih belum aktif. Gunakan semester aktif sebelum menyimpan nilai.",
              variant: "destructive",
            });
            handleGradeDialogOpenChange(false);
          } else if (resultCode === "ACTIVE_SEMESTER_NOT_FOUND") {
            toast({
              title: "Penegakan semester aktif",
              description:
                "Belum ada semester aktif yang ditetapkan. Tetapkan semester aktif terlebih dahulu sebelum menambahkan nilai.",
              variant: "destructive",
            });
            handleGradeDialogOpenChange(false);
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
        }
      } catch (error) {
        const { code, message } = (error as { code?: string; message?: string }) ?? {};
        if (code === "SEMESTER_NOT_ACTIVE") {
          toast({
            title: "Penegakan semester aktif",
            description:
              "Pengunggahan nilai diblokir karena semester yang dipilih belum aktif. Gunakan semester aktif sebelum menyimpan nilai.",
            variant: "destructive",
          });
          handleGradeDialogOpenChange(false);
          return;
        }
        if (code === "ACTIVE_SEMESTER_NOT_FOUND") {
          toast({
            title: "Penegakan semester aktif",
            description:
              "Belum ada semester aktif yang ditetapkan. Tetapkan semester aktif terlebih dahulu sebelum menambahkan nilai.",
            variant: "destructive",
          });
          handleGradeDialogOpenChange(false);
          return;
        }

        toast({
          title: "Error",
          description: message || "Gagal menyimpan nilai",
          variant: "destructive",
        });
      }
    }, [
      currentUser?.teacherId,
      editingGrade,
      enforcedActiveSemester,
      gradeForm,
      grades,
      handleGradeDialogOpenChange,
      hasEnforcedActiveSemester,
      isSemesterExpired,
      isStrictModeActive,
      loadGradesData,
      resolveSemesterDetails,
      resolveSemesterMetadata,
      selectedSemesterId,
      shouldAttachSemesterId,
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
        const enforcedId =
          enforcedActiveSemester?.id !== undefined &&
          enforcedActiveSemester?.id !== null
            ? String(enforcedActiveSemester.id)
            : null;
        const candidateSemesterId =
          semesterIdToUse || (isStrictModeActive ? enforcedId : null);
        const shouldUseSemesterId = shouldAttachSemesterId(candidateSemesterId);

        if (isStrictModeActive && !shouldUseSemesterId) {
          const message = hasEnforcedActiveSemester
            ? "Pengunggahan kehadiran diblokir karena semester aktif tidak tersedia. Hubungi admin untuk memperbarui daftar semester."
            : "Pengunggahan kehadiran diblokir karena belum ada semester aktif yang ditetapkan. Hubungi admin untuk bantuan lebih lanjut.";
          setUploadBlockedReason(message);
          toast({
            title: "Penegakan semester aktif",
            description: message,
            variant: "destructive",
          });
          handleAttendanceDialogOpenChange(false);
          return;
        }

        const requestSemesterId = shouldUseSemesterId
          ? candidateSemesterId
          : null;

        const semesterMetadataForCheck =
          (requestSemesterId
            ? resolveSemesterMetadata(requestSemesterId, semesterDetails)
            : null) ?? enforcedActiveSemester;

        if (
          isStrictModeActive &&
          semesterMetadataForCheck &&
          isSemesterExpired(semesterMetadataForCheck)
        ) {
          const message =
            "Pengunggahan kehadiran diblokir karena semester aktif telah berakhir. Hubungi admin untuk memperbarui semester aktif.";
          setUploadBlockedReason(message);
          toast({
            title: "Penegakan semester aktif",
            description: message,
            variant: "destructive",
          });
          handleAttendanceDialogOpenChange(false);
          return;
        }

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
          semesterId: requestSemesterId ? requestSemesterId : null,
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
          const resultCode =
            isRecord(result) && typeof result.code === "string"
              ? (result.code as string)
              : undefined;
          if (resultCode === "SEMESTER_NOT_ACTIVE") {
            toast({
              title: "Penegakan semester aktif",
              description:
                "Pengunggahan kehadiran diblokir karena semester yang dipilih belum aktif. Gunakan semester aktif sebelum menyimpan data.",
              variant: "destructive",
            });
            handleAttendanceDialogOpenChange(false);
          } else if (resultCode === "ACTIVE_SEMESTER_NOT_FOUND") {
            toast({
              title: "Penegakan semester aktif",
              description:
                "Belum ada semester aktif yang ditetapkan. Tetapkan semester aktif terlebih dahulu sebelum menambahkan data kehadiran.",
              variant: "destructive",
            });
            handleAttendanceDialogOpenChange(false);
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
        }
      } catch (error) {
        const { code, message } = (error as { code?: string; message?: string }) ?? {};
        if (code === "SEMESTER_NOT_ACTIVE") {
          toast({
            title: "Penegakan semester aktif",
            description:
              "Pengunggahan kehadiran diblokir karena semester yang dipilih belum aktif. Gunakan semester aktif sebelum menyimpan data.",
            variant: "destructive",
          });
          handleAttendanceDialogOpenChange(false);
          return;
        }
        if (code === "ACTIVE_SEMESTER_NOT_FOUND") {
          toast({
            title: "Penegakan semester aktif",
            description:
              "Belum ada semester aktif yang ditetapkan. Tetapkan semester aktif terlebih dahulu sebelum menambahkan data kehadiran.",
            variant: "destructive",
          });
          handleAttendanceDialogOpenChange(false);
          return;
        }

        toast({
          title: "Error",
          description: message || "Gagal menyimpan kehadiran",
          variant: "destructive",
        });
      }
    }, [
      attendanceForm,
      currentUser?.teacherId,
      editingAttendance,
      enforcedActiveSemester,
      handleAttendanceDialogOpenChange,
      hasEnforcedActiveSemester,
      isSemesterExpired,
      isStrictModeActive,
      loadAttendanceData,
      resolveSemesterDetails,
      resolveSemesterMetadata,
      selectedSemesterId,
      shouldAttachSemesterId,
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
      const student = findStudentByAnyId(id);
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
    enforcementMode,
    enforcedActiveSemester,
    hasEnforcedActiveSemester,
    isRelaxedMode,
    isStrictMode,
    isStrictModeActive,
    semesters,
    selectedSemesterId,
    setSelectedSemesterId,
    gradeForm,
    setGradeForm,
    attendanceForm,
    setAttendanceForm,
    gradeTypes,
    selectedGradeTypeFilter,
    setSelectedGradeTypeFilter,
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
    semesterWarning,
    uploadBlockedReason,
    gradeContextLock,
    setGradeContextLock,
    attendanceContextLock,
    setAttendanceContextLock,
  };
}

export type UseTeacherDashboardReturn = ReturnType<typeof useTeacherDashboard>;
