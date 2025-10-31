import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  SearchableCombobox,
  type SearchableComboboxOption,
} from "@/components/ui/searchable-combobox";
import {
  Plus,
  Loader2,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

interface AdminScheduleManagementProps {
  onDataChange?: () => void;
}

type ScheduleRecord = {
  id?: string;
  kelasId?: string | number | null;
  kelasNama?: string | null;
  subjectId?: string | number | null;
  subjectNama?: string | null;
  teacherId?: string | number | null;
  teacherNama?: string | null;
  teacherSubjectId?: string | number | null;
  teacherSubject?: TeacherSubjectRelation | null;
  semesterId?: string | number | null;
  semesterNama?: string | null;
  semesterTahunAjaran?: string | null;
  hari?: string | null;
  jamMulai?: string | null;
  jamSelesai?: string | null;
  walikelasId?: string | number | null;
  walikelasNama?: string | null;
  ruangan?: string | null;
  catatan?: string | null;
  [key: string]: unknown;
};

type ScheduleFormState = {
  kelasId: string;
  subjectId: string;
  teacherId: string;
  teacherSubjectId: string;
  semesterId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  walikelasId: string;
  ruangan: string;
  catatan: string;
};

type ConflictDetail = {
  hari?: unknown;
  jamMulai?: unknown;
  jamSelesai?: unknown;
  kelasNama?: unknown;
  teacherNama?: unknown;
  subjectNama?: unknown;
  [key: string]: unknown;
};

type ConflictInfo = {
  conflictScope?: string;
  conflicts?: ConflictDetail[];
};

type OptionEntity = {
  id?: string | number;
  teacherId?: string | number;
  nama?: string;
  name?: string;
  fullName?: string;
  role?: string;
  users?: {
    role?: string;
    roleName?: string;
    nama?: string;
    [key: string]: unknown;
  };
  user?: {
    role?: string;
    name?: string;
    [key: string]: unknown;
  };
  isWalikelas?: boolean;
  isHomeroom?: boolean;
  walikelas?: {
    id?: string | number;
    teacherId?: string | number;
    userId?: string | number;
    nama?: string;
    [key: string]: unknown;
  };
  walikelasId?: string | number;
  walikelasTeacherId?: string | number;
  walikelasNama?: string;
  tahunAjaran?: string;
  [key: string]: unknown;
};

type TeacherSubjectRelation = {
  id?: string | number;
  relationId?: string | number;
  teacherId?: string | number;
  guruId?: string | number;
  subjectId?: string | number;
  mapelId?: string | number;
  kelasId?: string | number;
  classId?: string | number;
  teacherNama?: string;
  guruNama?: string;
  subjectNama?: string;
  mapelNama?: string;
  kelasNama?: string;
  classNama?: string;
  teacher?: OptionEntity | null;
  guru?: OptionEntity | null;
  subject?: OptionEntity | null;
  mapel?: OptionEntity | null;
  kelas?: OptionEntity | null;
  class?: OptionEntity | null;
  pivot?: Record<string, unknown> | null;
  [key: string]: unknown;
};

type TeacherSubjectOption = {
  id: string;
  label: string;
  teacherId: string;
  subjectId: string;
  kelasId: string;
  teacherName: string;
  subjectName: string;
  kelasName: string;
  relation: TeacherSubjectRelation | null;
};

type ScheduleError = Partial<Error> & {
  code?: number;
  message?: string;
  details?: {
    conflicts?: Array<Record<string, unknown>>;
    conflictScope?: string;
    [key: string]: unknown;
  };
};

const toScheduleError = (error: unknown): ScheduleError => {
  if (error instanceof Error) {
    return error as ScheduleError;
  }

  if (error && typeof error === "object") {
    return error as ScheduleError;
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return { message: undefined };
};

const DAY_OPTIONS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const INITIAL_FILTERS = {
  kelasId: "",
  teacherId: "",
  teacherSubjectId: "",
  semesterId: "",
  hari: "",
  walikelasId: "",
};

const INITIAL_FORM_STATE: ScheduleFormState = {
  kelasId: "",
  subjectId: "",
  teacherId: "",
  teacherSubjectId: "",
  semesterId: "",
  hari: "",
  jamMulai: "",
  jamSelesai: "",
  walikelasId: "",
  ruangan: "",
  catatan: "",
};

const SELECT_ALL_VALUE = "all";
const SELECT_NONE_VALUE = "none";

const toStringOrEmpty = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  return `${value}`;
};

const toTextValue = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return `${value}`;
  return "";
};

