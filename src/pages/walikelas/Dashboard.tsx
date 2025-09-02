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
  Users,
  CheckCircle,
  Calendar,
  UserPlus,
  Edit,
  Trash2,
  Search,
  GraduationCap,
  BarChart3,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';
import { formatDate, getGradeColor, getAttendanceStatus } from '@/utils/helpers';
import { useIsMobile } from '@/hooks/use-mobile';

const WalikelasaDashboard = ({ currentUser }) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState({
    tahun: '2024/2025',
    semester: 1
  });
  
  const [studentForm, setStudentForm] = useState({
    nama: '',
    nisn: '',
    username: '',
    password: '',
    email: '',
    alamat: '',
    tanggalLahir: ''
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const academicPeriods = [
    { tahun: '2023/2024', semester: 1, label: '2023/2024 - Semester Ganjil' },
    { tahun: '2023/2024', semester: 2, label: '2023/2024 - Semester Genap' },
    { tahun: '2024/2025', semester: 1, label: '2024/2025 - Semester Ganjil (Aktif)' }
  ];

  useEffect(() => {
    if (currentUser) {
      loadWalikelasData();
    }
  }, [currentUser, selectedPeriod]);

  const loadWalikelasData = async () => {
    setLoading(true);
    try {
      // Load class students and their data
      const [studentsData, gradesData, attendanceData] = await Promise.all([
        apiService.getClassStudents(currentUser.id),
        apiService.getClassGrades(currentUser.id, selectedPeriod.tahun, selectedPeriod.semester),
        apiService.getClassAttendance(currentUser.id, selectedPeriod.tahun, selectedPeriod.semester)
      ]);

      setStudents(studentsData);
      setGrades(gradesData);
      setAttendance(attendanceData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data wali kelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentForm.nama || !studentForm.nisn || !studentForm.username) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive"
      });
      return;
    }

    try {
      const studentData = {
        ...studentForm,
        id: editingStudent ? editingStudent.id : Date.now().toString(),
        role: 'siswa',
        kelasId: currentUser.kelasId // Assuming walikelas has kelasId
      };

      let result;
      if (editingStudent) {
        result = await apiService.updateClassStudent(currentUser.id, studentData.id, studentData);
      } else {
        result = await apiService.addClassStudent(currentUser.id, studentData);
      }
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Siswa berhasil ${editingStudent ? 'diupdate' : 'ditambahkan'}`
        });
        
        resetStudentForm();
        loadWalikelasData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal ${editingStudent ? 'mengupdate' : 'menambahkan'} siswa`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      try {
        const result = await apiService.deleteClassStudent(currentUser.id, studentId);
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Siswa berhasil dihapus"
          });
          loadWalikelasData();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus siswa",
          variant: "destructive"
        });
      }
    }
  };

  const handleVerifyGrade = async (gradeId) => {
    try {
      const result = await apiService.verifyGrade(currentUser.id, gradeId);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Nilai berhasil diverifikasi"
        });
        loadWalikelasData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memverifikasi nilai",
        variant: "destructive"
      });
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      nama: '',
      nisn: '',
      username: '',
      password: '',
      email: '',
      alamat: '',
      tanggalLahir: ''
    });
    setEditingStudent(null);
    setShowStudentDialog(false);
  };

  const editStudent = (student) => {
    setStudentForm(student);
    setEditingStudent(student);
    setShowStudentDialog(true);
  };

  const filteredStudents = students.filter(student =>
    student.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nisn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unverifiedGrades = grades.filter(grade => !grade.verified);
  const totalAttendance = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'hadir').length;
  const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg">
              <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Dashboard Wali Kelas</h1>
              <p className="opacity-90 text-sm md:text-base">Selamat datang, {currentUser?.nama}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Period Selector */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h3 className="font-semibold text-foreground">Filter Periode Akademik</h3>
                <p className="text-sm text-muted-foreground">
                  Pilih tahun ajaran dan semester yang ingin dilihat
                </p>
              </div>
              <Select 
                value={`${selectedPeriod.tahun}-${selectedPeriod.semester}`}
                onValueChange={(value) => {
                  const [tahun, semester] = value.split('-');
                  setSelectedPeriod({ tahun, semester: parseInt(semester) });
                }}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {academicPeriods.map((period) => (
                    <SelectItem 
                      key={`${period.tahun}-${period.semester}`}
                      value={`${period.tahun}-${period.semester}`}
                    >
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{students.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Siswa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-warning/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 md:h-8 md:w-8 text-warning" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{unverifiedGrades.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Nilai Belum Verifikasi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-success/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 md:h-8 md:w-8 text-success" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{attendancePercentage}%</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Kehadiran Rata-rata</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-accent/10 rounded-lg">
                  <Calendar className="h-5 w-5 md:h-8 md:w-8 text-accent" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{grades.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Nilai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Siswa</span>
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Verifikasi Nilai</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Kehadiran</span>
            </TabsTrigger>
            {!isMobile && (
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Laporan</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Students Management Tab */}
          <TabsContent value="students">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <CardTitle>Manajemen Siswa Kelas</CardTitle>
                  <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-primary text-primary-foreground w-full md:w-auto"
                        onClick={() => setEditingStudent(null)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Tambah Siswa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4 md:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleStudentSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nama Lengkap</Label>
                            <Input
                              value={studentForm.nama}
                              onChange={(e) => setStudentForm(prev => ({ ...prev, nama: e.target.value }))}
                              placeholder="Nama Lengkap"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>NISN</Label>
                            <Input
                              value={studentForm.nisn}
                              onChange={(e) => setStudentForm(prev => ({ ...prev, nisn: e.target.value }))}
                              placeholder="Nomor NISN"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                              value={studentForm.username}
                              onChange={(e) => setStudentForm(prev => ({ ...prev, username: e.target.value }))}
                              placeholder="Username"
                              required
                            />
                          </div>
                          
                          {!editingStudent && (
                            <div className="space-y-2">
                              <Label>Password</Label>
                              <Input
                                type="password"
                                value={studentForm.password}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Password"
                                required={!editingStudent}
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={studentForm.email}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@example.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tanggal Lahir</Label>
                          <Input
                            type="date"
                            value={studentForm.tanggalLahir}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Alamat</Label>
                          <Input
                            value={studentForm.alamat}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, alamat: e.target.value }))}
                            placeholder="Alamat lengkap"
                          />
                        </div>

                        <div className="flex flex-col md:flex-row gap-2">
                          <Button type="submit" className="flex-1">
                            {editingStudent ? 'Update' : 'Simpan'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={resetStudentForm}
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
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>NISN</TableHead>
                        {!isMobile && <TableHead>Username</TableHead>}
                        {!isMobile && <TableHead>Email</TableHead>}
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.nama}</TableCell>
                          <TableCell>{student.nisn}</TableCell>
                          {!isMobile && <TableCell className="text-muted-foreground">{student.username}</TableCell>}
                          {!isMobile && <TableCell className="text-muted-foreground">{student.email || '-'}</TableCell>}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => editStudent(student)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteStudent(student.id)}
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

          {/* Grade Verification Tab */}
          <TabsContent value="grades">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Verifikasi Nilai Siswa</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Memuat data nilai...</p>
                  </div>
                ) : unverifiedGrades.length > 0 ? (
                  <div className="space-y-4">
                    {unverifiedGrades.map((grade) => (
                      <div 
                        key={grade.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-4 md:space-y-0"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {students.find(s => s.id === grade.studentId)?.nama || 'Siswa'}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Mata Pelajaran {grade.subjectId}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {grade.jenis}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(grade.tanggal)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`text-xl font-bold ${getGradeColor(grade.nilai)}`}>
                              {grade.nilai}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleVerifyGrade(grade.id)}
                            className="bg-success text-success-foreground"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verifikasi
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Semua nilai sudah diverifikasi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Kehadiran Kelas</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length > 0 ? (
                  <div className="space-y-4">
                    {attendance.map((record) => {
                      const status = getAttendanceStatus(record.status);
                      const student = students.find(s => s.id === record.studentId);
                      return (
                        <div 
                          key={record.id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-2 md:space-y-0"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {student?.nama || 'Siswa'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Mata Pelajaran {record.subjectId}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(record.tanggal)}
                              </span>
                            </div>
                            {record.keterangan && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {record.keterangan}
                              </p>
                            )}
                          </div>
                          <Badge className={`${status.bgColor} ${status.color}`}>
                            {status.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Belum ada data kehadiran</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Laporan Kelas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Fitur laporan akan segera hadir</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalikelasaDashboard;