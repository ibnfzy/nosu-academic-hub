import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [verificationFilter, setVerificationFilter] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [jenisFilter, setJenisFilter] = useState<"all" | string>("all");

  const jenisOptions = useMemo(() => {
    const uniqueJenis = Array.from(
      new Set(grades.map((grade) => grade.jenis).filter(Boolean))
    );

    return [
      { label: "Semua Jenis", value: "all" as const },
      ...uniqueJenis.map((jenis) => ({
        label: jenis,
        value: jenis,
      })),
    ];
  }, [grades]);

  const filteredGrades = useMemo(() => {
    let result = grades;

    if (verificationFilter === "verified") {
      result = result.filter((grade) => grade.verified);
    } else if (verificationFilter === "unverified") {
      result = result.filter((grade) => !grade.verified);
    }

    if (jenisFilter !== "all") {
      result = result.filter((grade) => grade.jenis === jenisFilter);
    }

    return result;
  }, [grades, jenisFilter, verificationFilter]);

  const unverifiedCount = useMemo(
    () => grades.filter((grade) => !grade.verified).length,
    [grades]
  );

  const canVerifyAll = unverifiedCount > 0;

  useEffect(() => {
    if (!open) {
      setVerificationFilter("all");
      setJenisFilter("all");
    }
  }, [open]);

  useEffect(() => {
    const availableJenis = jenisOptions.map((option) => option.value);

    if (jenisFilter !== "all" && !availableJenis.includes(jenisFilter)) {
      setJenisFilter("all");
    }
  }, [jenisFilter, jenisOptions]);

  const emptyMessage = useMemo(() => {
    if (grades.length === 0) {
      return selectedStudentName
        ? "Belum ada nilai untuk siswa ini."
        : "Belum ada data nilai yang tersedia.";
    }

    if (filteredGrades.length === 0) {
      const filterDescriptions: string[] = [];

      if (verificationFilter === "verified") {
        filterDescriptions.push("status sudah terverifikasi");
      } else if (verificationFilter === "unverified") {
        filterDescriptions.push("status belum terverifikasi");
      }

      if (jenisFilter !== "all") {
        filterDescriptions.push(`jenis ${jenisFilter}`);
      }

      const filterText =
        filterDescriptions.length > 0
          ? ` dengan ${filterDescriptions.join(" dan ")}`
          : "";

      return selectedStudentName
        ? `Tidak ada nilai yang sesuai${filterText} untuk siswa tersebut.`
        : `Tidak ada nilai yang sesuai${filterText}.`;
    }

    return undefined;
  }, [
    filteredGrades.length,
    grades.length,
    selectedStudentName,
    verificationFilter,
    jenisFilter,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-none"></DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <Card className="shadow-none border-none flex flex-col h-full overflow-hidden">
            <CardHeader className="px-0 pt-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                  <CardTitle className="text-lg">
                    {selectedStudentName
                      ? `Daftar Nilai ${selectedStudentName}`
                      : "Daftar Nilai Siswa"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredGrades.length} nilai ditampilkan
                    {verificationFilter !== "all"
                      ? ` • Filter: ${
                          verificationFilter === "verified"
                            ? "Sudah Terverifikasi"
                            : "Belum Terverifikasi"
                        }`
                      : ""}
                    {jenisFilter !== "all" ? ` • Jenis: ${jenisFilter}` : ""}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <Select
                    value={jenisFilter}
                    onValueChange={setJenisFilter}
                  >
                    <SelectTrigger className="w-full md:w-[220px]">
                      <SelectValue placeholder="Filter jenis nilai" />
                    </SelectTrigger>
                    <SelectContent>
                      {jenisOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={verificationFilter}
                    onValueChange={(value) =>
                      setVerificationFilter(
                        value as "all" | "verified" | "unverified"
                      )
                    }
                  >
                    <SelectTrigger className="w-full md:w-[220px]">
                      <SelectValue placeholder="Filter verifikasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Nilai</SelectItem>
                      <SelectItem value="unverified">
                        Belum Terverifikasi
                      </SelectItem>
                      <SelectItem value="verified">
                        Sudah Terverifikasi
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {canVerifyAll && (
                    <Button
                      onClick={onVerifyAll}
                      disabled={loading}
                      className="bg-success text-success-foreground w-full md:w-auto"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Verifikasi Semua ({unverifiedCount})
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 flex-1 overflow-y-auto pr-1">
              <GradesList
                loading={loading}
                grades={filteredGrades}
                students={students}
                onVerifyGrade={onVerifyGrade}
                emptyMessage={emptyMessage}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradesDialog;
