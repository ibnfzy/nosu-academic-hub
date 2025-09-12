# API Documentation
## Sistem Informasi Akademik SMA Negeri 1 Nosu

Dokumentasi lengkap endpoint API untuk Sistem Informasi Akademik. Backend developer dapat menggunakan dokumentasi ini sebagai spesifikasi untuk implementasi REST API.

**Configuration Note:** 
- Current mode: `USE_API = false` (menggunakan localStorage untuk prototype)
- Production mode: `USE_API = true` (menggunakan REST API endpoints)
- Base URL: `http://localhost:3000/api`

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
    "studentId": "string", // untuk siswa
    "teacherId": "string", // untuk guru dan walikelas
    "nisn": "string", // untuk siswa
    "nip": "string", // untuk guru dan walikelas
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
    "kelasName": "string",
    "jenisKelamin": "L|P",
    "tanggalLahir": "date",
    "alamat": "string",
    "nomorHP": "string",
    "namaOrangTua": "string",
    "pekerjaanOrangTua": "string",
    "tahunMasuk": "string"
  },
  "grades": [], // Array nilai seperti endpoint /nilai
  "attendance": [], // Array kehadiran seperti endpoint /kehadiran
  "tahunAjaran": "string",
  "semester": number,
  "walikelas": {
    "nama": "string",
    "nip": "string"
  },
  "profileSchool": {} // Data profil sekolah
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
    "id": "string",
    "nama": "string",
    "kode": "string",
    "teacherId": "string",
    "kelompok": "A|B|C"
  }
]
```

### GET /guru/grades
**Deskripsi:** Mendapatkan semua data nilai (untuk filtering di frontend)
**Response:** Array of grade objects

### GET /guru/attendance  
**Deskripsi:** Mendapatkan semua data kehadiran (untuk filtering di frontend)
**Response:** Array of attendance objects

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
    "id": "string",
    "studentId": "string",
    "kelasId": "string",
    "subjectId": "string",
    "teacherId": "string",
    "tahunAjaran": "string",
    "semester": number,
    "jenis": "string",
    "nilai": number,
    "tanggal": "date",
    "verified": false,
    "createdAt": "datetime"
  }
}
```

### PUT /guru/:id/nilai/:gradeId
**Deskripsi:** Edit nilai siswa
**Request Body:** Same as POST /guru/:id/nilai
**Response:** Same as POST response with updated data

### DELETE /guru/:id/nilai/:gradeId
**Deskripsi:** Hapus nilai siswa
**Response:**
```json
{
  "success": true
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
    "id": "string",
    "studentId": "string",
    "kelasId": "string",
    "subjectId": "string",
    "teacherId": "string",
    "tahunAjaran": "string",
    "semester": number,
    "tanggal": "date",
    "status": "string",
    "keterangan": "string",
    "createdAt": "datetime"
  }
}
```

### PUT /guru/:id/kehadiran/:attendanceId
**Deskripsi:** Edit kehadiran siswa
**Request Body:** Same as POST /guru/:id/kehadiran
**Response:** Same as POST response with updated data

### DELETE /guru/:id/kehadiran/:attendanceId
**Deskripsi:** Hapus data kehadiran siswa
**Response:**
```json
{
  "success": true
}
```

---

## 🧑‍🏫 Homeroom Teacher (Walikelas) Endpoints

### GET /walikelas/:id/kelas/siswa
**Deskripsi:** Mendapatkan daftar siswa di kelas yang diampu
**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "nisn": "string",
    "nama": "string",
    "kelasId": "string",
    "jenisKelamin": "L|P",
    "tanggalLahir": "date",
    "alamat": "string",
    "nomorHP": "string",
    "namaOrangTua": "string",
    "pekerjaanOrangTua": "string",
    "tahunMasuk": "string",
    "username": "string",
    "email": "string",
    "role": "siswa"
  }
]
```

### GET /walikelas/:id/kelas/nilai
**Deskripsi:** Mendapatkan semua nilai siswa di kelas yang diampu
**Parameters:**
- `tahun` (query): Tahun ajaran
- `semester` (query): Semester

**Response:** Array of grade objects (filtered by tahunAjaran and semester)

### PUT /walikelas/:id/verifikasi/:nilaiId
**Deskripsi:** Verifikasi nilai siswa
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "verified": true,
    "verifiedBy": "string",
    "verifiedAt": "datetime"
  }
}
```

