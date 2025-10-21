import { BookOpen, Calendar, FileText, Plus, Users } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { UseTeacherDashboardReturn } from "@/hooks/use-teacher-dashboard";

type TeacherDashboardTabsProps = {
  dashboard: UseTeacherDashboardReturn;
};

export function TeacherDashboardTabs({
  dashboard,
}: TeacherDashboardTabsProps) {
  const {
    loading,
    subjects,
    grades,
    attendance,
    students,
    handleViewStudentList,
    handleViewAllGrades,
    handleViewAllAttendance,
    getSubjectName,
    getClassesName,
    setGradeForm,
    setShowGradeDialog,
    setAttendanceForm,
    setShowAttendanceDialog,
    setGradeContextLock,
    setAttendanceContextLock,
  } = dashboard;

  return (
    <Tabs defaultValue="matapelajaran" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="matapelajaran" className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4" />
          <span>Mata Pelajaran</span>
        </TabsTrigger>
        <TabsTrigger value="siswa" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Daftar Siswa</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="matapelajaran" className="space-y-6">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : subjects.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {subjects.map((subject) => {
              const subjectGrades = grades.filter(
                (grade) =>
                  grade.subjectId === subject.id && grade.kelasId === subject.kelasId
              );
              const subjectAttendance = attendance.filter(
                (att) => att.subjectId === subject.id && att.kelasId === subject.kelasId
              );

              const getAttendanceStatusLabel = (status: string) => {
                if (status === "hadir") return "Hadir";
                if (status === "sakit") return "Sakit";
                if (status === "izin") return "Izin";
                return "Alfa";
              };

              return (
                <AccordionItem
                  key={subject.id}
                  value={`${subject.id}-${subject.kelasId}`}
                  className="rounded-xl border border-primary/20 bg-primary/5 shadow-soft"
                >
                  <div className="px-4 pt-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <AccordionTrigger className="flex-1 gap-4 rounded-lg bg-transparent px-0 py-0 text-left hover:no-underline">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {getSubjectName(subject.id)} Kelas {getClassesName(subject.kelasId)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {subjectGrades.length} nilai tercatat • {subjectAttendance.length} data kehadiran
                          </span>
                        </div>
                      </AccordionTrigger>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="shrink-0 gap-2">
                            <Plus className="h-4 w-4" />
                            Tambah data
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Tambah informasi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => {
                              const subjectId = String(subject.id);
                              const kelasId = subject.kelasId
                                ? String(subject.kelasId)
                                : "";
                              setGradeForm((prev) => ({
                                ...prev,
                                subjectId,
                                kelasId,
                              }));
                              setGradeContextLock({
                                subjectId,
                                kelasId,
                              });
                              setShowGradeDialog(true);
                            }}
                            className="gap-2"
                          >
                            <FileText className="h-4 w-4" /> Input nilai siswa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              const subjectId = String(subject.id);
                              const kelasId = subject.kelasId
                                ? String(subject.kelasId)
                                : "";
                              setAttendanceForm((prev) => ({
                                ...prev,
                                subjectId,
                                kelasId,
                              }));
                              setAttendanceContextLock({
                                subjectId,
                                kelasId,
                              });
                              setShowAttendanceDialog(true);
                            }}
                            className="gap-2"
                          >
                            <Calendar className="h-4 w-4" /> Catat kehadiran
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-6">
                      <div className="space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/10 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <FileText className="h-4 w-4" /> Ringkasan nilai terbaru
                        </div>
                        {subjectGrades.length > 0 ? (
                          <ul className="space-y-3 text-sm">
                            {subjectGrades.slice(-3).map((grade) => (
                              <li
                                key={grade.id}
                                className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 shadow-sm"
                              >
                                <p className="font-medium text-foreground">
                                  {grade.studentName}
                                </p>
                                <p className="text-muted-foreground">
                                  Nilai terakhir: {grade.nilai}
                                  {grade.jenis ? ` untuk ${grade.jenis}` : ""}
                                  {grade.semesterLabel ? ` • ${grade.semesterLabel}` : ""}
                                  {grade.studyDayNumber != null
                                    ? ` • Hari ke-${grade.studyDayNumber}`
                                    : ""}
                                </p>
                              </li>
                            ))}
                            {subjectGrades.length > 3 && (
                              <li className="text-center text-xs text-muted-foreground">
                                +{subjectGrades.length - 3} catatan nilai lainnya
                              </li>
                            )}
                          </ul>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground">
                            <p>Belum ada nilai yang dicatat untuk mata pelajaran ini.</p>
                          </div>
                        )}
                        {subjectGrades.length > 0 && (
                          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <p className="text-muted-foreground">
                              Butuh melihat riwayat lengkap nilai siswa?
                            </p>
                            <Button
                              variant="link"
                              className="px-0"
                              onClick={() =>
                                handleViewAllGrades(subject.id, subject.kelasId)
                              }
                            >
                              Lihat semua nilai
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/10 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Calendar className="h-4 w-4" /> Ringkasan kehadiran siswa
                        </div>
                        {subjectAttendance.length > 0 ? (
                          <ul className="space-y-3 text-sm">
                            {subjectAttendance.slice(-3).map((att) => (
                              <li
                                key={att.id}
                                className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 shadow-sm"
                              >
                                <p className="font-medium text-foreground">
                                  {att.studentName}
                                </p>
                                <p className="text-muted-foreground">
                                  Status kehadiran: {getAttendanceStatusLabel(att.status)}
                                  {att.studyDayNumber != null
                                    ? ` • Hari ke-${att.studyDayNumber}`
                                    : ""}
                                  {att.semesterLabel ? ` • ${att.semesterLabel}` : ""}
                                </p>
                              </li>
                            ))}
                            {subjectAttendance.length > 3 && (
                              <li className="text-center text-xs text-muted-foreground">
                                +{subjectAttendance.length - 3} catatan kehadiran lainnya
                              </li>
                            )}
                          </ul>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground">
                            <p>Belum ada catatan kehadiran yang masuk.</p>
                          </div>
                        )}
                        {subjectAttendance.length > 0 && (
                          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <p className="text-muted-foreground">
                              Lihat daftar lengkap kehadiran untuk analisis detail.
                            </p>
                            <Button
                              variant="link"
                              className="px-0"
                              onClick={() =>
                                handleViewAllAttendance(subject.id, subject.kelasId)
                              }
                            >
                              Lihat semua kehadiran
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg bg-primary/5 px-4 py-3 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Kelola daftar siswa
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Tinjau siswa yang terdaftar dalam mata pelajaran ini kapan saja.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewStudentList(subject.id, subject.kelasId)}
                          >
                            <Users className="mr-2 h-4 w-4" /> Lihat siswa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Belum ada mata pelajaran yang diampu
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="siswa">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Daftar Siswa yang Diajar</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="space-y-4">
                {students.map((student, index) => {
                  const resolvedStudentId =
                    student.studentId ?? student.userId ?? student.id;
                  const identifier = String(resolvedStudentId ?? index);
                  return (
                  <div
                    key={identifier}
                    className="flex items-center justify-between rounded-lg bg-muted/20 p-4 shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{student.nama}</h4>
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
                                studentId: identifier,
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
                                studentId: identifier,
                              }));
                              setShowAttendanceDialog(true);
                            }}
                          >
                            Input Kehadiran
                          </Button>
                        </div>
                  </div>
                );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada data siswa</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
