import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";

interface StudentReportCandidate {
  id: string;
  nama: string;
  nisn: string;
}

interface GradeItem {
  studentId: string;
  nilai: string;
  verified?: boolean;
}

interface ReportsSectionProps {
  students: StudentReportCandidate[];
  grades: GradeItem[];
  selectedSemesterPeriodLabel: string;
  selectedSemesterDateRange: string | null;
  selectedSemesterMetadata?: {
    jumlahHariBelajar?: number | null;
    catatan?: string | null;
  } | null;
  onPrintReport: (student: StudentReportCandidate) => void;
}

const ReportsSection = ({
  students,
  grades,
  selectedSemesterPeriodLabel,
  selectedSemesterDateRange,
  selectedSemesterMetadata,
  onPrintReport,
}: ReportsSectionProps) => {
  const renderStudentCard = (student: StudentReportCandidate) => {
    const studentGrades = grades.filter(
      (grade) => grade.studentId === student.id && grade.verified
    );
    const verifiedSubjects = studentGrades.length;
    const averageGrade =
      studentGrades.length > 0
        ? (
            studentGrades.reduce(
              (sum, grade) => sum + parseFloat(grade.nilai),
              0
            ) / studentGrades.length
          ).toFixed(1)
        : 0;

    return (
      <div
        key={student.id}
        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-border rounded-lg space-y-3 md:space-y-0"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">{student.nama}</h4>
              <p className="text-sm text-muted-foreground">NISN: {student.nisn}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 ml-11">
            <Badge variant="secondary" className="text-xs">
              {verifiedSubjects} Mata Pelajaran
            </Badge>
            <Badge variant="outline" className="text-xs">
              Rata-rata: {averageGrade}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Periode: {selectedSemesterPeriodLabel}
              {selectedSemesterDateRange ? ` • ${selectedSemesterDateRange}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrintReport(student)}
            className="w-full md:w-auto"
            aria-label={`Cetak raport ${student.nama}`}
          >
            <Printer className="h-4 w-4 mr-2" />
            Cetak Raport
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <CardTitle>Laporan Raport Siswa</CardTitle>
            {selectedSemesterPeriodLabel && (
              <div className="mt-1 text-xs text-muted-foreground space-y-1">
                <p>
                  Periode: {selectedSemesterPeriodLabel}
                  {selectedSemesterDateRange ? ` • ${selectedSemesterDateRange}` : ""}
                </p>
                {selectedSemesterMetadata ? (
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0">
                    {selectedSemesterMetadata.jumlahHariBelajar !== null &&
                      selectedSemesterMetadata.jumlahHariBelajar !== undefined && (
                        <span>
                          Hari belajar: {selectedSemesterMetadata.jumlahHariBelajar}
                        </span>
                      )}
                    {selectedSemesterMetadata.catatan && (
                      <span className="block truncate md:max-w-sm">
                        Catatan: {selectedSemesterMetadata.catatan}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{students.length}</span> siswa siap cetak raport
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {students.length > 0 ? (
          <div className="space-y-4">{students.map(renderStudentCard)}</div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-medium mb-2">
              Belum Ada Siswa dengan Nilai Terverifikasi
            </p>
            <p className="text-sm text-muted-foreground">
              Verifikasi nilai siswa terlebih dahulu untuk dapat mencetak raport
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsSection;
