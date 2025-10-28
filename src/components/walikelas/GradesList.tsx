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
  studentName?: string;
}

interface StudentSummary {
  id: string;
  nama: string;
  studentId?: string | number | null;
  userId?: string | number | null;
}

interface GradesListProps {
  loading: boolean;
  grades: GradeItem[];
  students: StudentSummary[];
  onVerifyGrade: (gradeId: string) => void;
  emptyMessage?: string;
}

const GradesList = ({
  loading,
  grades,
  students,
  onVerifyGrade,
  emptyMessage,
}: GradesListProps) => {
  const matchStudentById = (
    studentId: string | number | null | undefined
  ) => {
    if (studentId === undefined || studentId === null) {
      return undefined;
    }

    const targetId = String(studentId);

    return students.find((student) => {
      const candidateIds = [
        student.studentId ?? student.id ?? student.userId,
        student.studentId,
        student.id,
        student.userId,
      ]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value));

      return candidateIds.includes(targetId);
    });
  };

  const findStudentName = (studentId: string | number | null | undefined) =>
    matchStudentById(studentId)?.nama || "Siswa";

  const getNormalizedStudentId = (studentId: string | number) => {
    const student = matchStudentById(studentId);
    const normalizedId = student?.studentId ?? student?.id ?? student?.userId;

    return normalizedId !== undefined && normalizedId !== null
      ? String(normalizedId)
      : studentId;
  };

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
        <p className="text-muted-foreground">
          {emptyMessage || "Belum ada data nilai."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grades.map((grade) => {
        const normalizedStudentId = getNormalizedStudentId(grade.studentId);
        const studentName =
          grade.studentName ?? findStudentName(normalizedStudentId);

        return (
          <div
            key={grade.id}
            className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-4 md:space-y-0"
          >
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{studentName}</h4>
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
            <div className="flex flex-col items-stretch md:items-end gap-3">
              <div className="flex items-center gap-3 md:justify-end">
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${getGradeColor(grade.nilai)}`}
                  >
                    {grade.nilai}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    grade.verified
                      ? "border-success/40 text-success"
                      : "border-warning/40 text-warning"
                  }
                >
                  {grade.verified
                    ? "Sudah Terverifikasi"
                    : "Belum Terverifikasi"}
                </Badge>
              </div>
              {!grade.verified && (
                <Button
                  size="sm"
                  onClick={() => onVerifyGrade(grade.id)}
                  className="bg-success text-success-foreground"
                  aria-label={`Verifikasi nilai ${findStudentName(normalizedStudentId)}`}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verifikasi
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GradesList;
