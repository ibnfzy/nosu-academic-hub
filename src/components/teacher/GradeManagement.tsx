import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
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
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getGradeColor } from '@/utils/helpers';
import apiService from '@/services/apiService';

interface GradeManagementProps {
  grades: any[];
  students: any[];
  subjects: any[];
  currentUser: any;
  onDataChange: () => void;
}

export default function GradeManagement({ grades, students, subjects, currentUser, onDataChange }: GradeManagementProps) {
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    subjectId: '',
    jenis: '',
    nilai: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();

  const gradeTypes = ['Ulangan Harian', 'UTS', 'UAS', 'Kuis', 'Tugas'];

  const handleAddGrade = async (e: React.FormEvent) => {
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
      if (!currentUser?.teacherId) {
        toast({
          title: "Error",
          description: "ID guru tidak ditemukan. Harap hubungi administrator.",
          variant: "destructive"
        });
        return;
      }

      const studentData = students.find(s => s.id === gradeForm.studentId);
      const gradeData = {
        id: editingGrade ? editingGrade.id : Date.now().toString(),
        ...gradeForm,
        teacherId: currentUser.teacherId,
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
        result = await apiService.addGrade(currentUser.teacherId, gradeData);
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
        
        onDataChange();
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

  const handleEditGrade = (grade: any) => {
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

  const handleDeleteGrade = async (gradeId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus nilai ini?')) {
      try {
        const allGrades = JSON.parse(localStorage.getItem('akademik_grades') || '[]');
        const updatedGrades = allGrades.filter(grade => grade.id !== gradeId);
        localStorage.setItem('akademik_grades', JSON.stringify(updatedGrades));
        
        toast({
          title: "Berhasil",
          description: "Nilai berhasil dihapus"
        });
        
        onDataChange();
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus nilai",
          variant: "destructive"
        });
      }
    }
  };

  const getSubjectName = (subjectId: string) => {
    const allSubjects = JSON.parse(localStorage.getItem('akademik_subjects') || '[]');
    const subjectDetails = allSubjects.find(s => s.id === subjectId);
    return subjectDetails?.nama || `Mata Pelajaran ${subjectId}`;
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.nama || 'Unknown Student';
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manajemen Nilai</CardTitle>
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Input Nilai
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGrade ? 'Edit Nilai Siswa' : 'Input Nilai Siswa'}
                </DialogTitle>
                <DialogDescription>
                  {editingGrade ? 'Ubah nilai siswa yang sudah ada' : 'Masukkan nilai baru untuk siswa'}
                </DialogDescription>
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
                      {students.map((student, index) => {
                        const resolvedStudentId =
                          student.studentId ?? student.userId ?? student.id;
                        const optionValue = String(
                          resolvedStudentId ?? index
                        );
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {student.nama} - NIS: {student.nis || "-"} • NISN:{" "}
                            {student.nisn || "-"}
                          </SelectItem>
                        );
                      })}
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
                        <SelectItem key={subject.id || subject} value={subject.id || subject}>
                          {typeof subject === 'object' ? subject.nama : getSubjectName(subject)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={gradeForm.tanggal}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, tanggal: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingGrade ? 'Update' : 'Simpan'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowGradeDialog(false)}
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.length > 0 ? (
                grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">
                      {getStudentName(grade.studentId)}
                    </TableCell>
                    <TableCell>{getSubjectName(grade.subjectId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{grade.jenis}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${getGradeColor(grade.nilai)}`}>
                        {grade.nilai}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(grade.tanggal)}</TableCell>
                    <TableCell>
                      <Badge className={grade.verified ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                        {grade.verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada data nilai</p>
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