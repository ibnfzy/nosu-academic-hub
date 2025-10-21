import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import GradesList from "@/components/walikelas/GradesList";

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
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <CardTitle>Verifikasi Nilai Siswa</CardTitle>
          {unverifiedGrades.length > 0 && (
            <Button
              onClick={onVerifyAll}
              disabled={loading}
              className="bg-success text-success-foreground w-full md:w-auto"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Verifikasi Semua ({unverifiedGrades.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <GradesList
          loading={loading}
          grades={unverifiedGrades}
          students={students}
          onVerifyGrade={onVerifyGrade}
        />
      </CardContent>
    </Card>
  );
};

export default GradesSection;
