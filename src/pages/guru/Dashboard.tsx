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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Clock,
  LogOut,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';
import { formatDate, getGradeColor } from '@/utils/helpers';

const TeacherDashboard = ({ currentUser, onLogout }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showStudentListDialog, setShowStudentListDialog] = useState(false);
  const [showGradeTableDialog, setShowGradeTableDialog] = useState(false);
  const [showAttendanceTableDialog, setShowAttendanceTableDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSubjectForGrades, setSelectedSubjectForGrades] = useState('');
  const [selectedSubjectForAttendance, setSelectedSubjectForAttendance] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);
  
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

  useEffect(() => {
    if (students.length > 0 && subjects.length > 0) {
      loadGradesData();
      loadAttendanceData();
    }
  }, [students, subjects]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const subjectsData = await apiService.getTeacherSubjects(currentUser.id);
      const allSubjects = await apiService.getSubjects();
      
      const subjectIds = Array.isArray(subjectsData)
        ? subjectsData.map((s) => (typeof s === 'object' && s !== null ? s.subjectId : s)).filter(Boolean)
        : [];
      setSubjects(subjectIds);
      
      const allUsers = await apiService.getUsers();
      const studentsData = allUsers.filter(user => user.role === 'siswa');
      setStudents(studentsData);

      await loadGradesData();
      await loadAttendanceData();
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

  const loadGradesData = async () => {
    try {
      const allGrades = JSON.parse(localStorage.getItem('akademik_grades') || '[]');
      const teacherGrades = allGrades.filter(grade => 
        grade.teacherId === currentUser.id && subjects.includes(grade.subjectId)
      );

      const gradesWithNames = teacherGrades.map(grade => {
        const student = students.find(s => s.id === grade.studentId);
        return {
          ...grade,
          studentName: student?.nama || 'Unknown Student'
        };
      });

      setGrades(gradesWithNames);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const allAttendance = JSON.parse(localStorage.getItem('akademik_attendance') || '[]');
      const teacherAttendance = allAttendance.filter(att => 
        att.teacherId === currentUser.id && subjects.includes(att.subjectId)
      );

      const attendanceWithNames = teacherAttendance.map(att => {
        const student = students.find(s => s.id === att.studentId);
        return {
          ...att,
          studentName: student?.nama || 'Unknown Student'
        };
      });

      setAttendance(attendanceWithNames);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    
    if (!gradeForm.studentId || !gradeForm.subjectId || !gradeForm.nilai || !gradeForm.jenis) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field wajib",
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

    // Cek duplikasi UTS/UAS untuk mata pelajaran yang sama
    if ((gradeForm.jenis === 'UTS' || gradeForm.jenis === 'UAS') && !editingGrade) {
      const existingGrade = grades.find(g => 
        g.studentId === gradeForm.studentId && 
        g.subjectId === gradeForm.subjectId && 
        g.jenis === gradeForm.jenis
      );
      
      if (existingGrade) {
        toast({
          title: "Error",
          description: `${gradeForm.jenis} untuk mata pelajaran ini sudah ada. Gunakan edit untuk mengubah nilai.`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const studentData = students.find(s => s.id === gradeForm.studentId);
      const gradeData = {
        id: editingGrade ? editingGrade.id : Date.now().toString(),
        ...gradeForm,
        teacherId: currentUser.id,
        kelasId: studentData?.kelasId || '1',
        tahunAjaran: '2024/2025',
        semester: 1,
        nilai: nilaiNumber,
        verified: false
      };

      let result;
      if (editingGrade) {
        const allGrades = JSON.parse(localStorage.getItem('akademik_grades') || '[]');
        const gradeIndex = allGrades.findIndex(g => g.id === editingGrade.id);
        
        if (gradeIndex !== -1) {
          allGrades[gradeIndex] = { ...editingGrade, ...gradeData };
          localStorage.setItem('akademik_grades', JSON.stringify(allGrades));
          result = { success: true };
        } else {
          result = { success: false, message: "Grade not found" };
        }
      } else {
        result = await apiService.addGrade(currentUser.id, gradeData);
      }
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Nilai berhasil ${editingGrade ? 'diupdate' : 'ditambahkan'}`
        });
        
        setShowGradeDialog(false);
        setGradeForm({
          studentId: '',
          subjectId: '',
          jenis: '',
          nilai: '',
          tanggal: new Date().toISOString().split('T')[0]
        });
        setEditingGrade(null);
        
        await loadGradesData();
      } else {
        toast({
          title: "Error",
          description: result.message || "Gagal menyimpan nilai",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan nilai",
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
      const studentData = students.find(s => s.id === attendanceForm.studentId);
      const attendanceData = {
        id: editingAttendance ? editingAttendance.id : Date.now().toString(),
        ...attendanceForm,
        teacherId: currentUser.id,
        kelasId: studentData?.kelasId || '1',
        tahunAjaran: '2024/2025',
        semester: 1
      };

      let result;
      if (editingAttendance) {
        const allAttendance = JSON.parse(localStorage.getItem('akademik_attendance') || '[]');
        const attIndex = allAttendance.findIndex(att => att.id === editingAttendance.id);
        
        if (attIndex !== -1) {
          allAttendance[attIndex] = { ...editingAttendance, ...attendanceData };
          localStorage.setItem('akademik_attendance', JSON.stringify(allAttendance));
          result = { success: true };
        } else {
          result = { success: false, message: "Attendance not found" };
        }
      } else {
        result = await apiService.addAttendance(currentUser.id, attendanceData);
      }
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Kehadiran berhasil ${editingAttendance ? 'diupdate' : 'dicatat'}`
        });
        
        setShowAttendanceDialog(false);
        setAttendanceForm({
          studentId: '',
          subjectId: '',
          status: '',
          keterangan: '',
          tanggal: new Date().toISOString().split('T')[0]
        });
        setEditingAttendance(null);
        
        await loadAttendanceData();
      } else {
        toast({
          title: "Error",
          description: result.message || "Gagal menyimpan kehadiran",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan kehadiran",
        variant: "destructive"
      });
    }
  };

  const handleEditGrade = (grade) => {
    setGradeForm({
      studentId: grade.studentId,
      subjectId: grade.subjectId,
      jenis: grade.jenis,
      nilai: grade.nilai.toString(),
      tanggal: grade.tanggal
    });
    setEditingGrade(grade);
    setShowGradeDialog(true);
  };

  const handleDeleteGrade = async (gradeId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus nilai ini?')) {
      try {
        const allGrades = JSON.parse(localStorage.getItem('akademik_grades') || '[]');
        const updatedGrades = allGrades.filter(grade => grade.id !== gradeId);
        localStorage.setItem('akademik_grades', JSON.stringify(updatedGrades));
        
        toast({
          title: "Berhasil",
          description: "Nilai berhasil dihapus"
        });
        
        await loadGradesData();
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus nilai",
          variant: "destructive"
        });
      }
    }
  };

  const handleEditAttendance = (attendance) => {
    setAttendanceForm({
      studentId: attendance.studentId,
      subjectId: attendance.subjectId,
      status: attendance.status,
      keterangan: attendance.keterangan,
      tanggal: attendance.tanggal
    });
    setEditingAttendance(attendance);
    setShowAttendanceDialog(true);
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data kehadiran ini?')) {
      try {
        const allAttendance = JSON.parse(localStorage.getItem('akademik_attendance') || '[]');
        const updatedAttendance = allAttendance.filter(att => att.id !== attendanceId);
        localStorage.setItem('akademik_attendance', JSON.stringify(updatedAttendance));
        
        toast({
          title: "Berhasil",
          description: "Data kehadiran berhasil dihapus"
        });
        
        await loadAttendanceData();
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus data kehadiran",
          variant: "destructive"
        });
      }
    }
  };

  const handleViewStudentList = (subject) => {
    setSelectedSubject(subject);
    setShowStudentListDialog(true);
  };

  const handleViewAllGrades = (subjectId) => {
    setSelectedSubjectForGrades(subjectId);
    setShowGradeTableDialog(true);
  };

  const handleViewAllAttendance = (subjectId) => {
    setSelectedSubjectForAttendance(subjectId);
    setShowAttendanceTableDialog(true);
  };

  const getSubjectName = (subjectId) => {
    const allSubjects = JSON.parse(localStorage.getItem('akademik_subjects') || '[]');
    const subjectDetails = allSubjects.find(s => s.id === subjectId);
    return subjectDetails?.nama || `Mata Pelajaran ${subjectId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-accent text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Dashboard Guru</h1>
                <p className="opacity-90 text-sm md:text-base">Selamat datang, {currentUser?.nama}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={showGradeDialog} onOpenChange={(open) => {
            setShowGradeDialog(open);
            if (!open) {
              setEditingGrade(null);
              setGradeForm({
                studentId: '',
                subjectId: '',
                jenis: '',
                nilai: '',
                tanggal: new Date().toISOString().split('T')[0]
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Input Nilai
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGrade ? 'Edit Nilai Siswa' : 'Input Nilai Siswa'}
                </DialogTitle>
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
                          {getSubjectName(subject)}
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
                  {editingGrade ? 'Update Nilai' : 'Simpan Nilai'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAttendanceDialog} onOpenChange={(open) => {
            setShowAttendanceDialog(open);
            if (!open) {
              setEditingAttendance(null);
              setAttendanceForm({
                studentId: '',
                subjectId: '',
                status: '',
                keterangan: '',
                tanggal: new Date().toISOString().split('T')[0]
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Input Kehadiran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAttendance ? 'Edit Kehadiran Siswa' : 'Input Kehadiran Siswa'}
                </DialogTitle>
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
                          {getSubjectName(subject)}
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
                  {editingAttendance ? 'Update Kehadiran' : 'Simpan Kehadiran'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grades Table Dialog */}
        <Dialog open={showGradeTableDialog} onOpenChange={setShowGradeTableDialog}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                Daftar Semua Nilai - {getSubjectName(selectedSubjectForGrades)}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Jenis Penilaian</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades
                    .filter(grade => grade.subjectId === selectedSubjectForGrades)
                    .map((grade) => {
                      const student = students.find(s => s.id === grade.studentId);
                      return (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">
                            {grade.studentName || student?.nama}
                          </TableCell>
                          <TableCell>
                            {student?.nisn || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{grade.jenis}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`${getGradeColor(grade.nilai)} border-current`}
                            >
                              {grade.nilai}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(grade.tanggal)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={grade.verified ? "default" : "secondary"}>
                              {grade.verified ? "Terverifikasi" : "Belum Verifikasi"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditGrade(grade)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteGrade(grade.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              {grades.filter(grade => grade.subjectId === selectedSubjectForGrades).length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Belum ada nilai yang diinput untuk mata pelajaran ini</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance Table Dialog */}
        <Dialog open={showAttendanceTableDialog} onOpenChange={setShowAttendanceTableDialog}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                Daftar Semua Kehadiran - {getSubjectName(selectedSubjectForAttendance)}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Status Kehadiran</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance
                    .filter(att => att.subjectId === selectedSubjectForAttendance)
                    .map((att) => {
                      const student = students.find(s => s.id === att.studentId);
                      return (
                        <TableRow key={att.id}>
                          <TableCell className="font-medium">
                            {att.studentName || student?.nama}
                          </TableCell>
                          <TableCell>
                            {student?.nisn || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={att.status === 'hadir' ? 'default' : 'secondary'}
                              className={
                                att.status === 'hadir' ? 'bg-green-100 text-green-800' :
                                att.status === 'sakit' ? 'bg-yellow-100 text-yellow-800' :
                                att.status === 'izin' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {att.status === 'hadir' ? 'Hadir' :
                               att.status === 'sakit' ? 'Sakit' :
                               att.status === 'izin' ? 'Izin' : 'Alfa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(att.tanggal)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {att.keterangan || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAttendance(att)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAttendance(att.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              {attendance.filter(att => att.subjectId === selectedSubjectForAttendance).length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Belum ada data kehadiran untuk mata pelajaran ini</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Student List Dialog */}
        <Dialog open={showStudentListDialog} onOpenChange={setShowStudentListDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Daftar Siswa - {getSubjectName(selectedSubject)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {students.length > 0 ? (
                students.map((student) => (
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
                          setGradeForm(prev => ({ ...prev, studentId: student.id, subjectId: selectedSubject }));
                          setShowStudentListDialog(false);
                          setShowGradeDialog(true);
                        }}
                      >
                        Input Nilai
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setAttendanceForm(prev => ({ ...prev, studentId: student.id, subjectId: selectedSubject }));
                          setShowStudentListDialog(false);
                          setShowAttendanceDialog(true);
                        }}
                      >
                        Input Kehadiran
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Belum ada data siswa untuk mata pelajaran ini</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
          <TabsContent value="matapelajaran" className="space-y-6">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : subjects.length > 0 ? (
              <div className="grid gap-6">
                {subjects.map((subjectId) => {
                  const subjectGrades = grades.filter(grade => grade.subjectId === subjectId);
                  const subjectAttendance = attendance.filter(att => att.subjectId === subjectId);
                  
                  return (
                    <Card key={subjectId} className="shadow-soft">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <span>{getSubjectName(subjectId)}</span>
                            </CardTitle>
                            <p className="text-muted-foreground">
                              Nilai: {subjectGrades.length} | Kehadiran: {subjectAttendance.length}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewStudentList(subjectId)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Lihat Siswa
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setGradeForm(prev => ({ ...prev, subjectId }));
                                setShowGradeDialog(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Input Nilai
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setAttendanceForm(prev => ({ ...prev, subjectId }));
                                setShowAttendanceDialog(true);
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Input Kehadiran
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Grades Section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Nilai ({subjectGrades.length})
                              </h4>
                              {subjectGrades.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewAllGrades(subjectId)}
                                >
                                  Lihat Semua
                                </Button>
                              )}
                            </div>
                            {subjectGrades.length > 0 ? (
                              <div className="space-y-2">
                                {subjectGrades.slice(-3).map((grade) => (
                                  <div key={grade.id} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                                    <span className="text-sm">{grade.studentName}</span>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs">{grade.jenis}</Badge>
                                      <Badge variant="outline" className={`text-xs ${getGradeColor(grade.nilai)}`}>
                                        {grade.nilai}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                                {subjectGrades.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{subjectGrades.length - 3} nilai lainnya
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-xs">Belum ada nilai</p>
                              </div>
                            )}
                          </div>

                          {/* Attendance Section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Kehadiran ({subjectAttendance.length})
                              </h4>
                              {subjectAttendance.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewAllAttendance(subjectId)}
                                >
                                  Lihat Semua
                                </Button>
                              )}
                            </div>
                            {subjectAttendance.length > 0 ? (
                              <div className="space-y-2">
                                {subjectAttendance.slice(-3).map((att) => (
                                  <div key={att.id} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                                    <span className="text-sm">{att.studentName}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        att.status === 'hadir' ? 'bg-green-100 text-green-800' :
                                        att.status === 'sakit' ? 'bg-yellow-100 text-yellow-800' :
                                        att.status === 'izin' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {att.status === 'hadir' ? 'Hadir' :
                                       att.status === 'sakit' ? 'Sakit' :
                                       att.status === 'izin' ? 'Izin' : 'Alfa'}
                                    </Badge>
                                  </div>
                                ))}
                                {subjectAttendance.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{subjectAttendance.length - 3} record lainnya
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <Calendar className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-xs">Belum ada kehadiran</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada mata pelajaran yang diampu</p>
              </div>
            )}
          </TabsContent>

          {/* Siswa Tab */}
          <TabsContent value="siswa">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Daftar Siswa yang Diajar</CardTitle>
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
                              <span>Username: {student.username}</span>
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