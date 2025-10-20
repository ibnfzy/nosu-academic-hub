import { BookOpen, FileText, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type TeacherDashboardStatsProps = {
  subjectsCount: number;
  studentsCount: number;
  gradesCount: number;
};

export function TeacherDashboardStats({
  subjectsCount,
  studentsCount,
  gradesCount,
}: TeacherDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{subjectsCount}</p>
              <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{studentsCount}</p>
              <p className="text-sm text-muted-foreground">Siswa Diajar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <FileText className="h-8 w-8 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{gradesCount}</p>
              <p className="text-sm text-muted-foreground">Nilai Input</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
