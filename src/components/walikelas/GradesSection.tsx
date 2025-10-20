import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, CheckSquare, Clock } from "lucide-react";
import { formatDate, getGradeColor } from "@/utils/helpers";

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
  const findStudentName = (studentId: string) =>
    students.find((student) => student.id === studentId)?.nama || "Siswa";

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
        {loading ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Memuat data nilai...</p>
          </div>
        ) : unverifiedGrades.length > 0 ? (
          <div className="space-y-4">
            {unverifiedGrades.map((grade) => (
              <div
                key={grade.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-4 md:space-y-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">
                    {findStudentName(grade.studentId)}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Mata Pelajaran {grade.subjectId}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {grade.jenis}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(grade.tanggal)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getGradeColor(grade.nilai)}`}>
                      {grade.nilai}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onVerifyGrade(grade.id)}
                    className="bg-success text-success-foreground"
                    aria-label={`Verifikasi nilai ${findStudentName(grade.studentId)}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verifikasi
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Semua nilai sudah diverifikasi</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradesSection;
