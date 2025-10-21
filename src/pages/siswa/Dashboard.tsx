import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import SiswaNavbar from "@/components/SiswaNavbar";
import {
  StudentAttendanceTable,
  StudentDashboardHeader,
  StudentGradesTable,
  StudentStatsCards,
} from "@/components/siswa";
import { useDashboardSemester } from "@/hooks/use-dashboard-semester";
import { StudentUser, useStudentDashboard } from "@/hooks/use-student-dashboard";
import { calculateAverage, formatDate, getGradeColor } from "@/utils/helpers";

interface StudentDashboardProps {
  currentUser?: StudentUser | null;
  onLogout?: () => void;
}

const StudentDashboard = ({ currentUser, onLogout }: StudentDashboardProps) => {
  const [activeSection, setActiveSection] = useState("nilai");

  const {
    attendance,
    attendanceStats,
    averageGrade,
    grades,
    handlePrintReport,
    handleSemesterChange,
    loading,
    selectedSemesterId,
    selectedSemesterMetadata,
    semesterError,
    semesters,
    subjectGrades,
  } = useStudentDashboard({ currentUser });

  const {
    normalizeSemesterMetadata,
    buildSemesterTitle,
    buildSemesterDateRange,
    formatStudyDays,
  } = useDashboardSemester({ semesters });

  const semesterTitle = buildSemesterTitle(selectedSemesterMetadata);
  const semesterDateRange = buildSemesterDateRange(selectedSemesterMetadata);
  const semesterStudyDays = formatStudyDays(selectedSemesterMetadata);

  return (
    <div className="min-h-screen bg-background">
      <StudentDashboardHeader studentName={currentUser?.nama} />

      <SiswaNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
        onPrintReport={handlePrintReport}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h3 className="font-semibold text-foreground">Filter Periode Akademik</h3>
                <p className="text-sm text-muted-foreground">
                  Pilih tahun ajaran dan semester yang ingin dilihat
                </p>
              </div>
              <Select
                value={selectedSemesterId || ""}
                onValueChange={handleSemesterChange}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue
                    placeholder={
                      semesters.length > 0
                        ? "Pilih semester"
                        : "Semester belum tersedia"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {semesters.length > 0 ? (
                    semesters.map((semester, index) => {
                      const metadata = normalizeSemesterMetadata(semester);
                      const hasValidId =
                        semester.id !== null &&
                        semester.id !== undefined &&
                        semester.id !== "";
                      const itemValue = hasValidId
                        ? String(semester.id)
                        : `missing-semester-${index}`;
                      return (
                        <SelectItem
                          key={itemValue}
                          value={itemValue}
                          disabled={!hasValidId}
                        >
                          {buildSemesterTitle(metadata, true)}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-semester-data" disabled>
                      Data semester belum tersedia
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedSemesterMetadata && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Rentang Tanggal
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {semesterDateRange || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Jumlah Hari Belajar
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {semesterStudyDays}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Status Semester
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedSemesterMetadata.isActive ? "Aktif" : "Tidak aktif"}
                    </p>
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-3 text-sm">
                  <p className="font-medium text-foreground">Catatan Semester</p>
                  <p className="text-muted-foreground">
                    {selectedSemesterMetadata.catatan || "Tidak ada catatan khusus."}
                  </p>
                </div>
              </div>
            )}

            {semesterError && (
              <p className="text-sm text-destructive">{semesterError}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 mb-8">
          <StudentStatsCards
            averageGrade={averageGrade}
            attendancePercentage={attendanceStats.persentase}
            subjectCount={subjectGrades.length}
          />
        </div>

        <div className="space-y-6">
          {activeSection === "nilai" && (
            <StudentGradesTable grades={grades} loading={loading} />
          )}

          {activeSection === "kehadiran" && (
            <StudentAttendanceTable
              attendance={attendance}
              attendanceStats={attendanceStats}
              loading={loading}
              semesterMetadata={selectedSemesterMetadata}
              semesterTitle={semesterTitle}
              semesterDateRange={semesterDateRange}
              semesterStudyDays={semesterStudyDays}
            />
          )}

          {activeSection === "matapelajaran" && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Mata Pelajaran & Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                {subjectGrades.length > 0 ? (
                  <div className="space-y-6">
                    {subjectGrades.map((subject) => {
                      const avgGrade = calculateAverage(subject.grades);
                      return (
                        <div
                          key={subject.subjectId}
                          className="p-6 border border-border rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                {subject.subjectName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {subject.grades.length} nilai tercatat
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-xl font-bold ${getGradeColor(avgGrade)}`}
                              >
                                {avgGrade}
                              </p>
                              <p className="text-xs text-muted-foreground">Rata-rata</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {subject.grades.map((grade) => (
                              <div
                                key={grade.id}
                                className="p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {grade.jenis}
                                  </span>
                                  <span
                                    className={`font-bold ${getGradeColor(grade.nilai)}`}
                                  >
                                    {grade.nilai}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(grade.tanggal)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Belum ada data mata pelajaran
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
