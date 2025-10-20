import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock } from "lucide-react";
import {
  AttendanceStats,
  SemesterMetadata,
  StudentAttendanceRecord,
} from "@/hooks/use-student-dashboard";
import { formatDate, getAttendanceStatus } from "@/utils/helpers";

/**
 * Presents student attendance information for the selected semester.
 */
export interface StudentAttendanceTableProps {
  /** Raw attendance records from the API. */
  attendance: StudentAttendanceRecord[];
  /** Aggregated attendance statistics for highlighting totals. */
  attendanceStats: AttendanceStats;
  /** Loading indicator for asynchronous fetch operations. */
  loading?: boolean;
  /** Metadata associated with the currently selected semester. */
  semesterMetadata: SemesterMetadata | null;
  /** Title string describing the active semester (e.g., "2024/2025 - Semester Ganjil"). */
  semesterTitle: string;
  /** Human readable range derived from semester start and end date. */
  semesterDateRange?: string | null;
  /** Formatted label representing the number of study days. */
  semesterStudyDays: string;
}

export function StudentAttendanceTable({
  attendance,
  attendanceStats,
  loading = false,
  semesterMetadata,
  semesterTitle,
  semesterDateRange,
  semesterStudyDays,
}: StudentAttendanceTableProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Rekap Kehadiran</CardTitle>
      </CardHeader>
      <CardContent>
        {semesterMetadata && (
          <div className="mb-6 rounded-lg bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">
                Statistik hadir untuk {semesterTitle}
              </span>
              <Badge variant="secondary" className="text-xs">
                {semesterDateRange || "Rentang tidak tersedia"}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs md:text-sm text-muted-foreground">
              <span>Rentang: {semesterDateRange || "-"}</span>
              <span>Hari Belajar: {semesterStudyDays}</span>
              <span>
                Catatan: {semesterMetadata.catatan || "Tidak ada catatan."}
              </span>
            </div>
          </div>
        )}

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

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 border border-border rounded-lg"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Memuat data kehadiran...</span>
            </div>
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
                    <h4 className="font-medium text-foreground">{record.subjectName}</h4>
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
