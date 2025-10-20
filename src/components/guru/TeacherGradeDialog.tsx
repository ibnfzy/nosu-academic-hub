import { Plus } from "lucide-react";
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

type TeacherGradeDialogProps = {
  dashboard: UseTeacherDashboardReturn;
};

export function TeacherGradeDialog({ dashboard }: TeacherGradeDialogProps) {
  const {
    showGradeDialog,
    handleGradeDialogOpenChange,
    gradeForm,
    setGradeForm,
    gradeTypes,
    subjects,
    students,
    semesters,
    buildSemesterLabel,
    getSemesterLabelById,
    getClassesName,
    getStudentName,
    handleAddGrade,
    editingGrade,
  } = dashboard;

  return (
    <Dialog open={showGradeDialog} onOpenChange={handleGradeDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Input Nilai
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingGrade ? "Edit Nilai Siswa" : "Input Nilai Siswa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddGrade} className="space-y-4">
          <div className="space-y-2">
            <Label>Mata Pelajaran</Label>
            <Select
              value={
                gradeForm.subjectId && gradeForm.kelasId
                  ? `${gradeForm.subjectId}-${gradeForm.kelasId}`
                  : ""
              }
              onValueChange={(value) => {
                const [subjectId, kelasId] = value.split("-");
                setGradeForm((prev) => ({
                  ...prev,
                  subjectId,
                  kelasId,
                  studentId: "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata pelajaran" />
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
              value={gradeForm.studentId}
              onValueChange={(value) =>
                setGradeForm((prev) => ({ ...prev, studentId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih siswa">
                  {getStudentName(gradeForm.studentId)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {students
                  .filter(
                    (s) => String(s.kelasId) === String(gradeForm.kelasId)
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
              value={gradeForm.semesterId || ""}
              onValueChange={(value) =>
                setGradeForm((prev) => ({
                  ...prev,
                  semesterId: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester">
                  {gradeForm.semesterId
                    ? getSemesterLabelById(gradeForm.semesterId)
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
              <Label>Jenis Nilai</Label>
              <Select
                value={gradeForm.jenis}
                onValueChange={(value) =>
                  setGradeForm((prev) => ({
                    ...prev,
                    jenis: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis nilai" />
                </SelectTrigger>
                <SelectContent>
                  {gradeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nilai</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={gradeForm.nilai}
                onChange={(e) =>
                  setGradeForm((prev) => ({
                    ...prev,
                    nilai: e.target.value,
                  }))
                }
                placeholder="Masukkan nilai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={gradeForm.tanggal}
              onChange={(e) =>
                setGradeForm((prev) => ({
                  ...prev,
                  tanggal: e.target.value,
                }))
              }
            />
          </div>

          <Button type="submit" className="w-full">
            {editingGrade ? "Update Nilai" : "Simpan Nilai"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