const getCandidateValue = (
  source: unknown,
  paths: string[]
): unknown => {
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

const buildTeacherSubjectOption = (
  relation: TeacherSubjectRelation | null | undefined,
  {
    teacherNameMap,
    subjectNameMap,
    classNameMap,
  }: {
    teacherNameMap?: Map<string, string>;
    subjectNameMap?: Map<string, string>;
    classNameMap?: Map<string, string>;
  } = {}
): TeacherSubjectOption | null => {
  if (!relation || typeof relation !== "object") return null;

  const id = toStringOrEmpty(
    (getCandidateValue(relation, [
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
    ]) as string | number | undefined) ?? ""
  );

  if (!id) return null;

  const teacherId = toStringOrEmpty(
    (getCandidateValue(relation, [
      "teacherId",
      "guruId",
      "teacher.id",
      "teacher.teacherId",
      "guru.id",
      "pivot.teacherId",
      "pivot.guruId",
    ]) as string | number | undefined) ?? ""
  );

  const subjectId = toStringOrEmpty(
    (getCandidateValue(relation, [
      "subjectId",
      "mapelId",
      "subject.id",
      "mapel.id",
      "pivot.subjectId",
      "pivot.mapelId",
    ]) as string | number | undefined) ?? ""
  );

  const kelasId = toStringOrEmpty(
    (getCandidateValue(relation, [
      "kelasId",
      "classId",
      "kelas.id",
      "class.id",
      "pivot.kelasId",
      "pivot.classId",
    ]) as string | number | undefined) ?? ""
  );

  const teacherName =
    toTextValue(
      getCandidateValue(relation, [
        "teacherNama",
        "guruNama",
        "teacher.nama",
        "teacher.name",
        "teacher.fullName",
        "guru.nama",
        "guru.name",
        "users.nama",
        "user.name",
      ])
    ) || (teacherId && teacherNameMap?.get(teacherId)) || "";

  const subjectName =
    toTextValue(
      getCandidateValue(relation, [
        "subjectNama",
        "mapelNama",
        "subject.nama",
        "subject.name",
        "mapel.nama",
        "mapel.name",
      ])
    ) || (subjectId && subjectNameMap?.get(subjectId)) || "";

  const kelasName =
    toTextValue(
      getCandidateValue(relation, [
        "kelasNama",
        "classNama",
        "kelas.nama",
        "kelas.name",
        "class.nama",
        "class.name",
      ])
    ) || (kelasId && classNameMap?.get(kelasId)) || "";

  const labelSegments = [
    teacherName || "Guru",
    subjectName || "Mapel",
    kelasName || "Kelas",
  ];

  return {
    id,
    label: labelSegments.join(" • "),
    teacherId,
    subjectId,
    kelasId,
    teacherName,
    subjectName,
    kelasName,
    relation: relation ?? null,
  };
};

const getScheduleRelation = (
  schedule: ScheduleRecord | null | undefined
): TeacherSubjectRelation | null => {
  if (!schedule || typeof schedule !== "object") return null;

  const candidates = [
    schedule.teacherSubject,
    (schedule as Record<string, unknown>).teacher_subject,
    (schedule as Record<string, unknown>).teacherSubjectRelation,
    (schedule as Record<string, unknown>).teacherSubjectClass,
    (schedule as Record<string, unknown>).teacher_subject_class,
    (schedule as Record<string, unknown>).teacherSubjectMapping,
    (schedule as Record<string, unknown>).teacherSubjectMapel,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object") {
      return candidate as TeacherSubjectRelation;
    }
  }

  return null;
};

const mapHomeroomTeachers = (
  teachers: OptionEntity[] = [],
  classes: OptionEntity[] = []
): Array<{ id: string; nama: string }> => {
  const collection = new Map<string, { id: string; nama: string }>();

  teachers.forEach((teacher) => {
    const teacherId = toStringOrEmpty(teacher?.id ?? teacher?.teacherId);
    if (!teacherId) return;
    const role =
      teacher?.role ||
      teacher?.users?.role ||
      teacher?.user?.role ||
      teacher?.users?.roleName;

    if (role === "walikelas" || teacher?.isWalikelas || teacher?.isHomeroom) {
      const nama =
        teacher?.nama ||
        teacher?.name ||
        teacher?.fullName ||
        teacher?.users?.nama ||
        teacher?.user?.name ||
        "Walikelas";
      collection.set(teacherId, { id: teacherId, nama });
    }
  });

  classes.forEach((kelas) => {
    const walikelasId = toStringOrEmpty(
      kelas?.walikelasId ??
        kelas?.walikelasTeacherId ??
        kelas?.walikelas?.id ??
        kelas?.walikelas?.teacherId ??
        kelas?.walikelas?.userId
    );

    if (!walikelasId) return;

    if (!collection.has(walikelasId)) {
      const fallbackTeacher = teachers.find(
        (teacher) =>
          toStringOrEmpty(teacher?.id) === walikelasId ||
          toStringOrEmpty(teacher?.teacherId) === walikelasId
      );

      const nama =
        kelas?.walikelas?.nama ||
        kelas?.walikelasNama ||
        fallbackTeacher?.nama ||
        fallbackTeacher?.name ||
        fallbackTeacher?.fullName ||
        "Walikelas";

      collection.set(walikelasId, { id: walikelasId, nama });
    }
  });

  return Array.from(collection.values());
};

const formatConflict = (conflict: ConflictDetail, index: number) => {
  const segments: string[] = [];

  const day = toStringOrEmpty(conflict.hari);
  if (day) segments.push(day);

  const startTime = toStringOrEmpty(conflict.jamMulai);
  const endTime = toStringOrEmpty(conflict.jamSelesai);
  if (startTime || endTime) {
    const start = startTime || "?";
    const end = endTime || "?";
    segments.push(`${start} - ${end}`);
  }

  const className = toStringOrEmpty(conflict.kelasNama);
  if (className) segments.push(`Kelas ${className}`);

  const teacherName = toStringOrEmpty(conflict.teacherNama);
  if (teacherName) segments.push(`Guru ${teacherName}`);

  const subjectName = toStringOrEmpty(conflict.subjectNama);
  if (subjectName) segments.push(`Mapel ${subjectName}`);

  if (segments.length === 0) {
    return `Konflik ${index + 1}`;
  }

  return segments.join(" • ");
};

