import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { formatDate, getAttendanceStatus, getSubjectName, calculateAttendanceStats } from '@/utils/helpers';

interface AttendanceViewProps {
  attendance: any[];
  loading: boolean;
}

export default function AttendanceView({ attendance, loading }: AttendanceViewProps) {
  const attendanceStats = calculateAttendanceStats(attendance);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Rekap Kehadiran</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Attendance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-success/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-success">{attendanceStats.hadir}</p>
            <p className="text-sm text-muted-foreground">Hadir</p>
          </div>
          <div className="p-4 bg-warning/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-warning">{attendanceStats.sakit}</p>
            <p className="text-sm text-muted-foreground">Sakit</p>
          </div>
          <div className="p-4 bg-destructive/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-destructive">{attendanceStats.alfa}</p>
            <p className="text-sm text-muted-foreground">Alfa</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">{attendanceStats.izin}</p>
            <p className="text-sm text-muted-foreground">Izin</p>
          </div>
        </div>

        {/* Attendance List */}
        {loading ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Memuat data kehadiran...</p>
          </div>
        ) : attendance.length > 0 ? (
          <div className="space-y-4">
            {attendance.map((record) => {
              const status = getAttendanceStatus(record.status);
              return (
                <div 
                  key={record.id}
                  className="flex justify-between items-center p-4 border border-border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-foreground">
                      {getSubjectName(record.subjectId)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(record.tanggal)}
                    </p>
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
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada data kehadiran</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}