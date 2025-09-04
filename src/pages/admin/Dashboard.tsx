import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { AdminNavbar } from '@/components/AdminNavbar';
import {
  GraduationCap,
  UserCheck,
  Shield,
  Users,
  BookOpen,
  School,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminDashboard = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('siswa');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    nama: '',
    role: '',
    email: '',
    nis: '',
    nisn: '',
    nip: ''
  });
  
  const [subjectForm, setSubjectForm] = useState({
    nama: '',
    kode: '',
    kelasId: ''
  });
  
  const [classForm, setClassForm] = useState({
    nama: '',
    tingkat: '',
    walikelas: ''
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'guru', label: 'Guru' },
    { value: 'walikelas', label: 'Wali Kelas' },
    { value: 'siswa', label: 'Siswa' }
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load data from localStorage via apiService
      const [usersData, subjectsData, classesData] = await Promise.all([
        apiService.getUsers(),
        apiService.getSubjects(),
        apiService.getClasses()
      ]);
      
      setUsers(usersData);
      setSubjects(subjectsData);
      setClasses(classesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data admin",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!userForm.username || !userForm.nama || !userForm.role) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive"
      });
      return;
    }

    try {
      const userData = {
        ...userForm,
        role: userForm.role || activeSection,
        id: editingItem ? editingItem.id : Date.now().toString()
      };

      let result;
      if (editingItem) {
        result = await apiService.updateUser(userData.id, userData);
      } else {
        result = await apiService.addUser(userData);
      }
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: `User berhasil ${editingItem ? 'diupdate' : 'ditambahkan'}`
        });
        
        resetUserForm();
        loadAdminData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal ${editingItem ? 'mengupdate' : 'menambahkan'} user`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        const result = await apiService.deleteUser(userId);
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "User berhasil dihapus"
          });
          loadAdminData();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus user",
          variant: "destructive"
        });
      }
    }
  };

  const resetUserForm = () => {
    setUserForm({
      username: '',
      password: '',
      nama: '',
      role: '',
      email: '',
      nis: '',
      nisn: '',
      nip: ''
    });
    setEditingItem(null);
    setShowUserDialog(false);
  };

  const editUser = (user) => {
    setUserForm(user);
    setEditingItem(user);
    setShowUserDialog(true);
  };

  const getCurrentRoleUsers = () => {
    let targetRole;
    switch(activeSection) {
      case 'siswa': targetRole = 'siswa'; break;
      case 'guru': targetRole = 'guru'; break;
      case 'walikelas': targetRole = 'walikelas'; break;
      case 'admin': targetRole = 'admin'; break;
      default: return [];
    }
    
    return users.filter(user => {
      const matchesRole = user.role === targetRole;
      const matchesSearch = user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  };

  const filteredUsers = getCurrentRoleUsers();

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    
    if (!subjectForm.nama || !subjectForm.kode) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive"
      });
      return;
    }

    try {
      const subjectData = {
        ...subjectForm,
        id: editingItem ? editingItem.id : Date.now().toString()
      };

      let result;
      if (editingItem) {
        result = await apiService.updateSubject(subjectData.id, subjectData);
      } else {
        result = await apiService.addSubject(subjectData);
      }
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Mata pelajaran berhasil ${editingItem ? 'diupdate' : 'ditambahkan'}`
        });
        
        resetSubjectForm();
        loadAdminData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal ${editingItem ? 'mengupdate' : 'menambahkan'} mata pelajaran`,
        variant: "destructive"
      });
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    
    if (!classForm.nama || !classForm.tingkat) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive"
      });
      return;
    }

    try {
      const classData = {
        ...classForm,
        id: editingItem ? editingItem.id : Date.now().toString()
      };

      let result;
      if (editingItem) {
        result = await apiService.updateClass(classData.id, classData);
      } else {
        result = await apiService.addClass(classData);
      }
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Kelas berhasil ${editingItem ? 'diupdate' : 'ditambahkan'}`
        });
        
        resetClassForm();
        loadAdminData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal ${editingItem ? 'mengupdate' : 'menambahkan'} kelas`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      try {
        const result = await apiService.deleteSubject(subjectId);
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Mata pelajaran berhasil dihapus"
          });
          loadAdminData();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus mata pelajaran",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      try {
        const result = await apiService.deleteClass(classId);
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Kelas berhasil dihapus"
          });
          loadAdminData();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus kelas",
          variant: "destructive"
        });
      }
    }
  };

  const resetSubjectForm = () => {
    setSubjectForm({
      nama: '',
      kode: '',
      kelasId: ''
    });
    setEditingItem(null);
    setShowSubjectDialog(false);
  };

  const resetClassForm = () => {
    setClassForm({
      nama: '',
      tingkat: '',
      walikelas: ''
    });
    setEditingItem(null);
    setShowClassDialog(false);
  };

  const editSubject = (subject) => {
    setSubjectForm(subject);
    setEditingItem(subject);
    setShowSubjectDialog(true);
  };

  const editClass = (classItem) => {
    setClassForm(classItem);
    setEditingItem(classItem);
    setShowClassDialog(true);
  };

  const waliKelasList = users.filter(u => u.role === 'walikelas');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Admin Navbar */}
      <AdminNavbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in">
          <Card className="shadow-elegant hover-scale transition-smooth bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{users.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover-scale transition-smooth bg-gradient-to-br from-accent/10 to-accent/20 border-accent/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-accent/10 rounded-lg">
                  <BookOpen className="h-5 w-5 md:h-8 md:w-8 text-accent" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{subjects.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Mata Pelajaran</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover-scale transition-smooth bg-gradient-to-br from-success/10 to-success/20 border-success/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-success/10 rounded-lg">
                  <School className="h-5 w-5 md:h-8 md:w-8 text-success" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{classes.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Kelas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover-scale transition-smooth bg-gradient-to-br from-warning/10 to-warning/20 border-warning/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-warning/10 rounded-lg">
                  <Shield className="h-5 w-5 md:h-8 md:w-8 text-warning" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          {['siswa', 'guru', 'walikelas', 'admin'].includes(activeSection) && (
            <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-b border-primary/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {activeSection === 'siswa' && <GraduationCap className="h-5 w-5 text-primary" />}
                      {activeSection === 'guru' && <Users className="h-5 w-5 text-primary" />}
                      {activeSection === 'walikelas' && <UserCheck className="h-5 w-5 text-primary" />}
                      {activeSection === 'admin' && <Shield className="h-5 w-5 text-primary" />}
                      <span>
                        Manajemen {
                          activeSection === 'siswa' ? 'Siswa' :
                          activeSection === 'guru' ? 'Guru' :
                          activeSection === 'walikelas' ? 'Wali Kelas' :
                          'Administrator'
                        }
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Kelola data {
                        activeSection === 'siswa' ? 'siswa' :
                        activeSection === 'guru' ? 'guru' :
                        activeSection === 'walikelas' ? 'wali kelas' :
                        'administrator'
                      }
                    </p>
                  </div>
                  <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-primary text-primary-foreground w-full md:w-auto"
                        onClick={() => setEditingItem(null)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah {
                          activeSection === 'siswa' ? 'Siswa' :
                          activeSection === 'guru' ? 'Guru' :
                          activeSection === 'walikelas' ? 'Wali Kelas' :
                          'Admin'
                        }
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4 md:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? `Edit ${
                            activeSection === 'siswa' ? 'Siswa' :
                            activeSection === 'guru' ? 'Guru' :
                            activeSection === 'walikelas' ? 'Wali Kelas' :
                            'Admin'
                          }` : `Tambah ${
                            activeSection === 'siswa' ? 'Siswa' :
                            activeSection === 'guru' ? 'Guru' :
                            activeSection === 'walikelas' ? 'Wali Kelas' :
                            'Admin'
                          } Baru`}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUserSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                              value={userForm.username}
                              onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                              placeholder="Username"
                              required
                            />
                          </div>
                          
                          {!editingItem && (
                            <div className="space-y-2">
                              <Label>Password</Label>
                              <Input
                                type="password"
                                value={userForm.password}
                                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Password"
                                required={!editingItem}
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Nama Lengkap</Label>
                          <Input
                            value={userForm.nama}
                            onChange={(e) => setUserForm(prev => ({ ...prev, nama: e.target.value }))}
                            placeholder="Nama Lengkap"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select 
                            value={userForm.role || activeSection}
                            onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                            required
                            disabled={!editingItem}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={activeSection}>
                                {roles.find(r => r.value === activeSection)?.label}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(userForm.role === 'siswa' || userForm.role === 'guru' || userForm.role === 'walikelas') && (
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="email@example.com"
                            />
                          </div>
                        )}

                        {(userForm.role === 'siswa' || activeSection === 'siswa') && (
                          <>
                            <div className="space-y-2">
                              <Label>NIS</Label>
                              <Input
                                value={userForm.nis}
                                onChange={(e) => setUserForm(prev => ({ ...prev, nis: e.target.value }))}
                                placeholder="Nomor Induk Siswa"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>NISN</Label>
                              <Input
                                value={userForm.nisn}
                                onChange={(e) => setUserForm(prev => ({ ...prev, nisn: e.target.value }))}
                                placeholder="Nomor Induk Siswa Nasional"
                              />
                            </div>
                          </>
                        )}

                        {(userForm.role === 'guru' || userForm.role === 'walikelas' || activeSection === 'guru' || activeSection === 'walikelas') && (
                          <div className="space-y-2">
                            <Label>NIP</Label>
                            <Input
                              value={userForm.nip}
                              onChange={(e) => setUserForm(prev => ({ ...prev, nip: e.target.value }))}
                              placeholder="Nomor NIP"
                            />
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-2">
                          <Button type="submit" className="flex-1">
                            {editingItem ? 'Update' : 'Simpan'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={resetUserForm}
                          >
                            Batal
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={`Cari ${
                          activeSection === 'siswa' ? 'siswa' :
                          activeSection === 'guru' ? 'guru' :
                          activeSection === 'walikelas' ? 'wali kelas' :
                          'admin'
                        }...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Username</TableHead>
                        {activeSection === 'siswa' && !isMobile && <TableHead>NIS</TableHead>}
                        {activeSection === 'siswa' && !isMobile && <TableHead>NISN</TableHead>}
                        {(activeSection === 'guru' || activeSection === 'walikelas') && !isMobile && <TableHead>NIP</TableHead>}
                        {!isMobile && <TableHead>Email</TableHead>}
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nama}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          {activeSection === 'siswa' && !isMobile && <TableCell className="text-muted-foreground">{user.nis || '-'}</TableCell>}
                          {activeSection === 'siswa' && !isMobile && <TableCell className="text-muted-foreground">{user.nisn || '-'}</TableCell>}
                          {(activeSection === 'guru' || activeSection === 'walikelas') && !isMobile && <TableCell className="text-muted-foreground">{user.nip || '-'}</TableCell>}
                          {!isMobile && <TableCell className="text-muted-foreground">{user.email || '-'}</TableCell>}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => editUser(user)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'subjects' && (
            <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-accent/10">
              <CardHeader className="bg-gradient-to-r from-accent/5 to-accent/10 border-b border-accent/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-accent" />
                      <span>Manajemen Mata Pelajaran</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Kelola mata pelajaran sekolah</p>
                  </div>
                  <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-primary text-primary-foreground w-full md:w-auto"
                        onClick={() => setEditingItem(null)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Mata Pelajaran
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4 md:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubjectSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama Mata Pelajaran</Label>
                          <Input
                            value={subjectForm.nama}
                            onChange={(e) => setSubjectForm(prev => ({ ...prev, nama: e.target.value }))}
                            placeholder="Contoh: Matematika"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Kode Mata Pelajaran</Label>
                          <Input
                            value={subjectForm.kode}
                            onChange={(e) => setSubjectForm(prev => ({ ...prev, kode: e.target.value }))}
                            placeholder="Contoh: MTK"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Kelas (Opsional)</Label>
                          <Select 
                            value={subjectForm.kelasId}
                            onValueChange={(value) => setSubjectForm(prev => ({ ...prev, kelasId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kelas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Kelas</SelectItem>
                              {classes.map((kelas) => (
                                <SelectItem key={kelas.id} value={kelas.id}>
                                  {kelas.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2">
                          <Button type="submit" className="flex-1">
                            {editingItem ? 'Update' : 'Simpan'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={resetSubjectForm}
                          >
                            Batal
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Mata Pelajaran</TableHead>
                        <TableHead>Kode</TableHead>
                        {!isMobile && <TableHead>Kelas</TableHead>}
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.nama}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{subject.kode}</Badge>
                          </TableCell>
                          {!isMobile && (
                            <TableCell className="text-muted-foreground">
                              {subject.kelasId && subject.kelasId !== 'all'
                                ? classes.find(c => c.id === subject.kelasId)?.nama || '-'
                                : 'Semua Kelas'
                              }
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => editSubject(subject)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSubject(subject.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'classes' && (
            <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-success/10">
              <CardHeader className="bg-gradient-to-r from-success/5 to-success/10 border-b border-success/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <School className="h-5 w-5 text-success" />
                      <span>Manajemen Kelas</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Kelola kelas dan wali kelas</p>
                  </div>
                  <Dialog open={showClassDialog} onOpenChange={setShowClassDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-primary text-primary-foreground w-full md:w-auto"
                        onClick={() => setEditingItem(null)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Kelas
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4 md:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleClassSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama Kelas</Label>
                          <Input
                            value={classForm.nama}
                            onChange={(e) => setClassForm(prev => ({ ...prev, nama: e.target.value }))}
                            placeholder="Contoh: XII IPA 1"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tingkat</Label>
                          <Select 
                            value={classForm.tingkat}
                            onValueChange={(value) => setClassForm(prev => ({ ...prev, tingkat: value }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tingkat" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="X">Kelas X</SelectItem>
                              <SelectItem value="XI">Kelas XI</SelectItem>
                              <SelectItem value="XII">Kelas XII</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Wali Kelas (Opsional)</Label>
                          <Select 
                            value={classForm.walikelas}
                            onValueChange={(value) => setClassForm(prev => ({ ...prev, walikelas: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih wali kelas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Belum Ditentukan</SelectItem>
                              {waliKelasList.map((guru) => (
                                <SelectItem key={guru.id} value={guru.id}>
                                  {guru.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2">
                          <Button type="submit" className="flex-1">
                            {editingItem ? 'Update' : 'Simpan'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={resetClassForm}
                          >
                            Batal
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Kelas</TableHead>
                        <TableHead>Tingkat</TableHead>
                        {!isMobile && <TableHead>Wali Kelas</TableHead>}
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((classItem) => (
                        <TableRow key={classItem.id}>
                          <TableCell className="font-medium">{classItem.nama}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Kelas {classItem.tingkat}</Badge>
                          </TableCell>
                          {!isMobile && (
                            <TableCell className="text-muted-foreground">
                              {classItem.walikelas && classItem.walikelas !== 'none'
                                ? waliKelasList.find(g => g.id === classItem.walikelas)?.nama || '-'
                                : 'Belum Ditentukan'
                              }
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => editClass(classItem)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClass(classItem.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;