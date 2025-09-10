# API Documentation
## Sistem Informasi Akademik SMA Negeri 1 Nosu

Dokumentasi lengkap endpoint API untuk Sistem Informasi Akademik. Backend developer dapat menggunakan dokumentasi ini sebagai spesifikasi untuk implementasi REST API.

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
  }
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

---

## 🧑‍🏫 Homeroom Teacher (Walikelas) Endpoints

### GET /walikelas/:id/kelas/siswa
**Deskripsi:** Mendapatkan daftar siswa di kelas yang diampu
**Response:**
```json
[
  {
    "id": "string",
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
]
```

### GET /walikelas/:id/kelas/nilai
**Deskripsi:** Mendapatkan semua nilai siswa di kelas yang diampu
**Parameters:**
- `tahun` (query): Tahun ajaran
- `semester` (query): Semester

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
  "pekerjaanOrangTua": "string",
  "kelasId": "string",
  "tahunMasuk": "string"
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

### User Management

#### GET /admin/users
**Deskripsi:** Mendapatkan semua user
**Response:**
```json
[
  {
    "id": "string",
    "username": "string",
    "nama": "string",
    "role": "siswa|guru|walikelas|admin",
    "email": "string",
    "kelasId": "string", // untuk siswa dan walikelas
    "mataPelajaran": ["string"], // untuk guru
    "nisn": "string", // untuk siswa
    "nip": "string", // untuk guru dan walikelas
    "createdAt": "datetime",
    "updatedAt": "datetime"
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
  "mataPelajaran": ["string"], // untuk guru
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
  "waktuPenyelenggaraan": "string",
  "jumlahSiswa": number,
  "jumlahGuru": number,
  "jumlahKaryawan": number,
  "luas": "string",
  "visi": "string",
  "misi": ["string"],
  "tujuan": ["string"],
  "fasilitas": ["string"],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### PUT /admin/school-profile
**Deskripsi:** Update profil sekolah
**Request Body:** Same structure as GET response

---

### Achievement Management

#### GET /admin/achievements
**Deskripsi:** Mendapatkan daftar prestasi
**Response:**
```json
[
  {
    "id": "string",
    "judul": "string",
    "tingkat": "Kecamatan|Kabupaten|Provinsi|Nasional|Internasional",
    "tahun": "string",
    "bidang": "Akademik|Olahraga|Seni|Lingkungan|Kelembagaan",
    "penyelenggara": "string",
    "peserta": "string",
    "tanggal": "date",
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
  "judul": "string",
  "tingkat": "string",
  "tahun": "string",
  "bidang": "string",
  "penyelenggara": "string",
  "peserta": "string",
  "tanggal": "date"
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
    "kode": "string",
    "deskripsi": "string",
    "mataPelajaran": ["string"],
    "mataPelajaranPeminatan": ["string"],
    "prospek": ["string"],
    "syaratMasuk": ["string"],
    "jumlahSiswa": number,
    "kapasitas": number,
    "fasilitas": ["string"],
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
  "kode": "string",
  "deskripsi": "string",
  "mataPelajaran": ["string"],
  "mataPelajaranPeminatan": ["string"],
  "prospek": ["string"],
  "syaratMasuk": ["string"],
  "jumlahSiswa": number,
  "kapasitas": number,
  "fasilitas": ["string"]
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
**Deskripsi:** Mendapatkan daftar link pendaftaran
**Response:**
```json
[
  {
    "id": "string",
    "judul": "string",
    "deskripsi": "string",
    "link": "string",
    "tahunAjaran": "string",
    "jalur": "string",
    "mulaiPendaftaran": "date",
    "batasPendaftaran": "date",
    "biayaPendaftaran": number,
    "kuota": number,
    "syarat": ["string"],
    "dokumen": ["string"],
    "status": "Aktif|Nonaktif|Segera Dibuka",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST /admin/registration-links
**Deskripsi:** Tambah link pendaftaran baru
**Request Body:**
```json
{
  "judul": "string",
  "deskripsi": "string",
  "link": "string",
  "tahunAjaran": "string",
  "jalur": "string",
  "mulaiPendaftaran": "date",
  "batasPendaftaran": "date",
  "biayaPendaftaran": number,
  "kuota": number,
  "syarat": ["string"],
  "dokumen": ["string"],
  "status": "string"
}
```

#### PUT /admin/registration-links/:id
**Deskripsi:** Update link pendaftaran
**Request Body:** Same as POST

#### DELETE /admin/registration-links/:id
**Deskripsi:** Hapus link pendaftaran

---

## 🔒 Authentication & Authorization

### Headers yang Diperlukan
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Role-based Access Control
- **Siswa**: Hanya bisa mengakses data diri sendiri
- **Guru**: Bisa mengakses data siswa di kelas yang diajar + input nilai/kehadiran
- **Walikelas**: Bisa mengakses data siswa di kelas yang diampu + verifikasi nilai + manajemen siswa
- **Admin**: Full access ke semua endpoint + manajemen sistem

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

### Configuration
- **Development Mode**: `USE_API = false` (gunakan localStorage)
- **Production Mode**: `USE_API = true` (gunakan REST API endpoints)
- **Base URL**: Configurable melalui `API_BASE_URL`

### Pagination
Untuk endpoint yang mengembalikan list data, gunakan query parameters:
- `page`: Halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 20)
- `search`: Pencarian (opsional)
- `sort`: Pengurutan (opsional)
- `filter`: Filter data (opsional)

### Date Format
Gunakan format ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Validation Rules
- **NISN**: 10 digit angka, unik
- **NIP**: 18 digit angka, unik
- **Nilai**: 0-100
- **Username**: Minimal 4 karakter, unik
- **Password**: Minimal 6 karakter
- **Email**: Format email valid
- **Tahun Ajaran**: Format YYYY/YYYY (contoh: 2024/2025)
- **Semester**: 1 atau 2

### Error Codes
- `400`: Bad Request (data tidak valid)
- `401`: Unauthorized (belum login)
- `403`: Forbidden (tidak punya akses)
- `404`: Data tidak ditemukan
- `409`: Conflict (data sudah ada)
- `422`: Validation error
- `500`: Server error

### LocalStorage Keys (Development Mode)
```javascript
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
  REGISTRATION_LINKS: "akademik_registration_links"
}
```

### Sample Data Initialization
Sistem otomatis akan menginisialisasi data sample untuk development jika localStorage kosong. Data sample meliputi:
- Users (admin, siswa, guru, walikelas)
- Students dan teachers dengan data lengkap
- Classes dan subjects
- Grades dan attendance records
- Academic years
- School profile lengkap
- Achievements dan programs
- Registration links

### Status Values
- **Achievement Status**: Aktif
- **Registration Status**: "Aktif", "Nonaktif", "Segera Dibuka"
- **Attendance Status**: "hadir", "sakit", "alfa", "izin"
- **User Role**: "siswa", "guru", "walikelas", "admin"
- **Program Type**: "IPA", "IPS", "BAHASA"