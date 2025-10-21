import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks } from "lucide-react";

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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle className="text-xl">Langkah 1: Pilih Periode</CardTitle>
        </div>
        <CardDescription>
          {selectedSemesterId
            ? `Menampilkan data untuk ${getSemesterLabelById(selectedSemesterId)}`
            : semesters.length > 0
            ? "Silakan pilih semester untuk menampilkan data."
            : "Belum ada semester — hubungi admin."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
          <li>Tentukan semester</li>
          <li>Lihat data otomatis</li>
        </ol>
        <div className="w-full md:w-64">
          <Select value={selectedSemesterId || ""} onValueChange={onSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih semester">
                {selectedSemesterId
                  ? getSemesterLabelById(selectedSemesterId)
                  : semesters.length > 0
                  ? "Pilih semester"
                  : "Belum ada semester — hubungi admin"}
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
                <SelectItem value="no-semesters" disabled>
                  Belum ada semester — hubungi admin
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
