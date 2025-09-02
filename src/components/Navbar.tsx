import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  User, 
  UserCheck, 
  GraduationCap, 
  Shield, 
  LogIn,
  LogOut,
  School
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';

const Navbar = ({ currentUser, onLogin, onLogout }) => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { toast } = useToast();

  const roleOptions = [
    { value: 'siswa', label: 'Siswa', icon: User, color: 'text-primary' },
    { value: 'guru', label: 'Guru Mata Pelajaran', icon: GraduationCap, color: 'text-accent' },
    { value: 'walikelas', label: 'Wali Kelas', icon: UserCheck, color: 'text-success' },
    { value: 'admin', label: 'Administrator', icon: Shield, color: 'text-warning' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password || !loginData.role) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await apiService.login(loginData.username, loginData.password, loginData.role);
      
      if (result.success) {
        onLogin(result.user);
        setShowLogin(false);
        setLoginData({ username: '', password: '', role: '' });
        
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${result.user.nama}!`
        });

        // Redirect ke dashboard sesuai role
        const dashboardPath = result.user.role === 'walikelas' 
          ? '/dashboard/guru' 
          : `/dashboard/${result.user.role}`;
        navigate(dashboardPath);
      } else {
        toast({
          title: "Login Gagal",
          description: result.message || "Username atau password salah",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan sistem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      onLogout();
      navigate('/');
      
      toast({
        title: "Logout Berhasil",
        description: "Sampai jumpa!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat logout",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role) => {
    const roleOption = roleOptions.find(opt => opt.value === role);
    if (!roleOption) return User;
    return roleOption.icon;
  };

  const getRoleColor = (role) => {
    const roleOption = roleOptions.find(opt => opt.value === role);
    if (!roleOption) return 'text-muted-foreground';
    return roleOption.color;
  };

  return (
    <nav className="bg-background border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo dan Nama Sekolah */}
          <div className="flex items-center space-x-3">
            <School className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                SMA Negeri 1 Nosu
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistem Informasi Akademik
              </p>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Card className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const Icon = getRoleIcon(currentUser.role);
                      return <Icon className={`h-4 w-4 ${getRoleColor(currentUser.role)}`} />;
                    })()}
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{currentUser.nama}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {currentUser.role === 'walikelas' ? 'Wali Kelas' : 
                         currentUser.role === 'guru' ? 'Guru' : 
                         currentUser.role}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="transition-smooth"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog open={showLogin} onOpenChange={setShowLogin}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Login Sistem Akademik
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Masuk Sebagai</Label>
                      <Select 
                        value={loginData.role} 
                        onValueChange={(value) => setLoginData(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih peran Anda" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <option.icon className={`h-4 w-4 ${option.color}`} />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Masukkan username"
                        value={loginData.username}
                        onChange={(e) => setLoginData(prev => ({ 
                          ...prev, 
                          username: e.target.value 
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Masukkan password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ 
                          ...prev, 
                          password: e.target.value 
                        }))}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Memproses...' : 'Login'}
                    </Button>
                  </form>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
                    <div className="text-xs space-y-1">
                      <p>• Admin: admin / admin123</p>
                      <p>• Siswa: 2024001 / siswa123</p>
                      <p>• Guru: guru003 / guru123</p>
                      <p>• Walikelas: guru001 / guru123</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;