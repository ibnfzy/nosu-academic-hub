import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import AttendanceList from "@/components/walikelas/AttendanceList";

interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  status: string;
  tanggal: string;
  keterangan?: string;
}

interface StudentSummary {
  id: string;
  nama: string;
}

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: AttendanceRecord[];
  students: StudentSummary[];
  selectedStudentName?: string | null;
}

const AttendanceDialog = ({
  open,
  onOpenChange,
  attendance,
  students,
  selectedStudentName,
}: AttendanceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            {selectedStudentName
              ? `Detail Kehadiran ${selectedStudentName}`
              : "Detail Kehadiran Siswa"}
          </DialogTitle>
        </DialogHeader>
        <Card className="shadow-none border-none">
          <CardContent className="px-0">
            <AttendanceList attendance={attendance} students={students} />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;
