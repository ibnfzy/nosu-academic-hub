import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
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

interface GradesListProps {
  loading: boolean;
  grades: GradeItem[];
  students: StudentSummary[];
  onVerifyGrade: (gradeId: string) => void;
}

const GradesList = ({
  loading,
  grades,
  students,
  onVerifyGrade,
}: GradesListProps) => {
  const findStudentName = (studentId: string) =>
    students.find((student) => student.id === studentId)?.nama || "Siswa";

  if (loading) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Memuat data nilai...</p>
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Semua nilai sudah diverifikasi</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grades.map((grade) => (
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
  );
};

export default GradesList;
