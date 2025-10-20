import { TeacherDashboardHeader } from "@/components/guru/TeacherDashboardHeader";
import { TeacherSemesterSelector } from "@/components/guru/TeacherSemesterSelector";
import { TeacherDashboardStats } from "@/components/guru/TeacherDashboardStats";
import { TeacherGradeDialog } from "@/components/guru/TeacherGradeDialog";
import { TeacherAttendanceDialog } from "@/components/guru/TeacherAttendanceDialog";
import { TeacherGradeTableDialog } from "@/components/guru/TeacherGradeTableDialog";
import { TeacherAttendanceTableDialog } from "@/components/guru/TeacherAttendanceTableDialog";
import { TeacherStudentListDialog } from "@/components/guru/TeacherStudentListDialog";
import { TeacherDashboardTabs } from "@/components/guru/TeacherDashboardTabs";
import { useDashboardSemester } from "@/hooks/use-dashboard-semester";
import {
  type TeacherDashboardUser,
  useTeacherDashboard,
} from "@/hooks/use-teacher-dashboard";

type TeacherDashboardProps = {
  currentUser: TeacherDashboardUser | null;
  onLogout: () => void;
};

const TeacherDashboard = ({ currentUser, onLogout }: TeacherDashboardProps) => {
  const dashboard = useTeacherDashboard(currentUser);
  const {
    subjects,
    students,
    grades,
    selectedSemesterId,
    setSelectedSemesterId,
    semesters,
  } = dashboard;

  const { buildSemesterLabel, getSemesterLabelById } = useDashboardSemester({
    semesters,
  });

  return (
    <div className="min-h-screen bg-background">
      <TeacherDashboardHeader currentUser={currentUser} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <TeacherSemesterSelector
          selectedSemesterId={selectedSemesterId}
          semesters={semesters}
          onSelect={(value) => setSelectedSemesterId(value)}
          getSemesterLabelById={getSemesterLabelById}
          buildSemesterLabel={buildSemesterLabel}
        />

        <div className="flex flex-wrap gap-4 mb-8">
          <TeacherGradeDialog
            dashboard={dashboard}
            buildSemesterLabel={buildSemesterLabel}
            getSemesterLabelById={getSemesterLabelById}
          />
          <TeacherAttendanceDialog
            dashboard={dashboard}
            buildSemesterLabel={buildSemesterLabel}
            getSemesterLabelById={getSemesterLabelById}
          />
        </div>

        <TeacherGradeTableDialog dashboard={dashboard} />
        <TeacherAttendanceTableDialog dashboard={dashboard} />
        <TeacherStudentListDialog dashboard={dashboard} />

        <TeacherDashboardStats
          subjectsCount={subjects.length}
          studentsCount={students.length}
          gradesCount={grades.length}
        />

        <TeacherDashboardTabs dashboard={dashboard} />
      </div>
    </div>
  );
};

export default TeacherDashboard;
