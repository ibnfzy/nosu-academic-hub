/**
 * Academic Information System API Service
 * SMA Negeri 1 Nosu - Sulawesi Barat
 *
 * Configuration service untuk switching antara localStorage dan REST API
 * Untuk prototype: USE_API = false (gunakan localStorage)
 * Untuk production: USE_API = true (gunakan REST API endpoints)
 */

import sampleData from "./localData.js";

const USE_API = false; // Set to true untuk menggunakan REST API

const API_BASE_URL = "http://localhost:3000/api"; // Ganti dengan URL backend

// LocalStorage Keys
const STORAGE_KEYS = {
  USERS: "akademik_users",
  STUDENTS: "akademik_students",
  TEACHERS: "akademik_teachers",
  CLASSES: "akademik_classes",
  SUBJECTS: "akademik_subjects",
  GRADES: "akademik_grades",
  ATTENDANCE: "akademik_attendance",
  CURRENT_USER: "akademik_current_user",
  ACADEMIC_YEARS: "akademik_years",
  SCHOOL_PROFILE: "akademik_school_profile",
  ACHIEVEMENTS: "akademik_achievements",
  PROGRAMS: "akademik_programs",
  REGISTRATION_LINKS: "akademik_registration_links",
};

// Generic API/localStorage abstraction
const apiService = {
  // ============= AUTHENTICATION =============
  getToken() {
    const user = this.getCurrentUser();
    return user?.token || null;
  },

  async authFetch(url, options = {}) {
    const token = this.getToken();
    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      // Token invalid/expired → logout otomatis
      this.logout();
      throw new Error("Unauthorized. Please login again.");
    }
    return response.json();
  },

  async login(username, password, role) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        // Simpan user info + token
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify({ ...data.user, token: data.token })
        );
      }

      return data;
    } else {
      // LocalStorage implementation
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      const user = users.find(
        (u) =>
          u.username === username && u.password === password && u.role === role
      );

      if (user) {
        const sessionUser = { ...user };
        delete sessionUser.password; // Remove password from session
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify(sessionUser)
        );
        return { success: true, user: sessionUser };
      }
      return { success: false, message: "Invalid credentials" };
    }
  },

  async logout() {
    if (USE_API) {
      await this.authFetch(`${API_BASE_URL}/auth/logout`, { method: "POST" });
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return { success: true };
  },

  getCurrentUser() {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || "null"
    );
  },

  // ============= SISWA ENDPOINTS =============
  async getStudentGrades(studentId, tahun, semester) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/siswa/${studentId}/nilai?tahun=${tahun}&semester=${semester}`
      );
      return await response.json();
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      return grades.filter(
        (g) =>
          g.studentId === studentId &&
          g.tahunAjaran === tahun &&
          g.semester === semester
      );
    }
  },

  async getStudentAttendance(studentId, tahun, semester) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/siswa/${studentId}/kehadiran?tahun=${tahun}&semester=${semester}`
      );
      return await response.json();
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      return attendance.filter(
        (a) =>
          a.studentId === studentId &&
          a.tahunAjaran === tahun &&
          a.semester === semester
      );
    }
  },

  async getStudentReport(studentId, tahun, semester) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/siswa/${studentId}/raport?tahun=${tahun}&semester=${semester}`
      );
      return await response.json();
    } else {
      const grades = await this.getStudentGrades(studentId, tahun, semester);
      const attendance = await this.getStudentAttendance(
        studentId,
        tahun,
        semester
      );
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const student = students.find((s) => s.id === studentId);
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const classes = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
      );
      let walikelas = null;

      if (student) {
        const kelas = classes.find((c) => c.id === student.kelasId);
        if (kelas) {
          // Prefer explicit walikelasId if exists; fallback: teacher with role walikelas and kelasId match
          const walikelasId = kelas.walikelasId;
          if (walikelasId) {
            walikelas = teachers.find((t) => t.id === walikelasId) || null;
          }
          if (!walikelas) {
            walikelas =
              teachers.find(
                (t) => t.role === "walikelas" && t.kelasId === kelas.id
              ) || null;
          }
        }
      }

      return {
        student,
        grades,
        attendance,
        tahunAjaran: tahun,
        semester,
        walikelas: walikelas
          ? { nama: walikelas.nama, nip: walikelas.nip }
          : null,
      };
    }
  },

  // ============= GURU ENDPOINTS =============
  async getTeacherSubjects(teacherId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/matapelajaran`
      );
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const teacher = teachers.find((t) => t.id === teacherId);
      return teacher ? teacher.mataPelajaran : [];
    }
  },

  async addGrade(teacherId, gradeData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/nilai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gradeData),
        }
      );
      return await response.json();
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      const newGrade = {
        id: Date.now().toString(),
        ...gradeData,
        createdAt: new Date().toISOString(),
      };
      grades.push(newGrade);
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
      return { success: true, data: newGrade };
    }
  },

  async addAttendance(teacherId, attendanceData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/kehadiran`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attendanceData),
        }
      );
      return await response.json();
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      const newAttendance = {
        id: Date.now().toString(),
        ...attendanceData,
        createdAt: new Date().toISOString(),
      };
      attendance.push(newAttendance);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
      return { success: true, data: newAttendance };
    }
  },

  // ============= ADMIN ENDPOINTS =============
  async getUsers() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/users`);
      return await response.json();
    } else {
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      return users.map((u) => ({ ...u, password: undefined })); // Don't expose passwords
    }
  },

  async createUser(userData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } else {
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return { success: true, data: { ...newUser, password: undefined } };
    }
  },

  async updateUser(userId, userData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );
      return await response.json();
    } else {
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          ...userData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return {
          success: true,
          data: { ...users[userIndex], password: undefined },
        };
      }
      return { success: false, message: "User not found" };
    }
  },

  async deleteUser(userId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      const filteredUsers = users.filter((u) => u.id !== userId);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
      return { success: true };
    }
  },

  async addUser(userData) {
    return this.createUser(userData); // Use existing createUser method
  },

  // ============= STUDENT MANAGEMENT =============
  async getStudents() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/students`);
      return await response.json();
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      return students;
    }
  },

  async createStudent(studentData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      return await response.json();
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      // Create user first
      const newUser = {
        id: Date.now().toString(),
        ...studentData.users,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);

      // Create student
      const newStudent = {
        id: (Date.now() + 1).toString(), // Different ID for student
        userId: newUser.id, // Foreign key to user
        ...studentData.students,
        createdAt: new Date().toISOString(),
      };
      students.push(newStudent);

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

      return {
        success: true,
        data: { ...newUser, ...newStudent, password: undefined },
      };
    }
  },

  async updateStudent(studentId, studentData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/students/${studentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentData),
        }
      );
      return await response.json();
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      const studentIndex = students.findIndex((s) => s.id === studentId);
      const student = students[studentIndex];

      if (studentIndex !== -1 && student) {
        const userIndex = users.findIndex((u) => u.id === student.userId);

        if (userIndex !== -1) {
          // Update user
          users[userIndex] = {
            ...users[userIndex],
            ...studentData.users,
            updatedAt: new Date().toISOString(),
          };
        }

        // Update student
        students[studentIndex] = {
          ...students[studentIndex],
          ...studentData.students,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

        return {
          success: true,
          data: {
            ...users[userIndex],
            ...students[studentIndex],
            password: undefined,
          },
        };
      }
      return { success: false, message: "Student not found" };
    }
  },

  async deleteStudent(studentId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/students/${studentId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      const student = students.find((s) => s.id === studentId);
      const filteredStudents = students.filter((s) => s.id !== studentId);
      const filteredUsers = users.filter(
        (u) => u.id !== (student?.userId || studentId)
      );

      localStorage.setItem(
        STORAGE_KEYS.STUDENTS,
        JSON.stringify(filteredStudents)
      );
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));

      return { success: true };
    }
  },

  // ============= TEACHER MANAGEMENT =============
  async getTeachers() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/teachers`);
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      return teachers;
    }
  },

  async createTeacher(teacherData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      });
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      // Create user first
      const newUser = {
        id: Date.now().toString(),
        ...teacherData.users,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);

      // Create teacher
      const newTeacher = {
        id: (Date.now() + 1).toString(), // Different ID for teacher
        userId: newUser.id, // Foreign key to user
        ...teacherData.teachers,
        createdAt: new Date().toISOString(),
      };
      teachers.push(newTeacher);

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));

      return {
        success: true,
        data: { ...newUser, ...newTeacher, password: undefined },
      };
    }
  },

  async updateTeacher(teacherId, teacherData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/teachers/${teacherId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teacherData),
        }
      );
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      const teacherIndex = teachers.findIndex((t) => t.id === teacherId);
      const teacher = teachers[teacherIndex];

      if (teacherIndex !== -1 && teacher) {
        const userIndex = users.findIndex((u) => u.id === teacher.userId);

        if (userIndex !== -1) {
          // Update user
          users[userIndex] = {
            ...users[userIndex],
            ...teacherData.users,
            updatedAt: new Date().toISOString(),
          };
        }

        // Update teacher
        teachers[teacherIndex] = {
          ...teachers[teacherIndex],
          ...teacherData.teachers,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));

        return {
          success: true,
          data: {
            ...users[userIndex],
            ...teachers[teacherIndex],
            password: undefined,
          },
        };
      }
      return { success: false, message: "Teacher not found" };
    }
  },

  async deleteTeacher(teacherId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/teachers/${teacherId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      const teacher = teachers.find((t) => t.id === teacherId);
      const filteredTeachers = teachers.filter((t) => t.id !== teacherId);
      const filteredUsers = users.filter(
        (u) => u.id !== (teacher?.userId || teacherId)
      );

      localStorage.setItem(
        STORAGE_KEYS.TEACHERS,
        JSON.stringify(filteredTeachers)
      );
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));

      return { success: true };
    }
  },

  // ============= WALIKELAS MANAGEMENT =============
  async getWalikelas() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/walikelas`);
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      return teachers.filter((t) => t.role === "walikelas");
    }
  },

  async createWalikelas(walikelasData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/walikelas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walikelasData),
      });
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      // Create user first
      const newUser = {
        id: Date.now().toString(),
        ...walikelasData.users,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);

      // Create walikelas (stored as teacher with role walikelas)
      const newWalikelas = {
        id: (Date.now() + 1).toString(), // Different ID for walikelas
        userId: newUser.id, // Foreign key to user
        ...walikelasData.teachers,
        createdAt: new Date().toISOString(),
      };
      teachers.push(newWalikelas);

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));

      return {
        success: true,
        data: { ...newUser, ...newWalikelas, password: undefined },
      };
    }
  },

  async updateWalikelas(walikelasId, walikelasData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/walikelas/${walikelasId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(walikelasData),
        }
      );
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      const teacherIndex = teachers.findIndex((t) => t.id === walikelasId);
      const teacher = teachers[teacherIndex];

      if (teacherIndex !== -1 && teacher) {
        const userIndex = users.findIndex((u) => u.id === teacher.userId);

        if (userIndex !== -1) {
          // Update user
          users[userIndex] = {
            ...users[userIndex],
            ...walikelasData.users,
            updatedAt: new Date().toISOString(),
          };
        }

        // Update walikelas
        teachers[teacherIndex] = {
          ...teachers[teacherIndex],
          ...walikelasData.teachers,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));

        return {
          success: true,
          data: {
            ...users[userIndex],
            ...teachers[teacherIndex],
            password: undefined,
          },
        };
      }
      return { success: false, message: "Walikelas not found" };
    }
  },

  async deleteWalikelas(walikelasId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/walikelas/${walikelasId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      const teacher = teachers.find((t) => t.id === walikelasId);
      const filteredTeachers = teachers.filter((t) => t.id !== walikelasId);
      const filteredUsers = users.filter(
        (u) => u.id !== (teacher?.userId || walikelasId)
      );

      localStorage.setItem(
        STORAGE_KEYS.TEACHERS,
        JSON.stringify(filteredTeachers)
      );
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));

      return { success: true };
    }
  },

  // ============= ADMIN METHODS =============

  async getSubjects() {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/matapelajaran`
      );
      return await response.json();
    } else {
      const subjects = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SUBJECTS) || "[]"
      );
      return subjects;
    }
  },

  async addSubject(subjectData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/matapelajaran`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subjectData),
        }
      );
      return await response.json();
    } else {
      const subjects = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SUBJECTS) || "[]"
      );
      const newSubject = {
        ...subjectData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      subjects.push(newSubject);
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
      return { success: true, data: newSubject };
    }
  },

  async updateSubject(subjectId, subjectData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/matapelajaran/${subjectId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subjectData),
        }
      );
      return await response.json();
    } else {
      const subjects = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SUBJECTS) || "[]"
      );
      const subjectIndex = subjects.findIndex((s) => s.id === subjectId);

      if (subjectIndex !== -1) {
        subjects[subjectIndex] = {
          ...subjects[subjectIndex],
          ...subjectData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
        return { success: true, data: subjects[subjectIndex] };
      }
      return { success: false, message: "Subject not found" };
    }
  },

  async deleteSubject(subjectId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/matapelajaran/${subjectId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const subjects = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SUBJECTS) || "[]"
      );
      const filteredSubjects = subjects.filter((s) => s.id !== subjectId);
      localStorage.setItem(
        STORAGE_KEYS.SUBJECTS,
        JSON.stringify(filteredSubjects)
      );
      return { success: true };
    }
  },

  async getClasses() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/kelas`);
      return await response.json();
    } else {
      const classes = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
      );
      return classes;
    }
  },

  async addClass(classData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/kelas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
      });
      return await response.json();
    } else {
      const classes = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
      );
      const newClass = {
        ...classData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      classes.push(newClass);
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      return { success: true, data: newClass };
    }
  },

  async updateClass(classId, classData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/kelas/${classId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(classData),
        }
      );
      return await response.json();
    } else {
      const classes = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
      );
      const classIndex = classes.findIndex((c) => c.id === classId);

      if (classIndex !== -1) {
        classes[classIndex] = {
          ...classes[classIndex],
          ...classData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
        return { success: true, data: classes[classIndex] };
      }
      return { success: false, message: "Class not found" };
    }
  },

  async deleteClass(classId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/kelas/${classId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const classes = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
      );
      const filteredClasses = classes.filter((c) => c.id !== classId);
      localStorage.setItem(
        STORAGE_KEYS.CLASSES,
        JSON.stringify(filteredClasses)
      );
      return { success: true };
    }
  },

  // ============= WALIKELAS METHODS =============
  async getClassStudents(walikelasId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/walikelas/${walikelasId}/kelas/siswa`
      );
      return await response.json();
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      return students.filter((s) => s.kelasId === "1"); // Assuming walikelas manages kelas 1
    }
  },

  async getClassGrades(walikelasId, tahun, semester) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/walikelas/${walikelasId}/kelas/nilai?tahun=${tahun}&semester=${semester}`
      );
      return await response.json();
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      return grades.filter(
        (g) => g.tahunAjaran === tahun && g.semester === semester
      );
    }
  },

  async getClassAttendance(walikelasId, tahun, semester) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/walikelas/${walikelasId}/kelas/kehadiran?tahun=${tahun}&semester=${semester}`
      );
      return await response.json();
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      return attendance.filter(
        (a) => a.tahunAjaran === tahun && a.semester === semester
      );
    }
  },

  async addClassStudent(walikelasId, studentData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/walikelas/${walikelasId}/kelas/siswa`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentData),
        }
      );
      return await response.json();
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const newStudent = {
        ...studentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      students.push(newStudent);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

      // Also add to users
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      users.push(newStudent);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      return { success: true, data: { ...newStudent, password: undefined } };
    }
  },

  async updateClassStudent(walikelasId, studentId, studentData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/walikelas/${walikelasId}/kelas/siswa/${studentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentData),
        }
      );
      return await response.json();
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const studentIndex = students.findIndex((s) => s.id === studentId);
      if (studentIndex !== -1) {
        students[studentIndex] = {
          ...students[studentIndex],
          ...studentData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

        // Update in users too
        const users = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
        );
        const userIndex = users.findIndex((u) => u.id === studentId);
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            ...studentData,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        return {
          success: true,
          data: { ...students[studentIndex], password: undefined },
        };
      }
      return { success: false, message: "Student not found" };
    }
  },

  async deleteClassStudent(walikelasId, studentId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/walikelas/${walikelasId}/kelas/siswa/${studentId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const filteredStudents = students.filter((s) => s.id !== studentId);
      localStorage.setItem(
        STORAGE_KEYS.STUDENTS,
        JSON.stringify(filteredStudents)
      );

      // Delete from users too
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      const filteredUsers = users.filter((u) => u.id !== studentId);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));

      return { success: true };
    }
  },

  async verifyGrade(walikelasId, gradeId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/walikelas/${walikelasId}/verifikasi/${gradeId}`,
        {
          method: "PUT",
        }
      );
      return await response.json();
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      const gradeIndex = grades.findIndex((g) => g.id === gradeId);
      if (gradeIndex !== -1) {
        grades[gradeIndex].verified = true;
        grades[gradeIndex].verifiedBy = walikelasId;
        grades[gradeIndex].verifiedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
        return { success: true, data: grades[gradeIndex] };
      }
      return { success: false, message: "Grade not found" };
    }
  },

  // ============= SCHOOL PROFILE METHODS =============
  async getSchoolProfile() {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/school-profile`
      );
      return await response.json();
    } else {
      const profile = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE) || "null"
      );
      return profile;
    }
  },

  async updateSchoolProfile(profileData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/school-profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData),
        }
      );
      return await response.json();
    } else {
      const profile = {
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        STORAGE_KEYS.SCHOOL_PROFILE,
        JSON.stringify(profile)
      );
      return { success: true, data: profile };
    }
  },

  async getAchievements() {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/achievements`
      );
      return await response.json();
    } else {
      const achievements = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || "[]"
      );
      return achievements;
    }
  },

  async addAchievement(achievementData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/achievements`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(achievementData),
        }
      );
      return await response.json();
    } else {
      const achievements = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || "[]"
      );
      const newAchievement = {
        id: Date.now().toString(),
        ...achievementData,
        createdAt: new Date().toISOString(),
      };
      achievements.push(newAchievement);
      localStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(achievements)
      );
      return { success: true, data: newAchievement };
    }
  },

  async updateAchievement(achievementId, achievementData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/achievements/${achievementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(achievementData),
        }
      );
      return await response.json();
    } else {
      const achievements = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || "[]"
      );
      const achievementIndex = achievements.findIndex(
        (a) => a.id === achievementId
      );

      if (achievementIndex !== -1) {
        achievements[achievementIndex] = {
          ...achievements[achievementIndex],
          ...achievementData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          STORAGE_KEYS.ACHIEVEMENTS,
          JSON.stringify(achievements)
        );
        return { success: true, data: achievements[achievementIndex] };
      }
      return { success: false, message: "Achievement not found" };
    }
  },

  async deleteAchievement(achievementId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/achievements/${achievementId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const achievements = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || "[]"
      );
      const filtered = achievements.filter((a) => a.id !== achievementId);
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(filtered));
      return { success: true };
    }
  },

  async getPrograms() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/programs`);
      return await response.json();
    } else {
      const programs = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PROGRAMS) || "[]"
      );
      return programs;
    }
  },

  async addProgram(programData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(programData),
      });
      return await response.json();
    } else {
      const programs = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PROGRAMS) || "[]"
      );
      const newProgram = {
        id: Date.now().toString(),
        ...programData,
        createdAt: new Date().toISOString(),
      };
      programs.push(newProgram);
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
      return { success: true, data: newProgram };
    }
  },

  async updateProgram(programId, programData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/programs/${programId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(programData),
        }
      );
      return await response.json();
    } else {
      const programs = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PROGRAMS) || "[]"
      );
      const programIndex = programs.findIndex((p) => p.id === programId);

      if (programIndex !== -1) {
        programs[programIndex] = {
          ...programs[programIndex],
          ...programData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
        return { success: true, data: programs[programIndex] };
      }
      return { success: false, message: "Program not found" };
    }
  },

  async deleteProgram(programId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/programs/${programId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const programs = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PROGRAMS) || "[]"
      );
      const filtered = programs.filter((p) => p.id !== programId);
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(filtered));
      return { success: true };
    }
  },

  async getRegistrationLinks() {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/registration-links`
      );
      return await response.json();
    } else {
      const registrationLinks = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.REGISTRATION_LINKS) || "[]"
      );
      return registrationLinks;
    }
  },

  async addRegistrationLink(linkData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/registration-links`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(linkData),
        }
      );
      return await response.json();
    } else {
      const registrationLinks = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.REGISTRATION_LINKS) || "[]"
      );
      const newLink = {
        id: Date.now().toString(),
        ...linkData,
        status: "Aktif", // Default status
        createdAt: new Date().toISOString(),
      };
      registrationLinks.push(newLink);
      localStorage.setItem(
        STORAGE_KEYS.REGISTRATION_LINKS,
        JSON.stringify(registrationLinks)
      );
      return { success: true, data: newLink };
    }
  },

  async updateRegistrationLink(linkId, linkData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/registration-links/${linkId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(linkData),
        }
      );
      return await response.json();
    } else {
      const registrationLinks = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.REGISTRATION_LINKS) || "[]"
      );
      const linkIndex = registrationLinks.findIndex(
        (link) => link.id === linkId
      );

      if (linkIndex !== -1) {
        registrationLinks[linkIndex] = {
          ...registrationLinks[linkIndex],
          ...linkData,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          STORAGE_KEYS.REGISTRATION_LINKS,
          JSON.stringify(registrationLinks)
        );
        return { success: true, data: registrationLinks[linkIndex] };
      }
      return { success: false, message: "Registration link not found" };
    }
  },

  async deleteRegistrationLink(linkId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/admin/registration-links/${linkId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } else {
      const registrationLinks = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.REGISTRATION_LINKS) || "[]"
      );
      const filtered = registrationLinks.filter((l) => l.id !== linkId);
      localStorage.setItem(
        STORAGE_KEYS.REGISTRATION_LINKS,
        JSON.stringify(filtered)
      );
      return { success: true };
    }
  },

  // ============= UTILITY METHODS =============
  initializeData() {
    // Initialize with sample data if localStorage is empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.loadSampleData();
    }
  },

  // Force reload sample data (for development/testing)
  forceInitializeData() {
    this.loadSampleData();
  },

  loadSampleData() {
    // Load all sample data into localStorage
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sampleData.users));
    localStorage.setItem(
      STORAGE_KEYS.STUDENTS,
      JSON.stringify(sampleData.students)
    );
    localStorage.setItem(
      STORAGE_KEYS.TEACHERS,
      JSON.stringify(sampleData.teachers)
    );
    localStorage.setItem(
      STORAGE_KEYS.CLASSES,
      JSON.stringify(sampleData.classes)
    );
    localStorage.setItem(
      STORAGE_KEYS.SUBJECTS,
      JSON.stringify(sampleData.subjects)
    );
    localStorage.setItem(
      STORAGE_KEYS.GRADES,
      JSON.stringify(sampleData.grades)
    );
    localStorage.setItem(
      STORAGE_KEYS.ATTENDANCE,
      JSON.stringify(sampleData.attendance)
    );
    localStorage.setItem(
      STORAGE_KEYS.ACADEMIC_YEARS,
      JSON.stringify(sampleData.academicYears)
    );

    // Initialize school profile, achievements, programs, and registration links
    localStorage.setItem(
      STORAGE_KEYS.SCHOOL_PROFILE,
      JSON.stringify(sampleData.schoolProfile)
    );
    localStorage.setItem(
      STORAGE_KEYS.ACHIEVEMENTS,
      JSON.stringify(sampleData.achievements)
    );
    localStorage.setItem(
      STORAGE_KEYS.PROGRAMS,
      JSON.stringify(sampleData.programs)
    );
    localStorage.setItem(
      STORAGE_KEYS.REGISTRATION_LINKS,
      JSON.stringify(sampleData.registrationLinks)
    );
  },
};

export default apiService;
export { STORAGE_KEYS, USE_API, API_BASE_URL };
