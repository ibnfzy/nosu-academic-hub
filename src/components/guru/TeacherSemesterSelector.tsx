import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Semester } from "@/hooks/use-teacher-dashboard";

type TeacherSemesterSelectorProps = {
  selectedSemesterId: string;
  semesters: Semester[];
  onSelect: (value: string) => void;
  getSemesterLabelById: (id: string | number | null, fallback?: Semester | null) => string;
  buildSemesterLabel: (semesterItem: Semester | null) => string | null;
};

export function TeacherSemesterSelector({
  selectedSemesterId,
  semesters,
  onSelect,
  getSemesterLabelById,
  buildSemesterLabel,
}: TeacherSemesterSelectorProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Periode Akademik</h2>
        <p className="text-sm text-muted-foreground">
          {selectedSemesterId
            ? `Menampilkan data untuk ${getSemesterLabelById(selectedSemesterId)}`
            : semesters.length > 0
            ? "Silakan pilih semester untuk menampilkan data."
            : "Data semester belum tersedia."}
        </p>
      </div>
      <div className="w-full md:w-64">
        <Select value={selectedSemesterId || ""} onValueChange={onSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih semester">
              {selectedSemesterId
                ? getSemesterLabelById(selectedSemesterId)
                : semesters.length > 0
                ? "Pilih semester"
                : "Semester belum tersedia"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {semesters.length > 0 ? (
              semesters.map((semester) => (
                <SelectItem key={semester.id} value={String(semester.id)}>
                  {buildSemesterLabel(semester) || `Semester ${semester.semester}`}
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
    </div>
  );
}
