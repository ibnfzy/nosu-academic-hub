import {
  GraduationCap,
  HelpCircle,
  LogOut,
  MoreVertical,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { TeacherDashboardUser } from "@/hooks/use-teacher-dashboard";

type TeacherDashboardHeaderProps = {
  currentUser: TeacherDashboardUser | null;
  onLogout: () => void;
  teachingDayMessage?: string | null;
  teachingDayDateLabel?: string | null;
};

export function TeacherDashboardHeader({
  currentUser,
  onLogout,
  teachingDayMessage,
  teachingDayDateLabel,
}: TeacherDashboardHeaderProps) {
  return (
    <Card className="border-none bg-gradient-to-r from-primary/20 via-primary/10 to-background">
      <CardContent className="max-w-7xl mx-auto flex flex-col gap-6 px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Hai, {currentUser?.nama ?? "Guru hebat"}!
              </h1>
              <p className="mt-1 text-base text-muted-foreground">
                Senang kamu di sini lagi. Yuk, kita rapikan info kelas dan tugas
                hari ini bareng-bareng.
              </p>
              <div className="mt-4 rounded-lg border border-primary/10 bg-background/70 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Kalender Mengajar
                </p>
                {teachingDayDateLabel ? (
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {teachingDayDateLabel}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-muted-foreground">
                  {teachingDayMessage ?? "Data hari mengajar belum tersedia."}
                </p>
              </div>
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <HelpCircle className="mt-0.5 h-4 w-4" />
                <p>
                  Sistem akan otomatis menandai <span className="font-semibold">ALFA</span>{" "}
                  untuk semua siswa yang belum diabsen hari ini pada pukul 17.00.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* <div className="flex items-center gap-2">
              <Button variant="default" size="sm" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Panduan singkat
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 bg-background/80 text-foreground hover:bg-background"
              >
                <PlayCircle className="h-4 w-4" />
                Video
              </Button>
            </div> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Menu lainnya</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onLogout()} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
