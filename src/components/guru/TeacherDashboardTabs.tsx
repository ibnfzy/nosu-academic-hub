import { BookOpen, Calendar, FileText, Plus, Users } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { UseTeacherDashboardReturn } from "@/hooks/use-teacher-dashboard";
import { getGradeColor } from "@/utils/helpers";

type TeacherDashboardTabsProps = {
  dashboard: UseTeacherDashboardReturn;
};

export function TeacherDashboardTabs({
  dashboard,
}: TeacherDashboardTabsProps) {
  const {
    loading,
    subjects,
    grades,
    attendance,
    students,
    handleViewStudentList,
    handleViewAllGrades,
    handleViewAllAttendance,
    getSubjectName,
    getClassesName,
    setGradeForm,
    setShowGradeDialog,
    setAttendanceForm,
    setShowAttendanceDialog,
  } = dashboard;

  return (
    <Tabs defaultValue="matapelajaran" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="matapelajaran" className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4" />
          <span>Mata Pelajaran</span>
        </TabsTrigger>
        <TabsTrigger value="siswa" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Daftar Siswa</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="matapelajaran" className="space-y-6">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : subjects.length > 0 ? (
          <div className="grid gap-6">
            {subjects.map((subject) => {
              const subjectGrades = grades.filter(
                (grade) =>
                  grade.subjectId === subject.id && grade.kelasId === subject.kelasId
              );
              const subjectAttendance = attendance.filter(
                (att) => att.subjectId === subject.id && att.kelasId === subject.kelasId
              );

              return (
                <Card key={subject.id} className="shadow-soft">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span>
                            {getSubjectName(subject.id)} Kelas {" "}
                            {getClassesName(subject.kelasId)}
                          </span>
                        </CardTitle>
                        <p className="text-muted-foreground">
                          Nilai: {subjectGrades.length} | Kehadiran: {subjectAttendance.length}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStudentList(subject.id, subject.kelasId)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Lihat Siswa
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setGradeForm((prev) => ({
                              ...prev,
                              subjectId: String(subject.id),
                            }));
                            setShowGradeDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Input Nilai
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAttendanceForm((prev) => ({
                              ...prev,
                              subjectId: String(subject.id),
                              kelasId: subject.kelasId
                                ? String(subject.kelasId)
                                : "",
                            }));
                            setShowAttendanceDialog(true);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Input Kehadiran
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Nilai Terkini ({subjectGrades.length})
                          </h4>
                          {subjectGrades.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewAllGrades(subject.id, subject.kelasId)
                              }
                            >
                              Lihat Semua
                            </Button>
                          )}
                        </div>
                        {subjectGrades.length > 0 ? (
                          <div className="space-y-2">
                            {subjectGrades.slice(-3).map((grade) => (
                              <div
                                key={grade.id}
                                className="flex justify-between items-center p-2 bg-muted/20 rounded"
                              >
                                <span className="text-sm">{grade.studentName}</span>
                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                  {grade.semesterLabel && (
                                    <Badge variant="outline" className="text-xs">
                                      {grade.semesterLabel}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {grade.jenis}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getGradeColor(grade.nilai)}`}
                                  >
                                    {grade.nilai}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {subjectGrades.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{subjectGrades.length - 3} nilai lainnya
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-xs">Belum ada nilai</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Kehadiran ({subjectAttendance.length})
                          </h4>
                          {subjectAttendance.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewAllAttendance(subject.id, subject.kelasId)
                              }
                            >
                              Lihat Semua
                            </Button>
                          )}
                        </div>
                        {subjectAttendance.length > 0 ? (
                          <div className="space-y-2">
                            {subjectAttendance.slice(-3).map((att) => (
                              <div
                                key={att.id}
                                className="flex justify-between items-center p-2 bg-muted/20 rounded"
                              >
                                <span className="text-sm">{att.studentName}</span>
                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                  {att.semesterLabel && (
                                    <Badge variant="outline" className="text-xs">
                                      {att.semesterLabel}
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      att.status === "hadir"
                                        ? "bg-green-100 text-green-800"
                                        : att.status === "sakit"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : att.status === "izin"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {att.status === "hadir"
                                      ? "Hadir"
                                      : att.status === "sakit"
                                      ? "Sakit"
                                      : att.status === "izin"
                                      ? "Izin"
                                      : "Alfa"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {subjectAttendance.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{subjectAttendance.length - 3} record lainnya
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <Calendar className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-xs">Belum ada kehadiran</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Belum ada mata pelajaran yang diampu
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="siswa">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Daftar Siswa yang Diajar</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex justify-between items-center p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{student.nama}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>NISN: {student.nisn}</span>
                          <span>Username: {student.username}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setGradeForm((prev) => ({
                            ...prev,
                            studentId: String(student.id),
                          }));
                          setShowGradeDialog(true);
                        }}
                      >
                        Input Nilai
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAttendanceForm((prev) => ({
                            ...prev,
                            studentId: String(student.id),
                          }));
                          setShowAttendanceDialog(true);
                        }}
                      >
                        Input Kehadiran
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada data siswa</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
