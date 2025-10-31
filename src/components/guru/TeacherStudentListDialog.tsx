import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { UseTeacherDashboardReturn } from "@/hooks/use-teacher-dashboard";

type TeacherStudentListDialogProps = {
  dashboard: UseTeacherDashboardReturn;
};

export function TeacherStudentListDialog({
  dashboard,
}: TeacherStudentListDialogProps) {
  const {
    showStudentListDialog,
    setShowStudentListDialog,
    filteredStudents,
    getSubjectName,
    getClassesName,
    selectedSubjectId,
    selectedSubjectKelasId,
    setGradeForm,
    setAttendanceForm,
    setShowGradeDialog,
    setShowAttendanceDialog,
    setGradeContextLock,
    setAttendanceContextLock,
  } = dashboard;

  const [searchTerm, setSearchTerm] = useState("");

  const displayedStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return filteredStudents;
    }

    return filteredStudents.filter((student) => {
      const name = (student.nama ?? "").toString().toLowerCase();
      const nis = (student.nis ?? "").toString().toLowerCase();
      const nisn = (student.nisn ?? "").toString().toLowerCase();
      return name.includes(query) || nis.includes(query) || nisn.includes(query);
    });
  }, [filteredStudents, searchTerm]);

  const hasSearchTerm = searchTerm.trim().length > 0;

  return (
    <Dialog open={showStudentListDialog} onOpenChange={setShowStudentListDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Daftar Siswa - {getSubjectName(selectedSubjectId)} - Kelas {" "}
            {getClassesName(selectedSubjectKelasId)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Pilih siswa untuk memasukkan nilai atau kehadiran.
          </p>

          <div className="space-y-2">
            <Label htmlFor="student-search">Cari siswa</Label>
            <Input
              id="student-search"
              placeholder="Cari berdasarkan nama, NIS, atau NISN..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {displayedStudents.length > 0 ? (
              displayedStudents.map((student, index) => {
                const kelasName = getClassesName(student.kelasId ?? "");
                const studentName = student.nama || "Nama tidak tersedia";

                const resolvedStudentId =
                  student.studentId ?? student.userId ?? student.id;

                return (
                  <Card
                    key={String(resolvedStudentId ?? index)}
                    className="border border-border"
                  >
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-semibold text-foreground">
                            {studentName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Nomor Induk
                          </p>
                          <div className="text-sm font-medium text-foreground space-y-1">
                            <p>NIS: {student.nis || "-"}</p>
                            <p>NISN: {student.nisn || "-"}</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="self-start">
                        Kelas {kelasName || student.kelasId}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Informasi Kelas
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {kelasName || "Belum ada informasi kelas"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex w-full flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const subjectId = selectedSubjectId
                                ? String(selectedSubjectId)
                                : "";
                              const kelasId = selectedSubjectKelasId
                                ? String(selectedSubjectKelasId)
                                : "";
                              setGradeForm((prev) => ({
                                ...prev,
                                studentId: String(resolvedStudentId ?? ""),
                                subjectId,
                                kelasId,
                              }));
                              if (subjectId) {
                                setGradeContextLock({
                                  subjectId,
                                  kelasId,
                                });
                              }
                              setShowStudentListDialog(false);
                              setShowGradeDialog(true);
                            }}
                          >
                            Input Nilai
                          </Button>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Membuka formulir penilaian untuk siswa ini.
                          </p>
                        </div>
                        <div className="flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              const subjectId = selectedSubjectId
                                ? String(selectedSubjectId)
                                : "";
                              const kelasId = selectedSubjectKelasId
                                ? String(selectedSubjectKelasId)
                                : "";
                              setAttendanceForm((prev) => ({
                                ...prev,
                                studentId: String(resolvedStudentId ?? ""),
                                subjectId,
                                kelasId,
                              }));
                              if (subjectId) {
                                setAttendanceContextLock({
                                  subjectId,
                                  kelasId,
                                });
                              }
                              setShowStudentListDialog(false);
                              setShowAttendanceDialog(true);
                            }}
                          >
                            Input Kehadiran
                          </Button>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Membuka formulir kehadiran untuk siswa ini.
                          </p>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {hasSearchTerm
                    ? "Tidak ditemukan siswa yang cocok dengan pencarian."
                    : "Belum ada data siswa untuk kelas ini"}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
