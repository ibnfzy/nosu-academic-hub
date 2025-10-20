import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp, BarChart3 } from "lucide-react";

/**
 * Renders the summary statistics cards for the student dashboard.
 */
export interface StudentStatsCardsProps {
  /** Average grade for the currently selected period. */
  averageGrade: number;
  /** Attendance percentage aggregated from attendance records. */
  attendancePercentage: number;
  /** Number of subjects that contain at least one grade record. */
  subjectCount: number;
}

export function StudentStatsCards({
  averageGrade,
  attendancePercentage,
  subjectCount,
}: StudentStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{averageGrade}</p>
              <p className="text-sm text-muted-foreground">Nilai Rata-rata</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {attendancePercentage}%
              </p>
              <p className="text-sm text-muted-foreground">Kehadiran</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{subjectCount}</p>
              <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
