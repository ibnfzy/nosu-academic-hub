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
  Plus,
  Loader2,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { SubjectCombobox } from "@/components/ui/subject-combobox";

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
  semesterId: "",
  hari: "",
  walikelasId: "",
};

const INITIAL_FORM_STATE: ScheduleFormState = {
  kelasId: "",
  subjectId: "",
  teacherId: "",
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

  const loadReferenceData = useCallback(async () => {
    setIsReferenceLoading(true);
    try {
      const [classesData, subjectsData, teachersData, semestersData] =
        await Promise.all([
          apiService.getClasses(),
          apiService.getSubjects(),
          apiService.getTeachers(),
          apiService.getSemesters(),
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
      setSemesters(semesterList);
      setHomeroomTeachers(
        mapHomeroomTeachers(teacherList, classList)
      );
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
      setScheduleForm({
        kelasId: toStringOrEmpty(data?.kelasId),
        subjectId: toStringOrEmpty(data?.subjectId),
        teacherId: toStringOrEmpty(data?.teacherId),
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

    if (!scheduleForm.kelasId || !scheduleForm.subjectId || !scheduleForm.teacherId) {
      setFormError("Kelas, mata pelajaran, dan guru wajib diisi");
      toast({
        title: "Validasi gagal",
        description: "Kelas, mata pelajaran, dan guru wajib diisi",
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
      return (
        <TableRow
          key={schedule.id || `${schedule.kelasId}-${schedule.subjectId}`}
        >
          <TableCell className="font-medium">
            <div className="flex flex-col">
              <span>{schedule.subjectNama || "-"}</span>
              <span className="text-xs text-muted-foreground">
                {schedule.kelasNama || "-"}
              </span>
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
          <TableCell>{schedule.teacherNama || "-"}</TableCell>
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
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
                <Select
                  value={scheduleForm.kelasId}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({ ...prev, kelasId: value }))
                  }
                  disabled={isSaving || isFormDataLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((kelas) => (
                      <SelectItem key={kelas.id} value={toStringOrEmpty(kelas.id)}>
                        {kelas.nama || kelas.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Mata Pelajaran</Label>
                <SubjectCombobox
                  subjects={subjects}
                  value={scheduleForm.subjectId}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({ ...prev, subjectId: value }))
                  }
                  disabled={isSaving || isFormDataLoading}
                />
              </div>
              <div>
                <Label className="mb-1 block">Guru Pengampu</Label>
                <Select
                  value={scheduleForm.teacherId}
                  onValueChange={(value) =>
                    setScheduleForm((prev) => ({ ...prev, teacherId: value }))
                  }
                  disabled={isSaving || isFormDataLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih guru" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={toStringOrEmpty(teacher.id)}
                      >
                        {teacher.nama || teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <h3 className="text-lg font-semibold">
                  {detailSchedule.subjectNama || "Mata pelajaran"}
                </h3>
                <p className="text-muted-foreground">
                  {detailSchedule.kelasNama || "Kelas"} •{
                    " "
                  }
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
                  <p className="text-base font-medium">
                    {detailSchedule.teacherNama || "-"}
                  </p>
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
