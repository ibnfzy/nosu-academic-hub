import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckSquare, Check, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getGradeColor } from '@/utils/helpers';
import apiService from '@/services/apiService';

interface GradeVerificationProps {
  grades: any[];
  students: any[];
  currentUser: any;
  onDataChange: () => void;
}

export default function GradeVerification({ grades, students, currentUser, onDataChange }: GradeVerificationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyGrade = async (gradeId: string) => {
    try {
      const teacherId = currentUser?.teacherId;
      if (!teacherId) {
        toast({
          title: "Data Wali Kelas",
          description:
            "ID wali kelas tidak ditemukan pada akun Anda. Hubungi admin untuk bantuan lebih lanjut.",
          variant: "destructive",
        });
        return;
      }

      const result = await apiService.verifyGrade(teacherId, gradeId);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Nilai berhasil diverifikasi",
        });
        onDataChange();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memverifikasi nilai",
        variant: "destructive",
      });
    }
  };

  const unverifiedGrades = grades.filter((grade) => !grade.verified);

  const handleVerifyAll = async () => {
    if (unverifiedGrades.length === 0) return;

    if (
      window.confirm(
        `Apakah Anda yakin ingin memverifikasi semua ${unverifiedGrades.length} nilai yang belum diverifikasi?`
      )
    ) {
      setLoading(true);
      try {
        const teacherId = currentUser?.teacherId;
        if (!teacherId) {
          toast({
            title: "Data Wali Kelas",
            description:
              "ID wali kelas tidak ditemukan pada akun Anda. Hubungi admin untuk bantuan lebih lanjut.",
            variant: "destructive",
          });
          return;
        }

        // Verify all unverified grades
        const verifyPromises = unverifiedGrades.map((grade) =>
          apiService.verifyGrade(teacherId, grade.id)
        );

        await Promise.all(verifyPromises);

        toast({
          title: "Berhasil",
          description: `${unverifiedGrades.length} nilai berhasil diverifikasi`,
        });

        onDataChange();
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memverifikasi beberapa nilai",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const matchStudentById = (
    studentId: string | number | null | undefined
  ) => {
    if (studentId === undefined || studentId === null) {
      return undefined;
    }

    const targetId = String(studentId);

    return students.find((student) => {
      const candidateIds = [
        student?.studentId ?? student?.id ?? student?.userId,
        student?.studentId,
        student?.id,
        student?.userId,
      ]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value));

      return candidateIds.includes(targetId);
    });
  };

  const getStudentName = (
    studentId: string | number | null | undefined
  ) => {
    const student = matchStudentById(studentId);
    return student?.nama || 'Unknown Student';
  };

  const getSubjectName = (subjectId: string) => {
    const allSubjects = JSON.parse(localStorage.getItem('akademik_subjects') || '[]');
    const subjectDetails = allSubjects.find(s => s.id === subjectId);
    return subjectDetails?.nama || `Mata Pelajaran ${subjectId}`;
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <CardTitle>Verifikasi Nilai</CardTitle>
          {unverifiedGrades.length > 0 && (
            <Button
              onClick={handleVerifyAll}
              disabled={loading}
              className="bg-primary text-primary-foreground"
            >
              {loading ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckSquare className="h-4 w-4 mr-2" />
              )}
              Verifikasi Semua ({unverifiedGrades.length})
            </Button>
          )}
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
                      <Badge
                        className={
                          grade.verified
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {grade.verified ? "Terverifikasi" : "Belum Verifikasi"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!grade.verified && (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyGrade(grade.id)}
                          className="bg-success text-success-foreground hover:bg-success/90"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Verifikasi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada data nilai untuk diverifikasi</p>
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