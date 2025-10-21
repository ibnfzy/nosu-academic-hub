import { useMemo } from "react";
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
import { formatDate, getStudyDayNumber } from "@/utils/helpers";

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

  const {
    buildSemesterLabel,
    getSemesterLabelById,
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
  } = useDashboardSemester({
    semesters,
  });

  const activeSemesterMetadata = useMemo(() => {
    if (selectedSemesterId) {
      const resolved = resolveSemesterMetadata(selectedSemesterId);
      if (resolved) {
        return resolved;
      }
    }

    for (const record of semesters) {
      const metadata = normalizeSemesterMetadata(record);
      if (metadata?.isActive) {
        return metadata;
      }
    }

    if (semesters.length > 0) {
      return normalizeSemesterMetadata(semesters[0]);
    }

    return null;
  }, [
    normalizeSemesterMetadata,
    resolveSemesterMetadata,
    selectedSemesterId,
    semesters,
  ]);

  const todayLabel = useMemo(() => formatDate(new Date()), []);

  const currentTeachingDay = useMemo(() => {
    if (!activeSemesterMetadata) return null;
    return (
      getStudyDayNumber(new Date(), {
        semesterMetadata: activeSemesterMetadata,
      }) ?? null
    );
  }, [activeSemesterMetadata]);

  const totalTeachingDays = useMemo(() => {
    if (!activeSemesterMetadata) return null;
    const raw = activeSemesterMetadata.jumlahHariBelajar;

    if (raw === null || raw === undefined) return null;

    if (typeof raw === "number") {
      return Number.isFinite(raw) && raw > 0 ? raw : null;
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      const numericPortion = Number(trimmed.replace(/[^0-9.,-]/g, "").replace(/,/g, "."));
      if (!Number.isNaN(numericPortion) && numericPortion > 0) {
        return Math.round(numericPortion);
      }
    }

    return null;
  }, [activeSemesterMetadata]);

  const teachingDayMessage = useMemo(() => {
    if (!activeSemesterMetadata) {
      return null;
    }

    if (currentTeachingDay && totalTeachingDays) {
      return `Sekarang hari ke ${currentTeachingDay} dari ${totalTeachingDays} hari mengajar.`;
    }

    if (currentTeachingDay) {
      return `Sekarang hari ke ${currentTeachingDay} dalam kalender mengajar.`;
    }

    if (totalTeachingDays) {
      return `Semester ini memiliki ${totalTeachingDays} hari mengajar.`;
    }

    return null;
  }, [activeSemesterMetadata, currentTeachingDay, totalTeachingDays]);

  return (
    <div className="min-h-screen bg-background">
      <TeacherDashboardHeader
        currentUser={currentUser}
        onLogout={onLogout}
        teachingDayDateLabel={todayLabel}
        teachingDayMessage={teachingDayMessage}
      />

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
