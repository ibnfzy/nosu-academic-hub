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
  nis?: string;
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

export type TeacherSchedule = UnknownRecord & {
  id?: Identifier;
  kelasId?: Identifier | null;
  kelasNama?: string | null;
  subjectId?: Identifier | null;
  subjectNama?: string | null;
  teacherId?: Identifier | null;
  teacherNama?: string | null;
  semesterId?: Identifier | null;
  semesterNama?: string | null;
  semesterTahunAjaran?: string | null;
  hari?: string | null;
  jamMulai?: string | null;
  jamSelesai?: string | null;
  ruangan?: string | null;
  catatan?: string | null;
};

type TeacherSubjectRelation = UnknownRecord & {
  id?: Identifier;
  relationId?: Identifier;
  teacherSubjectId?: Identifier;
  teacherSubjectClassId?: Identifier;
  teacherId?: Identifier;
  guruId?: Identifier;
  subjectId?: Identifier;
  mapelId?: Identifier;
  kelasId?: Identifier;
  classId?: Identifier;
  teacher?: UnknownRecord | null;
  guru?: UnknownRecord | null;
  subject?: UnknownRecord | null;
  mapel?: UnknownRecord | null;
  kelas?: UnknownRecord | null;
  class?: UnknownRecord | null;
  pivot?: UnknownRecord | null;
};

export type TeacherSubjectOption = {
  id: string;
  label: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  kelasId: string;
  kelasName: string;
  relation: TeacherSubjectRelation | null;
};

type TeacherScheduleFilters = {
  kelasId: string;
  hari: string;
  teacherSubjectId: string;
};

type ScheduleConflictDetail = UnknownRecord & {
  hari?: string | null;
  jamMulai?: string | null;
  jamSelesai?: string | null;
  kelasNama?: string | null;
  teacherNama?: string | null;
  subjectNama?: string | null;
};

type ScheduleConflictInfo = {
  conflictScope?: string | null;
  conflicts: ScheduleConflictDetail[];
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

const toTeacherSchedule = (value: unknown): TeacherSchedule | null => {
  if (!isRecord(value)) {
    return null;
  }

  return value as TeacherSchedule;
};

const toStringOrEmpty = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  return String(value);
};

const toTextValue = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

const getCandidateValue = (source: unknown, paths: string[]): unknown => {
  if (!source || typeof source !== "object") return undefined;

  for (const path of paths) {
    const segments = path.split(".");
    let current: unknown = source;
    let isValidPath = true;

    for (const segment of segments) {
      if (!current || typeof current !== "object") {
        isValidPath = false;
        break;
      }

      if (!(segment in (current as Record<string, unknown>))) {
        isValidPath = false;
        break;
      }

      current = (current as Record<string, unknown>)[segment];
    }

    if (isValidPath && current !== undefined && current !== null) {
      return current;
    }
  }

  return undefined;
};

const RELATION_ID_PATHS = [
  "id",
  "relationId",
  "teacherSubjectId",
  "teacherSubjectClassId",
  "teacher_subject_id",
  "teacher_subject_class_id",
  "guruMapelKelasId",
  "guruMapelId",
  "mapelGuruKelasId",
  "pivot.id",
  "pivot.teacherSubjectId",
  "teacherSubject.id",
  "teacher_subject.id",
];

const RELATION_SUBJECT_PATHS = [
  "subjectId",
  "mapelId",
  "subject.id",
  "mapel.id",
  "pivot.subjectId",
  "pivot.mapelId",
];

const RELATION_CLASS_PATHS = [
  "kelasId",
  "classId",
  "kelas.id",
  "class.id",
  "pivot.kelasId",
  "pivot.classId",
];

const RELATION_TEACHER_PATHS = [
  "teacherId",
  "guruId",
  "teacher.id",
  "teacher.teacherId",
  "guru.id",
  "pivot.teacherId",
  "pivot.guruId",
];

const RELATION_TEACHER_NAME_PATHS = [
  "teacherNama",
  "guruNama",
  "teacher.nama",
  "teacher.name",
  "teacher.fullName",
  "guru.nama",
  "guru.name",
  "users.nama",
  "user.name",
];

const RELATION_SUBJECT_NAME_PATHS = [
  "subjectNama",
  "mapelNama",
  "subject.nama",
  "subject.name",
  "mapel.nama",
  "mapel.name",
];

const RELATION_CLASS_NAME_PATHS = [
  "kelasNama",
  "classNama",
  "kelas.nama",
  "kelas.name",
  "class.nama",
  "class.name",
];