### GET /walikelas/:id/kelas/kehadiran
**Deskripsi:** Mendapatkan kehadiran seluruh siswa di kelas
**Parameters:**
- `tahun` (query): Tahun ajaran
- `semester` (query): Semester

**Response:** Array of attendance objects (filtered by tahunAjaran and semester)

### POST /walikelas/:id/kelas/siswa
**Deskripsi:** Menambah siswa baru ke kelas
**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "nisn": "string",
  "nama": "string", 
  "kelasId": "string",
  "jenisKelamin": "L|P",
  "tanggalLahir": "date",
  "alamat": "string",
  "nomorHP": "string",
  "namaOrangTua": "string",
  "pekerjaanOrangTua": "string",
  "tahunMasuk": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "nisn": "string",
    "nama": "string",
    "kelasId": "string",
    "jenisKelamin": "L|P",
    "tanggalLahir": "date",
    "alamat": "string",
    "nomorHP": "string",
    "namaOrangTua": "string",
    "pekerjaanOrangTua": "string",
    "tahunMasuk": "string",
    "username": "string",
    "email": "string",
    "createdAt": "datetime"
  }
}
```

### PUT /walikelas/:id/kelas/siswa/:studentId
**Deskripsi:** Update data siswa
**Request Body:** Same as POST (password optional)

### DELETE /walikelas/:id/kelas/siswa/:studentId
**Deskripsi:** Hapus siswa dari kelas
**Response:**
```json
{
  "success": true,
  "message": "Siswa berhasil dihapus"
}
```

### GET /walikelas/:id/siswa/:studentId/raport
**Deskripsi:** Mendapatkan raport siswa tertentu di kelas
**Parameters:**
- `tahun` (query): Tahun ajaran
- `semester` (query): Semester

**Response:** Same structure as /siswa/:id/raport

---

## 🛠️ Admin Endpoints

### User Management

#### GET /admin/users
**Deskripsi:** Mendapatkan semua user
**Response:**
```json
[
  {
    "id": "string",
    "username": "string",
    "nama": "string", // dari data siswa/guru atau '-' untuk admin
    "role": "siswa|guru|walikelas|admin",
    "email": "string",
    "kelasId": "string", // untuk siswa dan walikelas
    "nisn": "string", // untuk siswa
    "nip": "string", // untuk guru dan walikelas
    "createdAt": "datetime",
    "updatedAt": "datetime"
    // password tidak di-expose
  }
]
```

#### POST /admin/users
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
  "nisn": "string", // untuk siswa
  "nip": "string" // untuk guru dan walikelas
}
```

#### PUT /admin/users/:id
**Deskripsi:** Update user
**Request Body:** Same as POST (password opsional untuk update)

#### DELETE /admin/users/:id
**Deskripsi:** Hapus user

---

### Student Management

