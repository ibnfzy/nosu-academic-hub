import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  CheckCircle,
  Calendar,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { formatDate } from "@/utils/helpers";
import WalikelasNavbar from "@/components/WalikelasNavbar";
import StudentsSection from "@/components/walikelas/StudentsSection";
import GradesSection from "@/components/walikelas/GradesSection";
import AttendanceSection from "@/components/walikelas/AttendanceSection";
import ReportsSection from "@/components/walikelas/ReportsSection";
import AttendanceDialog from "@/components/walikelas/AttendanceDialog";
import GradesDialog from "@/components/walikelas/GradesDialog";
import { useDashboardSemester } from "@/hooks/use-dashboard-semester";
import useWalikelasDashboard from "@/hooks/use-walikelas-dashboard";

const WalikelasaDashboard = ({ currentUser, onLogout }) => {
  const {
    students,
    grades,
    attendance,
    classInfo,
    loading,
    activeSection,
    setActiveSection,
    searchTerm,
    setSearchTerm,
    semesters,
    selectedSemesterId,
    handleSemesterChange,
    selectedSemesterMetadata,
    showStudentDialog,
    handleStudentDialogChange,
    startAddStudent,
    editingStudent,
    studentForm,
    updateStudentForm,
    handleStudentSubmit,
    handleDeleteStudent,
    filteredStudents,
    unverifiedGrades,
    handleVerifyGrade,
    handleVerifyAll,
    attendancePercentage,
    studentsWithVerifiedGrades,
    handlePrintReport,
    resetStudentForm,
    editStudent,
  } = useWalikelasDashboard(currentUser);

  const {
    getSemesterOptionLabel,
    buildSemesterPeriodLabel,
    buildSemesterDateRange,
  } = useDashboardSemester({ semesters });

  const selectedSemesterPeriodLabel = buildSemesterPeriodLabel(
    selectedSemesterMetadata
  );
  const selectedSemesterDateRange = buildSemesterDateRange(
    selectedSemesterMetadata
  );

  const [isAttendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [isGradesDialogOpen, setGradesDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const selectedStudentName = selectedStudentId
    ? students.find((student) => student.id === selectedStudentId)?.nama || null
    : null;

  const openAttendanceDialog = () => {
    setSelectedStudentId(null);
    setAttendanceDialogOpen(true);
  };

  const openGradesDialog = () => {
    setSelectedStudentId(null);
    setGradesDialogOpen(true);
  };

  const handleShowStudentAttendance = (studentId: string) => {
    setSelectedStudentId(studentId);
    setAttendanceDialogOpen(true);
  };

  const handleShowStudentGrades = (studentId: string) => {
    setSelectedStudentId(studentId);
    setGradesDialogOpen(true);
  };

  const filteredAttendanceRecords = selectedStudentId
    ? attendance.filter((record) => record.studentId === selectedStudentId)
    : attendance;

  const filteredGradeRecords = selectedStudentId
    ? grades.filter((grade) => grade.studentId === selectedStudentId)
    : grades;

  const handleAttendanceDialogChange = (open: boolean) => {
    setAttendanceDialogOpen(open);
    if (!open) {
      setSelectedStudentId(null);
    }
  };

  const handleGradesDialogChange = (open: boolean) => {
    setGradesDialogOpen(open);
    if (!open) {
      setSelectedStudentId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Dashboard Wali Kelas</h1>
                <p className="opacity-90 text-sm md:text-base">
                  Selamat datang, {currentUser?.nama}
                </p>
              </div>
            </div>
            {classInfo && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <div className="text-center md:text-right">
                  <h2 className="text-lg font-semibold">{classInfo.nama}</h2>
                  <p className="text-sm opacity-90">
                    Tingkat {classInfo.tingkat} - {classInfo.jurusan || "Umum"}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Total Siswa: {students.length} orang
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WalikelasNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
        onOpenAttendanceDialog={openAttendanceDialog}
        onOpenGradesDialog={openGradesDialog}
      />

      <AttendanceDialog
        open={isAttendanceDialogOpen}
        onOpenChange={handleAttendanceDialogChange}
        attendance={filteredAttendanceRecords}
        students={students}
        selectedStudentName={selectedStudentName}
      />

      <GradesDialog
        open={isGradesDialogOpen}
        onOpenChange={handleGradesDialogChange}
        loading={loading}
        grades={filteredGradeRecords}
        students={students}
        onVerifyGrade={handleVerifyGrade}
        onVerifyAll={handleVerifyAll}
        selectedStudentName={selectedStudentName}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h3 className="font-semibold text-foreground">Filter Periode Akademik</h3>
                <p className="text-sm text-muted-foreground">
                  Pilih tahun ajaran dan semester yang ingin dilihat
                </p>
                {selectedSemesterPeriodLabel !== "-" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Saat ini: {selectedSemesterPeriodLabel}
                    {selectedSemesterDateRange ? ` • ${selectedSemesterDateRange}` : ""}
                  </p>
                )}
              </div>
              <Select
                value={
                  selectedSemesterId ||
                  (semesters.length === 1 ? String(semesters[0]?.id) : undefined)
                }
                onValueChange={handleSemesterChange}
                disabled={semesters.length === 0}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.length > 0 ? (
                    semesters.map((semesterItem) => (
                      <SelectItem
                        key={semesterItem.id}
                        value={String(semesterItem.id)}
                      >
                        {getSemesterOptionLabel(semesterItem)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty" disabled>
                      Tidak ada data semester
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedSemesterMetadata && (
          <Card className="mb-6 shadow-soft">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Informasi Semester</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSemesterPeriodLabel}
                  </p>
                  {selectedSemesterDateRange && (
                    <p className="text-xs text-muted-foreground">
                      {selectedSemesterDateRange}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tanggal Mulai
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedSemesterMetadata.tanggalMulai
                      ? formatDate(selectedSemesterMetadata.tanggalMulai)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tanggal Selesai
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedSemesterMetadata.tanggalSelesai
                      ? formatDate(selectedSemesterMetadata.tanggalSelesai)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Jumlah Hari Belajar
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedSemesterMetadata.jumlahHariBelajar ?? "-"}
                  </p>
                </div>
              </div>
              {selectedSemesterMetadata.catatan && (
                <div className="border border-border bg-muted/30 rounded-lg p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">Catatan Semester</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedSemesterMetadata.catatan}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedSemesterMetadata && (
          <div className="text-sm text-muted-foreground mb-3">
            Statistik periode: {selectedSemesterPeriodLabel}
            {selectedSemesterDateRange ? ` • ${selectedSemesterDateRange}` : ""}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {students.length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Siswa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-warning/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 md:h-8 md:w-8 text-warning" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {unverifiedGrades.length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Nilai Belum Verifikasi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-success/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 md:h-8 md:w-8 text-success" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {attendancePercentage}%
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Kehadiran Rata-rata
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-accent/10 rounded-lg">
                  <Calendar className="h-5 w-5 md:h-8 md:w-8 text-accent" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {grades.length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total Nilai
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {activeSection === "students" && (
            <StudentsSection
              students={students}
              filteredStudents={filteredStudents}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddStudent={startAddStudent}
              onEditStudent={editStudent}
              onDeleteStudent={handleDeleteStudent}
              onShowAttendance={handleShowStudentAttendance}
              onShowGrades={handleShowStudentGrades}
              isDialogOpen={showStudentDialog}
              onDialogOpenChange={handleStudentDialogChange}
              isEditing={Boolean(editingStudent)}
              studentForm={studentForm}
              onStudentFormChange={updateStudentForm}
              onStudentSubmit={handleStudentSubmit}
              onResetForm={resetStudentForm}
            />
          )}

          {activeSection === "grades" && (
            <GradesSection
              loading={loading}
              unverifiedGrades={unverifiedGrades}
              students={students}
              onVerifyGrade={handleVerifyGrade}
              onVerifyAll={handleVerifyAll}
            />
          )}

          {activeSection === "attendance" && (
            <AttendanceSection attendance={attendance} students={students} />
          )}

          {activeSection === "reports" && (
            <ReportsSection
              students={studentsWithVerifiedGrades}
              grades={grades}
              selectedSemesterPeriodLabel={selectedSemesterPeriodLabel}
              selectedSemesterDateRange={selectedSemesterDateRange}
              selectedSemesterMetadata={selectedSemesterMetadata}
              onPrintReport={handlePrintReport}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WalikelasaDashboard;
