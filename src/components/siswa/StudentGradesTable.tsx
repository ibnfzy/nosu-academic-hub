import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, FileText } from "lucide-react";
import { StudentGrade } from "@/hooks/use-student-dashboard";
import { formatDate, getGradeColor } from "@/utils/helpers";

/**
 * Shows the grade list for the selected period.
 */
export interface StudentGradesTableProps {
  /** Collection of grade records retrieved for the active semester. */
  grades: StudentGrade[];
  /** Indicates whether grades are still being loaded from the API. */
  loading?: boolean;
}

export function StudentGradesTable({
  grades,
  loading = false,
}: StudentGradesTableProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Daftar Nilai</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Memuat data nilai...</span>
            </div>
          </div>
        ) : grades.length > 0 ? (
          <div className="space-y-4">
            {grades.map((grade) => (
              <div
                key={grade.id}
                className="flex justify-between items-center p-4 border border-border rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-foreground">{grade.subjectName}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {grade.jenis}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(grade.tanggal)}
                    </span>
                    {grade.verified === 1 ? (
                      <Badge className="text-xs bg-success text-success-foreground">
                        Terverifikasi
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-destructive text-destructive-foreground">
                        Belum Diverifikasi
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${getGradeColor(grade.nilai)}`}>
                    {grade.nilai}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada data nilai</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
