import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatDate, getAttendanceStatus } from "@/utils/helpers";

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

interface AttendanceListProps {
  attendance: AttendanceRecord[];
  students: StudentSummary[];
  emptyMessage?: string;
}

const AttendanceList = ({
  attendance,
  students,
  emptyMessage,
}: AttendanceListProps) => {
  const findStudentName = (studentId: string) =>
    students.find((student) => student.id === studentId)?.nama || "Siswa";

  if (attendance.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          {emptyMessage || "Belum ada data kehadiran"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attendance.map((record) => {
        const status = getAttendanceStatus(record.status);

        return (
          <div
            key={record.id}
            className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-2 md:space-y-0"
          >
            <div className="flex-1">
              <h4 className="font-medium text-foreground">
                {findStudentName(record.studentId)}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Mata Pelajaran {record.subjectId}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(record.tanggal)}
                </span>
              </div>
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
  );
};

export default AttendanceList;
