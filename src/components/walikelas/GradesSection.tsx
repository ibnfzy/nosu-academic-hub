import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import GradesList from "@/components/walikelas/GradesList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GradeItem {
  id: string;
  studentId: string;
  subjectId: string;
  jenis: string;
  nilai: string | number;
  tanggal: string;
  verified?: boolean;
}

interface StudentSummary {
  id: string;
  nama: string;
}

interface GradesSectionProps {
  loading: boolean;
  unverifiedGrades: GradeItem[];
  students: StudentSummary[];
  onVerifyGrade: (gradeId: string) => void;
  onVerifyAll: () => void;
}

const GradesSection = ({
  loading,
  unverifiedGrades,
  students,
  onVerifyGrade,
  onVerifyAll,
}: GradesSectionProps) => {
  const [selectedJenis, setSelectedJenis] = useState<"all" | string>("all");

  const jenisOptions = useMemo(() => {
    const uniqueJenis = Array.from(
      new Set(unverifiedGrades.map((grade) => grade.jenis).filter(Boolean))
    );

    return [
      { label: "Semua", value: "all" as const },
      ...uniqueJenis.map((jenis) => ({
        label: jenis,
        value: jenis,
      })),
    ];
  }, [unverifiedGrades]);

  useEffect(() => {
    const availableValues = jenisOptions.map((option) => option.value);

    if (selectedJenis !== "all" && !availableValues.includes(selectedJenis)) {
      setSelectedJenis("all");
    }
  }, [jenisOptions, selectedJenis]);

  const filteredGrades = useMemo(() => {
    if (selectedJenis === "all") {
      return unverifiedGrades;
    }

    return unverifiedGrades.filter((grade) => grade.jenis === selectedJenis);
  }, [selectedJenis, unverifiedGrades]);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <CardTitle>Verifikasi Nilai Siswa</CardTitle>
          <div className="flex flex-col md:flex-row w-full md:w-auto items-stretch md:items-center gap-3">
            <Select value={selectedJenis} onValueChange={setSelectedJenis}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Pilih jenis nilai" />
              </SelectTrigger>
              <SelectContent>
                {jenisOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {unverifiedGrades.length > 0 && (
              <Button
                onClick={onVerifyAll}
                disabled={loading || filteredGrades.length === 0}
                className="bg-success text-success-foreground w-full md:w-auto"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Verifikasi Semua ({filteredGrades.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <GradesList
          loading={loading}
          grades={filteredGrades}
          students={students}
          onVerifyGrade={onVerifyGrade}
        />
      </CardContent>
    </Card>
  );
};

export default GradesSection;
