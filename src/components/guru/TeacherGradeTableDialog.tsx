import { Edit, FileText, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UseTeacherDashboardReturn } from "@/hooks/use-teacher-dashboard";
import { formatDate, getGradeColor } from "@/utils/helpers";

type TeacherGradeTableDialogProps = {
  dashboard: UseTeacherDashboardReturn;
};

export function TeacherGradeTableDialog({
  dashboard,
}: TeacherGradeTableDialogProps) {
  const {
    showGradeTableDialog,
    setShowGradeTableDialog,
    grades,
    students,
    selectedSubjectForGrades,
    selectedSubjectKelasId,
    getSubjectName,
    handleEditGrade,
    handleDeleteGrade,
    gradeTypes,
    selectedGradeTypeFilter,
    setSelectedGradeTypeFilter,
  } = dashboard;

  const filteredGrades = grades.filter(
    (grade) =>
      grade.subjectId === selectedSubjectForGrades &&
      grade.kelasId === selectedSubjectKelasId &&
      (selectedGradeTypeFilter === "all" ||
        grade.jenis === selectedGradeTypeFilter)
  );

  const hasGrades = filteredGrades.length > 0;

  return (
    <Dialog open={showGradeTableDialog} onOpenChange={setShowGradeTableDialog}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Daftar Semua Nilai - {getSubjectName(selectedSubjectForGrades)}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm font-medium">Filter Jenis Penilaian</div>
            <Select
              value={selectedGradeTypeFilter}
              onValueChange={setSelectedGradeTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Pilih jenis penilaian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {gradeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Jenis Penilaian</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Hari Ke-</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((grade) => {
                  const student = students.find((s) => s.id === grade.studentId);
                  return (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">
                      {grade.studentName || student?.nama}
                    </TableCell>
                    <TableCell>{student?.nis || "-"}</TableCell>
                    <TableCell>{student?.nisn || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{grade.jenis}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getGradeColor(grade.nilai)} border-current`}
                        >
                          {grade.nilai}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(grade.tanggal)}
                      </TableCell>
                      <TableCell>
                        {grade.studyDayNumber != null
                          ? `Hari ke-${grade.studyDayNumber}`
                          : "-"}
                      </TableCell>
                      <TableCell>{grade.semesterLabel || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={grade.verified ? "default" : "secondary"}>
                          {grade.verified ? "Terverifikasi" : "Belum Verifikasi"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGrade(grade)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGrade(grade.id)}
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
            {!hasGrades && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Belum ada nilai yang diinput untuk mata pelajaran ini
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
