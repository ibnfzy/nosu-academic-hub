import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UseTeacherDashboardReturn } from "@/hooks/use-teacher-dashboard";

type TeacherAttendanceDialogProps = {
  dashboard: UseTeacherDashboardReturn;
};

export function TeacherAttendanceDialog({
  dashboard,
}: TeacherAttendanceDialogProps) {
  const {
    showAttendanceDialog,
    handleAttendanceDialogOpenChange,
    attendanceForm,
    setAttendanceForm,
    attendanceStatuses,
    subjects,
    students,
    semesters,
    buildSemesterLabel,
    getSemesterLabelById,
    getSubjectName,
    getClassesName,
    getStudentName,
    handleAddAttendance,
    editingAttendance,
  } = dashboard;

  return (
    <Dialog
      open={showAttendanceDialog}
      onOpenChange={handleAttendanceDialogOpenChange}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Input Kehadiran
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingAttendance ? "Edit Kehadiran Siswa" : "Input Kehadiran Siswa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddAttendance} className="space-y-4">
          <div className="space-y-2">
            <Label>Mata Pelajaran</Label>
            <Select
              value={
                attendanceForm.subjectId && attendanceForm.kelasId
                  ? `${attendanceForm.subjectId}-${attendanceForm.kelasId}`
                  : ""
              }
              onValueChange={(value) => {
                const [subjectId, kelasId] = value.split("-");
                setAttendanceForm((prev) => ({
                  ...prev,
                  subjectId,
                  kelasId,
                  studentId: "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata pelajaran">
                  {attendanceForm.subjectId
                    ? `${getSubjectName(attendanceForm.subjectId)} (${getClassesName(attendanceForm.kelasId)})`
                    : "Pilih mata pelajaran"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject, idx) => (
                  <SelectItem
                    key={`${subject.id}-${subject.kelasId}-${idx}`}
                    value={`${subject.id}-${subject.kelasId}`}
                  >
                    {subject.nama} ({getClassesName(subject.kelasId)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Siswa</Label>
            <Select
              value={attendanceForm.studentId}
              onValueChange={(value) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  studentId: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih siswa">
                  {getStudentName(attendanceForm.studentId)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {students
                  .filter(
                    (s) => String(s.kelasId) === String(attendanceForm.kelasId)
                  )
                  .map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.nama} ({student.nisn})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Semester</Label>
            <Select
              value={attendanceForm.semesterId || ""}
              onValueChange={(value) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  semesterId: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester">
                  {attendanceForm.semesterId
                    ? getSemesterLabelById(attendanceForm.semesterId)
                    : semesters.length > 0
                    ? "Pilih semester"
                    : "Semester belum tersedia"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {semesters.length > 0 ? (
                  semesters.map((semester) => (
                    <SelectItem key={semester.id} value={String(semester.id)}>
                      {buildSemesterLabel(semester) ||
                        `Semester ${semester.semester}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Data semester belum tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status Kehadiran</Label>
              <Select
                value={attendanceForm.status}
                onValueChange={(value) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {attendanceStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={attendanceForm.tanggal}
                onChange={(e) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    tanggal: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Keterangan (Opsional)</Label>
            <Input
              type="text"
              value={attendanceForm.keterangan}
              onChange={(e) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  keterangan: e.target.value,
                }))
              }
              placeholder="Masukkan keterangan jika diperlukan"
            />
          </div>

          <Button type="submit" className="w-full">
            {editingAttendance ? "Update Kehadiran" : "Simpan Kehadiran"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
