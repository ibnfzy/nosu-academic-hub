/**
 * Academic Information System API Service
 * SMA Negeri 1 Nosu - Sulawesi Barat
 *
 * Configuration service untuk switching antara localStorage dan REST API
 * Untuk prototype: USE_API = false (gunakan localStorage)
 * Untuk production: USE_API = true (gunakan REST API endpoints)
 */

import sampleData from "./localData.js";
import { normalizeData } from "../utils/helpers.js";

const USE_API = true; // Set to true untuk menggunakan REST API

const API_BASE_URL = "https://wirnaapi.jultapp.site"; // Ganti dengan URL backend

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
};

const buildSemesterQueryString = ({ semesterId, tahun, semester }) => {
  if (semesterId) {
    return `semesterId=${encodeURIComponent(semesterId)}`;
  }

  const params = [];

  if (tahun !== undefined && tahun !== null && tahun !== "") {
    params.push(`tahun=${encodeURIComponent(tahun)}`);
  }

  if (semester !== undefined && semester !== null && semester !== "") {
    params.push(`semester=${encodeURIComponent(semester)}`);
  }

  return params.join("&");
};

const appendQuery = (baseUrl, queryString) => {
  if (!queryString) return baseUrl;
  return `${baseUrl}?${queryString}`;
};

const findLocalSemesterRecord = (semesterId, tahun, semester) => {
  const semesters = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS) || "[]"
  );

  if (semesterId) {
    const matched = semesters.find(
      (item) => `${item.id}` === `${semesterId}`
    );
    if (matched) {
      return matched;
    }
  }

  if (tahun && (semester || semester === 0)) {
    return semesters.find(
      (item) => item.tahun === tahun && `${item.semester}` === `${semester}`
    );
  }

  return null;
};

