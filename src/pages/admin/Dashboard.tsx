import { useState, useEffect } from "react";
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
  const [registrationLinks, setRegistrationLinks] = useState([]);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        usersData,
        subjectsData,
        classesData,
        schoolProfileData,
        achievementsData,
        programsData,
        registrationLinksData,
      ] = await Promise.all([
        apiService.getUsers(),
        apiService.getSubjects(),
        apiService.getClasses(),
        apiService.getSchoolProfile(),
        apiService.getAchievements(),
        apiService.getPrograms(),
        apiService.getRegistrationLinks(),
      ]);

      setUsers(usersData);
      setSubjects(subjectsData);
      setClasses(classesData);
      setSchoolProfile(schoolProfileData);
      setAchievements(achievementsData);
      setPrograms(programsData);
      setRegistrationLinks(registrationLinksData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <SubjectManagement
              subjects={subjects}
              classes={classes}
              onDataChange={loadAdminData}
            />
          )}

          {/* Class Management */}
          {activeSection === "classes" && (
            <ClassManagement
              classes={classes}
              users={users}
              onDataChange={loadAdminData}
            />
          )}

          {/* School Profile Management */}
          {activeSection === "school-profile" && (
            <SchoolProfileManagement
              schoolProfile={schoolProfile}
              onDataChange={loadAdminData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
