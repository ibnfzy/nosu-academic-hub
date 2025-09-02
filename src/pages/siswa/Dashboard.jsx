import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  User,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  Download,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';
import { 
  calculateAverage, 
  calculateAttendanceStats, 
  getGradeColor, 
  getAttendanceStatus,
  formatDate,
  printReport
} from '@/utils/helpers';

const StudentDashboard = ({ currentUser }) => {
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({
    tahun: '2024/2025',
    semester: 1
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const academicPeriods = [
    { tahun: '2023/2024', semester: 1, label: '2023/2024 - Semester Ganjil' },
    { tahun: '2023/2024', semester: 2, label: '2023/2024 - Semester Genap' },
    { tahun: '2024/2025', semester: 1, label: '2024/2025 - Semester Ganjil (Aktif)' }
  ];

  useEffect(() => {
    if (currentUser) {
      loadStudentData();
    }
  }, [currentUser, selectedPeriod]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [gradesData, attendanceData] = await Promise.all([
        apiService.getStudentGrades(
          currentUser.id, 
          selectedPeriod.tahun, 
          selectedPeriod.semester
        ),
        apiService.getStudentAttendance(
          currentUser.id, 
          selectedPeriod.tahun, 
          selectedPeriod.semester
        )
      ]);

      setGrades(gradesData);
      setAttendance(attendanceData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = async () => {
    try {
      const reportData = await apiService.getStudentReport(
        currentUser.id,
        selectedPeriod.tahun,
        selectedPeriod.semester
      );
      
      printReport(reportData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mencetak raport",
        variant: "destructive"
      });
    }
  };

  const averageGrade = calculateAverage(grades);
  const attendanceStats = calculateAttendanceStats(attendance);

  const subjectGrades = grades.reduce((acc, grade) => {
    const subject = acc.find(s => s.subjectId === grade.subjectId);
    if (subject) {
      subject.grades.push(grade);
    } else {
      acc.push({
        subjectId: grade.subjectId,
        subjectName: `Mata Pelajaran ${grade.subjectId}`, // TODO: Get actual subject name
        grades: [grade]
      });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard Siswa</h1>
              <p className="opacity-90">Selamat datang, {currentUser?.nama}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h3 className="font-semibold text-foreground">Filter Periode Akademik</h3>
                <p className="text-sm text-muted-foreground">
                  Pilih tahun ajaran dan semester yang ingin dilihat
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select 
                  value={`${selectedPeriod.tahun}-${selectedPeriod.semester}`}
                  onValueChange={(value) => {
                    const [tahun, semester] = value.split('-');
                    setSelectedPeriod({ tahun, semester: parseInt(semester) });
                  }}
                >
                  <SelectTrigger className="w-64">
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
                <Button onClick={handlePrintReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Cetak Raport
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{averageGrade}</p>
                  <p className="text-sm text-muted-foreground">Nilai Rata-rata</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{attendanceStats.persentase}%</p>
                  <p className="text-sm text-muted-foreground">Kehadiran</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{subjectGrades.length}</p>
                  <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="nilai" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nilai" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Nilai</span>
            </TabsTrigger>
            <TabsTrigger value="kehadiran" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Kehadiran</span>
            </TabsTrigger>
            <TabsTrigger value="matapelajaran" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Mata Pelajaran</span>
            </TabsTrigger>
          </TabsList>

          {/* Nilai Tab */}
          <TabsContent value="nilai">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Daftar Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Memuat data nilai...</p>
                  </div>
                ) : grades.length > 0 ? (
                  <div className="space-y-4">
                    {grades.map((grade) => (
                      <div 
                        key={grade.id}
                        className="flex justify-between items-center p-4 border border-border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-foreground">
                            {`Mata Pelajaran ${grade.subjectId}`}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {grade.jenis}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(grade.tanggal)}
                            </span>
                            {grade.verified && (
                              <Badge className="text-xs bg-success text-success-foreground">
                                Terverifikasi
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getGradeColor(grade.nilai)}`}>
                            {grade.nilai}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Belum ada data nilai</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kehadiran Tab */}
          <TabsContent value="kehadiran">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Rekap Kehadiran</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Attendance Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-success/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-success">{attendanceStats.hadir}</p>
                    <p className="text-sm text-muted-foreground">Hadir</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-warning">{attendanceStats.sakit}</p>
                    <p className="text-sm text-muted-foreground">Sakit</p>
                  </div>
                  <div className="p-4 bg-destructive/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-destructive">{attendanceStats.alfa}</p>
                    <p className="text-sm text-muted-foreground">Alfa</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{attendanceStats.izin}</p>
                    <p className="text-sm text-muted-foreground">Izin</p>
                  </div>
                </div>

                {/* Attendance List */}
                {loading ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Memuat data kehadiran...</p>
                  </div>
                ) : attendance.length > 0 ? (
                  <div className="space-y-4">
                    {attendance.map((record) => {
                      const status = getAttendanceStatus(record.status);
                      return (
                        <div 
                          key={record.id}
                          className="flex justify-between items-center p-4 border border-border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-foreground">
                              {`Mata Pelajaran ${record.subjectId}`}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(record.tanggal)}
                            </p>
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

          {/* Mata Pelajaran Tab */}
          <TabsContent value="matapelajaran">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Mata Pelajaran & Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                {subjectGrades.length > 0 ? (
                  <div className="space-y-6">
                    {subjectGrades.map((subject) => {
                      const avgGrade = calculateAverage(subject.grades);
                      return (
                        <div key={subject.subjectId} className="p-6 border border-border rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                {subject.subjectName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {subject.grades.length} nilai tercatat
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-bold ${getGradeColor(avgGrade)}`}>
                                {avgGrade}
                              </p>
                              <p className="text-xs text-muted-foreground">Rata-rata</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {subject.grades.map((grade) => (
                              <div 
                                key={grade.id}
                                className="p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{grade.jenis}</span>
                                  <span className={`font-bold ${getGradeColor(grade.nilai)}`}>
                                    {grade.nilai}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(grade.tanggal)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Belum ada data mata pelajaran</p>
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

export default StudentDashboard;