const resolveLocalSemesterInfo = (semesterId, tahun, semester) => {
  const record = findLocalSemesterRecord(semesterId, tahun, semester);

  if (!record) {
    return {
      tahunAjaran: tahun ?? null,
      semester: semester ?? null,
      record: null,
    };
  }

  return {
    tahunAjaran: record.tahun ?? tahun ?? null,
    semester: record.semester ?? semester ?? null,
    record,
  };
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

    let result;
    if (typeof response.json === "function") {
      result = await response.json();
    } else {
      result = response;
    }

    // if (response.status === 401 || result.success === false) {
    //   // simpan pesan sementara
    //   localStorage.setItem(
    //     "sessionMessage",
    //     result.message || "Sesi Anda sudah habis, silakan login kembali."
    //   );

    //   this.logout(); // hapus token, data user, dll

    //   // arahkan ke login
    //   window.location.href = "/";
    //   return; // pastikan berhenti
    // }

    return result;
  },

  async login(username, password, role) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const result = await response.json();

      let data = result.data;

      if (data?.token) {
        // Simpan user info + token
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify({ ...data.user, token: data.token })
        );
      }

      return result;
    } else {
      // LocalStorage implementation
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const classes = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
      );

      const user = users.find(
        (u) =>
          u.username === username && u.password === password && u.role === role
      );

      if (user) {
        const sessionUser = { ...user };
        delete sessionUser.password; // Remove password from session

        // Tambahkan studentId / teacherId sesuai role
        if (role === "siswa") {
          const student = students.find((s) => s.userId === user.id);
          if (student) {
            sessionUser.studentId = student.id;
            sessionUser.kelasId = student.kelasId;
            sessionUser.nisn = student.nisn;
          }
        } else if (role === "guru" || role === "walikelas") {
          const teacher = teachers.find((t) => t.userId === user.id);
          const classe = classes.find((c) => c.walikelasId === teacher.id);

          if (teacher) {
            sessionUser.teacherId = teacher.id;
            sessionUser.nip = teacher.nip;
          }

          if (role === "walikelas") {
            sessionUser.kelasId = classe.id || null;
          }
        }

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
  async getStudentGrades(studentId, tahun, semester, semesterId = null) {
    if (USE_API) {
      const query = buildSemesterQueryString({ semesterId, tahun, semester });
      const response = await this.authFetch(
        appendQuery(
          `${API_BASE_URL}/siswa/${studentId}/nilai`,
          query
        )
      );
      return normalizeData(response.data);
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
        semesterId,
        tahun,
        semester
      );
      return grades.filter((g) => {
        if (g.studentId !== studentId) return false;
        const matchTahun =
          !tahunAjaran || g.tahunAjaran === tahunAjaran || g.tahun === tahunAjaran;
        const matchSemester =
          semesterNumber === null || semesterNumber === undefined
            ? true
            : `${g.semester}` === `${semesterNumber}`;
        return matchTahun && matchSemester;
      });
    }
  },

  async getStudentAttendance(
    studentId,
    tahun,
    semester,
    semesterId = null
  ) {
    if (USE_API) {
      const query = buildSemesterQueryString({ semesterId, tahun, semester });
      const response = await this.authFetch(
        appendQuery(
          `${API_BASE_URL}/siswa/${studentId}/kehadiran`,
          query
        )
      );
      return normalizeData(response.data);
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
        semesterId,
        tahun,
        semester
      );
      return attendance.filter((a) => {
        if (a.studentId !== studentId) return false;
        const matchTahun =
          !tahunAjaran || a.tahunAjaran === tahunAjaran || a.tahun === tahunAjaran;
        const matchSemester =
          semesterNumber === null || semesterNumber === undefined
            ? true
            : `${a.semester}` === `${semesterNumber}`;
        return matchTahun && matchSemester;
      });
    }
  },

  async getStudentReport(studentId, tahun, semester, semesterId = null) {
    if (USE_API) {
      const query = buildSemesterQueryString({ semesterId, tahun, semester });
      const response = await this.authFetch(
        appendQuery(
          `${API_BASE_URL}/siswa/${studentId}/raport`,
          query
        )
      );
      return response.data;
    } else {
      const { tahunAjaran, semester: semesterNumber, record } =
        resolveLocalSemesterInfo(semesterId, tahun, semester);
      const grades = await this.getStudentGrades(
        studentId,
        tahunAjaran,
        semesterNumber,
        semesterId
      );
      const attendance = await this.getStudentAttendance(
        studentId,
        tahunAjaran,
        semesterNumber,
        semesterId
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
      const profileSchool = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE) || "[]"
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
        tahunAjaran: tahunAjaran,
        semester: semesterNumber,
        semesterId: semesterId ?? record?.id ?? null,
        semesterInfo: record
          ? {
              id: record.id,
              tahunAjaran: record.tahun,
              semester: record.semester,
              startDate: record.startDate,
              endDate: record.endDate,
              isActive: record.isActive,
            }
          : null,
        walikelas: walikelas
          ? { nama: walikelas.nama, nip: walikelas.nip }
          : null,
        profileSchool,
      };
    }
  },

  // ============= GURU ENDPOINTS =============
  async getTeacherSubjects(teacherId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/matapelajaran`
      );
      return normalizeData(response.data);
    } else {
      const subjects = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SUBJECTS) || "[]"
      );
      // Ambil semua mapel yang diajar guru ini
      return subjects.filter((s) => s.teacherId === teacherId);
    }
  },

  async getGrades(semesterId = null, tahun = null, semester = null) {
    if (USE_API) {
      const query = buildSemesterQueryString({ semesterId, tahun, semester });
      const response = await this.authFetch(
        appendQuery(`${API_BASE_URL}/guru/grades`, query)
      );
      if (response?.success === false) {
        const error = new Error(
          response?.message || "Gagal memuat data nilai"
        );
        error.code = response?.code;
        throw error;
      }
      return normalizeData(response.data);
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      if (!semesterId && !tahun && (semester === null || semester === undefined)) {
        return grades;
      }
      const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
        semesterId,
        tahun,
        semester
      );
      return grades.filter((g) => {
        const matchTahun =
          !tahunAjaran || g.tahunAjaran === tahunAjaran || g.tahun === tahunAjaran;
        const matchSemester =
          semesterNumber === null || semesterNumber === undefined
            ? true
            : `${g.semester}` === `${semesterNumber}`;
        return matchTahun && matchSemester;
      });
    }
  },

  async getAttendance(semesterId = null, tahun = null, semester = null) {
    if (USE_API) {
      const query = buildSemesterQueryString({ semesterId, tahun, semester });
      const response = await this.authFetch(
        appendQuery(`${API_BASE_URL}/guru/attendance`, query)
      );
      if (response?.success === false) {
        const error = new Error(
          response?.message || "Gagal memuat data kehadiran"
        );
        error.code = response?.code;
        throw error;
      }
      return normalizeData(response.data);
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      if (!semesterId && !tahun && (semester === null || semester === undefined)) {
        return attendance;
      }
      const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
        semesterId,
        tahun,
        semester
      );
      return attendance.filter((a) => {
        const matchTahun =
          !tahunAjaran || a.tahunAjaran === tahunAjaran || a.tahun === tahunAjaran;
        const matchSemester =
          semesterNumber === null || semesterNumber === undefined
            ? true
            : `${a.semester}` === `${semesterNumber}`;
        return matchTahun && matchSemester;
      });
    }
  },

  async addGrade(teacherId, gradeData, semesterId = null) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/nilai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...gradeData,
            semesterId: semesterId ?? gradeData?.semesterId ?? null,
          }),
        }
      );
      return response.data;
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
        semesterId,
        gradeData?.tahunAjaran ?? gradeData?.tahun ?? null,
        gradeData?.semester ?? null
      );
      const newGrade = {
        id: Date.now().toString(),
        ...gradeData,
        semesterId: semesterId ?? gradeData?.semesterId ?? null,
        createdAt: new Date().toISOString(),
      };
      if (tahunAjaran && !newGrade.tahunAjaran) {
        newGrade.tahunAjaran = tahunAjaran;
      }
      if (
        semesterNumber !== undefined &&
        semesterNumber !== null &&
        (newGrade.semester === undefined || newGrade.semester === null)
      ) {
        newGrade.semester = semesterNumber;
      }
      grades.push(newGrade);
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
      return { success: true, data: newGrade };
    }
  },

  async addAttendance(teacherId, attendanceData, semesterId = null) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/kehadiran`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...attendanceData,
            semesterId: semesterId ?? attendanceData?.semesterId ?? null,
          }),
        }
      );
      return response.data;
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
        semesterId,
        attendanceData?.tahunAjaran ?? attendanceData?.tahun ?? null,
        attendanceData?.semester ?? null
      );
      const newAttendance = {
        id: Date.now().toString(),
        ...attendanceData,
        semesterId: semesterId ?? attendanceData?.semesterId ?? null,
        createdAt: new Date().toISOString(),
      };
      if (tahunAjaran && !newAttendance.tahunAjaran) {
        newAttendance.tahunAjaran = tahunAjaran;
      }
      if (
        semesterNumber !== undefined &&
        semesterNumber !== null &&
        (newAttendance.semester === undefined || newAttendance.semester === null)
      ) {
        newAttendance.semester = semesterNumber;
      }
      attendance.push(newAttendance);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
      return { success: true, data: newAttendance };
    }
  },

  async editGrade(teacherId, gradeData, semesterId = null) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/nilai/${gradeData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...gradeData,
            semesterId: semesterId ?? gradeData?.semesterId ?? null,
          }),
        }
      );
      return response.data;
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      const idx = grades.findIndex((g) => g.id === gradeData.id);

      if (idx !== -1) {
        const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
          semesterId,
          gradeData?.tahunAjaran ?? grades[idx]?.tahunAjaran ?? grades[idx]?.tahun ?? null,
          gradeData?.semester ?? grades[idx]?.semester ?? null
        );
        grades[idx] = {
          ...grades[idx],
          ...gradeData,
          semesterId: semesterId ?? gradeData?.semesterId ?? grades[idx].semesterId ?? null,
          updatedAt: new Date().toISOString(),
        };
        if (tahunAjaran && !grades[idx].tahunAjaran) {
          grades[idx].tahunAjaran = tahunAjaran;
        }
        if (
          semesterNumber !== undefined &&
          semesterNumber !== null &&
          (grades[idx].semester === undefined || grades[idx].semester === null)
        ) {
          grades[idx].semester = semesterNumber;
        }
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
        return { success: true, data: grades[idx] };
      }
      return { success: false, message: "Grade not found" };
    }
  },

  async deleteGrade(teacherId, gradeId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/nilai/${gradeId}`,
        { method: "DELETE" }
      );
      return response.data;
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      const updated = grades.filter((g) => g.id !== gradeId);
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(updated));
      return { success: true };
    }
  },

  // EDIT ATTENDANCE
  async editAttendance(teacherId, attendanceData, semesterId = null) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/kehadiran/${attendanceData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...attendanceData,
            semesterId: semesterId ?? attendanceData?.semesterId ?? null,
          }),
        }
      );
      return response.data;
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      const idx = attendance.findIndex((a) => a.id === attendanceData.id);

      if (idx !== -1) {
        const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
          semesterId,
          attendanceData?.tahunAjaran ?? attendance[idx]?.tahunAjaran ?? attendance[idx]?.tahun ?? null,
          attendanceData?.semester ?? attendance[idx]?.semester ?? null
        );
        attendance[idx] = {
          ...attendance[idx],
          ...attendanceData,
          semesterId:
            semesterId ?? attendanceData?.semesterId ?? attendance[idx].semesterId ?? null,
          updatedAt: new Date().toISOString(),
        };
        if (tahunAjaran && !attendance[idx].tahunAjaran) {
          attendance[idx].tahunAjaran = tahunAjaran;
        }
        if (
          semesterNumber !== undefined &&
          semesterNumber !== null &&
          (attendance[idx].semester === undefined || attendance[idx].semester === null)
        ) {
          attendance[idx].semester = semesterNumber;
        }
        localStorage.setItem(
          STORAGE_KEYS.ATTENDANCE,
          JSON.stringify(attendance)
        );
        return { success: true, data: attendance[idx] };
      }
      return { success: false, message: "Attendance not found" };
    }
  },

  async deleteAttendance(teacherId, attendanceId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/guru/${teacherId}/kehadiran/${attendanceId}`,
        { method: "DELETE" }
      );
      return response.data;
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      const updated = attendance.filter((a) => a.id !== attendanceId);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
      return { success: true };
    }
  },

  // ============= ADMIN ENDPOINTS =============
  async getUsers() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/users`);
      return normalizeData(response.data);
    } else {
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );

      return users.map((u) => {
        let extraData = {};

        if (u.role === "siswa") {
          const student = students.find((s) => s.userId === u.id);
          extraData = {
            nama: student?.nama || u.username,
            nisn: student?.nisn || null,
            kelasId: student?.kelasId || null,
          };
        } else if (u.role === "guru" || u.role === "walikelas") {
          const teacher = teachers.find((t) => t.userId === u.id);
          extraData = {
            nama: teacher?.nama || u.username,
            nip: teacher?.nip || null,
            kelasId: teacher?.kelasId || null,
          };
        } else if (u.role === "admin") {
          extraData = {
            nama: "-", // admin tidak punya nama guru/siswa
          };
        }

        return {
          ...u,
          ...extraData,
          password: undefined, // jangan expose password
        };
      });
    }
  },

  async createUser(userData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return normalizeData(response.data);
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return normalizeData(response.data);
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
      return response.data;
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
      return response.data;
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
      return response.data;
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

  // ============= SEMESTER MANAGEMENT =============
  async getSemesters() {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/api/admin/semesters`
      );
      return normalizeData(response.data);
    } else {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS) || "[]"
      );
    }
  },

  async createSemester(semesterData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/api/admin/semesters`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(semesterData),
        }
      );
      return response.data;
    } else {
      const semesters = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS) || "[]"
      );
      const newSemester = {
        id: semesterData.id || Date.now().toString(),
        ...semesterData,
        createdAt: new Date().toISOString(),
      };
      semesters.push(newSemester);
      localStorage.setItem(
        STORAGE_KEYS.ACADEMIC_YEARS,
        JSON.stringify(semesters)
      );
      return { success: true, data: newSemester };
    }
  },

  async updateSemester(semesterId, semesterData) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/api/admin/semesters/${semesterId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(semesterData),
        }
      );
      return response.data;
    } else {
      const semesters = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS) || "[]"
      );
      const semesterIndex = semesters.findIndex(
        (item) => `${item.id}` === `${semesterId}`
      );

      if (semesterIndex === -1) {
        return { success: false, message: "Semester not found" };
      }

      semesters[semesterIndex] = {
        ...semesters[semesterIndex],
        ...semesterData,
        id: semesters[semesterIndex].id,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        STORAGE_KEYS.ACADEMIC_YEARS,
        JSON.stringify(semesters)
      );

      return { success: true, data: semesters[semesterIndex] };
    }
  },

  async deleteSemester(semesterId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/api/admin/semesters/${semesterId}`,
        {
          method: "DELETE",
        }
      );
      return response.data;
    } else {
      const semesters = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS) || "[]"
      );
      const filtered = semesters.filter((item) => `${item.id}` !== `${semesterId}`);

      localStorage.setItem(
        STORAGE_KEYS.ACADEMIC_YEARS,
        JSON.stringify(filtered)
      );

      return { success: true };
    }
  },

  // ============= ADMIN METHODS =============

  async getSubjects() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/subjects`);
      return normalizeData(response.data);
    } else {
      const subjects = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SUBJECTS) || "[]"
      );
      return subjects;
    }
  },

  async addSubject(subjectData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectData),
      });
      return response.data;
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
        `${API_BASE_URL}/admin/subjects/${subjectId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subjectData),
        }
      );
      return response.data;
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
        `${API_BASE_URL}/admin/subjects/${subjectId}`,
        {
          method: "DELETE",
        }
      );
      return response.data;
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
      const response = await this.authFetch(`${API_BASE_URL}/admin/classes`);
      return normalizeData(response.data);
    } else {
      const classes = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
      );
      return classes;
    }
  },

  async addClass(classData) {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/admin/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
      });
      return response.data;
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
        `${API_BASE_URL}/admin/classes/${classId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(classData),
        }
      );
      return response.data;
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
        `${API_BASE_URL}/admin/classes/${classId}`,
        {
          method: "DELETE",
        }
      );
      return response.data;
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
  async getClassStudents(classId) {
    if (USE_API) {
      const response = await this.authFetch(
        `${API_BASE_URL}/walikelas/${classId}/kelas/siswa`
      );
      return normalizeData(response.data);
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      // ambil semua siswa di kelas yang dikelola walikelas
      // misalnya walikelasId = 1 → ambil kelasId "1"
      const kelasId = "1"; // bisa kamu sesuaikan dinamis kalau sudah ada mapping walikelas → kelas
      const classStudents = students.filter((s) => s.kelasId === kelasId);

      // gabungkan data student + user (pakai userId)
      const merged = classStudents.map((student) => {
        const user = users.find((u) => u.id === student.userId);
        return {
          ...student,
          username: user?.username || "",
          email: user?.email || "",
          role: user?.role || "siswa",
        };
      });

      return merged;
    }
  },

  async getClassGrades(
    walikelasId,
    tahun,
    semester,
    semesterId = null
  ) {
    if (USE_API) {
      const query = buildSemesterQueryString({ semesterId, tahun, semester });
      const response = await this.authFetch(
        appendQuery(
          `${API_BASE_URL}/walikelas/${walikelasId}/kelas/nilai`,
          query
        )
      );
      return normalizeData(response.data);
    } else {
      const grades = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRADES) || "[]"
      );
      const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
        semesterId,
        tahun,
        semester
      );
      return grades.filter((g) => {
        const matchTahun =
          !tahunAjaran || g.tahunAjaran === tahunAjaran || g.tahun === tahunAjaran;
        const matchSemester =
          semesterNumber === null || semesterNumber === undefined
            ? true
            : `${g.semester}` === `${semesterNumber}`;
        return matchTahun && matchSemester;
      });
    }
  },

  async getClassAttendance(
    walikelasId,
    tahun,
    semester,
    semesterId = null
  ) {
    if (USE_API) {
      const query = buildSemesterQueryString({ semesterId, tahun, semester });
      const response = await this.authFetch(
        appendQuery(
          `${API_BASE_URL}/walikelas/${walikelasId}/kelas/kehadiran`,
          query
        )
      );
      return normalizeData(response.data);
    } else {
      const attendance = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]"
      );
      const { tahunAjaran, semester: semesterNumber } = resolveLocalSemesterInfo(
        semesterId,
        tahun,
        semester
      );
      return attendance.filter((a) => {
        const matchTahun =
          !tahunAjaran || a.tahunAjaran === tahunAjaran || a.tahun === tahunAjaran;
        const matchSemester =
          semesterNumber === null || semesterNumber === undefined
            ? true
            : `${a.semester}` === `${semesterNumber}`;
        return matchTahun && matchSemester;
      });
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
      return response.data;
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      // buat user baru
      const newUser = {
        id: Date.now().toString(),
        username: studentData.username,
        password: studentData.password,
        role: "siswa",
        email: studentData.email,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // buat student baru yang refer ke user
      const newStudent = {
        id: (Date.now() + 1).toString(),
        userId: newUser.id,
        nisn: studentData.nisn,
        nama: studentData.nama,
        kelasId: studentData.kelasId || "1",
        jenisKelamin: studentData.jenisKelamin || "",
        tanggalLahir: studentData.tanggalLahir || "",
        alamat: studentData.alamat || "",
        nomorHP: studentData.nomorHP || "",
        namaOrangTua: studentData.namaOrangTua || "",
        pekerjaanOrangTua: studentData.pekerjaanOrangTua || "",
        tahunMasuk:
          studentData.tahunMasuk || new Date().getFullYear().toString(),
        createdAt: new Date().toISOString(),
      };
      students.push(newStudent);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

      return {
        success: true,
        data: {
          ...newStudent,
          username: newUser.username,
          email: newUser.email,
        },
      };
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
      return response.data;
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      const studentIndex = students.findIndex((s) => s.id === studentId);
      if (studentIndex === -1)
        return { success: false, message: "Student not found" };

      const student = students[studentIndex];
      const userIndex = users.findIndex((u) => u.id === student.userId);

      // update student
      students[studentIndex] = {
        ...student,
        nisn: studentData.nisn,
        nama: studentData.nama,
        alamat: studentData.alamat,
        tanggalLahir: studentData.tanggalLahir,
        nomorHP: studentData.nomorHP,
        namaOrangTua: studentData.namaOrangTua,
        pekerjaanOrangTua: studentData.pekerjaanOrangTua,
        tahunMasuk: studentData.tahunMasuk,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

      // update user (username, email, password optional)
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          username: studentData.username || users[userIndex].username,
          email: studentData.email || users[userIndex].email,
          ...(studentData.password ? { password: studentData.password } : {}),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      return {
        success: true,
        data: {
          ...students[studentIndex],
          username: users[userIndex]?.username,
          email: users[userIndex]?.email,
        },
      };
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
      return response.data;
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );

      // cari student dulu
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        return { success: false, message: "Student not found" };
      }

      // hapus student dari tabel students
      const filteredStudents = students.filter((s) => s.id !== studentId);
      localStorage.setItem(
        STORAGE_KEYS.STUDENTS,
        JSON.stringify(filteredStudents)
      );

      // hapus user yang terkait (berdasarkan student.userId)
      const filteredUsers = users.filter((u) => u.id !== student.userId);
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
      return normalizeData(response.data);
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

  async getClassStudentReport(
    walikelasId,
    studentId,
    tahun,
    semester,
    semesterId = null
  ) {
    if (USE_API) {
      const query = buildSemesterQueryString({ semesterId, tahun, semester });
      const response = await this.authFetch(
        appendQuery(
          `${API_BASE_URL}/walikelas/${walikelasId}/siswa/${studentId}/raport`,
          query
        )
      );
      return response.data;
    } else {
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );
      const classes = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
      );
      const profileSchool = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE) || "{}"
      );

      const student = students.find((s) => s.id === studentId);
      const { tahunAjaran, semester: semesterNumber, record } =
        resolveLocalSemesterInfo(semesterId, tahun, semester);
      const grades = await this.getStudentGrades(
        studentId,
        tahunAjaran,
        semesterNumber,
        semesterId
      );
      const attendance = await this.getStudentAttendance(
        studentId,
        tahunAjaran,
        semesterNumber,
        semesterId
      );

      let walikelas = null;
      if (student) {
        const kelas = classes.find((c) => c.id === student.kelasId);
        if (kelas) {
          walikelas =
            teachers.find((t) => t.id === kelas.walikelasId) ||
            teachers.find(
              (t) => t.role === "walikelas" && t.kelasId === kelas.id
            ) ||
            null;
        }
      }

      return {
        student,
        grades,
        attendance,
        tahunAjaran,
        semester: semesterNumber,
        semesterId: semesterId ?? record?.id ?? null,
        semesterInfo: record
          ? {
              id: record.id,
              tahunAjaran: record.tahun,
              semester: record.semester,
              startDate: record.startDate,
              endDate: record.endDate,
              isActive: record.isActive,
            }
          : null,
        walikelas: walikelas
          ? { nama: walikelas.nama, nip: walikelas.nip }
          : null,
        profileSchool,
      };
    }
  },

  // ============= SCHOOL PROFILE METHODS =============
  async getSchoolProfile() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/school-profile`);
      return response.data;
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
      return response.data;
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
      const response = await this.authFetch(`${API_BASE_URL}/achievements`);
      return normalizeData(response.data);
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
      const response = await this.authFetch(`${API_BASE_URL}/programs`);
      return normalizeData(response.data);
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
      return response.data;
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
      return response.data;
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
      return response.data;
    } else {
      const programs = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PROGRAMS) || "[]"
      );
      const filtered = programs.filter((p) => p.id !== programId);
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(filtered));
      return { success: true };
    }
  },

  async getUsersHomepage() {
    if (USE_API) {
      const response = await this.authFetch(`${API_BASE_URL}/users`);
      return normalizeData(response.data);
    } else {
      const users = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USERS) || "[]"
      );
      const students = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]"
      );
      const teachers = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TEACHERS) || "[]"
      );

      return users.map((u) => {
        let extraData = {};

        if (u.role === "siswa") {
          const student = students.find((s) => s.userId === u.id);
          extraData = {
            nama: student?.nama || u.username,
            nisn: student?.nisn || null,
            kelasId: student?.kelasId || null,
          };
        } else if (u.role === "guru" || u.role === "walikelas") {
          const teacher = teachers.find((t) => t.userId === u.id);
          extraData = {
            nama: teacher?.nama || u.username,
            nip: teacher?.nip || null,
            kelasId: teacher?.kelasId || null,
          };
        } else if (u.role === "admin") {
          extraData = {
            nama: "-", // admin tidak punya nama guru/siswa
          };
        }

        return {
          ...u,
          ...extraData,
          password: undefined, // jangan expose password
        };
      });
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
  },
};

export default apiService;
export { STORAGE_KEYS, USE_API, API_BASE_URL };
