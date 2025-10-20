import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { TeacherDashboardUser } from "@/hooks/use-teacher-dashboard";

type TeacherDashboardHeaderProps = {
  currentUser: TeacherDashboardUser | null;
  onLogout: () => void;
};

export function TeacherDashboardHeader({
  currentUser,
  onLogout,
}: TeacherDashboardHeaderProps) {
  return (
    <div className="gradient-accent text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg">
              <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Dashboard Guru</h1>
              <p className="opacity-90 text-sm md:text-base">
                Selamat datang, {currentUser?.nama}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
