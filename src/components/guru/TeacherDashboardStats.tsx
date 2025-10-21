import { BookOpen, FileText, Users } from "lucide-react";

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
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-muted/40 bg-muted/30 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="leading-tight">
            <p className="text-2xl font-semibold text-foreground">{subjectsCount}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Mapel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div className="leading-tight">
            <p className="text-2xl font-semibold text-foreground">{studentsCount}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Siswa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm">
            <FileText className="h-5 w-5 text-success" />
          </div>
          <div className="leading-tight">
            <p className="text-2xl font-semibold text-foreground">{gradesCount}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Nilai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
