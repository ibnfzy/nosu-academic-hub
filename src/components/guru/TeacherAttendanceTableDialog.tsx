import { Calendar, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { UseTeacherDashboardReturn } from "@/hooks/use-teacher-dashboard";
import { formatDate } from "@/utils/helpers";

type TeacherAttendanceTableDialogProps = {
  dashboard: UseTeacherDashboardReturn;
};

export function TeacherAttendanceTableDialog({
  dashboard,
}: TeacherAttendanceTableDialogProps) {
  const {
    showAttendanceTableDialog,
    setShowAttendanceTableDialog,
    attendance,
    students,
    selectedSubjectForAttendance,
    selectedSubjectKelasId,
    getSubjectName,
    handleEditAttendance,
    handleDeleteAttendance,
  } = dashboard;

  const hasAttendance =
    attendance.filter(
      (att) => att.subjectId === selectedSubjectForAttendance
    ).length > 0;

  return (
    <Dialog
      open={showAttendanceTableDialog}
      onOpenChange={setShowAttendanceTableDialog}
    >
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Daftar Semua Kehadiran - {getSubjectName(selectedSubjectForAttendance)}
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
                <TableHead>Hari Ke-</TableHead>
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
                  const student = students.find((s) => s.id === att.studentId);
                  return (
                    <TableRow key={att.id}>
                      <TableCell className="font-medium">
                        {att.studentName || student?.nama}
                      </TableCell>
                      <TableCell>{student?.nisn || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={att.status === "hadir" ? "default" : "secondary"}
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
                      <TableCell>
                        {att.studyDayNumber != null
                          ? `Hari ke-${att.studyDayNumber}`
                          : "-"}
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
          {!hasAttendance && (
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
  );
}
