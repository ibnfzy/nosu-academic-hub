# API Documentation
## Sistem Informasi Akademik SMA Negeri 1 Nosu

Dokumentasi ini menjelaskan endpoint API yang dibutuhkan oleh frontend application. Backend developer dapat menggunakan dokumentasi ini sebagai spesifikasi untuk implementasi REST API.

---

## 🔐 Authentication Endpoints

### POST /auth/login
**Deskripsi:** Login user berdasarkan role
**Request Body:**
```json
{
  "username": "string",
  "password": "string", 
  "role": "siswa|guru|walikelas|admin"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "nama": "string",
    "role": "string",
    "email": "string",
    "kelasId": "string", // untuk siswa dan walikelas
    "mataPelajaran": ["string"], // untuk guru
    "createdAt": "datetime"
  },
  "token": "jwt_token" // opsional jika menggunakan JWT
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### POST /auth/logout
**Deskripsi:** Logout user
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👨‍🎓 Student (Siswa) Endpoints

### GET /siswa/:id/nilai
**Deskripsi:** Mendapatkan daftar nilai siswa
**Parameters:**
- `id` (path): Student ID
- `tahun` (query): Tahun ajaran (2024/2025)
- `semester` (query): Semester (1 atau 2)

**Example:** `/siswa/123/nilai?tahun=2024/2025&semester=1`

**Response:**
```json
[
  {
    "id": "string",
    "studentId": "string",
    "kelasId": "string", 
    "subjectId": "string",
    "subjectName": "string",
    "teacherId": "string",
    "teacherName": "string",
    "tahunAjaran": "string",
    "semester": number,
    "jenis": "string", // Ulangan Harian, UTS, UAS, dll
    "nilai": number,
    "tanggal": "date",
    "verified": boolean,
    "verifiedBy": "string",
    "verifiedAt": "datetime",
    "createdAt": "datetime"
  }
]
```

### GET /siswa/:id/kehadiran
**Deskripsi:** Mendapatkan data kehadiran siswa
**Parameters:** Same as nilai endpoint

**Response:**
```json
[
  {
    "id": "string",
    "studentId": "string",
    "kelasId": "string",
    "subjectId": "string", 
    "subjectName": "string",
    "teacherId": "string",
    "tahunAjaran": "string",
    "semester": number,
    "tanggal": "date",
    "status": "hadir|sakit|alfa|izin",
    "keterangan": "string",
    "createdAt": "datetime"
  }
]
```

### GET /siswa/:id/raport
**Deskripsi:** Mendapatkan data raport lengkap siswa
**Parameters:** Same as nilai endpoint

**Response:**
```json
{
  "student": {
    "id": "string",
    "nisn": "string",
    "nama": "string",
    "kelasId": "string",
    "kelasName": "string"
  },
  "grades": [], // Array nilai seperti endpoint /nilai
  "attendance": [], // Array kehadiran seperti endpoint /kehadiran
  "summary": {
    "averageGrade": number,
    "totalSubjects": number,
    "attendancePercentage": number,
    "attendanceStats": {
      "hadir": number,
      "sakit": number,
      "alfa": number,
      "izin": number
    }
  },
  "tahunAjaran": "string",
  "semester": number
}
```

---

## 👩‍🏫 Teacher (Guru) Endpoints

### GET /guru/:id/matapelajaran
**Deskripsi:** Mendapatkan daftar mata pelajaran yang diajar guru
**Response:**
```json
[
  {
    "subjectId": "string",
    "subjectName": "string", 
    "kelasIds": ["string"],
    "kelasNames": ["string"]
  }
]
```

### POST /guru/:id/nilai
**Deskripsi:** Menambah nilai siswa
**Request Body:**
```json
{
  "studentId": "string",
  "kelasId": "string",
  "subjectId": "string",
  "tahunAjaran": "string",
  "semester": number,
  "jenis": "string",
  "nilai": number,
  "tanggal": "date"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Object nilai yang baru dibuat
  }
}
```

### POST /guru/:id/kehadiran
**Deskripsi:** Input kehadiran siswa
**Request Body:**
```json
{
  "studentId": "string",
  "kelasId": "string", 
  "subjectId": "string",
  "tahunAjaran": "string",
  "semester": number,
  "tanggal": "date",
  "status": "hadir|sakit|alfa|izin",
  "keterangan": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Object kehadiran yang baru dibuat
  }
}
```

---

## 🧑‍🏫 Homeroom Teacher (Walikelas) Endpoints

### GET /walikelas/:id/kelas/nilai
**Deskripsi:** Mendapatkan semua nilai siswa di kelas yang diampu
**Response:**
```json
[
  {
    // Same structure as student grades
    // but includes all students in the class
  }
]
```

### PUT /walikelas/:id/verifikasi/:nilaiId
**Deskripsi:** Verifikasi nilai siswa
**Response:**
```json
{
  "success": true,
  "message": "Nilai berhasil diverifikasi"
}
```

### GET /walikelas/:id/kelas/kehadiran
**Deskripsi:** Mendapatkan kehadiran seluruh siswa di kelas
**Response:**
```json
[
  {
    // Same structure as student attendance  
    // but includes all students in the class
  }
]
```

### POST /walikelas/:id/kelas/siswa
**Deskripsi:** Menambah siswa baru ke kelas
**Request Body:**
```json
{
  "nisn": "string",
  "nama": "string", 
  "jenisKelamin": "L|P",
  "tanggalLahir": "date",
  "alamat": "string",
  "nomorHP": "string",
  "namaOrangTua": "string",
  "pekerjaanOrangTua": "string"
}
```

### PUT /walikelas/:id/kelas/siswa/:studentId
**Deskripsi:** Update data siswa
**Request Body:** Same as POST

### DELETE /walikelas/:id/kelas/siswa/:studentId
**Deskripsi:** Hapus siswa dari kelas
**Response:**
```json
{
  "success": true,
  "message": "Siswa berhasil dihapus"
}
```

---

## 🛠️ Admin Endpoints

### GET /admin/users
**Deskripsi:** Mendapatkan semua user
**Response:**
```json
[
  {
    "id": "string",
    "username": "string",
    "nama": "string",
    "role": "string",
    "email": "string",
    "active": boolean,
    "createdAt": "datetime"
  }
]
```

### POST /admin/users
**Deskripsi:** Membuat user baru
**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "nama": "string",
  "role": "siswa|guru|walikelas|admin",
  "email": "string",
  "kelasId": "string", // untuk siswa dan walikelas
  "mataPelajaran": ["string"], // untuk guru
  "nisn": "string", // untuk siswa
  "nip": "string" // untuk guru dan walikelas
}
```

