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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg">
              <Shield className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Dashboard Administrator</h1>
              <p className="opacity-90 text-sm md:text-base">Selamat datang, {currentUser?.nama}</p>
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
                <CardTitle>Manajemen Mata Pelajaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Fitur manajemen mata pelajaran akan segera hadir</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Manajemen Kelas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <School className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Fitur manajemen kelas akan segera hadir</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;