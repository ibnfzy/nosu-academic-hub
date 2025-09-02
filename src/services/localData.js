/**
 * Sample Data untuk Prototype
 * SMA Negeri 1 Nosu - Sulawesi Barat
 * Data ini akan digunakan selama fase pengembangan dengan localStorage
 */

const academicYears = [
  {
    id: '1',
    tahun: '2023/2024',
    semester: 1,
    isActive: false,
    startDate: '2023-07-15',
    endDate: '2023-12-22'
  },
  {
    id: '2',
    tahun: '2023/2024',
    semester: 2,
    isActive: false,
    startDate: '2024-01-08',
    endDate: '2024-06-28'
  },
  {
    id: '3',
    tahun: '2024/2025',
    semester: 1,
    isActive: true,
    startDate: '2024-07-15',
    endDate: '2024-12-20'
  }
];

const classes = [
  { id: '1', nama: 'X IPA 1', tingkat: 10, jurusan: 'IPA', walikelasId: '3' },
  { id: '2', nama: 'X IPA 2', tingkat: 10, jurusan: 'IPA', walikelasId: '4' },
  { id: '3', nama: 'XI IPA 1', tingkat: 11, jurusan: 'IPA', walikelasId: '5' },
  { id: '4', nama: 'XII IPA 1', tingkat: 12, jurusan: 'IPA', walikelasId: '6' }
];

const subjects = [
  { id: '1', nama: 'Matematika', kode: 'MAT', kelompok: 'A' },
  { id: '2', nama: 'Bahasa Indonesia', kode: 'BIN', kelompok: 'A' },
  { id: '3', nama: 'Bahasa Inggris', kode: 'BIG', kelompok: 'A' },
  { id: '4', nama: 'Fisika', kode: 'FIS', kelompok: 'C' },
  { id: '5', nama: 'Kimia', kode: 'KIM', kelompok: 'C' },
  { id: '6', nama: 'Biologi', kode: 'BIO', kelompok: 'C' }
];

