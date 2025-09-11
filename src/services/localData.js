/**
 * Sample Data untuk Prototype
 * SMA Negeri 1 Nosu - Sulawesi Barat
 * Data ini mengikuti struktur tabel database
 */

// USERS - hanya data autentikasi & role
const users = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
    email: "admin@sman1nosu.sch.id",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    username: "2024001",
    password: "siswa123",
    role: "siswa",
    email: "ahmad.fadli@student.sman1nosu.sch.id",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    username: "2024002",
    password: "siswa123",
    role: "siswa",
    email: "siti.aminah@student.sman1nosu.sch.id",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    username: "guru001",
    password: "guru123",
    role: "walikelas",
    email: "budi.santoso@sman1nosu.sch.id",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "5",
    username: "guru002",
    password: "guru123",
    role: "walikelas",
    email: "sari.dewi@sman1nosu.sch.id",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "6",
    username: "guru003",
    password: "guru123",
    role: "guru",
    email: "ahmad.hidayat@sman1nosu.sch.id",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "7",
    username: "guru004",
    password: "guru123",
    role: "guru",
    email: "ratna.sari@sman1nosu.sch.id",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

// STUDENTS - detail siswa, relasi ke users
const students = [
  {
    id: "1", // Student ID
    userId: "2", // Foreign key to users table
    nisn: "2024001001", // ✅ 10 digit
    nama: "Ahmad Fadli",
    kelasId: "1",
    jenisKelamin: "L",
    tanggalLahir: "2007-05-15",
    alamat: "Jl. Merdeka No. 123, Nosu",
    nomorHP: "081234567890",
    namaOrangTua: "Fadli Rahman",
    pekerjaanOrangTua: "Petani",
    tahunMasuk: "2024",
  },
  {
    id: "2", // Student ID
    userId: "3", // Foreign key to users table
    nisn: "2024001002", // ✅ 10 digit
    nama: "Siti Aminah",
    kelasId: "1",
    jenisKelamin: "P",
    tanggalLahir: "2007-08-22",
    alamat: "Jl. Pahlawan No. 456, Nosu",
    nomorHP: "081234567891",
    namaOrangTua: "Aminah Sari",
    pekerjaanOrangTua: "Ibu Rumah Tangga",
    tahunMasuk: "2024",
  },
];

// TEACHERS - detail guru, relasi ke users
const teachers = [
  {
    id: "1", // Teacher ID
    userId: "4", // Foreign key to users table
    nip: "196501011990031003",
    nama: "Drs. Budi Santoso",
    role: "walikelas",
    jenisKelamin: "L",
    alamat: "Jl. Guru No. 1, Nosu",
    nomorHP: "081234567892",
  },
  {
    id: "2", // Teacher ID
    userId: "5", // Foreign key to users table
    nip: "196801151991032004",
    nama: "Dra. Sari Dewi",
    role: "walikelas",
    jenisKelamin: "P",
    alamat: "Jl. Guru No. 2, Nosu",
    nomorHP: "081234567893",
  },
  {
    id: "3", // Teacher ID
    userId: "6", // Foreign key to users table
    nip: "197205101999031005",
    nama: "Ahmad Hidayat, S.Pd",
    role: "guru",
    jenisKelamin: "L",
    alamat: "Jl. Guru No. 3, Nosu",
    nomorHP: "081234567894",
  },
  {
    id: "4", // Teacher ID
    userId: "7", // Foreign key to users table
    nip: "197808201999032006",
    nama: "Dr. Ratna Sari",
    role: "guru",
    jenisKelamin: "P",
    alamat: "Jl. Guru No. 4, Nosu",
    nomorHP: "081234567895",
  },
];

// CLASSES - daftar kelas
const classes = [
  { id: "1", nama: "X IPA 1", tingkat: 10, jurusan: "IPA", walikelasId: "1" },
  { id: "2", nama: "X IPA 2", tingkat: 10, jurusan: "IPA", walikelasId: "2" },
  { id: "3", nama: "XI IPA 1", tingkat: 11, jurusan: "IPA", walikelasId: 3 },
  {
    id: "4",
    nama: "XII IPA 1",
    tingkat: 12,
    jurusan: "IPA",
    walikelasId: 3,
  },
];

// SUBJECTS (sudah ada teacherId di dalamnya)
const subjects = [
  { id: "1", nama: "Matematika", kode: "MAT", kelompok: "A", teacherId: "3" },
  {
    id: "2",
    nama: "Bahasa Indonesia",
    kode: "BIN",
    kelompok: "A",
    teacherId: "4",
  },
  {
    id: "3",
    nama: "Bahasa Inggris",
    kode: "BIG",
    kelompok: "A",
    teacherId: "4",
  },
  { id: "4", nama: "Fisika", kode: "FIS", kelompok: "C", teacherId: null },
  { id: "5", nama: "Kimia", kode: "KIM", kelompok: "C", teacherId: null },
  { id: "6", nama: "Biologi", kode: "BIO", kelompok: "C", teacherId: null },
];

// ACADEMIC YEARS - tahun ajaran
const academicYears = [
  {
    id: "1",
    tahun: "2023/2024",
    semester: 1,
    isActive: false,
    startDate: "2023-07-15",
    endDate: "2023-12-22",
  },
  {
    id: "2",
    tahun: "2023/2024",
    semester: 2,
    isActive: false,
    startDate: "2024-01-08",
    endDate: "2024-06-28",
  },
  {
    id: "3",
    tahun: "2024/2025",
    semester: 1,
    isActive: true,
    startDate: "2024-07-15",
    endDate: "2024-12-20",
  },
];

