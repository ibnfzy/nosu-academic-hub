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

// School Profile Data
const schoolProfile = {
  id: '1',
  nama: 'SMA Negeri 1 Nosu',
  kepalaSekolah: 'Drs. Abdul Rahman, M.Pd',
  alamat: 'Jl. Pendidikan No. 1, Nosu, Kabupaten Mamuju Utara, Sulawesi Barat 91571',
  telepon: '(0426) 123456',
  fax: '(0426) 123457',
  email: 'info@sman1nosu.sch.id',
  website: 'https://sman1nosu.sch.id',
  tahunBerdiri: '1985',
  akreditasi: 'A',
  npsn: '40404040',
  statusSekolah: 'Negeri',
  bentukPendidikan: 'SMA',
  waktuPenyelenggaraan: 'Sehari penuh/6 hari',
  jumlahSiswa: 450,
  jumlahGuru: 28,
  jumlahKaryawan: 12,
  luas: '5000 m²',
  visi: 'Mewujudkan generasi yang unggul dalam prestasi, berkarakter mulia, dan berwawasan global berbasis kearifan lokal Sulawesi Barat',
  misi: [
    'Menyelenggarakan pendidikan berkualitas dengan kurikulum yang adaptif',
    'Mengembangkan potensi siswa melalui pembelajaran yang inovatif',
    'Menanamkan nilai-nilai karakter dan budaya lokal',
    'Mempersiapkan siswa menghadapi tantangan era digital',
    'Menciptakan lingkungan sekolah yang kondusif dan ramah'
  ],
  tujuan: [
    'Meningkatkan prestasi akademik dan non-akademik siswa',
    'Menghasilkan lulusan yang berkarakter dan berakhlak mulia',
    'Mempersiapkan siswa untuk melanjutkan ke perguruan tinggi',
    'Mengembangkan keterampilan abad 21 pada siswa'
  ],
  fasilitas: [
    '24 Ruang Kelas ber-AC',
    'Laboratorium IPA (Fisika, Kimia, Biologi)',
    'Laboratorium Komputer',
    'Perpustakaan Digital',
    'Aula Serbaguna',
    'Lapangan Olahraga',
    'Kantin Sehat',
    'Mushola',
    'UKS',
    'Hotspot WiFi'
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-09-10T00:00:00.000Z'
};

// School Achievements
const achievements = [
  {
    id: '1',
    judul: 'Juara 1 Olimpiade Matematika Tingkat Kabupaten 2024',
    tingkat: 'Kabupaten',
    tahun: '2024',
    bidang: 'Akademik',
    penyelenggara: 'Dinas Pendidikan Kabupaten Mamuju Utara',
    peserta: 'Ahmad Fadli - Kelas X IPA 1',
    tanggal: '2024-08-15',
    createdAt: '2024-08-15T10:00:00.000Z'
  },
  {
    id: '2',
    judul: 'Juara 2 Lomba Karya Tulis Ilmiah Tingkat Provinsi 2024',
    tingkat: 'Provinsi',
    tahun: '2024',
    bidang: 'Akademik',
    penyelenggara: 'Dinas Pendidikan Provinsi Sulawesi Barat',
    peserta: 'Tim SMAN 1 Nosu',
    tanggal: '2024-07-20',
    createdAt: '2024-07-20T14:30:00.000Z'
  },
  {
    id: '3',
    judul: 'Sekolah Adiwiyata Tingkat Kabupaten 2023',
    tingkat: 'Kabupaten',
    tahun: '2023',
    bidang: 'Lingkungan',
    penyelenggara: 'Kementerian Lingkungan Hidup dan Kehutanan',
    peserta: 'SMAN 1 Nosu',
    tanggal: '2023-11-10',
    createdAt: '2023-11-10T09:00:00.000Z'
  },
  {
    id: '4',
    judul: 'Akreditasi A dari BAN-S/M',
    tingkat: 'Nasional',
    tahun: '2023',
    bidang: 'Kelembagaan',
    penyelenggara: 'Badan Akreditasi Nasional Sekolah/Madrasah',
    peserta: 'SMAN 1 Nosu',
    tanggal: '2023-05-15',
    createdAt: '2023-05-15T08:00:00.000Z'
  },
  {
    id: '5',
    judul: 'Juara 3 Festival Seni Budaya Sulawesi Barat',
    tingkat: 'Provinsi',
    tahun: '2024',
    bidang: 'Seni',
    penyelenggara: 'Dinas Kebudayaan Provinsi Sulawesi Barat',
    peserta: 'Grup Tari SMAN 1 Nosu',
    tanggal: '2024-06-12',
    createdAt: '2024-06-12T16:00:00.000Z'
  },
  {
    id: '6',
    judul: 'Juara 1 Lomba Bola Voli Antar SMA Se-Kabupaten',
    tingkat: 'Kabupaten',
    tahun: '2024',
    bidang: 'Olahraga',
    penyelenggara: 'KONI Kabupaten Mamuju Utara',
    peserta: 'Tim Putra SMAN 1 Nosu',
    tanggal: '2024-09-05',
    createdAt: '2024-09-05T17:00:00.000Z'
  },
  {
    id: '7',
    judul: 'Sekolah Sehat Tingkat Kabupaten 2024',
    tingkat: 'Kabupaten',
    tahun: '2024',
    bidang: 'Kelembagaan',
    penyelenggara: 'Dinas Kesehatan Kabupaten Mamuju Utara',
    peserta: 'SMAN 1 Nosu',
    tanggal: '2024-03-22',
    createdAt: '2024-03-22T11:00:00.000Z'
  },
  {
    id: '8',
    judul: 'Juara 2 Lomba Debat Bahasa Indonesia Tingkat Kecamatan',
    tingkat: 'Kecamatan',
    tahun: '2024',
    bidang: 'Akademik',
    penyelenggara: 'UPTD Pendidikan Kecamatan Nosu',
    peserta: 'Siti Aminah - Kelas XI IPA 2',
    tanggal: '2024-04-18',
    createdAt: '2024-04-18T13:15:00.000Z'
  }
];

// Study Programs
const programs = [
  {
    id: '1',
    nama: 'IPA (Ilmu Pengetahuan Alam)',
    kode: 'IPA',
    deskripsi: 'Program unggulan dengan fokus pada sains dan teknologi untuk mempersiapkan siswa melanjutkan ke perguruan tinggi bidang SAINTEK. Program ini mengembangkan kemampuan berpikir logis, analitis, dan kritis dalam bidang matematika dan sains.',
    mataPelajaran: [
      'Matematika (Wajib & Peminatan)',
      'Fisika',
      'Kimia', 
      'Biologi',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Pendidikan Agama',
      'PPKn',
      'Sejarah Indonesia',
      'Seni Budaya',
      'Prakarya dan Kewirausahaan',
      'Pendidikan Jasmani'
    ],
    mataPelajaranPeminatan: [
      'Matematika Peminatan',
      'Fisika Peminatan',
      'Kimia Peminatan',
      'Biologi Peminatan'
    ],
    prospek: [
      'Kedokteran dan Ilmu Kesehatan',
      'Teknik (Sipil, Mesin, Elektro, Informatika)',
      'Farmasi dan Ilmu Farmasi',
      'MIPA (Matematika, Fisika, Kimia, Biologi)',
      'Pertanian dan Kehutanan',
      'Perikanan dan Kelautan',
      'Teknologi Pangan'
    ],
    syaratMasuk: [
      'Nilai Matematika minimal 75',
      'Nilai IPA minimal 75',
      'Lulus tes masuk program IPA'
    ],
    jumlahSiswa: 280,
    kapasitas: 300,
    fasilitas: [
      'Laboratorium Fisika',
      'Laboratorium Kimia',
      'Laboratorium Biologi',
      'Ruang Kelas ber-AC',
      'Proyektor LCD',
      'Akses Internet'
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-09-10T00:00:00.000Z'
  },
  {
    id: '2',
    nama: 'IPS (Ilmu Pengetahuan Sosial)',
    kode: 'IPS',
    deskripsi: 'Program yang mengembangkan pemahaman tentang kehidupan sosial, ekonomi, dan budaya untuk mempersiapkan siswa melanjutkan ke perguruan tinggi bidang SOSHUM. Program ini mengembangkan kemampuan berpikir kritis tentang fenomena sosial dan ekonomi.',
    mataPelajaran: [
      'Bahasa Indonesia',
      'Bahasa Inggris', 
      'Matematika (Wajib)',
      'Sejarah Indonesia',
      'Geografi',
      'Ekonomi',
      'Sosiologi',
      'Pendidikan Agama',
      'PPKn',
      'Seni Budaya',
      'Prakarya dan Kewirausahaan',
      'Pendidikan Jasmani'
    ],
    mataPelajaranPeminatan: [
      'Geografi Peminatan',
      'Sejarah Peminatan', 
      'Ekonomi Peminatan',
      'Sosiologi Peminatan'
    ],
    prospek: [
      'Hukum dan Ilmu Hukum',
      'Ekonomi dan Bisnis',
      'Manajemen dan Administrasi',
      'Komunikasi dan Media',
      'Hubungan Internasional',
      'Psikologi',
      'Ilmu Sosial dan Politik',
      'Pendidikan',
      'Pariwisata'
    ],
    syaratMasuk: [
      'Nilai Bahasa Indonesia minimal 75',
      'Nilai IPS minimal 75',
      'Lulus tes masuk program IPS'
    ],
    jumlahSiswa: 170,
    kapasitas: 180,
    fasilitas: [
      'Ruang Kelas ber-AC',
      'Perpustakaan Digital',
      'Ruang Multimedia',
      'Proyektor LCD',
      'Akses Internet',
      'Laboratorium Bahasa'
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-09-10T00:00:00.000Z'
  },
  {
    id: '3',
    nama: 'Bahasa dan Sastra',
    kode: 'BAHASA',
    deskripsi: 'Program khusus untuk siswa yang memiliki minat dan bakat dalam bidang bahasa, sastra, dan budaya. Program ini mengembangkan kemampuan berbahasa dan apresiasi sastra siswa.',
    mataPelajaran: [
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Bahasa Daerah (Mandar)',
      'Sastra Indonesia',
      'Sastra Inggris',
      'Matematika (Wajib)',
      'Pendidikan Agama',
      'PPKn',
      'Sejarah Indonesia',
      'Seni Budaya',
      'Prakarya dan Kewirausahaan',
      'Pendidikan Jasmani'
    ],
    mataPelajaranPeminatan: [
      'Bahasa dan Sastra Indonesia',
      'Bahasa dan Sastra Inggris',
      'Bahasa dan Sastra Daerah',
      'Antropologi'
    ],
    prospek: [
      'Pendidikan Bahasa dan Sastra',
      'Jurnalistik dan Media',
      'Penerjemahan',
      'Sastra dan Budaya',
      'Komunikasi',
      'Pariwisata dan Perhotelan',
      'Diplomasi',
      'Creative Writing'
    ],
    syaratMasuk: [
      'Nilai Bahasa Indonesia minimal 80',
      'Nilai Bahasa Inggris minimal 75',
      'Tes kemampuan berbahasa'
    ],
    jumlahSiswa: 45,
    kapasitas: 60,
    fasilitas: [
      'Ruang Kelas ber-AC',
      'Laboratorium Bahasa',
      'Perpustakaan Sastra',
      'Studio Podcast',
      'Ruang Teater Mini'
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-09-10T00:00:00.000Z'
  }
];

//Registration Links
const registrationLinks = [
  {
    id: '1',
    judul: 'Pendaftaran Siswa Baru 2025/2026 - Jalur Reguler',
    deskripsi: 'Pendaftaran online untuk siswa baru tahun ajaran 2025/2026 melalui jalur reguler. Silakan lengkapi formulir dan upload dokumen yang diperlukan (Ijazah SMP, KK, Akte Kelahiran, dan Pas Foto).',
    link: 'https://ppdb.sman1nosu.sch.id/reguler2025',
    tahunAjaran: '2025/2026',
    jalur: 'Reguler',
    mulaiPendaftaran: '2025-05-01',
    batasPendaftaran: '2025-06-30',
    biayaPendaftaran: 0,
    kuota: 300,
    syarat: [
      'Lulusan SMP/MTs sederajat',
      'Nilai rata-rata rapor minimal 7.0',
      'Sehat jasmani dan rohani',
      'Berusia maksimal 21 tahun'
    ],
    dokumen: [
      'Ijazah SMP/Surat Keterangan Lulus',
      'Kartu Keluarga',
      'Akte Kelahiran',
      'Pas Foto 3x4 (3 lembar)',
      'Surat Keterangan Sehat'
    ],
    status: 'Aktif',
    createdAt: '2024-12-01T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z'
  },
  {
    id: '2', 
    judul: 'Pendaftaran Siswa Baru 2025/2026 - Jalur Prestasi',
    deskripsi: 'Pendaftaran khusus untuk siswa berprestasi akademik dan non-akademik. Tersedia beasiswa penuh untuk siswa berprestasi tingkat nasional.',
    link: 'https://ppdb.sman1nosu.sch.id/prestasi2025',
    tahunAjaran: '2025/2026',
    jalur: 'Prestasi',
    mulaiPendaftaran: '2025-04-01',
    batasPendaftaran: '2025-05-31',
    biayaPendaftaran: 0,
    kuota: 50,
    syarat: [
      'Juara 1-3 olimpiade/lomba tingkat kabupaten atau lebih tinggi',
      'Nilai rata-rata rapor minimal 8.5',
      'Surat rekomendasi dari sekolah asal'
    ],
    dokumen: [
      'Ijazah SMP/Surat Keterangan Lulus',
      'Piagam/Sertifikat Prestasi',
      'Surat Rekomendasi',
      'Kartu Keluarga',
      'Pas Foto 3x4 (3 lembar)'
    ],
    status: 'Aktif',
    createdAt: '2024-12-01T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z'
  },
  {
    id: '3',
    judul: 'Pendaftaran Siswa Pindahan Semester Genap 2024/2025',
    deskripsi: 'Pendaftaran khusus untuk siswa pindahan dari sekolah lain yang akan masuk pada semester genap. Harap sertakan dokumen transfer dan rapor terakhir.',
    link: 'https://ppdb.sman1nosu.sch.id/pindahan2025',
    tahunAjaran: '2024/2025',
    jalur: 'Pindahan',
    mulaiPendaftaran: '2024-12-01',
    batasPendaftaran: '2025-01-15',
    biayaPendaftaran: 50000,
    kuota: 20,
    syarat: [
      'Siswa kelas X atau XI dari SMA sederajat',
      'Nilai rata-rata rapor minimal 7.0',
      'Surat pindah dari sekolah asal',
      'Alasan pindah yang jelas'
    ],
    dokumen: [
      'Surat Pindah dari Sekolah Asal',
      'Rapor Semester Terakhir',
      'Kartu Keluarga',
      'Surat Keterangan Kelakuan Baik',
      'Pas Foto 3x4 (2 lembar)'
    ],
    status: 'Aktif',
    createdAt: '2024-11-15T00:00:00.000Z',
    updatedAt: '2024-12-20T00:00:00.000Z'
  },
  {
    id: '4',
    judul: 'Pendaftaran Kelas Unggulan Sains 2025/2026',
    deskripsi: 'Program khusus untuk siswa dengan minat dan bakat tinggi di bidang sains dan matematika. Dilengkapi dengan fasilitas laboratorium canggih dan pembimbingan olimpiade.',
    link: 'https://ppdb.sman1nosu.sch.id/unggulan2025',
    tahunAjaran: '2025/2026',
    jalur: 'Kelas Unggulan',
    mulaiPendaftaran: '2025-04-15',
    batasPendaftaran: '2025-06-15',
    biayaPendaftaran: 100000,
    kuota: 30,
    syarat: [
      'Nilai Matematika dan IPA minimal 9.0',
      'Lulus tes seleksi akademik',
      'Tes psikologi dan wawancara',
      'Komitmen mengikuti program olimpiade'
    ],
    dokumen: [
      'Ijazah SMP dengan nilai tinggi',
      'Sertifikat prestasi (jika ada)',
      'Surat pernyataan komitmen',
      'Kartu Keluarga',
      'Pas Foto 3x4 (4 lembar)'
    ],
    status: 'Segera Dibuka',
    createdAt: '2024-12-01T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z'
  },
  {
    id: '5',
    judul: 'Pendaftaran Beasiswa Siswa Kurang Mampu 2025/2026',
    deskripsi: 'Program bantuan pendidikan untuk siswa berprestasi dari keluarga kurang mampu. Bantuan meliputi biaya sekolah, seragam, dan buku pelajaran.',
    link: 'https://beasiswa.sman1nosu.sch.id/kurangmampu2025',
    tahunAjaran: '2025/2026',
    jalur: 'Beasiswa',
    mulaiPendaftaran: '2025-05-15',
    batasPendaftaran: '2025-07-15',
    biayaPendaftaran: 0,
    kuota: 25,
    syarat: [
      'Sudah diterima sebagai siswa baru',
      'Nilai rata-rata rapor minimal 8.0',
      'Surat Keterangan Tidak Mampu dari Desa/Kelurahan',
      'Penghasilan orang tua maksimal 2 juta/bulan'
    ],
    dokumen: [
      'SKTM dari Desa/Kelurahan',
      'Slip Gaji atau Surat Keterangan Penghasilan',
      'Kartu Keluarga',
      'Rapor SMP Semester 5 dan 6',
      'Surat Pernyataan Kesanggupan'
    ],
    status: 'Segera Dibuka',
    createdAt: '2024-12-01T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z'
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
  academicYears,
  schoolProfile,
  achievements,
  programs,
  registrationLinks
};

export default sampleData;