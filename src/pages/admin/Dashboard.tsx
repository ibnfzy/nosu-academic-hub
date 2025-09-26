import { useState, useEffect, useCallback } from "react";
import { AdminNavbar } from "@/components/AdminNavbar";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { useIsMobile } from "@/hooks/use-mobile";

// Import modular components
import UserManagement from "@/components/admin/UserManagement";
import SubjectManagement from "@/components/admin/SubjectManagement";
import ClassManagement from "@/components/admin/ClassManagement";
import SchoolProfileManagement from "@/components/admin/SchoolProfileManagement";

const AdminDashboard = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("siswa");

  // School management data
  const [schoolProfile, setSchoolProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [programs, setPrograms] = useState([]);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // apiService.forceInitializeData();
      const [
        usersData,
        studentsData,
        teachersData,
        subjectsData,
        classesData,
        schoolProfileData,
        achievementsData,
        programsData,
      ] = await Promise.all([
        apiService.getUsers(),
        apiService.getStudents(),
        apiService.getTeachers(),
        apiService.getSubjects(),
        apiService.getClasses(),
        apiService.getSchoolProfile(),
        apiService.getAchievements(),
        apiService.getPrograms(),
      ]);

      // Gabungkan data users dengan data siswa dan guru untuk menampilkan data lengkap
      const combinedUsers = usersData.map((user) => {
        if (user.role === "siswa") {
          const studentData = studentsData.find(
            (student) => student.userId === user.id
          );
          return { ...user, ...studentData };
        } else if (user.role === "guru" || user.role === "walikelas") {
          const teacherData = teachersData.find(
            (teacher) => teacher.userId === user.id
          );
          return { ...user, ...teacherData };
        }
        return user;
      });

      setUsers(combinedUsers);
      setSubjects(subjectsData);
      setClasses(classesData);
      setSchoolProfile(schoolProfileData);
      setAchievements(achievementsData);
      setPrograms(programsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <AdminNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Main Content */}
        <div className="space-y-6">
          {/* User Management Sections */}
          {(activeSection === "siswa" ||
            activeSection === "guru" ||
            activeSection === "walikelas" ||
            activeSection === "admin" ||
            activeSection === "semua") && (
            <UserManagement
              users={users}
              activeSection={activeSection}
              onDataChange={loadAdminData}
            />
          )}

          {/* Subject Management */}
          {activeSection === "subjects" && (
            <SubjectManagement onDataChange={loadAdminData} />
          )}

          {/* Class Management */}
          {activeSection === "classes" && (
            <ClassManagement onDataChange={loadAdminData} />
          )}

          {/* School Profile Management */}
          {activeSection === "school-profile" && (
            <SchoolProfileManagement onDataChange={loadAdminData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