// GRADES - nilai siswa per mapel per tahun ajaran
const grades = [
  {
    id: "1",
    studentId: "2",
    subjectId: "1",
    jenis: "Ujian",
    nilai: 85,
    tanggal: "2024-07-20",
    teacherId: "3",
    kelasId: "1",
    tahunAjaran: "2024/2025",
    semester: 1,
    verified: false,
  },
  {
    id: "2",
    studentId: "2",
    subjectId: "2",
    jenis: "Kuis",
    nilai: 90,
    tanggal: "2024-07-21",
    teacherId: "3",
    kelasId: "1",
    tahunAjaran: "2024/2025",
    semester: 1,
    verified: false,
  },
];

const attendance = [
  {
    id: "1",
    studentId: "1",
    subjectId: "1",
    tanggal: "2024-07-20",
    status: "hadir",
    keterangan: "",
    teacherId: "3",
    kelasId: "1",
    tahunAjaran: "2024/2025",
    semester: 1,
  },
  {
    id: "2",
    studentId: "1",
    subjectId: "1",
    tanggal: "2024-07-21",
    status: "sakit",
    keterangan: "",
    teacherId: "3",
    kelasId: "1",
    tahunAjaran: "2024/2025",
    semester: 1,
  },
];

// SCHOOL PROFILE - profil sekolah
const schoolProfile = {
  namaSekolah: "SMA Negeri 1 Nosu",
  npsn: "12345678",
  alamat: "Jl. Pendidikan No. 1, Nosu, Sulawesi Barat",
  kodePos: "12345",
  telepon: "(0421) 123456",
  email: "info@sman1nosu.sch.id",
  website: "www.sman1nosu.sch.id",
  kepalaSekolah: "Drs. Ahmad Fadli, M.Pd",
  nipKepalaSekolah: "196001011990031001",
  akreditasi: "A",
  tahunAkreditasi: "2023",
  visi: "Menjadi sekolah unggulan yang menghasilkan lulusan berkarakter, berprestasi, dan berdaya saing global",
  misi: "1. Menyelenggarakan pendidikan berkualitas tinggi\n2. Mengembangkan karakter siswa yang baik\n3. Meningkatkan prestasi akademik dan non-akademik\n4. Mempersiapkan lulusan yang siap bersaing di era global",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

// ACHIEVEMENTS - prestasi sekolah
const achievements = [
  {
    id: "1",
    nama: "Juara 1 Olimpiade Matematika Tingkat Provinsi",
    tahun: "2024",
    tingkat: "Provinsi",
    kategori: "Akademik",
    deskripsi:
      "Siswa SMA Negeri 1 Nosu meraih juara 1 dalam Olimpiade Matematika Tingkat Provinsi Sulawesi Barat",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    nama: "Juara 2 Lomba Debat Bahasa Inggris",
    tahun: "2024",
    tingkat: "Kabupaten",
    kategori: "Bahasa",
    deskripsi:
      "Tim debat bahasa Inggris SMA Negeri 1 Nosu meraih juara 2 di tingkat kabupaten",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    nama: "Sekolah Adiwiyata Mandiri",
    tahun: "2023",
    tingkat: "Nasional",
    kategori: "Lingkungan",
    deskripsi:
      "SMA Negeri 1 Nosu meraih penghargaan Sekolah Adiwiyata Mandiri dari Kementerian Lingkungan Hidup",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

// PROGRAMS - program unggulan sekolah
const programs = [
  {
    id: "1",
    nama: "Program Kelas Unggulan",
    deskripsi:
      "Program khusus untuk siswa berprestasi dengan kurikulum yang diperkaya",
    target: "Siswa kelas X-XII",
    durasi: "3 tahun",
    status: "Aktif",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    nama: "Program Bilingual",
    deskripsi:
      "Program pembelajaran dengan bahasa pengantar bahasa Indonesia dan bahasa Inggris",
    target: "Siswa kelas X-XII",
    durasi: "3 tahun",
    status: "Aktif",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    nama: "Program Ekstrakurikuler Robotik",
    deskripsi:
      "Program ekstrakurikuler untuk mengembangkan kemampuan teknologi dan robotik siswa",
    target: "Siswa kelas X-XII",
    durasi: "1 semester",
    status: "Aktif",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

// REGISTRATION LINKS - link pendaftaran
const registrationLinks = [
  {
    id: "1",
    nama: "Pendaftaran PPDB 2024/2025",
    url: "https://ppdb.sman1nosu.sch.id",
    deskripsi:
      "Link pendaftaran Penerimaan Peserta Didik Baru tahun ajaran 2024/2025",
    periode: "2024",
    status: "Aktif",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    nama: "Pendaftaran Ekstrakurikuler",
    url: "https://ekskul.sman1nosu.sch.id",
    deskripsi: "Link pendaftaran kegiatan ekstrakurikuler semester genap 2024",
    periode: "2024",
    status: "Aktif",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    nama: "Pendaftaran Beasiswa",
    url: "https://beasiswa.sman1nosu.sch.id",
    deskripsi: "Link pendaftaran program beasiswa untuk siswa berprestasi",
    periode: "2024",
    status: "Tidak Aktif",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

// EXPORT SEMUA
const sampleData = {
  users,
  students,
  teachers,
  classes,
  subjects,
  academicYears,
  grades,
  attendance,
  schoolProfile,
  achievements,
  programs,
  registrationLinks,
};

export default sampleData;
