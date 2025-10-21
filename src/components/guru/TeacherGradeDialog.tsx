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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  type Semester,
  UseTeacherDashboardReturn,
} from "@/hooks/use-teacher-dashboard";

type TeacherGradeDialogProps = {
  dashboard: UseTeacherDashboardReturn;
  buildSemesterLabel: (semester: Semester | null) => string | null;
  getSemesterLabelById: (
    id: string | number | null,
    fallback?: Semester | null
  ) => string;
};

export function TeacherGradeDialog({
  dashboard,
  buildSemesterLabel,
  getSemesterLabelById,
}: TeacherGradeDialogProps) {
  const {
    showGradeDialog,
    handleGradeDialogOpenChange,
    gradeForm,
    setGradeForm,
    gradeTypes,
    subjects,
    students,
    semesters,
    getClassesName,
    getStudentName,
    handleAddGrade,
    editingGrade,
    gradeContextLock,
  } = dashboard;

  const isSubjectLocked =
    !editingGrade &&
    !!gradeContextLock?.subjectId &&
    !!gradeContextLock?.kelasId;

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
        <form onSubmit={handleAddGrade} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Langkah 1: Mata Pelajaran
            </h3>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select
                disabled={isSubjectLocked}
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
                <SelectTrigger disabled={isSubjectLocked}>
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
              <p className="text-xs text-muted-foreground">
                {isSubjectLocked
                  ? "Mata pelajaran dan kelas ditetapkan dari konteks pilihan Anda."
                  : "Pilih mata pelajaran dan kelas yang ingin dinilai."}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Langkah 2: Pilih Siswa
            </h3>
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
                    .map((student, index) => {
                      const resolvedStudentId =
                        student.studentId ?? student.userId ?? student.id;
                      const optionValue = String(
                        resolvedStudentId ?? index
                      );
                      return (
                        <SelectItem key={optionValue} value={optionValue}>
                          {student.nama} ({student.nisn})
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Siswa ditampilkan berdasarkan kelas yang dipilih.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Langkah 3: Isi Nilai
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
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
                <p className="text-xs text-muted-foreground">
                  Pilih semester sesuai jadwal akademik.
                </p>
              </div>

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
                <p className="text-xs text-muted-foreground">
                  Pilih jenis penilaian yang sesuai.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                <p className="text-xs text-muted-foreground">Nilai 0–100.</p>
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
                <p className="text-xs text-muted-foreground">
                  Pilih tanggal sesuai tanggal mengajar.
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {editingGrade ? "Perbarui Nilai Ini" : "Simpan Nilai Ini"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
