import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { UserPlus, Edit, Trash2, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';

interface StudentManagementProps {
  students: any[];
  currentUser: any;
  onDataChange: () => void;
}

export default function StudentManagement({ students, currentUser, onDataChange }: StudentManagementProps) {
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentForm, setStudentForm] = useState({
    nama: "",
    nisn: "",
    username: "",
    password: "",
    email: "",
    alamat: "",
    tanggalLahir: "",
  });

  const { toast } = useToast();

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentForm.nama || !studentForm.nisn || !studentForm.username) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive",
      });
      return;
    }

    try {
      const studentData = {
        ...studentForm,
        id: editingStudent ? editingStudent.id : Date.now().toString(),
        role: "siswa",
        kelasId: currentUser.kelasId, // Assuming walikelas has kelasId
      };

      let result;
      if (editingStudent) {
        result = await apiService.updateClassStudent(
          currentUser.id,
          studentData.id,
          studentData
        );
      } else {
        result = await apiService.addClassStudent(currentUser.id, studentData);
      }

      if (result.success) {
        toast({
          title: "Berhasil",
          description: `Siswa berhasil ${
            editingStudent ? "diupdate" : "ditambahkan"
          }`,
        });

        resetStudentForm();
        onDataChange();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal ${
          editingStudent ? "mengupdate" : "menambahkan"
        } siswa`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      try {
        const result = await apiService.deleteClassStudent(
          currentUser.id,
          studentId
        );
        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Siswa berhasil dihapus",
          });
          onDataChange();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus siswa",
          variant: "destructive",
        });
      }
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      nama: "",
      nisn: "",
      username: "",
      password: "",
      email: "",
      alamat: "",
      tanggalLahir: "",
    });
    setEditingStudent(null);
    setShowStudentDialog(false);
  };

  const editStudent = (student: any) => {
    setStudentForm(student);
    setEditingStudent(student);
    setShowStudentDialog(true);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <CardTitle>Manajemen Siswa Kelas</CardTitle>
          <Dialog open={showStudentDialog} onOpenChange={(open) => {
            setShowStudentDialog(open);
            if (!open) resetStudentForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Siswa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? "Edit Siswa" : "Tambah Siswa Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap *</Label>
                  <Input
                    value={studentForm.nama}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, nama: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>NISN *</Label>
                  <Input
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, nisn: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input
                    value={studentForm.username}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingStudent}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Input
                    value={studentForm.alamat}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, alamat: e.target.value }))}
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

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingStudent ? "Update" : "Tambah"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowStudentDialog(false)}
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
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.nama}</TableCell>
                    <TableCell>{student.nisn}</TableCell>
                    <TableCell>{student.username}</TableCell>
                    <TableCell>{student.email || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editStudent(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : searchTerm ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Tidak ada siswa yang cocok dengan pencarian "{searchTerm}"
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada data siswa</p>
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