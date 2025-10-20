import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  } = dashboard;

  return (
    <Dialog open={showStudentListDialog} onOpenChange={setShowStudentListDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Daftar Siswa - {getSubjectName(selectedSubjectId)} - Kelas {" "}
            {getClassesName(selectedSubjectKelasId)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex justify-between items-center p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{student.nama}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>NISN: {student.nisn}</span>
                      <span>Kelas: {student.kelasId}</span>
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
                      studentId: String(student.id),
                      subjectId: selectedSubjectId
                        ? String(selectedSubjectId)
                        : "",
                    }));
                    setShowStudentListDialog(false);
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
                      studentId: String(student.id),
                      subjectId: selectedSubjectId
                        ? String(selectedSubjectId)
                        : "",
                    }));
                    setShowStudentListDialog(false);
                    setShowAttendanceDialog(true);
                  }}
                  >
                    Input Kehadiran
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Belum ada data siswa untuk kelas ini
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
