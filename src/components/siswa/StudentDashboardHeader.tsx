import { User } from "lucide-react";

/**
 * Displays the student dashboard hero section including the title and greeting.
 */
export interface StudentDashboardHeaderProps {
  /** Name of the student that is displayed in the greeting. */
  studentName?: string;
}

export function StudentDashboardHeader({
  studentName,
}: StudentDashboardHeaderProps) {
  return (
    <div className="gradient-primary text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <div className="p-2 md:p-3 bg-white/20 rounded-lg">
            <User className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Panel Orang Tua Siswa
            </h1>
            <p className="opacity-90 text-sm md:text-base">
              Selamat datang, Orang Tua Siswa {studentName || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
