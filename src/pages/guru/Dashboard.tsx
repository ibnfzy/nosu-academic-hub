import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeacherDashboardHeader } from "@/components/guru/TeacherDashboardHeader";
import { TeacherSemesterSelector } from "@/components/guru/TeacherSemesterSelector";
import { TeacherDashboardStats } from "@/components/guru/TeacherDashboardStats";
import { TeacherGradeDialog } from "@/components/guru/TeacherGradeDialog";
import { TeacherAttendanceDialog } from "@/components/guru/TeacherAttendanceDialog";
import { TeacherGradeTableDialog } from "@/components/guru/TeacherGradeTableDialog";
import { TeacherAttendanceTableDialog } from "@/components/guru/TeacherAttendanceTableDialog";
import { TeacherStudentListDialog } from "@/components/guru/TeacherStudentListDialog";
import { TeacherDashboardTabs } from "@/components/guru/TeacherDashboardTabs";
import { useDashboardSemester } from "@/hooks/use-dashboard-semester";
import {
  type TeacherDashboardUser,
  useTeacherDashboard,
} from "@/hooks/use-teacher-dashboard";
import { formatDate, getStudyDayNumber } from "@/utils/helpers";

type TeacherDashboardProps = {
  currentUser: TeacherDashboardUser | null;
  onLogout: () => void;
};

