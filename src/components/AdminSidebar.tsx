import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Users,
  BookOpen,
  School,
  Shield,
} from 'lucide-react';

const menuItems = [
  { 
    title: 'Manajemen Users', 
    icon: Users,
    id: 'users'
  },
  { 
    title: 'Mata Pelajaran', 
    icon: BookOpen,
    id: 'subjects'
  },
  { 
    title: 'Manajemen Kelas', 
    icon: School,
    id: 'classes'
  },
];

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const isActive = (tabId: string) => activeTab === tabId;

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Menu Admin</span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.id) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
                  >
                    <button 
                      onClick={() => handleTabClick(item.id)}
                      className="w-full flex items-center space-x-2 p-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}