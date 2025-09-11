import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Users,
  UserCheck,
  Shield,
  BookOpen,
  School,
  LogOut,
  Building2
} from 'lucide-react';

const menuItems = [
  { 
    title: 'Siswa', 
    icon: GraduationCap,
    id: 'siswa',
    description: 'Kelola data siswa'
  },
  { 
    title: 'Guru & Wali Kelas', 
    icon: Users,
    id: 'guru',
    description: 'Kelola data guru dan wali kelas'
  },
  { 
    title: 'Admin', 
    icon: Shield,
    id: 'admin',
    description: 'Kelola data administrator'
  },
  { 
    title: 'Mata Pelajaran', 
    icon: BookOpen,
    id: 'subjects',
    description: 'Atur mata pelajaran'
  },
  { 
    title: 'Kelas', 
    icon: School,
    id: 'classes',
    description: 'Manajemen kelas'
  },
  { 
    title: 'Profil Sekolah', 
    icon: Building2,
    id: 'school-profile',
    description: 'Kelola profil dan informasi sekolah'
  },
];

interface AdminNavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

export function AdminNavbar({ activeSection, setActiveSection, onLogout }: AdminNavbarProps) {
  return (
    <nav className="bg-gradient-to-r from-primary via-primary-glow to-accent p-4 shadow-elegant">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="text-white">
            <h1 className="text-xl md:text-2xl font-bold">Dashboard Administrator</h1>
            <p className="text-sm opacity-90">Kelola sistem akademik sekolah</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 transition-smooth w-full sm:w-auto ${
                    isActive 
                      ? 'bg-white text-primary shadow-glow' 
                      : 'text-white hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.title}</span>
                </Button>
              );
            })}
            
            {/* Logout Button */}
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
        
        {/* Section Description */}
        <div className="mt-4 lg:mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-white text-sm">
              {menuItems.find(item => item.id === activeSection)?.description || 'Pilih menu untuk memulai'}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}