import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import GradesList from "@/components/walikelas/GradesList";

interface GradeItem {
  id: string;
  studentId: string;
  subjectId: string;
  jenis: string;
  nilai: string | number;
  tanggal: string;
  verified?: boolean;
}

interface StudentSummary {
  id: string;
  nama: string;
}

interface GradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  grades: GradeItem[];
  students: StudentSummary[];
  onVerifyGrade: (gradeId: string) => void;
  onVerifyAll: () => void;
  selectedStudentName?: string | null;
}

const GradesDialog = ({
  open,
  onOpenChange,
  loading,
  grades,
  students,
  onVerifyGrade,
  onVerifyAll,
  selectedStudentName,
}: GradesDialogProps) => {
  const canVerifyAll = grades.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            {selectedStudentName
              ? `Verifikasi Nilai ${selectedStudentName}`
              : "Verifikasi Nilai Siswa"}
          </DialogTitle>
        </DialogHeader>
        <Card className="shadow-none border-none">
          <CardHeader className="px-0 pt-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <CardTitle className="text-lg">Daftar Nilai Belum Terverifikasi</CardTitle>
              {canVerifyAll && (
                <Button
                  onClick={onVerifyAll}
                  disabled={loading}
                  className="bg-success text-success-foreground w-full md:w-auto"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Verifikasi Semua ({grades.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <GradesList
              loading={loading}
              grades={grades}
              students={students}
              onVerifyGrade={onVerifyGrade}
            />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default GradesDialog;
