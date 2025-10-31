import { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Edit, Trash2, Calendar, BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import StudentFormDialog from "./StudentFormDialog";

interface Student {
  id: string;
  nama: string;
  nis?: string;
  nisn: string;
  username?: string;
  email?: string;
  nomorHP?: string;
  namaOrangTua?: string;
  tanggalLahir?: string;
  mergedUserData?: any;
}

interface StudentsSectionProps {
  students: Student[];
  filteredStudents: Student[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onShowAttendance: (studentId: string) => void;
  onShowGrades: (studentId: string) => void;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  isEditing: boolean;
  studentForm: any;
  onStudentFormChange: (field: string, value: string) => void;
  onStudentSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onResetForm: () => void;
}

const StudentsSection = ({
  students,
  filteredStudents,
  searchTerm,
  onSearchChange,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onShowAttendance,
  onShowGrades,
  isDialogOpen,
  onDialogOpenChange,
  isEditing,
  studentForm,
  onStudentFormChange,
  onStudentSubmit,
  onResetForm,
}: StudentsSectionProps) => {
  const isMobile = useIsMobile();

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <CardTitle>Manajemen Siswa Kelas</CardTitle>
          <StudentFormDialog
            open={isDialogOpen}
            onOpenChange={onDialogOpenChange}
            trigger={
              <Button
                className="bg-primary text-primary-foreground w-full md:w-auto"
                onClick={onAddStudent}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Siswa
              </Button>
            }
            isEditing={isEditing}
            studentForm={studentForm}
            onFieldChange={(field, value) => onStudentFormChange(field as string, value)}
            onSubmit={onStudentSubmit}
            onCancel={onResetForm}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari siswa berdasarkan nama, NIS, atau NISN..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9"
              aria-label="Cari siswa"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIS</TableHead>
                <TableHead>NISN</TableHead>
                {!isMobile && <TableHead>Username</TableHead>}
                {!isMobile && <TableHead>Email</TableHead>}
                {!isMobile && <TableHead>No. HP</TableHead>}
                {!isMobile && <TableHead>Orang Tua</TableHead>}
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.nama}</TableCell>
                  <TableCell>{student.nis || "-"}</TableCell>
                  <TableCell>{student.nisn}</TableCell>
                  {!isMobile && (
                    <TableCell className="text-muted-foreground">
                      {student.username}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell className="text-muted-foreground">
                      {student.email || "-"}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell className="text-muted-foreground">
                      {student.nomorHP || "-"}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell className="text-muted-foreground">
                      {student.namaOrangTua || "-"}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onShowAttendance(student.id)}
                        aria-label={`Lihat kehadiran ${student.nama}`}
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onShowGrades(student.id)}
                        aria-label={`Lihat nilai ${student.nama}`}
                      >
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditStudent(student)}
                        aria-label={`Edit ${student.nama}`}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteStudent(student.id)}
                        aria-label={`Hapus ${student.nama}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Badge variant="outline">Belum ada siswa</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsSection;