export default function AdminScheduleManagement({
  onDataChange,
}: AdminScheduleManagementProps) {
  const { toast } = useToast();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [classes, setClasses] = useState<OptionEntity[]>([]);
  const [subjects, setSubjects] = useState<OptionEntity[]>([]);
  const [teachers, setTeachers] = useState<OptionEntity[]>([]);
  const [semesters, setSemesters] = useState<OptionEntity[]>([]);
  const [teacherSubjectRelations, setTeacherSubjectRelations] = useState<
    TeacherSubjectRelation[]
  >([]);
  const [homeroomTeachers, setHomeroomTeachers] = useState<
    Array<{ id: string; nama: string }>
  >([]);

  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(
    INITIAL_FORM_STATE
  );
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormDataLoading, setIsFormDataLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isReferenceLoading, setIsReferenceLoading] = useState(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleRecord | null>(
    null
  );
  const [detailSchedule, setDetailSchedule] = useState<ScheduleRecord | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  const homeroomFilterOptions = useMemo(() => homeroomTeachers, [
    homeroomTeachers,
  ]);

  const teacherNameMap = useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((teacher) => {
      const id = toStringOrEmpty(teacher?.id ?? teacher?.teacherId);
      if (!id) return;
      const name =
        toTextValue(teacher?.nama) ||
        toTextValue(teacher?.name) ||
        toTextValue(teacher?.fullName) ||
        toTextValue(teacher?.users?.nama) ||
        toTextValue(teacher?.user?.name);
      if (name) {
        map.set(id, name);
      }
    });
    return map;
  }, [teachers]);

  const subjectNameMap = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((subject) => {
      const id = toStringOrEmpty(subject?.id ?? subject?.subjectId);
      if (!id) return;
      const name =
        toTextValue(subject?.nama) ||
        toTextValue(subject?.name) ||
        toTextValue((subject as Record<string, unknown>)?.subjectNama);
      if (name) {
        map.set(id, name);
      }
    });
    return map;
  }, [subjects]);

  const classNameMap = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((kelas) => {
      const id = toStringOrEmpty(kelas?.id ?? kelas?.kelasId);
      if (!id) return;
      const name =
        toTextValue(kelas?.nama) ||
        toTextValue(kelas?.name) ||
        toTextValue((kelas as Record<string, unknown>)?.kelasNama);
      if (name) {
        map.set(id, name);
      }
    });
    return map;
  }, [classes]);

  const teacherSubjectOptions = useMemo(() => {
    return teacherSubjectRelations
      .map((relation) =>
        buildTeacherSubjectOption(relation, {
          teacherNameMap,
          subjectNameMap,
          classNameMap,
        })
      )
      .filter((option): option is TeacherSubjectOption => Boolean(option));
  }, [
    teacherSubjectRelations,
    teacherNameMap,
    subjectNameMap,
    classNameMap,
  ]);

  const teacherSubjectOptionMap = useMemo(() => {
    const map = new Map<string, TeacherSubjectOption>();
    teacherSubjectOptions.forEach((option) => {
      map.set(option.id, option);
    });
    return map;
  }, [teacherSubjectOptions]);

  const resolveTeacherSubjectInfo = useCallback(
    (schedule: ScheduleRecord | null | undefined): TeacherSubjectOption | null => {
      if (!schedule) return null;

      const relation = getScheduleRelation(schedule);
      const relationOption = relation
        ? buildTeacherSubjectOption(relation, {
            teacherNameMap,
            subjectNameMap,
            classNameMap,
          })
        : null;

      const scheduleRelationId = toStringOrEmpty(
        (getCandidateValue(schedule, [
          "teacherSubjectId",
          "teacherSubjectClassId",
          "teacher_subject_id",
          "teacher_subject_class_id",
          "relationId",
          "guruMapelKelasId",
          "guruMapelId",
          "mapelGuruKelasId",
          "teacherSubject.id",
          "teacher_subject.id",
        ]) as string | number | undefined) ?? ""
      );

      const optionFromMap = scheduleRelationId
        ? teacherSubjectOptionMap.get(scheduleRelationId)
        : null;

      const teacherId =
        relationOption?.teacherId ||
        optionFromMap?.teacherId ||
        toStringOrEmpty(
          (getCandidateValue(schedule, [
            "teacherId",
            "guruId",
            "teacher.id",
            "teacher.teacherId",
            "guru.id",
          ]) as string | number | undefined) ?? ""
        );

      const subjectId =
        relationOption?.subjectId ||
        optionFromMap?.subjectId ||
        toStringOrEmpty(
          (getCandidateValue(schedule, [
            "subjectId",
            "mapelId",
            "subject.id",
            "mapel.id",
          ]) as string | number | undefined) ?? ""
        );

      const kelasId =
        relationOption?.kelasId ||
        optionFromMap?.kelasId ||
        toStringOrEmpty(
          (getCandidateValue(schedule, [
            "kelasId",
            "classId",
            "kelas.id",
            "class.id",
          ]) as string | number | undefined) ?? ""
        );

      const teacherName =
        relationOption?.teacherName ||
        optionFromMap?.teacherName ||
        toTextValue(
          getCandidateValue(schedule, [
            "teacherNama",
            "teacher.nama",
            "teacher.name",
            "guruNama",
            "guru.nama",
            "guru.name",
          ])
        ) ||
        (teacherId ? teacherNameMap.get(teacherId) ?? "" : "");

      const subjectName =
        relationOption?.subjectName ||
        optionFromMap?.subjectName ||
        toTextValue(
          getCandidateValue(schedule, [
            "subjectNama",
            "subject.nama",
            "subject.name",
            "mapel.nama",
            "mapel.name",
          ])
        ) ||
        (subjectId ? subjectNameMap.get(subjectId) ?? "" : "");

      const kelasName =
        relationOption?.kelasName ||
        optionFromMap?.kelasName ||
        toTextValue(
          getCandidateValue(schedule, [
            "kelasNama",
            "kelas.nama",
            "kelas.name",
            "class.nama",
            "class.name",
          ])
        ) ||
        (kelasId ? classNameMap.get(kelasId) ?? "" : "");

      const id = relationOption?.id || optionFromMap?.id || scheduleRelationId;

      if (!id && !teacherName && !subjectName && !kelasName) {
        return null;
      }

      const labelSegments = [
        teacherName || "Guru",
        subjectName || "Mapel",
        kelasName || "Kelas",
      ];

      return {
        id: id || "",
        label: labelSegments.join(" • "),
        teacherId,
        subjectId,
        kelasId,
        teacherName,
        subjectName,
        kelasName,
        relation: relationOption?.relation || relation || null,
      };
    },
    [
      teacherSubjectOptionMap,
      teacherNameMap,
      subjectNameMap,
      classNameMap,
    ]
  );

  const filteredTeacherSubjectOptions = useMemo(() => {
    if (!scheduleForm.kelasId) return teacherSubjectOptions;
    return teacherSubjectOptions.filter(
      (option) => option.kelasId === scheduleForm.kelasId
    );
  }, [scheduleForm.kelasId, teacherSubjectOptions]);

  const classComboboxOptions = useMemo<SearchableComboboxOption[]>(() => {
    return classes
      .map((kelas) => {
        const value = toStringOrEmpty(kelas?.id ?? kelas?.kelasId);
        if (!value) {
          return null;
        }

        const name =
          toStringOrEmpty(kelas?.nama ?? kelas?.name ?? kelas?.label) ||
          `Kelas ${value}`;
        const tingkat = toStringOrEmpty(
          (kelas as Record<string, unknown>)?.tingkat
        );

        return {
          value,
          label: name,
          description: tingkat ? `Tingkat ${tingkat}` : undefined,
          searchValue: [value, name, tingkat].filter(Boolean).join(" "),
        };
      })
      .filter((option): option is SearchableComboboxOption => Boolean(option));
  }, [classes]);

  const teacherSubjectComboboxOptions = useMemo<SearchableComboboxOption[]>(() => {
    return filteredTeacherSubjectOptions.map((option) => {
      const label = option.teacherName || option.label || "Guru";
      const descriptionParts = [
        option.subjectName || null,
        option.kelasName || null,
      ].filter(Boolean);

      return {
        value: option.id,
        label,
        description: descriptionParts.join(" • ") || undefined,
        searchValue: [
          option.label,
          option.teacherName,
          option.subjectName,
          option.kelasName,
          option.teacherId,
          option.subjectId,
        ]
          .filter(Boolean)
          .join(" "),
      };
    });
  }, [filteredTeacherSubjectOptions]);

  const detailTeacherSubjectInfo = useMemo(
    () => resolveTeacherSubjectInfo(detailSchedule),
    [detailSchedule, resolveTeacherSubjectInfo]
  );

  const detailSubjectName = detailSchedule
    ? detailTeacherSubjectInfo?.subjectName || detailSchedule.subjectNama || "Mata pelajaran"
    : "Mata pelajaran";
  const detailClassName = detailSchedule
    ? detailTeacherSubjectInfo?.kelasName || detailSchedule.kelasNama || "Kelas"
    : "Kelas";
  const detailTeacherName = detailSchedule
    ? detailTeacherSubjectInfo?.teacherName || detailSchedule.teacherNama || "-"
    : "-";

  const loadReferenceData = useCallback(async () => {
    setIsReferenceLoading(true);
    try {
      const [
        classesData,
        subjectsData,
        teachersData,
        semestersData,
        teacherSubjectData,
      ] = await Promise.all([
        apiService.getClasses(),
        apiService.getSubjects(),
        apiService.getTeachers(),
        apiService.getSemesters(),
        apiService.getTeacherSubjectClassRelations(),
      ]);

      const classList = Array.isArray(classesData)
        ? (classesData as OptionEntity[])
        : [];
      const subjectList = Array.isArray(subjectsData)
        ? (subjectsData as OptionEntity[])
        : [];
      const teacherList = Array.isArray(teachersData)
        ? (teachersData as OptionEntity[])
        : [];
      const semesterList = Array.isArray(semestersData)
        ? (semestersData as OptionEntity[])
        : [];

      setClasses(classList);
      setSubjects(subjectList);
      setTeachers(teacherList);
      const teacherSubjectRelationsRaw = Array.isArray(
        (teacherSubjectData as { relations?: unknown })?.relations
      )
        ? ((teacherSubjectData as { relations?: unknown[] }).relations ?? [])
        : Array.isArray(
            (teacherSubjectData as { data?: { relations?: unknown } })?.data
              ?.relations
          )
        ? (
            (
              (teacherSubjectData as {
                data?: { relations?: unknown[] };
              }).data?.relations ?? []
            )
          )
        : Array.isArray(teacherSubjectData)
        ? (teacherSubjectData as unknown[])
        : teacherSubjectData
        ? [teacherSubjectData as unknown]
        : [];

      const teacherSubjectList = teacherSubjectRelationsRaw.filter(
        (relation): relation is TeacherSubjectRelation =>
          Boolean(
            relation &&
              typeof relation === "object" &&
              "id" in relation &&
              (relation as { id?: unknown }).id !== undefined &&
              (relation as { id?: unknown }).id !== null
          )
      );

      setSemesters(semesterList);
      setHomeroomTeachers(
        mapHomeroomTeachers(teacherList, classList)
      );
      setTeacherSubjectRelations(teacherSubjectList);
    } catch (error) {
      const err = toScheduleError(error);
      console.error("Gagal memuat referensi jadwal", err);
      toast({
        title: "Error",
        description: err.message || "Gagal memuat data referensi jadwal",
        variant: "destructive",
      });
    } finally {
      setIsReferenceLoading(false);
    }
  }, [toast]);

  const fetchSchedules = useCallback(async () => {
    setIsScheduleLoading(true);
    try {
      const payload = {
        semesterId: filters.semesterId || null,
        kelasId: filters.kelasId || null,
        hari: filters.hari || null,
        walikelasId: filters.walikelasId || null,
        guruId: filters.teacherId || null,
        teacherSubjectId: filters.teacherSubjectId || null,
      };

      const data = await apiService.getAdminSchedules(payload);
      const normalized = Array.isArray(data)
        ? (data as ScheduleRecord[])
        : data
        ? [(data as ScheduleRecord)]
        : [];
      setSchedules(normalized);
    } catch (error) {
      const err = toScheduleError(error);
      console.error("Gagal memuat jadwal", err);
      toast({
        title: "Gagal memuat jadwal",
        description: err.message || "Terjadi kesalahan saat memuat jadwal",
        variant: "destructive",
      });
      setSchedules([]);
    } finally {
      setIsScheduleLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const resetFormState = () => {
    setScheduleForm(INITIAL_FORM_STATE);
    setSelectedSchedule(null);
    setFormError(null);
    setConflictInfo(null);
    setIsFormDataLoading(false);
  };

  const handleOpenCreateDialog = () => {
    setFormMode("create");
    resetFormState();
    setIsFormOpen(true);
  };

  const handleEditSchedule = async (scheduleId?: string) => {
    if (!scheduleId) return;
    setFormMode("edit");
    resetFormState();
    setIsFormOpen(true);
    setIsFormDataLoading(true);
    try {
      const data = (await apiService.getAdminScheduleById(
        scheduleId
      )) as ScheduleRecord;
      setSelectedSchedule(data);
      const semesterInfo = data?.semester as
        | { id?: string | number }
        | undefined;
      const relationInfo = resolveTeacherSubjectInfo(data);
      setScheduleForm({
        kelasId:
          relationInfo?.kelasId || toStringOrEmpty(data?.kelasId),
        subjectId:
          relationInfo?.subjectId || toStringOrEmpty(data?.subjectId),
        teacherId:
          relationInfo?.teacherId || toStringOrEmpty(data?.teacherId),
        teacherSubjectId: relationInfo?.id || "",
        semesterId: toStringOrEmpty(
          data?.semesterId ?? semesterInfo?.id ?? data?.semester
        ),
        hari: toStringOrEmpty(data?.hari),
        jamMulai: toStringOrEmpty(data?.jamMulai),
        jamSelesai: toStringOrEmpty(data?.jamSelesai),
        walikelasId: toStringOrEmpty(data?.walikelasId),
        ruangan: toStringOrEmpty(data?.ruangan),
        catatan: toStringOrEmpty(data?.catatan),
      });
    } catch (error) {
      const err = toScheduleError(error);
      console.error("Gagal memuat detail jadwal", err);
      toast({
        title: "Gagal memuat detail",
        description: err.message || "Jadwal tidak ditemukan",
        variant: "destructive",
      });
      setIsFormOpen(false);
    } finally {
      setIsFormDataLoading(false);
    }
  };

  const handleViewSchedule = async (scheduleId?: string) => {
    if (!scheduleId) return;
    setDetailSchedule(null);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const data = (await apiService.getAdminScheduleById(
        scheduleId
      )) as ScheduleRecord;
      setDetailSchedule(data);
    } catch (error) {
      const err = toScheduleError(error);
      console.error("Gagal memuat detail jadwal", err);
      toast({
        title: "Gagal memuat detail",
        description: err.message || "Jadwal tidak ditemukan",
        variant: "destructive",
      });
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId?: string) => {
    if (!scheduleId) return;
    const confirmation = window.confirm(
      "Apakah Anda yakin ingin menghapus jadwal ini?"
    );

    if (!confirmation) return;

    try {
      await apiService.deleteAdminSchedule(scheduleId);
      toast({
        title: "Berhasil",
        description: "Jadwal berhasil dihapus",
      });
      fetchSchedules();
      onDataChange?.();
    } catch (error) {
      const err = toScheduleError(error);
      console.error("Gagal menghapus jadwal", err);
      toast({
        title: "Gagal menghapus",
        description:
          err.message || "Terjadi kesalahan saat menghapus jadwal",
        variant: "destructive",
      });
    }
  };

  const validateForm = (): boolean => {
    setFormError(null);

    if (!scheduleForm.kelasId) {
      setFormError("Kelas wajib diisi");
      toast({
        title: "Validasi gagal",
        description: "Kelas wajib diisi",
        variant: "destructive",
      });
      return false;
    }

    if (!scheduleForm.teacherSubjectId) {
      setFormError("Relasi guru dan mata pelajaran wajib dipilih");
      toast({
        title: "Validasi gagal",
        description: "Relasi guru dan mata pelajaran wajib dipilih",
        variant: "destructive",
      });
      return false;
    }

    if (!scheduleForm.subjectId || !scheduleForm.teacherId) {
      setFormError("Data guru atau mata pelajaran tidak valid");
      toast({
        title: "Validasi gagal",
        description: "Data guru atau mata pelajaran tidak valid",
        variant: "destructive",
      });
      return false;
    }

    if (!scheduleForm.semesterId || !scheduleForm.hari) {
      setFormError("Semester dan hari wajib diisi");
      toast({
        title: "Validasi gagal",
        description: "Semester dan hari wajib diisi",
        variant: "destructive",
      });
      return false;
    }

    if (!scheduleForm.jamMulai || !scheduleForm.jamSelesai) {
      setFormError("Jam mulai dan selesai wajib diisi");
      toast({
        title: "Validasi gagal",
        description: "Jam mulai dan selesai wajib diisi",
        variant: "destructive",
      });
      return false;
    }

    if (scheduleForm.jamMulai >= scheduleForm.jamSelesai) {
      setFormError("Jam mulai harus lebih awal daripada jam selesai");
      toast({
        title: "Validasi gagal",
        description: "Jam mulai harus lebih awal daripada jam selesai",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setConflictInfo(null);

    const payload: Record<string, unknown> = {
      kelasId: scheduleForm.kelasId,
      subjectId: scheduleForm.subjectId,
      teacherId: scheduleForm.teacherId,
      teacherSubjectId: scheduleForm.teacherSubjectId,
      semesterId: scheduleForm.semesterId,
      hari: scheduleForm.hari,
      jamMulai: scheduleForm.jamMulai,
      jamSelesai: scheduleForm.jamSelesai,
    };

    if (scheduleForm.walikelasId) {
      payload.walikelasId = scheduleForm.walikelasId;
    }

    if (scheduleForm.ruangan) {
      payload.ruangan = scheduleForm.ruangan;
    }

    if (scheduleForm.catatan) {
      payload.catatan = scheduleForm.catatan;
    }

    try {
      if (formMode === "edit" && selectedSchedule?.id) {
        await apiService.updateAdminSchedule(selectedSchedule.id, payload);
        toast({
          title: "Berhasil",
          description: "Jadwal berhasil diperbarui",
        });
      } else {
        await apiService.createAdminSchedule(payload);
        toast({
          title: "Berhasil",
          description: "Jadwal baru berhasil dibuat",
        });
      }

      setIsFormOpen(false);
      resetFormState();
      fetchSchedules();
      onDataChange?.();
    } catch (error) {
      const err = toScheduleError(error);
      console.error("Gagal menyimpan jadwal", err);
      if (err?.code === 404) {
        const message =
          err?.message || "Referensi jadwal tidak ditemukan. Periksa kembali data.";
        setFormError(message);
        toast({
          title: "Data tidak ditemukan",
          description: message,
          variant: "destructive",
        });
      } else if (err?.code === 409) {
        const conflicts = Array.isArray(err?.details?.conflicts)
          ? (err.details?.conflicts as ConflictDetail[])
          : [];
        const conflictScope = err?.details?.conflictScope;
        setConflictInfo({ conflicts, conflictScope });
        toast({
          title: "Konflik jadwal",
          description:
            "Terdapat konflik jadwal dengan entitas lain. Silakan sesuaikan waktu atau pengampu.",
          variant: "destructive",
        });
      } else {
        const message =
          err?.message || "Terjadi kesalahan saat menyimpan jadwal";
        setFormError(message);
        toast({
          title: "Gagal menyimpan",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilterChange = (
    key: keyof typeof INITIAL_FILTERS,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === SELECT_ALL_VALUE ? "" : value,
    }));
  };

  const resetFilters = () => {
    setFilters(() => ({ ...INITIAL_FILTERS }));
  };

  const renderScheduleRows = () => {
    if (isScheduleLoading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center">
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memuat jadwal...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!schedules.length) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
            Tidak ada jadwal yang sesuai dengan filter
          </TableCell>
        </TableRow>
      );
    }

    return schedules.map((schedule) => {
      const scheduleId = schedule.id ? String(schedule.id) : undefined;
      const relationInfo = resolveTeacherSubjectInfo(schedule);
      const subjectName =
        relationInfo?.subjectName || schedule.subjectNama || "-";
      const className =
        relationInfo?.kelasName || schedule.kelasNama || "-";
      const teacherName =
        relationInfo?.teacherName || schedule.teacherNama || "-";
      return (
        <TableRow
          key={schedule.id || `${schedule.kelasId}-${schedule.subjectId}`}
        >
          <TableCell className="font-medium">
            <div className="flex flex-col">
              <span>{subjectName}</span>
              <span className="text-xs text-muted-foreground">{className}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="mb-1">
              {schedule.hari || "-"}
            </Badge>
            <div className="text-sm">
              {schedule.jamMulai || "-"} - {schedule.jamSelesai || "-"}
            </div>
          </TableCell>
          <TableCell>{teacherName}</TableCell>
          <TableCell>{schedule.walikelasNama || "-"}</TableCell>
          <TableCell>
            <div className="flex flex-col text-sm">
              <span>{schedule.semesterNama || "-"}</span>
              <span className="text-xs text-muted-foreground">
                {schedule.semesterTahunAjaran || ""}
              </span>
            </div>
          </TableCell>
          <TableCell>{schedule.ruangan || "-"}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleViewSchedule(scheduleId)}
                aria-label="Lihat detail jadwal"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEditSchedule(scheduleId)}
                aria-label="Edit jadwal"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDeleteSchedule(scheduleId)}
                aria-label="Hapus jadwal"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Card className="border-primary/10 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manajemen Jadwal</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola jadwal pelajaran berdasarkan kelas, guru, dan semester.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <Label className="mb-1 block">Filter Kelas</Label>
            <Select
              value={filters.kelasId || SELECT_ALL_VALUE}
              onValueChange={(value) => handleFilterChange("kelasId", value)}
              disabled={isReferenceLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_ALL_VALUE}>Semua kelas</SelectItem>
                {classes.map((kelas) => (
                  <SelectItem key={kelas.id} value={toStringOrEmpty(kelas.id)}>
                    {kelas.nama || kelas.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Filter Guru</Label>
            <Select
              value={filters.teacherId || SELECT_ALL_VALUE}
              onValueChange={(value) => handleFilterChange("teacherId", value)}
              disabled={isReferenceLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua guru" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_ALL_VALUE}>Semua guru</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={toStringOrEmpty(teacher.id)}>
                    {teacher.nama || teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Filter Relasi Guru-Mapel-Kelas</Label>
            <Select
              value={filters.teacherSubjectId || SELECT_ALL_VALUE}
              onValueChange={(value) =>
                handleFilterChange("teacherSubjectId", value)
              }
              disabled={isReferenceLoading || !teacherSubjectOptions.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua relasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_ALL_VALUE}>Semua relasi</SelectItem>
                {teacherSubjectOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Filter Semester</Label>
            <Select
              value={filters.semesterId || SELECT_ALL_VALUE}
              onValueChange={(value) => handleFilterChange("semesterId", value)}
              disabled={isReferenceLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_ALL_VALUE}>Semua semester</SelectItem>
                {semesters.map((semester) => (
                  <SelectItem key={semester.id} value={toStringOrEmpty(semester.id)}>
                    {semester.nama || semester.name || semester.tahunAjaran}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Filter Hari</Label>
            <Select
              value={filters.hari || SELECT_ALL_VALUE}
              onValueChange={(value) => handleFilterChange("hari", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua hari" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_ALL_VALUE}>Semua hari</SelectItem>
                {DAY_OPTIONS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Filter Wali Kelas</Label>
            <Select
              value={filters.walikelasId || SELECT_ALL_VALUE}
              onValueChange={(value) => handleFilterChange("walikelasId", value)}
              disabled={isReferenceLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua wali kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_ALL_VALUE}>Semua wali kelas</SelectItem>
                {homeroomFilterOptions.map((walikelas) => (
                  <SelectItem
                    key={walikelas.id}
                    value={toStringOrEmpty(walikelas.id)}
                  >
                    {walikelas.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={isReferenceLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filter
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-primary/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Ruangan</TableHead>
                <TableHead className="w-[140px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderScheduleRows()}</TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            resetFormState();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "edit" ? "Edit Jadwal" : "Tambah Jadwal"}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive">
              <AlertTitle>Validasi</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {conflictInfo?.conflicts && conflictInfo.conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Konflik Jadwal</AlertTitle>
              <AlertDescription>
                {conflictInfo.conflictScope && (
                  <p className="mb-2 font-medium">
                    Ruang lingkup: {conflictInfo.conflictScope}
                  </p>
                )}
                <ul className="list-disc space-y-1 pl-4">
                  {conflictInfo.conflicts.map((conflict, index) => (
                    <li key={index} className="text-sm">
                      {formatConflict(conflict, index)}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isFormDataLoading && (
              <div className="flex items-center justify-center rounded-md border border-dashed border-muted p-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat detail jadwal...
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block">Kelas</Label>
                <SearchableCombobox
                  options={classComboboxOptions}
                  value={scheduleForm.kelasId}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => {
                      const isRelationValid =
                        prev.teacherSubjectId &&
                        teacherSubjectOptions.some(
                          (option) =>
                            option.id === prev.teacherSubjectId &&
                            option.kelasId === value
                        );

                      return {
                        ...prev,
                        kelasId: value,
                        teacherSubjectId: isRelationValid
                          ? prev.teacherSubjectId
                          : "",
                        teacherId: isRelationValid ? prev.teacherId : "",
                        subjectId: isRelationValid ? prev.subjectId : "",
                      };
                    })
                  }
                  disabled={isSaving || isFormDataLoading}
                  placeholder="Pilih kelas"
                  searchPlaceholder="Cari kelas..."
                  emptyMessage="Kelas tidak ditemukan"
                />
              </div>
              <div>
                <Label className="mb-1 block">Guru • Mata Pelajaran</Label>
                <SearchableCombobox
                  options={teacherSubjectComboboxOptions}
                  value={scheduleForm.teacherSubjectId}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => {
                      const option =
                        teacherSubjectOptionMap.get(value) ||
                        filteredTeacherSubjectOptions.find(
                          (item) => item.id === value
                        ) || null;

                      return {
                        ...prev,
                        teacherSubjectId: value,
                        teacherId: option?.teacherId || "",
                        subjectId: option?.subjectId || "",
                        kelasId: option?.kelasId || prev.kelasId,
                      };
                    })
                  }
                  disabled={
                    isSaving ||
                    isFormDataLoading ||
                    (!scheduleForm.kelasId && !teacherSubjectOptions.length)
                  }
                  placeholder="Pilih guru dan mata pelajaran"
                  searchPlaceholder="Cari guru atau mata pelajaran..."
                  emptyMessage={
                    scheduleForm.kelasId
                      ? "Tidak ada relasi untuk kelas ini"
                      : "Pilih kelas terlebih dahulu"
                  }
                />
              </div>
              <div>
                <Label className="mb-1 block">Semester</Label>
                <Select
                  value={scheduleForm.semesterId}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({ ...prev, semesterId: value }))
                  }
                  disabled={isSaving || isFormDataLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem
                        key={semester.id}
                        value={toStringOrEmpty(semester.id)}
                      >
                        {semester.nama || semester.name || semester.tahunAjaran}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Hari</Label>
                <Select
                  value={scheduleForm.hari}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({ ...prev, hari: value }))
                  }
                  disabled={isSaving || isFormDataLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OPTIONS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Wali Kelas</Label>
                <Select
                  value={scheduleForm.walikelasId || SELECT_NONE_VALUE}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      walikelasId: value === SELECT_NONE_VALUE ? "" : value,
                    }))
                  }
                  disabled={isSaving || isFormDataLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih wali kelas (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_NONE_VALUE}>Tidak ada</SelectItem>
                    {homeroomFilterOptions.map((walikelas) => (
                      <SelectItem
                        key={walikelas.id}
                        value={toStringOrEmpty(walikelas.id)}
                      >
                        {walikelas.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Jam Mulai</Label>
                <Input
                  type="time"
                  value={scheduleForm.jamMulai}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      jamMulai: event.target.value,
                    }))
                  }
                  disabled={isSaving || isFormDataLoading}
                />
              </div>
              <div>
                <Label className="mb-1 block">Jam Selesai</Label>
                <Input
                  type="time"
                  value={scheduleForm.jamSelesai}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      jamSelesai: event.target.value,
                    }))
                  }
                  disabled={isSaving || isFormDataLoading}
                />
              </div>
              <div>
                <Label className="mb-1 block">Ruangan</Label>
                <Input
                  placeholder="Mis. Lab 1"
                  value={scheduleForm.ruangan}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      ruangan: event.target.value,
                    }))
                  }
                  disabled={isSaving || isFormDataLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1 block">Catatan</Label>
                <Input
                  placeholder="Catatan tambahan (opsional)"
                  value={scheduleForm.catatan}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      catatan: event.target.value,
                    }))
                  }
                  disabled={isSaving || isFormDataLoading}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSaving || isFormDataLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setDetailSchedule(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Jadwal</DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat detail...
            </div>
          ) : detailSchedule ? (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-lg font-semibold">{detailSubjectName}</h3>
                <p className="text-muted-foreground">
                  {detailClassName} •{" "}
                  {detailSchedule.semesterTahunAjaran || detailSchedule.semesterNama}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Hari
                  </span>
                  <p className="text-base font-medium">
                    {detailSchedule.hari || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Waktu
                  </span>
                  <p className="text-base font-medium">
                    {detailSchedule.jamMulai || "-"} -
                    {" "}
                    {detailSchedule.jamSelesai || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Guru Pengampu
                  </span>
                  <p className="text-base font-medium">{detailTeacherName}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Wali Kelas
                  </span>
                  <p className="text-base font-medium">
                    {detailSchedule.walikelasNama || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Semester
                  </span>
                  <p className="text-base font-medium">
                    {detailSchedule.semesterNama || "-"}
                  </p>
                  {detailSchedule.semesterTahunAjaran && (
                    <p className="text-xs text-muted-foreground">
                      {detailSchedule.semesterTahunAjaran}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Ruangan
                  </span>
                  <p className="text-base font-medium">
                    {detailSchedule.ruangan || "-"}
                  </p>
                </div>
              </div>
              {detailSchedule.catatan && (
                <div>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Catatan
                  </span>
                  <p>{detailSchedule.catatan}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              Data jadwal tidak tersedia.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
