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
      <DialogContent className="max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-none">
          <DialogTitle>
            {selectedStudentName
              ? `Detail Kehadiran ${selectedStudentName}`
              : "Detail Kehadiran Siswa"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <Card className="shadow-none border-none flex flex-col h-full overflow-hidden">
            <CardContent className="px-0 flex-1 overflow-y-auto pr-1">
              <AttendanceList attendance={attendance} students={students} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;
