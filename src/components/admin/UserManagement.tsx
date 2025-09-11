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
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';

interface UserManagementProps {
  users: any[];
  classes: any[];
  activeSection: string;
  onDataChange: () => void;
}

export default function UserManagement({ users, classes, activeSection, onDataChange }: UserManagementProps) {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userForm, setUserForm] = useState({
    // Users table fields
    username: '',
    password: '',
    email: '',
    role: '',
    
    // Students/Teachers table fields
    nama: '',
    nisn: '',
    nip: '',
    kelasId: '',
    jenisKelamin: '',
    tanggalLahir: '',
    alamat: '',
    nomorHP: '',
    namaOrangTua: '',
    pekerjaanOrangTua: '',
    tahunMasuk: ''
  });

  const { toast } = useToast();

  // Auto-set role when activeSection changes
  useEffect(() => {
    if (activeSection !== 'semua' && !editingItem) {
      setUserForm(prev => ({ ...prev, role: activeSection }));
    }
  }, [activeSection, editingItem]);

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'guru', label: 'Guru' },
    { value: 'walikelas', label: 'Wali Kelas' },
    { value: 'siswa', label: 'Siswa' }
  ];

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-set role based on activeSection if not already set
    const currentRole = userForm.role || activeSection;
    
    if (!userForm.username || !userForm.nama || !currentRole) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive"
      });
      return;
    }

    // Validate role-specific required fields
    if (currentRole === 'siswa' && !userForm.nisn) {
      toast({
        title: "Error",
        description: "NISN wajib diisi untuk siswa",
        variant: "destructive"
      });
      return;
    }

    if ((currentRole === 'guru' || currentRole === 'walikelas') && !userForm.nip) {
      toast({
        title: "Error",
        description: "NIP wajib diisi untuk guru/walikelas",
        variant: "destructive"
      });
      return;
    }

    if (currentRole === 'walikelas' && !userForm.kelasId) {
      toast({
        title: "Error",
        description: "Kelas wajib dipilih untuk walikelas",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare payload based on user type
      const baseUserData = {
        username: userForm.username,
        password: userForm.password,
        email: userForm.email,
        role: currentRole
      };

      let payload;
      let apiEndpoint;

      if (currentRole === 'siswa') {
        payload = {
          users: baseUserData,
          students: {
            nisn: userForm.nisn,
            nama: userForm.nama,
            kelasId: userForm.kelasId,
            jenisKelamin: userForm.jenisKelamin,
            tanggalLahir: userForm.tanggalLahir,
            alamat: userForm.alamat,
            nomorHP: userForm.nomorHP,
            namaOrangTua: userForm.namaOrangTua,
            pekerjaanOrangTua: userForm.pekerjaanOrangTua,
            tahunMasuk: userForm.tahunMasuk
          }
        };
        apiEndpoint = '/admin/students';
      } else if (currentRole === 'guru') {
        payload = {
          users: baseUserData,
          teachers: {
            nip: userForm.nip,
            nama: userForm.nama,
            role: 'guru',
            kelasId: userForm.kelasId || null,
            jenisKelamin: userForm.jenisKelamin,
            alamat: userForm.alamat,
            nomorHP: userForm.nomorHP
          }
        };
        apiEndpoint = '/admin/teachers';
      } else if (currentRole === 'walikelas') {
        payload = {
          users: baseUserData,
          teachers: {
            nip: userForm.nip,
            nama: userForm.nama,
            role: 'walikelas',
            kelasId: userForm.kelasId,
            jenisKelamin: userForm.jenisKelamin,
            alamat: userForm.alamat,
            nomorHP: userForm.nomorHP
          }
        };
        apiEndpoint = '/admin/walikelas';
      } else {
        // Admin users only need users table
        payload = baseUserData;
        apiEndpoint = '/admin/users';
      }

      let result;
      if (editingItem) {
        // For updates, include the ID
        payload.id = editingItem.id;
        result = await apiService.put(`${apiEndpoint}/${editingItem.id}`, payload);
      } else {
        result = await apiService.post(apiEndpoint, payload);
      }
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: `User berhasil ${editingItem ? 'diupdate' : 'ditambahkan'}`
        });
        
        resetUserForm();
        onDataChange();
        setShowUserDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        // Find the user to determine the correct endpoint
        const user = users.find(u => u.id === userId);
        let endpoint = '/admin/users'; // default
        
        if (user) {
          switch (user.role) {
            case 'siswa':
              endpoint = '/admin/students';
              break;
            case 'guru':
              endpoint = '/admin/teachers';
              break;
            case 'walikelas':
              endpoint = '/admin/walikelas';
              break;
            default:
              endpoint = '/admin/users';
          }
        }
        
        const result = await apiService.delete(`${endpoint}/${userId}`);
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "User berhasil dihapus"
          });
          onDataChange();
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
      // Users table fields
      username: '',
      password: '',
      email: '',
      role: '',
      
      // Students/Teachers table fields
      nama: '',
      nisn: '',
      nip: '',
      kelasId: '',
      jenisKelamin: '',
      tanggalLahir: '',
      alamat: '',
      nomorHP: '',
      namaOrangTua: '',
      pekerjaanOrangTua: '',
      tahunMasuk: ''
    });
    setEditingItem(null);
  };

  const editUser = (user: any) => {
    setUserForm(user);
    setEditingItem(user);
    setShowUserDialog(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = 
      user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeSection !== 'semua') {
      return user.role === activeSection && matchesRole && matchesSearch;
    }
    return matchesRole && matchesSearch;
  });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Manajemen {activeSection === 'siswa' ? 'Siswa' : 
                       activeSection === 'guru' ? 'Guru' : 
                       activeSection === 'walikelas' ? 'Wali Kelas' : 
                       activeSection === 'admin' ? 'Administrator' : 'Pengguna'}
          </CardTitle>
          <Dialog open={showUserDialog} onOpenChange={(open) => {
            setShowUserDialog(open);
            if (!open) resetUserForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit User' : 'Tambah User Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input
                    value={userForm.username}
                    onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingItem}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Nama Lengkap *</Label>
                  <Input
                    value={userForm.nama}
                    onChange={(e) => setUserForm(prev => ({ ...prev, nama: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select 
                    value={userForm.role || activeSection}
                    onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                    disabled={activeSection !== 'semua'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSection === 'semua' ? (
                        roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={activeSection}>
                          {roles.find(r => r.value === activeSection)?.label || activeSection}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                {(userForm.role === 'siswa' || activeSection === 'siswa') && (
                  <>
                    <div className="space-y-2">
                      <Label>NISN *</Label>
                      <Input
                        value={userForm.nisn}
                        onChange={(e) => setUserForm(prev => ({ ...prev, nisn: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kelas *</Label>
                      <Select 
                        value={userForm.kelasId}
                        onValueChange={(value) => setUserForm(prev => ({ ...prev, kelasId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((kelas) => (
                            <SelectItem key={kelas.id} value={kelas.id}>
                              {kelas.namaKelas}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Jenis Kelamin *</Label>
                      <Select 
                        value={userForm.jenisKelamin}
                        onValueChange={(value) => setUserForm(prev => ({ ...prev, jenisKelamin: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tahun Masuk *</Label>
                      <Input
                        type="number"
                        value={userForm.tahunMasuk}
                        onChange={(e) => setUserForm(prev => ({ ...prev, tahunMasuk: e.target.value }))}
                        placeholder="2024"
                        required
                      />
                    </div>
                  </>
                )}
                {(userForm.role === 'guru' || userForm.role === 'walikelas' || activeSection === 'guru' || activeSection === 'walikelas') && (
                  <>
                    <div className="space-y-2">
                      <Label>NIP *</Label>
                      <Input
                        value={userForm.nip}
                        onChange={(e) => setUserForm(prev => ({ ...prev, nip: e.target.value }))}
                        required
                      />
                    </div>
                    {(userForm.role === 'walikelas' || activeSection === 'walikelas') && (
                      <div className="space-y-2">
                        <Label>Kelas *</Label>
                        <Select 
                          value={userForm.kelasId}
                          onValueChange={(value) => setUserForm(prev => ({ ...prev, kelasId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kelas" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes?.map((kelas) => (
                              <SelectItem key={kelas.id} value={kelas.id}>
                                {kelas.namaKelas}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Jenis Kelamin *</Label>
                      <Select 
                        value={userForm.jenisKelamin}
                        onValueChange={(value) => setUserForm(prev => ({ ...prev, jenisKelamin: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {/* Additional fields for students and teachers */}
                {(userForm.role === 'siswa' || userForm.role === 'guru' || userForm.role === 'walikelas' || 
                  activeSection === 'siswa' || activeSection === 'guru' || activeSection === 'walikelas') && (
                  <>
                    <div className="space-y-2">
                      <Label>Tanggal Lahir</Label>
                      <Input
                        type="date"
                        value={userForm.tanggalLahir}
                        onChange={(e) => setUserForm(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alamat</Label>
                      <Input
                        value={userForm.alamat}
                        onChange={(e) => setUserForm(prev => ({ ...prev, alamat: e.target.value }))}
                        placeholder="Alamat lengkap"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nomor HP</Label>
                      <Input
                        value={userForm.nomorHP}
                        onChange={(e) => setUserForm(prev => ({ ...prev, nomorHP: e.target.value }))}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                  </>
                )}
                
                {/* Additional fields for students only */}
                {(userForm.role === 'siswa' || activeSection === 'siswa') && (
                  <>
                    <div className="space-y-2">
                      <Label>Nama Orang Tua</Label>
                      <Input
                        value={userForm.namaOrangTua}
                        onChange={(e) => setUserForm(prev => ({ ...prev, namaOrangTua: e.target.value }))}
                        placeholder="Nama orang tua/wali"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pekerjaan Orang Tua</Label>
                      <Input
                        value={userForm.pekerjaanOrangTua}
                        onChange={(e) => setUserForm(prev => ({ ...prev, pekerjaanOrangTua: e.target.value }))}
                        placeholder="Pekerjaan orang tua/wali"
                      />
                    </div>
                  </>
                )}
                
                {(userForm.role === 'admin' || activeSection === 'admin') && (
                  <div className="space-y-2">
                    <Label>NIP</Label>
                    <Input
                      value={userForm.nip}
                      onChange={(e) => setUserForm(prev => ({ ...prev, nip: e.target.value }))}
                    />
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Update' : 'Tambah'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowUserDialog(false)}
                    className="flex-1"
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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama, username, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {activeSection === 'semua' && (
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
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
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Identitas</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nama}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {roles.find(r => r.value === user.role)?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === 'siswa' && user.nisn ? (
                        <div className="text-sm">
                          <div>NISN: {user.nisn}</div>
                        </div>
                      ) : user.nip ? (
                        <div className="text-sm">NIP: {user.nip}</div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data pengguna
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}