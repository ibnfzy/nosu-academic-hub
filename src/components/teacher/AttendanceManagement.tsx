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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getAttendanceStatus } from '@/utils/helpers';
import apiService from '@/services/apiService';

interface AttendanceManagementProps {
  attendance: any[];
  students: any[];
  subjects: any[];
  currentUser: any;
  onDataChange: () => void;
}

export default function AttendanceManagement({ attendance, students, subjects, currentUser, onDataChange }: AttendanceManagementProps) {
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    subjectId: '',
    status: '',
    keterangan: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();

  const attendanceStatuses = [
    { value: 'hadir', label: 'Hadir' },
    { value: 'sakit', label: 'Sakit' },
    { value: 'alfa', label: 'Alfa' },
    { value: 'izin', label: 'Izin' }
  ];

  const handleAddAttendance = async (e: React.FormEvent) => {
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
      if (!currentUser?.teacherId) {
        toast({
          title: "Error",
          description: "ID guru tidak ditemukan. Harap hubungi administrator.",
          variant: "destructive"
        });
        return;
      }

      const studentData = students.find(s => s.id === attendanceForm.studentId);
      const attendanceData = {
        id: editingAttendance ? editingAttendance.id : Date.now().toString(),
        ...attendanceForm,
        teacherId: currentUser.teacherId,
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
        result = await apiService.addAttendance(currentUser.teacherId, attendanceData);
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
        
        onDataChange();
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

  const handleEditAttendance = (attendance: any) => {
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

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data kehadiran ini?')) {
      try {
        const allAttendance = JSON.parse(localStorage.getItem('akademik_attendance') || '[]');
        const updatedAttendance = allAttendance.filter(att => att.id !== attendanceId);
        localStorage.setItem('akademik_attendance', JSON.stringify(updatedAttendance));
        
        toast({
          title: "Berhasil",
          description: "Data kehadiran berhasil dihapus"
        });
        
        onDataChange();
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus data kehadiran",
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
          <CardTitle>Manajemen Kehadiran</CardTitle>
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Catat Kehadiran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAttendance ? 'Edit Kehadiran' : 'Catat Kehadiran Siswa'}
                </DialogTitle>
                <DialogDescription>
                  {editingAttendance ? 'Ubah data kehadiran siswa' : 'Catat kehadiran siswa untuk mata pelajaran'}
                </DialogDescription>
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
                    value={attendanceForm.subjectId}
                    onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, subjectId: value }))}
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
                  <Label>Keterangan (Opsional)</Label>
                  <Textarea
                    value={attendanceForm.keterangan}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, keterangan: e.target.value }))}
                    placeholder="Masukkan keterangan jika diperlukan"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={attendanceForm.tanggal}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, tanggal: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingAttendance ? 'Update' : 'Simpan'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAttendanceDialog(false)}
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
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length > 0 ? (
                attendance.map((record) => {
                  const status = getAttendanceStatus(record.status);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {getStudentName(record.studentId)}
                      </TableCell>
                      <TableCell>{getSubjectName(record.subjectId)}</TableCell>
                      <TableCell>
                        <Badge className={`${status.bgColor} ${status.color}`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(record.tanggal)}</TableCell>
                      <TableCell>
                        {record.keterangan ? (
                          <span className="text-sm">{record.keterangan}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAttendance(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAttendance(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada data kehadiran</p>
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