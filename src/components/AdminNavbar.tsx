import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Users,
  Shield,
  BookOpen,
  School,
  CalendarDays,
  Building2,
  LogOut,
  ChevronDown,
  Settings2,
} from "lucide-react";

const groupedMenu = [
  {
    title: "Manajemen Akses",
    items: [
      {
        title: "Siswa",
        icon: GraduationCap,
        id: "siswa",
        description: "Kelola data akses siswa",
      },
      {
        title: "Akses Guru",
        icon: Users,
        id: "guru",
        description: "Kelola data akses guru",
      },
      {
        title: "Akses Walikelas",
        icon: Users,
        id: "walikelas",
        description: "Kelola data akses wali kelas",
      },
      {
        title: "Admin",
        icon: Shield,
        id: "admin",
        description: "Kelola data akses administrator",
      },
    ],
  },
  {
    title: "Akademik",
    items: [
      {
        title: "Mata Pelajaran",
        icon: BookOpen,
        id: "subjects",
        description: "Atur mata pelajaran",
      },
      {
        title: "Kelas",
        icon: School,
        id: "classes",
        description: "Manajemen kelas",
      },
      {
        title: "Semester",
        icon: CalendarDays,
        id: "semesters",
        description: "Kelola periode semester akademik",
      },
      {
        title: "Penegakan Semester",
        icon: Settings2,
        id: "semester-enforcement",
        description: "Atur mode penegakan semester aktif",
      },
    ],
  },
  {
    title: "Sekolah",
    items: [
      {
        title: "Profil Sekolah",
        icon: Building2,
        id: "school-profile",
        description: "Kelola profil dan informasi sekolah",
      },
    ],
  },
];

interface AdminNavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

export function AdminNavbar({
  activeSection,
  setActiveSection,
  onLogout,
}: AdminNavbarProps) {
  return (
    <nav className="bg-gradient-to-r from-primary via-primary-glow to-accent p-4 shadow-elegant">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="text-white">
            <h1 className="text-xl md:text-2xl font-bold">
              Dashboard Administrator
            </h1>
            <p className="text-sm opacity-90">Kelola sistem akademik sekolah</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {groupedMenu.map((group) => (
              <DropdownMenu key={group.title}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 hover:text-white flex items-center space-x-2 w-full sm:w-auto"
                  >
                    <span>{group.title}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-primary shadow-lg">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 transition-smooth w-full sm:w-auto text-white hover:bg-red-500/20 hover:text-white border border-white/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 lg:mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-white text-sm">
              {groupedMenu
                .flatMap((group) => group.items)
                .find((item) => item.id === activeSection)?.description ||
                "Pilih menu untuk memulai"}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
