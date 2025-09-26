import { Button } from "@/components/ui/button";
import { FileText, Calendar, BookOpen, LogOut, Download } from "lucide-react";

// Menu items for siswa dashboard
const menuItems = [
  {
    title: "Nilai",
    icon: FileText,
    id: "nilai",
    description: "Lihat nilai-nilai pelajaran",
  },
  {
    title: "Kehadiran",
    icon: Calendar,
    id: "kehadiran",
    description: "Monitor kehadiran Anda",
  },
  {
    title: "Mata Pelajaran",
    icon: BookOpen,
    id: "matapelajaran",
    description: "Lihat semua mata pelajaran",
  },
];

interface SiswaNavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
  onPrintReport: () => void;
}

const SiswaNavbar = ({
  activeSection,
  setActiveSection,
  onLogout,
  onPrintReport,
}: SiswaNavbarProps) => {
  const activeItem = menuItems.find((item) => item.id === activeSection);

  return (
    <div className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 py-4">
          {/* Navigation Title */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Panel Orang Tua Siswa
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeItem?.description || "Dashboard akademik Anda"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrintReport}
                className="text-primary hover:text-primary-foreground hover:bg-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Cetak Raport
              </Button>
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

export default SiswaNavbar;
