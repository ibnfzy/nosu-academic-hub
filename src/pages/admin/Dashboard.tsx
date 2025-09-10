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
import { Textarea } from '@/components/ui/textarea';
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
  Building2,
  Trophy,
  GraduationCap as Programs,
  Link,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminDashboard = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('siswa');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [showSchoolProfileDialog, setShowSchoolProfileDialog] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // School management data
  const [schoolProfile, setSchoolProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [registrationLinks, setRegistrationLinks] = useState([]);
  
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
  
  // School management forms
  const [schoolProfileForm, setSchoolProfileForm] = useState({
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
    website: '',
    kepalaSekolah: '',
    tahunBerdiri: '',
    akreditasi: '',
    visi: '',
    misi: ''
  });
  
  const [achievementForm, setAchievementForm] = useState({
    judul: '',
    tingkat: '',
    tahun: '',
    bidang: ''
  });
  
  const [programForm, setProgramForm] = useState({
    nama: '',
    deskripsi: '',
    mataPelajaran: '',
    prospek: ''
  });
  
  const [registrationForm, setRegistrationForm] = useState({
    judul: '',
    deskripsi: '',
    link: '',
    tahunAjaran: '',
    batasPendaftaran: ''
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
      const [
        usersData, 
        subjectsData, 
        classesData, 
        schoolProfileData, 
        achievementsData, 
        programsData,
        registrationLinksData
      ] = await Promise.all([
        apiService.getUsers(),
        apiService.getSubjects(),
        apiService.getClasses(),
        apiService.getSchoolProfile(),
        apiService.getAchievements(),
        apiService.getPrograms(),
        apiService.getRegistrationLinks()
      ]);
      
      setUsers(usersData);
      setSubjects(subjectsData);
      setClasses(classesData);
      setSchoolProfile(schoolProfileData);
      setAchievements(achievementsData);
      setPrograms(programsData);
      setRegistrationLinks(registrationLinksData);
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
  };

  const editUser = (user) => {
    setUserForm(user);
    setEditingItem(user);
    setShowUserDialog(true);
  };

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
        setShowSubjectDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan mata pelajaran",
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

  const resetSubjectForm = () => {
    setSubjectForm({
      nama: '',
      kode: '',
      kelasId: ''
    });
    setEditingItem(null);
  };

  const editSubject = (subject) => {
    setSubjectForm(subject);
    setEditingItem(subject);
    setShowSubjectDialog(true);
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
        setShowClassDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan kelas",
        variant: "destructive"
      });
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

  // School profile handlers
  const handleSchoolProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!schoolProfileForm.nama) {
      toast({
        title: "Error",
        description: "Nama sekolah wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await apiService.updateSchoolProfile(schoolProfileForm);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Profil sekolah berhasil diperbarui"
        });
        
        resetSchoolProfileForm();
        loadAdminData();
        setShowSchoolProfileDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan profil sekolah",
        variant: "destructive"
      });
    }
  };

  const handleAchievementSubmit = async (e) => {
    e.preventDefault();
    
    if (!achievementForm.judul || !achievementForm.tahun) {
      toast({
        title: "Error",
        description: "Judul dan tahun prestasi wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await apiService.addAchievement(achievementForm);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Prestasi berhasil ditambahkan"
        });
        
        resetAchievementForm();
        loadAdminData();
        setShowAchievementDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan prestasi",
        variant: "destructive"
      });
    }
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    
    if (!programForm.nama || !programForm.deskripsi) {
      toast({
        title: "Error",
        description: "Nama dan deskripsi program wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const programData = {
        ...programForm,
        mataPelajaran: programForm.mataPelajaran.split(',').map(mp => mp.trim())
      };
      const result = await apiService.addProgram(programData);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Program studi berhasil ditambahkan"
        });
        
        resetProgramForm();
        loadAdminData();
        setShowProgramDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan program studi",
        variant: "destructive"
      });
    }
  };

  const resetClassForm = () => {
    setClassForm({
      nama: '',
      tingkat: '',
      walikelas: ''
    });
    setEditingItem(null);
  };

  const resetSchoolProfileForm = () => {
    setSchoolProfileForm({
      nama: '',
      alamat: '',
      telepon: '',
      email: '',
      website: '',
      kepalaSekolah: '',
      tahunBerdiri: '',
      akreditasi: '',
      visi: '',
      misi: ''
    });
  };

  const resetAchievementForm = () => {
    setAchievementForm({
      judul: '',
      tingkat: '',
      tahun: '',
      bidang: ''
    });
  };

  const resetProgramForm = () => {
    setProgramForm({
      nama: '',
      deskripsi: '',
      mataPelajaran: '',
      prospek: ''
    });
  };

  const editSchoolProfile = () => {
    if (schoolProfile) {
      setSchoolProfileForm({
        nama: schoolProfile.nama || '',
        alamat: schoolProfile.alamat || '',
        telepon: schoolProfile.telepon || '',
        email: schoolProfile.email || '',
        website: schoolProfile.website || '',
        kepalaSekolah: schoolProfile.kepalaSekolah || '',
        tahunBerdiri: schoolProfile.tahunBerdiri || '',
        akreditasi: schoolProfile.akreditasi || '',
        visi: schoolProfile.visi || '',
        misi: schoolProfile.misi || ''
      });
    }
    setShowSchoolProfileDialog(true);
  };

  const editAchievement = (achievement) => {
    setAchievementForm({
      judul: achievement.judul || '',
      tingkat: achievement.tingkat || '',
      tahun: achievement.tahun || '',
      bidang: achievement.bidang || ''
    });
    setEditingItem(achievement);
    setShowAchievementDialog(true);
  };

  const deleteAchievement = async (achievementId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus prestasi ini?')) {
      try {
        // Note: Add delete method in apiService if needed
        const updatedAchievements = achievements.filter(a => a.id !== achievementId);
        setAchievements(updatedAchievements);
        toast({
          title: "Berhasil",
          description: "Prestasi berhasil dihapus"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus prestasi",
          variant: "destructive"
        });
      }
    }
  };

  const editProgram = (program) => {
    setProgramForm({
      nama: program.nama || '',
      deskripsi: program.deskripsi || '',
      mataPelajaran: Array.isArray(program.mataPelajaran) ? program.mataPelajaran.join(', ') : program.mataPelajaran || '',
      prospek: program.prospek || ''
    });
    setEditingItem(program);
    setShowProgramDialog(true);
  };

  const deleteProgram = async (programId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      try {
        // Note: Add delete method in apiService if needed
        const updatedPrograms = programs.filter(p => p.id !== programId);
        setPrograms(updatedPrograms);
        toast({
          title: "Berhasil",
          description: "Program berhasil dihapus"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus program",
          variant: "destructive"
        });
      }
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    
    if (!registrationForm.judul || !registrationForm.link) {
      toast({
        title: "Error",
        description: "Judul dan link pendaftaran wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      let result;
      
      if (editingItem) {
        // Update existing registration link
        result = await apiService.updateRegistrationLink(editingItem.id, registrationForm);
      } else {
        // Add new registration link
        result = await apiService.addRegistrationLink(registrationForm);
      }
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Link pendaftaran berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}`
        });
        
        resetRegistrationForm();
        setEditingItem(null);
        loadAdminData();
        setShowRegistrationDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan link pendaftaran",
        variant: "destructive"
      });
    }
  };

  const resetRegistrationForm = () => {
    setRegistrationForm({
      judul: '',
      deskripsi: '',
      link: '',
      tahunAjaran: '',
      batasPendaftaran: ''
    });
    setEditingItem(null);
  };

  const editRegistrationLink = (registration) => {
    setRegistrationForm({
      judul: registration.judul || '',
      deskripsi: registration.deskripsi || '',
      link: registration.link || '',
      tahunAjaran: registration.tahunAjaran || '',
      batasPendaftaran: registration.batasPendaftaran || ''
    });
    setEditingItem(registration);
    setShowRegistrationDialog(true);
  };

  const deleteRegistrationLink = async (registrationId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus link pendaftaran ini?')) {
      try {
        // Note: Add delete method in apiService if needed
        const updatedRegistrations = registrationLinks.filter(r => r.id !== registrationId);
        setRegistrationLinks(updatedRegistrations);
        toast({
          title: "Berhasil",
          description: "Link pendaftaran berhasil dihapus"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus link pendaftaran",
          variant: "destructive"
        });
      }
    }
  };

  const editClass = (classItem) => {
    setClassForm(classItem);
    setEditingItem(classItem);
    setShowClassDialog(true);
  };

  const getCurrentRoleUsers = () => {
    let filteredUsers = users.filter(user => {
      if (activeSection === 'admin' || activeSection === 'siswa' || activeSection === 'guru' || activeSection === 'walikelas') {
        return user.role === activeSection;
      }
      return true;
    });
    
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredUsers;
  };

  const waliKelasList = users.filter(user => user.role === 'walikelas' || user.role === 'guru');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AdminNavbar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
      />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-elegant bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-primary">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mata Pelajaran</p>
                    <p className="text-2xl font-bold text-success">{subjects.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Kelas</p>
                    <p className="text-2xl font-bold text-accent">{classes.length}</p>
                  </div>
                  <School className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admin</p>
                    <p className="text-2xl font-bold text-warning">{users.filter(u => u.role === 'admin').length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}

          {(activeSection === 'siswa' || activeSection === 'guru' || activeSection === 'walikelas' || activeSection === 'admin') && (
            <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <span>Manajemen {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Kelola data {activeSection}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari pengguna..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64"
                      />
                    </div>
                    
                    <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-primary text-primary-foreground w-full md:w-auto"
                          onClick={() => setEditingItem(null)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-4 md:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>
                            {editingItem ? 'Edit User' : `Tambah ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Baru`}
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
                            <div className="space-y-2">
                              <Label>Nama Lengkap</Label>
                              <Input
                                value={userForm.nama}
                                onChange={(e) => setUserForm(prev => ({ ...prev, nama: e.target.value }))}
                                placeholder="Nama lengkap"
                                required
                              />
                            </div>
                          </div>

                          {!editingItem && (
                            <div className="space-y-2">
                              <Label>Password</Label>
                              <Input
                                type="password"
                                value={userForm.password}
                                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Password"
                                required
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select 
                              value={userForm.role || activeSection}
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

                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Email"
                            />
                          </div>

                          {(userForm.role === 'siswa' || activeSection === 'siswa') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>NIS</Label>
                                <Input
                                  value={userForm.nis}
                                  onChange={(e) => setUserForm(prev => ({ ...prev, nis: e.target.value }))}
                                  placeholder="NIS"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>NISN</Label>
                                <Input
                                  value={userForm.nisn}
                                  onChange={(e) => setUserForm(prev => ({ ...prev, nisn: e.target.value }))}
                                  placeholder="NISN"
                                />
                              </div>
                            </div>
                          )}

                          {((userForm.role === 'guru' || userForm.role === 'walikelas') || 
                            (activeSection === 'guru' || activeSection === 'walikelas')) && (
                            <div className="space-y-2">
                              <Label>NIP</Label>
                              <Input
                                value={userForm.nip}
                                onChange={(e) => setUserForm(prev => ({ ...prev, nip: e.target.value }))}
                                placeholder="NIP"
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Username</TableHead>
                        {!isMobile && <TableHead>Email</TableHead>}
                        {!isMobile && <TableHead>Role</TableHead>}
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentRoleUsers().map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nama}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.username}</Badge>
                          </TableCell>
                          {!isMobile && (
                            <TableCell className="text-muted-foreground">{user.email || '-'}</TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              <Badge variant="secondary">{user.role}</Badge>
                            </TableCell>
                          )}
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
            <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-success/10">
              <CardHeader className="bg-gradient-to-r from-success/5 to-success/10 border-b border-success/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-success" />
                      <span>Manajemen Mata Pelajaran</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Kelola mata pelajaran sekolah</p>
                  </div>
                  <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-success text-white w-full md:w-auto"
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
                              <SelectValue placeholder="Pilih kelas atau semua kelas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Kelas</SelectItem>
                              {classes.map((classItem) => (
                                <SelectItem key={classItem.id} value={classItem.id}>
                                  {classItem.nama}
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
                        <TableHead>Mata Pelajaran</TableHead>
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

          {/* School Profile Management */}
          {activeSection === 'school-profile' && (
            <div className="space-y-6">
              {/* School Profile Info Card */}
              <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-primary/10">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span>Profil Sekolah</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Informasi dasar sekolah</p>
                    </div>
                    <Dialog open={showSchoolProfileDialog} onOpenChange={setShowSchoolProfileDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-primary text-primary-foreground w-full md:w-auto"
                          onClick={editSchoolProfile}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Edit Profil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl mx-4">
                        <DialogHeader>
                          <DialogTitle>Edit Profil Sekolah</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSchoolProfileSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nama Sekolah</Label>
                              <Input
                                value={schoolProfileForm.nama}
                                onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, nama: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Kepala Sekolah</Label>
                              <Input
                                value={schoolProfileForm.kepalaSekolah}
                                onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, kepalaSekolah: e.target.value }))}
                                placeholder="Nama kepala sekolah"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Alamat</Label>
                            <Input
                              value={schoolProfileForm.alamat}
                              onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, alamat: e.target.value }))}
                              placeholder="Alamat lengkap sekolah"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Telepon</Label>
                              <Input
                                value={schoolProfileForm.telepon}
                                onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, telepon: e.target.value }))}
                                placeholder="Nomor telepon"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={schoolProfileForm.email}
                                onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Email sekolah"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Website</Label>
                            <Input
                              value={schoolProfileForm.website}
                              onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://website-sekolah.com"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tahun Berdiri</Label>
                              <Input
                                value={schoolProfileForm.tahunBerdiri}
                                onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, tahunBerdiri: e.target.value }))}
                                placeholder="Tahun berdiri sekolah"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Akreditasi</Label>
                              <Input
                                value={schoolProfileForm.akreditasi}
                                onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, akreditasi: e.target.value }))}
                                placeholder="Status akreditasi (A/B/C)"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Visi</Label>
                            <Textarea
                              rows={3}
                              value={schoolProfileForm.visi}
                              onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, visi: e.target.value }))}
                              placeholder="Visi sekolah"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Misi</Label>
                            <Textarea
                              rows={4}
                              value={schoolProfileForm.misi}
                              onChange={(e) => setSchoolProfileForm(prev => ({ ...prev, misi: e.target.value }))}
                              placeholder="Misi sekolah"
                            />
                          </div>
                          <div className="flex flex-col md:flex-row gap-2">
                            <Button type="submit" className="flex-1">
                              Simpan Profil
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setShowSchoolProfileDialog(false)}
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
                  {schoolProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Nama Sekolah</h4>
                          <p className="font-medium">{schoolProfile.nama}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Kepala Sekolah</h4>
                          <p>{schoolProfile.kepalaSekolah}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Alamat</h4>
                          <p>{schoolProfile.alamat}</p>
                        </div>
                        {schoolProfile.tahunBerdiri && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Tahun Berdiri</h4>
                            <p>{schoolProfile.tahunBerdiri}</p>
                          </div>
                        )}
                        {schoolProfile.akreditasi && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Akreditasi</h4>
                            <p>Akreditasi {schoolProfile.akreditasi}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Kontak</h4>
                          <p>Telepon: {schoolProfile.telepon}</p>
                          <p>Email: {schoolProfile.email}</p>
                        </div>
                        {schoolProfile.website && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Website</h4>
                            <p>{schoolProfile.website}</p>
                          </div>
                        )}
                        {schoolProfile.visi && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Visi</h4>
                            <p className="text-sm">{schoolProfile.visi}</p>
                          </div>
                        )}
                        {schoolProfile.misi && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Misi</h4>
                            <p className="text-sm">{schoolProfile.misi}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Belum ada profil sekolah. Klik "Edit Profil" untuk menambahkan.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievements Management */}
              <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-success/10">
                <CardHeader className="bg-gradient-to-r from-success/5 to-success/10 border-b border-success/10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Trophy className="h-5 w-5 text-success" />
                        <span>Prestasi Terbaru</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Kelola prestasi sekolah</p>
                    </div>
                    <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-success text-white w-full md:w-auto"
                          onClick={() => setEditingItem(null)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Prestasi
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-4 md:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>
                            {editingItem ? 'Edit Prestasi' : 'Tambah Prestasi Baru'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAchievementSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Judul Prestasi</Label>
                            <Input
                              value={achievementForm.judul}
                              onChange={(e) => setAchievementForm(prev => ({ ...prev, judul: e.target.value }))}
                              placeholder="Nama prestasi"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tingkat</Label>
                            <Select 
                              value={achievementForm.tingkat}
                              onValueChange={(value) => setAchievementForm(prev => ({ ...prev, tingkat: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tingkat" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kecamatan">Kecamatan</SelectItem>
                                <SelectItem value="kabupaten">Kabupaten</SelectItem>
                                <SelectItem value="provinsi">Provinsi</SelectItem>
                                <SelectItem value="nasional">Nasional</SelectItem>
                                <SelectItem value="internasional">Internasional</SelectItem>
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
                              onClick={() => setShowAchievementDialog(false)}
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
                  <div className="space-y-4">
                    {achievements.length > 0 ? achievements.map((achievement) => (
                      <div key={achievement.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{achievement.judul}</h4>
                              <Badge variant="secondary">{achievement.tingkat}</Badge>
                              <Badge variant="outline">{achievement.bidang}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{achievement.tahun}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => editAchievement(achievement)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteAchievement(achievement.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Belum ada prestasi yang ditambahkan</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Programs Management */}
              <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-accent/10">
                <CardHeader className="bg-gradient-to-r from-accent/5 to-accent/10 border-b border-accent/10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Programs className="h-5 w-5 text-accent" />
                        <span>Program Studi</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Kelola program dan jurusan</p>
                    </div>
                    <Dialog open={showProgramDialog} onOpenChange={setShowProgramDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-accent text-white w-full md:w-auto"
                          onClick={() => setEditingItem(null)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Program
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-4 md:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>
                            {editingItem ? 'Edit Program' : 'Tambah Program Baru'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleProgramSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Nama Program</Label>
                            <Input
                              value={programForm.nama}
                              onChange={(e) => setProgramForm(prev => ({ ...prev, nama: e.target.value }))}
                              placeholder="Contoh: IPA, IPS, Bahasa"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Textarea
                              rows={3}
                              value={programForm.deskripsi}
                              onChange={(e) => setProgramForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                              placeholder="Deskripsi program studi"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mata Pelajaran</Label>
                            <Input
                              value={programForm.mataPelajaran}
                              onChange={(e) => setProgramForm(prev => ({ ...prev, mataPelajaran: e.target.value }))}
                              placeholder="Pisahkan dengan koma, contoh: Matematika, Fisika, Kimia"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Prospek Karir</Label>
                            <Textarea
                              rows={3}
                              value={programForm.prospek}
                              onChange={(e) => setProgramForm(prev => ({ ...prev, prospek: e.target.value }))}
                              placeholder="Contoh: Kedokteran, Teknik, Farmasi"
                            />
                          </div>
                          <div className="flex flex-col md:flex-row gap-2">
                            <Button type="submit" className="flex-1">
                              {editingItem ? 'Update' : 'Simpan'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setShowProgramDialog(false)}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.length > 0 ? programs.map((program) => (
                      <div key={program.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <h4 className="font-semibold">{program.nama}</h4>
                            <p className="text-sm text-muted-foreground">{program.deskripsi}</p>
                            {program.mataPelajaran && (
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(program.mataPelajaran) ? program.mataPelajaran : program.mataPelajaran.split(',')).map((subject, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {subject.trim()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {program.prospek && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Prospek:</span> {program.prospek}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => editProgram(program)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteProgram(program.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-muted-foreground">Belum ada program studi yang ditambahkan</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Registration Links Management */}
              <Card className="shadow-elegant bg-gradient-to-br from-background to-muted/20 border-primary/10">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Link className="h-5 w-5 text-primary" />
                        <span>Link Pendaftaran</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Kelola link pendaftaran siswa baru</p>
                    </div>
                    <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-primary text-primary-foreground w-full md:w-auto"
                          onClick={() => {
                            setEditingItem(null);
                            resetRegistrationForm();
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Link
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-4 md:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>
                            {editingItem ? 'Edit Link Pendaftaran' : 'Tambah Link Pendaftaran'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Judul Pendaftaran</Label>
                            <Input
                              value={registrationForm.judul}
                              onChange={(e) => setRegistrationForm(prev => ({ ...prev, judul: e.target.value }))}
                              placeholder="Contoh: Pendaftaran Siswa Baru 2025"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Textarea
                              rows={3}
                              value={registrationForm.deskripsi}
                              onChange={(e) => setRegistrationForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                              placeholder="Deskripsi pendaftaran"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link Pendaftaran</Label>
                            <Input
                              value={registrationForm.link}
                              onChange={(e) => setRegistrationForm(prev => ({ ...prev, link: e.target.value }))}
                              placeholder="https://forms.google.com/..."
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tahun Ajaran</Label>
                              <Input
                                value={registrationForm.tahunAjaran}
                                onChange={(e) => setRegistrationForm(prev => ({ ...prev, tahunAjaran: e.target.value }))}
                                placeholder="2024/2025"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Batas Pendaftaran</Label>
                              <Input
                                type="date"
                                value={registrationForm.batasPendaftaran}
                                onChange={(e) => setRegistrationForm(prev => ({ ...prev, batasPendaftaran: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-2">
                            <Button type="submit" className="flex-1">
                              {editingItem ? 'Update' : 'Simpan'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setShowRegistrationDialog(false)}
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
                  <div className="space-y-4">
                    {registrationLinks.length > 0 ? registrationLinks.map((registration) => (
                      <div key={registration.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{registration.judul}</h4>
                              <Badge variant={registration.status === 'Aktif' ? 'default' : 'secondary'}>
                                {registration.status}
                              </Badge>
                            </div>
                            {registration.deskripsi && (
                              <p className="text-sm text-muted-foreground">{registration.deskripsi}</p>
                            )}
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Tahun Ajaran: {registration.tahunAjaran}</p>
                              <p>Batas Pendaftaran: {new Date(registration.batasPendaftaran).toLocaleDateString('id-ID')}</p>
                              <p className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <a href={registration.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  Buka Form Pendaftaran
                                </a>
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => editRegistrationLink(registration)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteRegistrationLink(registration.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Belum ada link pendaftaran yang ditambahkan</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
