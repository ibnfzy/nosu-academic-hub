import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface AttendanceSectionProps {
  attendance: AttendanceRecord[];
  students: StudentSummary[];
}

const AttendanceSection = ({ attendance, students }: AttendanceSectionProps) => {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Kehadiran Kelas</CardTitle>
      </CardHeader>
      <CardContent>
        <AttendanceList attendance={attendance} students={students} />
      </CardContent>
    </Card>
  );
};

export default AttendanceSection;
