import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Calendar,
  Plus,
  Check,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';
import { formatDate, getGradeColor } from '@/utils/helpers';

const TeacherDashboard = ({ currentUser }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    subjectId: '',
    jenis: '',
    nilai: '',
    tanggal: new Date().toISOString().split('T')[0]
  });
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    subjectId: '',
    status: '',
    keterangan: '',
    tanggal: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const gradeTypes = ['Ulangan Harian', 'UTS', 'UAS', 'Kuis', 'Tugas'];
  const attendanceStatuses = [
    { value: 'hadir', label: 'Hadir' },
    { value: 'sakit', label: 'Sakit' },
    { value: 'alfa', label: 'Alfa' },
    { value: 'izin', label: 'Izin' }
  ];

  useEffect(() => {
    if (currentUser) {
      loadTeacherData();
    }
  }, [currentUser]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const subjectsData = await apiService.getTeacherSubjects(currentUser.id);
      setSubjects(subjectsData);
      
      // TODO: Load students based on teacher's classes
      // For now, using sample data
      setStudents([
        { id: '2', nama: 'Ahmad Fadli', nisn: '2024001', kelasId: '1' },
        { id: '7', nama: 'Siti Aminah', nisn: '2024002', kelasId: '1' }
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data guru",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    
    if (!gradeForm.studentId || !gradeForm.subjectId || !gradeForm.nilai) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive"
      });
      return;
    }

    const nilaiNumber = Number(gradeForm.nilai);
    if (isNaN(nilaiNumber) || nilaiNumber < 0 || nilaiNumber > 100) {
      toast({
        title: "Error",
        description: "Nilai harus antara 0-100",
        variant: "destructive"
      });
      return;
    }

    try {
      const gradeData = {
        ...gradeForm,
        teacherId: currentUser.id,
        kelasId: students.find(s => s.id === gradeForm.studentId)?.kelasId,
        tahunAjaran: '2024/2025',
        semester: 1,
        nilai: nilaiNumber
      };

      const result = await apiService.addGrade(currentUser.id, gradeData);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Nilai berhasil ditambahkan"
        });
        
        setShowGradeDialog(false);
        setGradeForm({
          studentId: '',
          subjectId: '',
          jenis: '',
          nilai: '',
          tanggal: new Date().toISOString().split('T')[0]
        });
        
        // Refresh grades data
        loadTeacherData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan nilai",
        variant: "destructive"
      });
    }
  };

  const handleAddAttendance = async (e) => {
    e.preventDefault();
    
    if (!attendanceForm.studentId || !attendanceForm.subjectId || !attendanceForm.status) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive"
      });
      return;
    }

    try {
      const attendanceData = {
        ...attendanceForm,
        teacherId: currentUser.id,
        kelasId: students.find(s => s.id === attendanceForm.studentId)?.kelasId,
        tahunAjaran: '2024/2025',
        semester: 1
      };

      const result = await apiService.addAttendance(currentUser.id, attendanceData);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Kehadiran berhasil dicatat"
        });
        
        setShowAttendanceDialog(false);
        setAttendanceForm({
          studentId: '',
          subjectId: '',
          status: '',
          keterangan: '',
          tanggal: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mencatat kehadiran",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-accent text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Dashboard {currentUser?.role === 'walikelas' ? 'Wali Kelas' : 'Guru'}
              </h1>
              <p className="opacity-90">Selamat datang, {currentUser?.nama}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Input Nilai
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Nilai Siswa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div className="space-y-2">
                  <Label>Siswa</Label>
                  <Select 
                    value={gradeForm.studentId}
                    onValueChange={(value) => setGradeForm(prev => ({ ...prev, studentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.nama} ({student.nisn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select 
                    value={gradeForm.subjectId}
                    onValueChange={(value) => setGradeForm(prev => ({ ...prev, subjectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          Mata Pelajaran {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jenis Penilaian</Label>
                    <Select 
                      value={gradeForm.jenis}
                      onValueChange={(value) => setGradeForm(prev => ({ ...prev, jenis: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nilai (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={gradeForm.nilai}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, nilai: e.target.value }))}
                      placeholder="Masukkan nilai"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={gradeForm.tanggal}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, tanggal: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Simpan Nilai
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Input Kehadiran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Kehadiran Siswa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAttendance} className="space-y-4">
                <div className="space-y-2">
                  <Label>Siswa</Label>
                  <Select 
                    value={attendanceForm.studentId}
                    onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, studentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.nama} ({student.nisn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select 
                    value={attendanceForm.subjectId}
                    onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, subjectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          Mata Pelajaran {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status Kehadiran</Label>
                    <Select 
                      value={attendanceForm.status}
                      onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        {attendanceStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={attendanceForm.tanggal}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, tanggal: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Keterangan (Opsional)</Label>
                  <Input
                    type="text"
                    value={attendanceForm.keterangan}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, keterangan: e.target.value }))}
                    placeholder="Masukkan keterangan jika diperlukan"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Simpan Kehadiran
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
                  <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Siswa Diajar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <FileText className="h-8 w-8 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{grades.length}</p>
                  <p className="text-sm text-muted-foreground">Nilai Input</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="matapelajaran" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matapelajaran" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Mata Pelajaran</span>
            </TabsTrigger>
            <TabsTrigger value="siswa" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Daftar Siswa</span>
            </TabsTrigger>
          </TabsList>

          {/* Mata Pelajaran Tab */}
          <TabsContent value="matapelajaran">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Mata Pelajaran yang Diajar</CardTitle>
              </CardHeader>
              <CardContent>
                {subjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subjects.map((subject) => (
                      <div key={subject} className="p-6 border border-border rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <BookOpen className="h-6 w-6 text-accent" />
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Mata Pelajaran {subject}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Tahun Ajaran 2024/2025
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Siswa:</span>
                            <Badge variant="outline">{students.length} siswa</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge className="bg-success text-success-foreground">
                              <Check className="h-3 w-3 mr-1" />
                              Aktif
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Belum ada mata pelajaran yang diajar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Siswa Tab */}
          <TabsContent value="siswa">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Daftar Siswa</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div 
                        key={student.id}
                        className="flex justify-between items-center p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{student.nama}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>NISN: {student.nisn}</span>
                              <span>Kelas: {student.kelasId}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setGradeForm(prev => ({ ...prev, studentId: student.id }));
                              setShowGradeDialog(true);
                            }}
                          >
                            Input Nilai
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setAttendanceForm(prev => ({ ...prev, studentId: student.id }));
                              setShowAttendanceDialog(true);
                            }}
                          >
                            Input Kehadiran
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Belum ada data siswa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;