const users = [
  // Admin
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    nama: 'Administrator',
    email: 'admin@sman1nosu.sch.id',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Siswa
  {
    id: '2',
    username: '2024001',
    password: 'siswa123',
    role: 'siswa',
    nama: 'Ahmad Fadli',
    nisn: '2024001',
    kelasId: '1',
    email: 'ahmad.fadli@student.sman1nosu.sch.id',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '7',
    username: '2024002',
    password: 'siswa123',
    role: 'siswa',
    nama: 'Siti Aminah',
    nisn: '2024002',
    kelasId: '1',
    email: 'siti.aminah@student.sman1nosu.sch.id',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Guru
  {
    id: '3',
    username: 'guru001',
    password: 'guru123',
    role: 'walikelas',
    nama: 'Drs. Budi Santoso',
    nip: '196501011990031003',
    kelasId: '1', // Walikelas X IPA 1
    mataPelajaran: ['1'], // Matematika
    email: 'budi.santoso@sman1nosu.sch.id',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    username: 'guru002',
    password: 'guru123',
    role: 'walikelas',
    nama: 'Dra. Sari Dewi',
    nip: '196801151991032004',
    kelasId: '2', // Walikelas X IPA 2
    mataPelajaran: ['2'], // Bahasa Indonesia
    email: 'sari.dewi@sman1nosu.sch.id',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '5',
    username: 'guru003',
    password: 'guru123',
    role: 'guru',
    nama: 'Ahmad Hidayat, S.Pd',
    nip: '197205101999031005',
    mataPelajaran: ['3'], // Bahasa Inggris
    email: 'ahmad.hidayat@sman1nosu.sch.id',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '6',
    username: 'guru004',
    password: 'guru123',
    role: 'guru',
    nama: 'Dr. Ratna Sari',
    nip: '197808201999032006',
    mataPelajaran: ['4', '5'], // Fisika dan Kimia
    email: 'ratna.sari@sman1nosu.sch.id',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const students = [
  {
    id: '2',
    nisn: '2024001',
    nama: 'Ahmad Fadli',
    kelasId: '1',
    jenisKelamin: 'L',
    tanggalLahir: '2007-05-15',
    alamat: 'Jl. Merdeka No. 123, Nosu',
    nomorHP: '081234567890',
    namaOrangTua: 'Bapak Fadli Rahman',
    pekerjaanOrangTua: 'Petani',
    tahunMasuk: '2024'
  },
  {
    id: '7',
    nisn: '2024002',
    nama: 'Siti Aminah',
    kelasId: '1',
    jenisKelamin: 'P',
    tanggalLahir: '2007-08-22',
    alamat: 'Jl. Pahlawan No. 456, Nosu',
    nomorHP: '081234567891',
    namaOrangTua: 'Ibu Aminah Sari',
    pekerjaanOrangTua: 'Ibu Rumah Tangga',
    tahunMasuk: '2024'
  }
];

const teachers = [
  {
    id: '3',
    nip: '196501011990031003',
    nama: 'Drs. Budi Santoso',
    role: 'walikelas',
    kelasId: '1',
    mataPelajaran: [
      { subjectId: '1', kelasIds: ['1', '2'] }
    ],
    jenisKelamin: 'L',
    alamat: 'Jl. Guru No. 1, Nosu',
    nomorHP: '081234567892'
  },
  {
    id: '4',
    nip: '196801151991032004',
    nama: 'Dra. Sari Dewi',
    role: 'walikelas',
    kelasId: '2',
    mataPelajaran: [
      { subjectId: '2', kelasIds: ['1', '2'] }
    ],
    jenisKelamin: 'P',
    alamat: 'Jl. Guru No. 2, Nosu',
    nomorHP: '081234567893'
  },
  {
    id: '5',
    nip: '197205101999031005',
    nama: 'Ahmad Hidayat, S.Pd',
    role: 'guru',
    mataPelajaran: [
      { subjectId: '3', kelasIds: ['1', '2', '3'] }
    ],
    jenisKelamin: 'L',
    alamat: 'Jl. Guru No. 3, Nosu',
    nomorHP: '081234567894'
  },
  {
    id: '6',
    nip: '197808201999032006',
    nama: 'Dr. Ratna Sari',
    role: 'guru',
    mataPelajaran: [
      { subjectId: '4', kelasIds: ['1', '2'] },
      { subjectId: '5', kelasIds: ['1', '2'] }
    ],
    jenisKelamin: 'P',
    alamat: 'Jl. Guru No. 4, Nosu',
    nomorHP: '081234567895'
  }
];

const grades = [
  // Sample grades for Ahmad Fadli (studentId: '2')
  {
    id: '1',
    studentId: '2',
    kelasId: '1',
    subjectId: '1', // Matematika
    teacherId: '3',
    tahunAjaran: '2024/2025',
    semester: 1,
    jenis: 'Ulangan Harian',
    nilai: 85,
    tanggal: '2024-09-15',
    verified: true,
    verifiedBy: '3',
    verifiedAt: '2024-09-16T10:00:00.000Z',
    createdAt: '2024-09-15T14:30:00.000Z'
  },
  {
    id: '2',
    studentId: '2',
    kelasId: '1',
    subjectId: '1', // Matematika
    teacherId: '3',
    tahunAjaran: '2024/2025',
    semester: 1,
    jenis: 'UTS',
    nilai: 78,
    tanggal: '2024-10-15',
    verified: false,
    createdAt: '2024-10-15T14:30:00.000Z'
  },
  {
    id: '3',
    studentId: '2',
    kelasId: '1',
    subjectId: '2', // Bahasa Indonesia
    teacherId: '4',
    tahunAjaran: '2024/2025',
    semester: 1,
    jenis: 'Ulangan Harian',
    nilai: 88,
    tanggal: '2024-09-20',
    verified: true,
    verifiedBy: '4',
    verifiedAt: '2024-09-21T10:00:00.000Z',
    createdAt: '2024-09-20T14:30:00.000Z'
  }
];

const attendance = [
  // Sample attendance for Ahmad Fadli (studentId: '2')
  {
    id: '1',
    studentId: '2',
    kelasId: '1',
    subjectId: '1', // Matematika
    teacherId: '3',
    tahunAjaran: '2024/2025',
    semester: 1,
    tanggal: '2024-09-01',
    status: 'hadir', // hadir, sakit, alfa, izin
    keterangan: '',
    createdAt: '2024-09-01T07:00:00.000Z'
  },
  {
    id: '2',
    studentId: '2',
    kelasId: '1',
    subjectId: '1',
    teacherId: '3',
    tahunAjaran: '2024/2025',
    semester: 1,
    tanggal: '2024-09-02',
    status: 'sakit',
    keterangan: 'Demam',
    createdAt: '2024-09-02T07:00:00.000Z'
  },
  {
    id: '3',
    studentId: '2',
    kelasId: '1',
    subjectId: '2', // Bahasa Indonesia
    teacherId: '4',
    tahunAjaran: '2024/2025',
    semester: 1,
    tanggal: '2024-09-01',
    status: 'hadir',
    keterangan: '',
    createdAt: '2024-09-01T08:00:00.000Z'
  }
];

// Export all sample data
const sampleData = {
  users,
  students,
  teachers,
  classes,
  subjects,
  grades,
  attendance,
  academicYears
};

export default sampleData;