const TeacherDashboard = ({ currentUser, onLogout }: TeacherDashboardProps) => {
  const dashboard = useTeacherDashboard(currentUser);
  const {
    subjects,
    students,
    grades,
    classes,
    selectedSemesterId,
    setSelectedSemesterId,
    semesters,
    teacherSchedules,
    teacherScheduleFilters,
    updateTeacherScheduleFilters,
    isTeacherScheduleLoading,
    teacherScheduleError,
    teacherScheduleMetadata,
    teacherScheduleConflicts,
    getSubjectName,
    getClassesName,
  } = dashboard;

  const {
    buildSemesterLabel,
    getSemesterLabelById,
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
  } = useDashboardSemester({
    semesters,
  });

  const activeSemesterMetadata = useMemo(() => {
    if (selectedSemesterId) {
      const resolved = resolveSemesterMetadata(selectedSemesterId);
      if (resolved) {
        return resolved;
      }
    }

    for (const record of semesters) {
      const metadata = normalizeSemesterMetadata(record);
      if (metadata?.isActive) {
        return metadata;
      }
    }

    if (semesters.length > 0) {
      return normalizeSemesterMetadata(semesters[0]);
    }

    return null;
  }, [
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
    selectedSemesterId,
    semesters,
  ]);

  const todayLabel = useMemo(() => formatDate(new Date()), []);

  const currentTeachingDay = useMemo(() => {
    if (!activeSemesterMetadata) return null;
    return (
      getStudyDayNumber(new Date(), {
        semesterMetadata: activeSemesterMetadata,
      }) ?? null
    );
  }, [activeSemesterMetadata]);

  const totalTeachingDays = useMemo(() => {
    if (!activeSemesterMetadata) return null;
    const raw = activeSemesterMetadata.jumlahHariBelajar;

    if (raw === null || raw === undefined) return null;

    if (typeof raw === "number") {
      return Number.isFinite(raw) && raw > 0 ? raw : null;
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      const numericPortion = Number(trimmed.replace(/[^0-9.,-]/g, "").replace(/,/g, "."));
      if (!Number.isNaN(numericPortion) && numericPortion > 0) {
        return Math.round(numericPortion);
      }
    }

    return null;
  }, [activeSemesterMetadata]);

  const teachingDayMessage = useMemo(() => {
    if (!activeSemesterMetadata) {
      return null;
    }

    if (currentTeachingDay && totalTeachingDays) {
      return `Sekarang hari ke ${currentTeachingDay} dari ${totalTeachingDays} hari mengajar.`;
    }

    if (currentTeachingDay) {
      return `Sekarang hari ke ${currentTeachingDay} dalam kalender mengajar.`;
    }

    if (totalTeachingDays) {
      return `Semester ini memiliki ${totalTeachingDays} hari mengajar.`;
    }

    return null;
  }, [activeSemesterMetadata, currentTeachingDay, totalTeachingDays]);

  const scheduleFilters = teacherScheduleFilters;

  const scheduleClassOptions = useMemo(() => {
    if (!classes || classes.length === 0) {
      return [] as typeof classes;
    }

    const relevantIds = new Set(
      subjects
        .map((subject) =>
          subject?.kelasId !== undefined && subject?.kelasId !== null
            ? String(subject.kelasId)
            : null
        )
        .filter((value): value is string => value !== null)
    );

    if (relevantIds.size === 0) {
      return classes;
    }

    return classes.filter((kelas) => {
      if (kelas?.id === undefined || kelas?.id === null) {
        return false;
      }
      return relevantIds.has(String(kelas.id));
    });
  }, [classes, subjects]);

  const scheduleDayOptions = useMemo(
    () => ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
    []
  );

  const scheduleMetadataEntries = useMemo(() => {
    if (!teacherScheduleMetadata) {
      return [] as Array<{ label: string; value: string }>;
    }

    const entries: Array<{ label: string; value: string }> = [];
    const metadata = teacherScheduleMetadata as Record<string, unknown>;
    const addEntry = (label: string, value: unknown) => {
      if (value === null || value === undefined) {
        return;
      }
      if (typeof value === "string" && value.trim() === "") {
        return;
      }
      entries.push({ label, value: String(value) });
    };

    addEntry(
      "Semester",
      metadata.semesterNama ??
        metadata.semesterLabel ??
        metadata.semester ??
        metadata.semesterName
    );
    addEntry(
      "Tahun Ajaran",
      metadata.semesterTahunAjaran ??
        metadata.tahunAjaran ??
        metadata.tahun ??
        metadata.academicYear
    );
    addEntry(
      "Jumlah Jadwal",
      metadata.total ??
        metadata.count ??
        metadata.totalItems ??
        metadata.totalSchedules ??
        metadata.jumlah
    );

    return entries;
  }, [teacherScheduleMetadata]);

  return (
    <div className="min-h-screen bg-background">
      <TeacherDashboardHeader
        currentUser={currentUser}
        onLogout={onLogout}
        teachingDayDateLabel={todayLabel}
        teachingDayMessage={teachingDayMessage}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <TeacherSemesterSelector
          selectedSemesterId={selectedSemesterId}
          semesters={semesters}
          onSelect={(value) => setSelectedSemesterId(value)}
          getSemesterLabelById={getSemesterLabelById}
          buildSemesterLabel={buildSemesterLabel}
        />

        <div className="flex flex-wrap gap-4 mb-8">
          <TeacherGradeDialog
            dashboard={dashboard}
            buildSemesterLabel={buildSemesterLabel}
            getSemesterLabelById={getSemesterLabelById}
          />
          <TeacherAttendanceDialog
            dashboard={dashboard}
            buildSemesterLabel={buildSemesterLabel}
            getSemesterLabelById={getSemesterLabelById}
          />
        </div>

        <TeacherGradeTableDialog dashboard={dashboard} />
        <TeacherAttendanceTableDialog dashboard={dashboard} />
        <TeacherStudentListDialog dashboard={dashboard} />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Jadwal Mengajar</CardTitle>
            {scheduleMetadataEntries.length > 0 && (
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {scheduleMetadataEntries.map((entry) => (
                  <p key={`${entry.label}-${entry.value}`}>
                    <span className="font-medium text-foreground">
                      {entry.label}:
                    </span>{" "}
                    {entry.value}
                  </p>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Filter Kelas
                </label>
                <select
                  value={scheduleFilters.kelasId}
                  onChange={(event) =>
                    updateTeacherScheduleFilters({
                      kelasId: event.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua kelas</option>
                  {scheduleClassOptions.map((kelas) => (
                    <option key={String(kelas.id)} value={String(kelas.id)}>
                      {kelas.nama || getClassesName(kelas.id ?? "") || "Kelas"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Filter Hari
                </label>
                <select
                  value={scheduleFilters.hari}
                  onChange={(event) =>
                    updateTeacherScheduleFilters({ hari: event.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua hari</option>
                  {scheduleDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {teacherScheduleConflicts &&
              teacherScheduleConflicts.conflicts.length > 0 && (
                <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
                  <p className="font-semibold">Terdapat konflik jadwal</p>
                  {teacherScheduleConflicts.conflictScope && (
                    <p className="mt-1 text-sm">
                      Ruang lingkup: {teacherScheduleConflicts.conflictScope}
                    </p>
                  )}
                  <ul className="mt-2 space-y-1 text-sm">
                    {teacherScheduleConflicts.conflicts.map((conflict, index) => {
                      const segments: string[] = [];
                      const day =
                        typeof conflict.hari === "string"
                          ? conflict.hari
                          : null;
                      const start =
                        typeof conflict.jamMulai === "string"
                          ? conflict.jamMulai
                          : null;
                      const end =
                        typeof conflict.jamSelesai === "string"
                          ? conflict.jamSelesai
                          : null;
                      const className =
                        typeof conflict.kelasNama === "string"
                          ? conflict.kelasNama
                          : null;
                      const teacherName =
                        typeof conflict.teacherNama === "string"
                          ? conflict.teacherNama
                          : null;
                      const subjectName =
                        typeof conflict.subjectNama === "string"
                          ? conflict.subjectNama
                          : null;

                      if (day) segments.push(day);
                      if (start || end) {
                        segments.push(`${start || "?"} - ${end || "?"}`);
                      }
                      if (className) segments.push(`Kelas ${className}`);
                      if (teacherName) segments.push(`Guru ${teacherName}`);
                      if (subjectName) segments.push(`Mapel ${subjectName}`);

                      return (
                        <li key={`${day ?? "conflict"}-${index}`}>
                          • {segments.length > 0
                            ? segments.join(" • ")
                            : `Konflik ${index + 1}`}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

            {teacherScheduleError && (
              <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
                {teacherScheduleError}
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hari</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Ruang</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTeacherScheduleLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Memuat jadwal guru...
                      </TableCell>
                    </TableRow>
                  ) : teacherSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Tidak ada jadwal untuk filter yang dipilih.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teacherSchedules.map((scheduleItem, index) => {
                      const timeSegments: string[] = [];
                      if (scheduleItem?.jamMulai) {
                        timeSegments.push(String(scheduleItem.jamMulai));
                      }
                      if (scheduleItem?.jamSelesai) {
                        timeSegments.push(String(scheduleItem.jamSelesai));
                      }
                      const timeLabel =
                        timeSegments.length > 0
                          ? timeSegments.join(" - ")
                          : "-";

                      return (
                        <TableRow key={String(scheduleItem.id ?? index)}>
                          <TableCell className="font-medium">
                            {scheduleItem?.hari || "-"}
                          </TableCell>
                          <TableCell>{timeLabel}</TableCell>
                          <TableCell>
                            {scheduleItem?.subjectNama ||
                              getSubjectName(scheduleItem?.subjectId ?? "") ||
                              "-"}
                          </TableCell>
                          <TableCell>
                            {scheduleItem?.kelasNama ||
                              getClassesName(scheduleItem?.kelasId ?? "") ||
                              "-"}
                          </TableCell>
                          <TableCell>{scheduleItem?.ruangan || "-"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <TeacherDashboardStats
          subjectsCount={subjects.length}
          studentsCount={students.length}
          gradesCount={grades.length}
        />

        <TeacherDashboardTabs dashboard={dashboard} />
      </div>
    </div>
  );
};

export default TeacherDashboard;
