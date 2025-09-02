/**
 * Academic Information System API Service
 * SMA Negeri 1 Nosu - Sulawesi Barat
 * 
 * Configuration service untuk switching antara localStorage dan REST API
 * Untuk prototype: USE_API = false (gunakan localStorage)
 * Untuk production: USE_API = true (gunakan REST API endpoints)
 */

import sampleData from './localData.js';

const USE_API = false; // Set to true untuk menggunakan REST API

const API_BASE_URL = 'http://localhost:3000/api'; // Ganti dengan URL backend

// LocalStorage Keys
const STORAGE_KEYS = {
  USERS: 'akademik_users',
  STUDENTS: 'akademik_students',
  TEACHERS: 'akademik_teachers',
  CLASSES: 'akademik_classes',
  SUBJECTS: 'akademik_subjects',
  GRADES: 'akademik_grades',
  ATTENDANCE: 'akademik_attendance',
  CURRENT_USER: 'akademik_current_user',
  ACADEMIC_YEARS: 'akademik_years'
};

// Generic API/localStorage abstraction
const apiService = {
  // ============= AUTHENTICATION =============
  async login(username, password, role) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      return await response.json();
    } else {
      // LocalStorage implementation
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = users.find(u => u.username === username && u.password === password && u.role === role);
      
      if (user) {
        const sessionUser = { ...user };
        delete sessionUser.password; // Remove password from session
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      }
      return { success: false, message: 'Invalid credentials' };
    }
  },

  async logout() {
    if (USE_API) {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return { success: true };
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  },

  // ============= SISWA ENDPOINTS =============
  async getStudentGrades(studentId, tahun, semester) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/siswa/${studentId}/nilai?tahun=${tahun}&semester=${semester}`);
      return await response.json();
    } else {
      const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
      return grades.filter(g => 
        g.studentId === studentId && 
        g.tahunAjaran === tahun && 
        g.semester === semester
      );
    }
  },

  async getStudentAttendance(studentId, tahun, semester) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/siswa/${studentId}/kehadiran?tahun=${tahun}&semester=${semester}`);
      return await response.json();
    } else {
      const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
      return attendance.filter(a => 
        a.studentId === studentId && 
        a.tahunAjaran === tahun && 
        a.semester === semester
      );
    }
  },

  async getStudentReport(studentId, tahun, semester) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/siswa/${studentId}/raport?tahun=${tahun}&semester=${semester}`);
      return await response.json();
    } else {
      const grades = await this.getStudentGrades(studentId, tahun, semester);
      const attendance = await this.getStudentAttendance(studentId, tahun, semester);
      const student = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]')
        .find(s => s.id === studentId);
      
      return {
        student,
        grades,
        attendance,
        tahunAjaran: tahun,
        semester
      };
    }
  },

  // ============= GURU ENDPOINTS =============
  async getTeacherSubjects(teacherId) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/guru/${teacherId}/matapelajaran`);
      return await response.json();
    } else {
      const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
      const teacher = teachers.find(t => t.id === teacherId);
      return teacher ? teacher.mataPelajaran : [];
    }
  },

  async addGrade(teacherId, gradeData) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/guru/${teacherId}/nilai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
      return await response.json();
    } else {
      const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
      const newGrade = {
        id: Date.now().toString(),
        ...gradeData,
        createdAt: new Date().toISOString()
      };
      grades.push(newGrade);
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
      return { success: true, data: newGrade };
    }
  },

  async addAttendance(teacherId, attendanceData) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/guru/${teacherId}/kehadiran`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData)
      });
      return await response.json();
    } else {
      const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
      const newAttendance = {
        id: Date.now().toString(),
        ...attendanceData,
        createdAt: new Date().toISOString()
      };
      attendance.push(newAttendance);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
      return { success: true, data: newAttendance };
    }
  },

  // ============= WALIKELAS ENDPOINTS =============
  async getClassGrades(walikelasId) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/walikelas/${walikelasId}/kelas/nilai`);
      return await response.json();
    } else {
      const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
      const walikelas = teachers.find(t => t.id === walikelasId && t.role === 'walikelas');
      
      if (walikelas && walikelas.kelasId) {
        const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
        return grades.filter(g => g.kelasId === walikelas.kelasId);
      }
      return [];
    }
  },

  async verifyGrade(walikelasId, gradeId) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/walikelas/${walikelasId}/verifikasi/${gradeId}`, {
        method: 'PUT'
      });
      return await response.json();
    } else {
      const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
      const gradeIndex = grades.findIndex(g => g.id === gradeId);
      
      if (gradeIndex !== -1) {
        grades[gradeIndex].verified = true;
        grades[gradeIndex].verifiedAt = new Date().toISOString();
        grades[gradeIndex].verifiedBy = walikelasId;
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
        return { success: true };
      }
      return { success: false, message: 'Grade not found' };
    }
  },

  // ============= ADMIN ENDPOINTS =============
  async getUsers() {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      return await response.json();
    } else {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      return users.map(u => ({ ...u, password: undefined })); // Don't expose passwords
    }
  },

  async createUser(userData) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } else {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return { success: true, data: { ...newUser, password: undefined } };
    }
  },

  async updateUser(userId, userData) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } else {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return { success: true, data: { ...users[userIndex], password: undefined } };
      }
      return { success: false, message: 'User not found' };
    }
  },

  async deleteUser(userId) {
    if (USE_API) {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } else {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const filteredUsers = users.filter(u => u.id !== userId);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
      return { success: true };
    }
  },

  // ============= UTILITY METHODS =============
  initializeData() {
    // Initialize with sample data if localStorage is empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      // Muat sample data dari modul ESM
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sampleData.users));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(sampleData.students));
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(sampleData.teachers));
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(sampleData.classes));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(sampleData.subjects));
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(sampleData.grades));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(sampleData.attendance));
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS, JSON.stringify(sampleData.academicYears));
    }
  }
};

export default apiService;
export { STORAGE_KEYS, USE_API, API_BASE_URL };