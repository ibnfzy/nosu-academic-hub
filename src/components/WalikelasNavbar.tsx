import { Button } from "@/components/ui/button";
import { Users, CheckCircle, Calendar, BarChart3, LogOut } from "lucide-react";

// Menu items for walikelas dashboard
const menuItems = [
  {
    title: "Siswa",
    icon: Users,
    id: "students",
    description: "Kelola data siswa kelas",
  },
  {
    title: "Verifikasi Nilai",
    icon: CheckCircle,
    id: "grades",
    description: "Verifikasi nilai siswa",
  },
  {
    title: "Kehadiran",
    icon: Calendar,
    id: "attendance",
    description: "Monitor kehadiran siswa",
  },
  {
    title: "Laporan",
    icon: BarChart3,
    id: "reports",
    description: "Laporan kelas dan siswa",
  },
];

interface WalikelasNavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const WalikelasNavbar = ({
  activeSection,
  setActiveSection,
  onLogout,
}: WalikelasNavbarProps) => {
  const activeItem = menuItems.find((item) => item.id === activeSection);

  return (
    <div className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 py-4">
          {/* Navigation Title */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Panel Wali Kelas
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeItem?.description || "Kelola kelas Anda"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Navigation Menu */}
          <div className="flex flex-wrap gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalikelasNavbar;
