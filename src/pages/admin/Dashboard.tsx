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
import SemesterManagement from "@/components/admin/SemesterManagement";

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

      const mergedUserForms = mergeUserData(
        usersData,
        studentsData,
        teachersData
      );

      setUsers(mergedUserForms);
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

  const mergeUserData = (usersData, studentsData, teachersData) => {
    return usersData.map((user) => {
      const student = studentsData.find((s) => s.userId === user.id);
      const teacher = teachersData.find((t) => t.userId === user.id);

      return {
        id: user.id, // gunakan ID dari tabel users
        username: user.username || "",
        password: "",
        email: user.email || "",
        role: user.role || "",

        nama: user.nama || student?.nama || teacher?.nama || "",
        nisn: student?.nisn || "",
        nip: teacher?.nip || user.nip || "",
        kelasId: student?.kelasId || "",
        jenisKelamin: student?.jenisKelamin || teacher?.jenisKelamin || "",
        tanggalLahir: student?.tanggalLahir || "",
        alamat: student?.alamat || teacher?.alamat || "",
        nomorHP: student?.nomorHP || teacher?.nomorHP || "",
        namaOrangTua: student?.namaOrangTua || "",
        pekerjaanOrangTua: student?.pekerjaanOrangTua || "",
        tahunMasuk: student?.tahunMasuk || "",
      };
    });
  };

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

          {/* Semester Management */}
          {activeSection === "semesters" && (
            <SemesterManagement onDataChange={loadAdminData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
