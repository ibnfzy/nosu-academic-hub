import { useEffect, useMemo, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AttendanceList from "@/components/walikelas/AttendanceList";
import { getAttendanceStatus } from "@/utils/helpers";

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
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(attendance.map((record) => record.status).filter(Boolean))
    );

    return [
      { label: "Semua Status", value: "all" as const },
      ...uniqueStatuses.map((status) => ({
        value: status,
        label: getAttendanceStatus(status).label,
      })),
    ];
  }, [attendance]);

  useEffect(() => {
    const availableValues = statusOptions.map((option) => option.value);

    if (statusFilter !== "all" && !availableValues.includes(statusFilter)) {
      setStatusFilter("all");
    }
  }, [statusFilter, statusOptions]);

  useEffect(() => {
    if (!open) {
      setStatusFilter("all");
    }
  }, [open]);

  const filteredAttendance = useMemo(() => {
    if (statusFilter === "all") {
      return attendance;
    }

    return attendance.filter((record) => record.status === statusFilter);
  }, [attendance, statusFilter]);

  const emptyMessage = useMemo(() => {
    if (attendance.length === 0) {
      return selectedStudentName
        ? "Belum ada data kehadiran untuk siswa ini."
        : "Belum ada data kehadiran yang tersedia.";
    }

    if (filteredAttendance.length === 0) {
      const label =
        statusFilter === "all"
          ? ""
          : getAttendanceStatus(statusFilter).label.toLowerCase();

      if (statusFilter === "all") {
        return selectedStudentName
          ? "Tidak ada data kehadiran untuk siswa ini."
          : "Tidak ada data kehadiran yang tersedia.";
      }

      return selectedStudentName
        ? `Tidak ada catatan kehadiran dengan status ${label} untuk siswa ini.`
        : `Tidak ada catatan kehadiran dengan status ${label}.`;
    }

    return undefined;
  }, [attendance.length, filteredAttendance.length, selectedStudentName, statusFilter]);

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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 px-1">
                <p className="text-sm text-muted-foreground">
                  {filteredAttendance.length} catatan ditampilkan
                  {statusFilter !== "all"
                    ? ` • Status: ${getAttendanceStatus(statusFilter).label}`
                    : ""}
                </p>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Pilih status kehadiran" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AttendanceList
                attendance={filteredAttendance}
                students={students}
                emptyMessage={emptyMessage}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;
