import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  SidebarProvider, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import {
  Shield,
  Users,
  BookOpen,
  School,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminDashboard = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1">
          {/* Header */}
          <div className="bg-gradient-primary text-white py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SidebarTrigger className="text-white hover:bg-white/20" />
                  <div className="flex items-center space-x-3">
                    <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                      <Shield className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <h1 className="text-lg md:text-xl font-bold">Dashboard Administrator</h1>
                      <p className="opacity-90 text-xs md:text-sm">Selamat datang, {currentUser?.nama}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="shadow-soft">
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

          <Card className="shadow-soft">
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

          <Card className="shadow-soft">
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

          <Card className="shadow-soft">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Manajemen Users</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Mata Pelajaran</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center space-x-2">
              <School className="h-4 w-4" />
              <span>Manajemen Kelas</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Management Tab */}
          <TabsContent value="users">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <CardTitle>Manajemen Users</CardTitle>
                  <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-primary text-primary-foreground w-full md:w-auto"
                        onClick={() => setEditingItem(null)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4 md:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? 'Edit User' : 'Tambah User Baru'}
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
                            value={userForm.role}
                            onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
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

                        {userForm.role === 'siswa' && (
                          <div className="space-y-2">
                            <Label>NISN</Label>
                            <Input
                              value={userForm.nisn}
                              onChange={(e) => setUserForm(prev => ({ ...prev, nisn: e.target.value }))}
                              placeholder="Nomor NISN"
                            />
                          </div>
                        )}

                        {(userForm.role === 'guru' || userForm.role === 'walikelas') && (
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
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Role</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        {!isMobile && <TableHead>Email</TableHead>}
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nama}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {roles.find(r => r.value === user.role)?.label || user.role}
                            </Badge>
                          </TableCell>
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
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <CardTitle>Manajemen Mata Pelajaran</CardTitle>
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
                              <SelectItem value="">Semua Kelas</SelectItem>
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
                              {subject.kelasId 
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
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <CardTitle>Manajemen Kelas</CardTitle>
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
                              <SelectItem value="">Belum Ditentukan</SelectItem>
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
                              {classItem.walikelas 
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
          </TabsContent>
        </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;