#### GET /admin/students
**Deskripsi:** Mendapatkan semua data siswa
**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "nisn": "string",
    "nama": "string",
    "kelasId": "string",
    "jenisKelamin": "L|P",
    "tanggalLahir": "date",
    "alamat": "string",
    "nomorHP": "string",
    "namaOrangTua": "string",
    "pekerjaanOrangTua": "string",
    "tahunMasuk": "string",
    "createdAt": "datetime"
  }
]
```

#### POST /admin/students
**Deskripsi:** Tambah siswa baru
**Request Body:**
```json
{
  "users": {
    "username": "string",
    "password": "string",
    "role": "siswa",
    "email": "string"
  },
  "students": {
    "nisn": "string",
    "nama": "string",
    "kelasId": "string",
    "jenisKelamin": "L|P",
    "tanggalLahir": "date",
    "alamat": "string",
    "nomorHP": "string",
    "namaOrangTua": "string",
    "pekerjaanOrangTua": "string",
    "tahunMasuk": "string"
  }
}
```

#### PUT /admin/students/:id
**Deskripsi:** Update data siswa
**Request Body:** Same as POST

#### DELETE /admin/students/:id
**Deskripsi:** Hapus siswa (akan menghapus user terkait juga)

---

### Teacher Management

#### GET /admin/teachers
**Deskripsi:** Mendapatkan semua data guru
**Response:**
```json
[
  {
    "id": "string",
    "userId": "string", 
    "nip": "string",
    "nama": "string",
    "kelasId": "string", // untuk walikelas
    "createdAt": "datetime"
  }
]
```

#### POST /admin/teachers
**Deskripsi:** Tambah guru baru
**Request Body:**
```json
{
  "users": {
    "username": "string",
    "password": "string",
    "role": "guru|walikelas",
    "email": "string"
  },
  "teachers": {
    "nip": "string",
    "nama": "string",
    "kelasId": "string" // untuk walikelas
  }
}
```

#### PUT /admin/teachers/:id
**Deskripsi:** Update data guru
**Request Body:** Same as POST

#### DELETE /admin/teachers/:id
**Deskripsi:** Hapus guru (akan menghapus user terkait juga)

---

### Subject Management

#### GET /admin/matapelajaran
**Deskripsi:** Mendapatkan daftar mata pelajaran
**Response:**
```json
[
  {
    "id": "string",
    "nama": "string",
    "kode": "string",
    "teacherId": "string",
    "kelompok": "A|B|C", // Kelompok mata pelajaran
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST /admin/matapelajaran
**Deskripsi:** Tambah mata pelajaran baru
**Request Body:**
```json
{
  "nama": "string",
  "kode": "string", 
  "teacherId": "string",
  "kelompok": "A|B|C"
}
```

#### PUT /admin/matapelajaran/:id
**Deskripsi:** Update mata pelajaran
**Request Body:** Same as POST

#### DELETE /admin/matapelajaran/:id
**Deskripsi:** Hapus mata pelajaran

---

### Class Management

#### GET /admin/kelas
**Deskripsi:** Mendapatkan daftar kelas
**Response:**
```json
[
  {
    "id": "string",
    "nama": "string", // X IPA 1
    "tingkat": number, // 10, 11, 12
    "jurusan": "IPA|IPS|BAHASA",
    "walikelasId": "string",
    "walikelasName": "string",
    "totalSiswa": number,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST /admin/kelas
**Deskripsi:** Tambah kelas baru
**Request Body:**
```json
{
  "nama": "string",
  "tingkat": number,
  "jurusan": "string",
  "walikelasId": "string"
}
```

#### PUT /admin/kelas/:id  
**Deskripsi:** Update kelas
**Request Body:** Same as POST

#### DELETE /admin/kelas/:id
**Deskripsi:** Hapus kelas

---

### School Profile Management

#### GET /admin/school-profile
**Deskripsi:** Mendapatkan profil sekolah
**Response:**
```json
{
  "id": "string",
  "nama": "string",
  "kepalaSekolah": "string",
  "alamat": "string",
  "telepon": "string",
  "fax": "string",
  "email": "string",
  "website": "string",
  "tahunBerdiri": "string",
  "akreditasi": "string",
  "npsn": "string",
  "statusSekolah": "string",
  "bentukPendidikan": "string",
  "updatedAt": "datetime"
}
```

#### PUT /admin/school-profile
**Deskripsi:** Update profil sekolah
**Request Body:** Same as GET response structure (without id and timestamps)

---

### Achievement Management

#### GET /admin/achievements
**Deskripsi:** Mendapatkan daftar prestasi sekolah
**Response:**
```json
[
  {
    "id": "string",
    "nama": "string",
    "kategori": "string",
    "tingkat": "string",
    "tahun": "string",
    "deskripsi": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST /admin/achievements
**Deskripsi:** Tambah prestasi baru
**Request Body:**
```json
{
  "nama": "string",
  "kategori": "string",
  "tingkat": "string",
  "tahun": "string",
  "deskripsi": "string"
}
```

#### PUT /admin/achievements/:id
**Deskripsi:** Update prestasi
**Request Body:** Same as POST

#### DELETE /admin/achievements/:id
**Deskripsi:** Hapus prestasi

---

### Program Study Management

#### GET /admin/programs
**Deskripsi:** Mendapatkan daftar program studi
**Response:**
```json
[
  {
    "id": "string",
    "nama": "string",
    "deskripsi": "string",
    "kepalaProgram": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST /admin/programs
**Deskripsi:** Tambah program studi baru
**Request Body:**
```json
{
  "nama": "string",
  "deskripsi": "string",
  "kepalaProgram": "string"
}
```

#### PUT /admin/programs/:id
**Deskripsi:** Update program studi
**Request Body:** Same as POST

#### DELETE /admin/programs/:id
**Deskripsi:** Hapus program studi

---

### Registration Link Management

#### GET /admin/registration-links
**Deskripsi:** Mendapatkan daftar link registrasi
**Response:**
```json
[
  {
    "id": "string",
    "nama": "string",
    "link": "string",
    "status": "Aktif|Nonaktif",
    "deskripsi": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST /admin/registration-links
**Deskripsi:** Tambah link registrasi baru
**Request Body:**
```json
{
  "nama": "string",
  "link": "string",
  "deskripsi": "string"
}
```

#### PUT /admin/registration-links/:id
**Deskripsi:** Update link registrasi
**Request Body:**
```json
{
  "nama": "string",
  "link": "string",
  "status": "Aktif|Nonaktif",
  "deskripsi": "string"
}
```

#### DELETE /admin/registration-links/:id
**Deskripsi:** Hapus link registrasi

---

## 📝 Additional Notes

### Authentication and Authorization
- Semua endpoint (kecuali `/auth/login`) memerlukan header `Authorization: Bearer {token}`
- Role-based access control:
  - **Siswa**: hanya akses endpoint `/siswa/:id/*` dengan ID sesuai
  - **Guru**: akses endpoint `/guru/:id/*` dan data terkait mata pelajaran yang diajar
  - **Walikelas**: akses endpoint `/walikelas/:id/*` dan data siswa di kelasnya
  - **Admin**: akses semua endpoint `/admin/*`

### Response Format
**Success Response:**
```json
{
  "success": true,
  "data": {} // actual data
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### Configuration
- **Development Mode**: `USE_API = false` (menggunakan localStorage)
- **Production Mode**: `USE_API = true` (menggunakan REST API)
- **Base URL**: `http://localhost:3000/api`

### LocalStorage Keys (Development Mode)
- `akademik_users` - User accounts
- `akademik_students` - Student data
- `akademik_teachers` - Teacher data  
- `akademik_classes` - Class data
- `akademik_subjects` - Subject data
- `akademik_grades` - Grade data
- `akademik_attendance` - Attendance data
- `akademik_current_user` - Current logged in user
- `akademik_school_profile` - School profile
- `akademik_achievements` - School achievements
- `akademik_programs` - Study programs
- `akademik_registration_links` - Registration links

### Date Format
- Semua date menggunakan format ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Query parameter date menggunakan format: `YYYY-MM-DD`

### Validation Rules
- **Username**: 3-50 karakter, alphanumeric
- **Password**: minimum 6 karakter
- **Email**: format email valid
- **NISN**: 10 digit
- **NIP**: format NIP valid
- **Nilai**: 0-100
- **Status kehadiran**: `hadir|sakit|alfa|izin`

### Status Values
- **User role**: `siswa|guru|walikelas|admin`
- **Gender**: `L|P` (Laki-laki/Perempuan)
- **Subject group**: `A|B|C`
- **Grade verification**: `true|false`
- **Registration link status**: `Aktif|Nonaktif`

### Sample Data Initialization
Sistem secara otomatis menginisialisasi data sample jika localStorage kosong, termasuk:
- Sample users untuk setiap role
- Sample students, teachers, classes, subjects
- Sample grades dan attendance data
- Sample school profile, achievements, programs, dan registration links