### PUT /admin/users/:id
**Deskripsi:** Update user
**Request Body:** Same as POST (password opsional untuk update)

### DELETE /admin/users/:id
**Deskripsi:** Hapus user
**Response:**
```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

### GET /admin/matapelajaran
**Deskripsi:** Mendapatkan daftar mata pelajaran
**Response:**
```json
[
  {
    "id": "string",
    "nama": "string",
    "kode": "string",
    "kelompok": "A|B|C", // Kelompok mata pelajaran
    "active": boolean
  }
]
```

### POST /admin/matapelajaran
**Deskripsi:** Tambah mata pelajaran baru
**Request Body:**
```json
{
  "nama": "string",
  "kode": "string", 
  "kelompok": "string"
}
```

### PUT /admin/matapelajaran/:id
**Deskripsi:** Update mata pelajaran
**Request Body:** Same as POST

### DELETE /admin/matapelajaran/:id
**Deskripsi:** Hapus mata pelajaran

### GET /admin/kelas
**Deskripsi:** Mendapatkan daftar kelas
**Response:**
```json
[
  {
    "id": "string",
    "nama": "string", // X IPA 1
    "tingkat": number, // 10, 11, 12
    "jurusan": "IPA|IPS",
    "walikelasId": "string",
    "walikelasName": "string",
    "totalSiswa": number
  }
]
```

### POST /admin/kelas
### PUT /admin/kelas/:id  
### DELETE /admin/kelas/:id
**Struktur sama dengan mata pelajaran**

---

## 🔒 Authentication & Authorization

### Headers yang Diperlukan
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Role-based Access Control
- **Siswa**: Hanya bisa mengakses data diri sendiri
- **Guru**: Bisa mengakses data siswa di kelas yang diajar
- **Walikelas**: Bisa mengakses data siswa di kelas yang diampu + verifikasi nilai  
- **Admin**: Full access ke semua endpoint

---

## 📄 Response Format

### Success Response
```json
{
  "success": true,
  "data": {}, // atau []
  "message": "string", // opsional
  "meta": { // untuk pagination
    "total": number,
    "page": number,
    "limit": number
  }
}
```

### Error Response  
```json
{
  "success": false,
  "message": "string",
  "errors": [], // detail error jika ada
  "code": "ERROR_CODE" // opsional
}
```

---

## 🚀 Additional Notes

### Pagination
Untuk endpoint yang mengembalikan list data, gunakan query parameters:
- `page`: Halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 20)
- `search`: Pencarian (opsional)

### Date Format
Gunakan format ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Validation Rules
- **NISN**: 10 digit angka
- **NIP**: 18 digit angka  
- **Nilai**: 0-100
- **Username**: Minimal 4 karakter, unik
- **Password**: Minimal 6 karakter

### Error Codes
- `401`: Unauthorized
- `403`: Forbidden (tidak punya akses)
- `404`: Data tidak ditemukan
- `422`: Validation error
- `500`: Server error