const buildTeacherSubjectOption = (
  relation: TeacherSubjectRelation | null | undefined,
  {
    teacherIdFallback = "",
    teacherNameFallback = "",
    subjectNameMap,
    classNameMap,
  }: {
    teacherIdFallback?: string;
    teacherNameFallback?: string;
    subjectNameMap?: Map<string, string>;
    classNameMap?: Map<string, string>;
  } = {}
): TeacherSubjectOption | null => {
  if (!relation || typeof relation !== "object") return null;

  const subjectId = toStringOrEmpty(
    getCandidateValue(relation, RELATION_SUBJECT_PATHS)
  );
  const kelasId = toStringOrEmpty(
    getCandidateValue(relation, RELATION_CLASS_PATHS)
  );

  let relationId = toStringOrEmpty(
    getCandidateValue(relation, RELATION_ID_PATHS)
  );

  if (!relationId) {
    const fallbackParts = [subjectId, kelasId].filter((part) => part);
    if (fallbackParts.length > 0) {
      relationId = `relation-${fallbackParts.join("-")}`;
    }
  }

  if (!relationId) return null;

  const teacherId =
    toStringOrEmpty(getCandidateValue(relation, RELATION_TEACHER_PATHS)) ||
    teacherIdFallback;

  const teacherName =
    toTextValue(getCandidateValue(relation, RELATION_TEACHER_NAME_PATHS)) ||
    teacherNameFallback;

  const subjectName =
    toTextValue(getCandidateValue(relation, RELATION_SUBJECT_NAME_PATHS)) ||
    (subjectId ? subjectNameMap?.get(subjectId) ?? "" : "");

  const kelasName =
    toTextValue(getCandidateValue(relation, RELATION_CLASS_NAME_PATHS)) ||
    (kelasId ? classNameMap?.get(kelasId) ?? "" : "");

  const labelSegments = [teacherName, subjectName, kelasName].filter(
    (segment) => segment && segment.trim() !== ""
  );

  return {
    id: relationId,
    label:
      labelSegments.length > 0 ? labelSegments.join(" • ") : relationId,
    teacherId,
    teacherName,
    subjectId,
    subjectName,
    kelasId,
    kelasName,
    relation: relation ?? null,
  };
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
      return candidate;
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

export function useTeacherDashboard(currentUser: TeacherDashboardUser | null) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherSubjectRelations, setTeacherSubjectRelations] =
    useState<TeacherSubjectRelation[]>([]);
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
  const [teacherSchedules, setTeacherSchedules] = useState<TeacherSchedule[]>([]);
  const [teacherScheduleMetadata, setTeacherScheduleMetadata] =
    useState<UnknownRecord | null>(null);
  const [teacherScheduleError, setTeacherScheduleError] =
    useState<string | null>(null);
  const [teacherScheduleConflicts, setTeacherScheduleConflicts] =
    useState<ScheduleConflictInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [teacherScheduleFilters, setTeacherScheduleFilters] =
    useState<TeacherScheduleFilters>({
      kelasId: "",
      hari: "",
      teacherSubjectId: "",
    });
  const [isTeacherScheduleLoading, setIsTeacherScheduleLoading] =
    useState(false);
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

  const teacherScheduleClassFilter = teacherScheduleFilters.kelasId;
  const teacherScheduleDayFilter = teacherScheduleFilters.hari;
  const teacherScheduleSubjectFilter =
    teacherScheduleFilters.teacherSubjectId;

  const updateTeacherScheduleFilters = useCallback(
    (updates: Partial<TeacherScheduleFilters>) => {
      setTeacherScheduleFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const teacherSubjectOptions = useMemo<TeacherSubjectOption[]>(() => {
    const subjectNameMap = new Map<string, string>();
    subjects.forEach((subject) => {
      if (subject?.id === undefined || subject?.id === null) return;
      const subjectId = toStringOrEmpty(subject.id);
      if (!subjectId) return;
      const subjectName = toTextValue(subject.nama);
      if (subjectName) {
        subjectNameMap.set(subjectId, subjectName);
      }
    });

    const classNameMap = new Map<string, string>();
    classes.forEach((kelas) => {
      if (kelas?.id === undefined || kelas?.id === null) return;
      const kelasId = toStringOrEmpty(kelas.id);
      if (!kelasId) return;
      const kelasName = toTextValue(kelas.nama);
      if (kelasName) {
        classNameMap.set(kelasId, kelasName);
      }
    });

    const fallbackTeacherId = toStringOrEmpty(currentUser?.teacherId ?? "");
    const fallbackTeacherName = (() => {
      if (!currentUser) return "";
      const candidates: unknown[] = [currentUser.nama];
      if (isRecord(currentUser)) {
        const record = currentUser as UnknownRecord;
        candidates.push(record.name, record.fullName, record.displayName);
      }
      for (const candidate of candidates) {
        const text = toTextValue(candidate);
        if (text) {
          return text;
        }
      }
      return "";
    })();

    const optionsMap = new Map<string, TeacherSubjectOption>();

    teacherSubjectRelations.forEach((relation) => {
      const option = buildTeacherSubjectOption(relation, {
        teacherIdFallback: fallbackTeacherId,
        teacherNameFallback: fallbackTeacherName,
        subjectNameMap,
        classNameMap,
      });
      if (option) {
        optionsMap.set(option.id, option);
      }
    });

    const hasOptionFor = (subjectId: string, kelasId: string) => {
      for (const option of optionsMap.values()) {
        if (option.subjectId === subjectId && option.kelasId === kelasId) {
          return true;
        }
      }
      return false;
    };

    subjects.forEach((subject) => {
      const subjectId = toStringOrEmpty(subject?.id ?? "");
      if (!subjectId) return;
      const kelasId = toStringOrEmpty(subject?.kelasId ?? "");
      if (subjectId && hasOptionFor(subjectId, kelasId)) {
        return;
      }

      const subjectName =
        toTextValue(subject?.nama) || subjectNameMap.get(subjectId) || "";
      const kelasName = kelasId ? classNameMap.get(kelasId) ?? "" : "";
      const labelSegments = [
        fallbackTeacherName,
        subjectName,
        kelasName,
      ].filter((segment) => segment && segment.trim() !== "");

      const fallbackIdParts = [subjectId];
      if (kelasId) fallbackIdParts.push(kelasId);
      const fallbackId = `subject-${fallbackIdParts.join("-")}`;

      optionsMap.set(fallbackId, {
        id: fallbackId,
        label:
          labelSegments.length > 0
            ? labelSegments.join(" • ")
            : fallbackId,
        teacherId: fallbackTeacherId,
        teacherName: fallbackTeacherName,
        subjectId,
        subjectName,
        kelasId,
        kelasName,
        relation: null,
      });
    });

    return Array.from(optionsMap.values());
  }, [classes, currentUser, subjects, teacherSubjectRelations]);

  useEffect(() => {
    const selectedId = teacherScheduleFilters.teacherSubjectId;
    if (!selectedId) {
      return;
    }

    const exists = teacherSubjectOptions.some(
      (option) => option.id === selectedId
    );

    if (!exists) {
      setTeacherScheduleFilters((prev) => {
        if (!prev.teacherSubjectId) {
          return prev;
        }
        return { ...prev, teacherSubjectId: "" };
      });
    }
  }, [teacherScheduleFilters.teacherSubjectId, teacherSubjectOptions]);

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
      const normalizedTeacherSubjectRelations = Array.isArray(subjectsData)
        ? subjectsData
            .map((item) => {
              if (isRecord(item)) {
                return item as TeacherSubjectRelation;
              }
              if (isIdentifier(item)) {
                return {
                  id: item,
                  subjectId: item,
                } as TeacherSubjectRelation;
              }
              return null;
            })
            .filter(
              (
                item
              ): item is TeacherSubjectRelation => item !== null
            )
        : [];

      setTeacherSubjectRelations(normalizedTeacherSubjectRelations);
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
                  getCandidateValue(item, RELATION_SUBJECT_PATHS) ??
                  getCandidateValue(item, ["id"]);
                return extractIdentifier(candidate);
              }
              return null;
            })
            .filter((value): value is Identifier => value !== null)
        : [];
      const subjectIdSet = new Set(subjectIds.map((value) => String(value)));

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

      const teacherSubjects =
        subjectIdSet.size > 0
          ? allSubjects.filter((subj) =>
              subj?.id !== undefined && subj?.id !== null
                ? subjectIdSet.has(String(subj.id))
                : false
            )
          : [];

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
      setTeacherSubjectRelations([]);
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

  const loadTeacherSchedules = useCallback(async () => {
    if (!currentUser?.teacherId) {
      setTeacherSchedules([]);
      setTeacherScheduleMetadata(null);
      setTeacherScheduleError(null);
      setTeacherScheduleConflicts(null);
      return;
    }

    setIsTeacherScheduleLoading(true);
    setTeacherScheduleError(null);
    setTeacherScheduleConflicts(null);

    try {
      const response = await apiService.getTeacherSchedules(
        currentUser.teacherId,
        {
          semesterId:
            selectedSemesterId && selectedSemesterId !== ""
              ? selectedSemesterId
              : undefined,
          kelasId:
            teacherScheduleClassFilter && teacherScheduleClassFilter !== ""
              ? teacherScheduleClassFilter
              : undefined,
          hari:
            teacherScheduleDayFilter && teacherScheduleDayFilter !== ""
              ? teacherScheduleDayFilter
              : undefined,
          teacherSubjectId:
            teacherScheduleSubjectFilter &&
            teacherScheduleSubjectFilter !== ""
              ? teacherScheduleSubjectFilter
              : undefined,
        }
      );

      const normalizeSchedules = (items: unknown): TeacherSchedule[] => {
        if (!Array.isArray(items)) return [];
        return items
          .map((item) => toTeacherSchedule(item))
          .filter((item): item is TeacherSchedule => item !== null);
      };

      let schedules: TeacherSchedule[] = [];
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
          metadata = Object.keys(fallbackMetadata).length > 0
            ? fallbackMetadata
            : null;
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
          const candidate = toTeacherSchedule(record);
          schedules = candidate ? [candidate] : [];
        }
      } else {
        schedules = [];
      }

      setTeacherSchedules(schedules);
      setTeacherScheduleMetadata(metadata);
      setTeacherScheduleError(null);
    } catch (error) {
      console.error("Error loading teacher schedules:", error);
      const err = (error as {
        message?: string;
        code?: unknown;
        details?: unknown;
      }) || { message: "Gagal memuat jadwal guru" };

      const codeString =
        typeof err.code === "number"
          ? String(err.code)
          : typeof err.code === "string"
          ? err.code
          : "";

      const message =
        err.message ||
        (codeString === "404"
          ? "Jadwal tidak ditemukan untuk filter yang dipilih."
          : codeString === "409"
          ? "Terjadi konflik pada jadwal yang dipilih."
          : "Gagal memuat jadwal guru");

      setTeacherSchedules([]);
      setTeacherScheduleMetadata(null);
      setTeacherScheduleError(message);

      if (codeString === "409") {
        const details = (err as { details?: unknown }).details;
        const detailRecord = isRecord(details) ? (details as UnknownRecord) : null;
        const conflictScope =
          typeof detailRecord?.conflictScope === "string"
            ? (detailRecord.conflictScope as string)
            : null;
        const conflictsRaw = Array.isArray(detailRecord?.conflicts)
          ? (detailRecord?.conflicts as unknown[])
          : [];
        const conflicts = conflictsRaw
          .map((item) => toScheduleConflictDetail(item))
          .filter((item): item is ScheduleConflictDetail => item !== null);

        setTeacherScheduleConflicts({
          conflictScope,
          conflicts,
        });
      } else {
        setTeacherScheduleConflicts(null);
      }

      if (codeString !== "404") {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsTeacherScheduleLoading(false);
    }
  }, [
    currentUser?.teacherId,
    selectedSemesterId,
    teacherScheduleClassFilter,
    teacherScheduleDayFilter,
    teacherScheduleSubjectFilter,
    toast,
  ]);

  useEffect(() => {
    if (currentUser) {
      loadSemesters();
      loadTeacherData();
    }
  }, [currentUser, loadSemesters, loadTeacherData]);

  useEffect(() => {
    if (!currentUser?.teacherId) {
      setTeacherSchedules([]);
      setTeacherScheduleMetadata(null);
      setTeacherScheduleError(null);
      setTeacherScheduleConflicts(null);
      setIsTeacherScheduleLoading(false);
      return;
    }

    loadTeacherSchedules();
  }, [currentUser?.teacherId, loadTeacherSchedules]);

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
      return student
        ? `${student.nama} (NIS: ${student.nis || "-"} • NISN: ${
            student.nisn || "-"
          })`
        : "Pilih siswa";
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
    classes,
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
    teacherSchedules,
    teacherSubjectOptions,
    teacherScheduleFilters,
    updateTeacherScheduleFilters,
    isTeacherScheduleLoading,
    teacherScheduleError,
    teacherScheduleMetadata,
    teacherScheduleConflicts,
    loadTeacherSchedules,
  };
}

export type UseTeacherDashboardReturn = ReturnType<typeof useTeacherDashboard>;
