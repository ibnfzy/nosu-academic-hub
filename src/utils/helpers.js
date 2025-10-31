/**
 * Helper functions untuk Academic Information System
 * SMA Negeri 1 Nosu - Sulawesi Barat
 */

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date - Tanggal input
 * @param {boolean} includeTime - Apakah menyertakan waktu
 * @returns {string} - Tanggal terformat
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return "-";

  const d = new Date(date);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return d.toLocaleDateString("id-ID", options);
};

/**
 * Format nama untuk menampilkan inisial jika nama terlalu panjang
 * @param {string} nama - Nama lengkap
 * @param {number} maxLength - Panjang maksimal
 * @returns {string} - Nama terformat
 */
export const formatName = (nama, maxLength = 20) => {
  if (!nama) return "-";

  if (nama.length <= maxLength) return nama;

  const words = nama.split(" ");
  if (words.length === 1) return nama.substring(0, maxLength) + "...";

  const firstName = words[0];
  const lastInitial = words[words.length - 1].charAt(0);
  return `${firstName} ${lastInitial}.`;
};

/**
 * Menghitung nilai rata-rata
 * @param {Array} grades - Array nilai
 * @returns {number} - Nilai rata-rata
 */
export const calculateAverage = (grades) => {
  if (!grades || grades.length === 0) return 0;

  const total = grades.reduce(
    (sum, grade) => sum + (parseFloat(grade.nilai) || 0),
    0
  );
  return Math.round((total / grades.length) * 100) / 100;
};

/**
 * Parse jumlah hari belajar menjadi angka.
 * @param {number|string|null|undefined} value
 * @returns {number|null}
 */
const parseLearningDays = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const numericPortion = trimmed.replace(/[^0-9.,-]/g, "").replace(/,/g, ".");

    if (!numericPortion) return null;

    const parsed = Number(numericPortion);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
};

/**
 * Menghitung statistik kehadiran
 * @param {Array} attendance - Array kehadiran
 * @param {Object} [options] - Opsi tambahan untuk perhitungan
 * @param {number|string|null} [options.totalSchoolDays] - Jumlah hari belajar
 * @param {Object|null} [options.semesterMetadata] - Metadata semester yang memuat jumlah hari belajar
 * @param {Object|null} [options.semesterInfo] - Informasi semester alternatif
 * @returns {Object} - Statistik kehadiran
 */
export const calculateAttendanceStats = (attendance, options = {}) => {
  const attendanceArray = Array.isArray(attendance) ? attendance : [];

  if (attendanceArray.length === 0) {
    return { hadir: 0, sakit: 0, alfa: 0, izin: 0, total: 0, persentase: 0 };
  }

  const stats = attendanceArray.reduce(
    (acc, curr) => {
      if (curr && typeof curr === "object" && curr.status) {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
      }
      acc.total++;
      return acc;
    },
    { hadir: 0, sakit: 0, alfa: 0, izin: 0, total: 0 }
  );

  const {
    totalSchoolDays,
    semesterMetadata = null,
    semesterInfo = null,
  } = options || {};

  const resolvedTotalSchoolDays = (() => {
    const directValue =
      parseLearningDays(totalSchoolDays) ??
      parseLearningDays(semesterMetadata?.jumlahHariBelajar) ??
      parseLearningDays(semesterInfo?.jumlahHariBelajar);
    if (directValue) {
      return directValue;
    }

    for (const record of attendanceArray) {
      if (!record || typeof record !== "object") continue;
      const candidate =
        record.jumlahHariBelajar ??
        record.totalSchoolDays ??
        record.hariBelajar ??
        record.semesterJumlahHariBelajar ??
        record?.semesterInfo?.jumlahHariBelajar ??
        record?.semesterInfo?.totalSchoolDays;

      const parsedCandidate = parseLearningDays(candidate);
      if (parsedCandidate) {
        return parsedCandidate;
      }
    }

    return null;
  })();

  const ratio = (() => {
    if (resolvedTotalSchoolDays && resolvedTotalSchoolDays > 0) {
      return stats.hadir / resolvedTotalSchoolDays;
    }
    if (stats.total > 0) {
      return stats.hadir / stats.total;
    }
    return 0;
  })();

  const percentage = Math.round(Math.max(0, Math.min(1, ratio)) * 100);

  return {
    ...stats,
    persentase: Number.isFinite(percentage) ? percentage : 0,
  };
};

/**
 * Menghitung urutan hari belajar berdasarkan tanggal dan metadata semester.
 * @param {string|Date|null|undefined} date - Tanggal kegiatan belajar.
 * @param {Object} [options]
 * @param {Object|null} [options.semesterMetadata] - Metadata semester terstandardisasi.
 * @param {Object|null} [options.semesterInfo] - Informasi semester mentah (fallback).
 * @param {string|Date|null|undefined} [options.startDate] - Tanggal mulai eksplisit.
 * @param {string|Date|null|undefined} [options.fallbackStartDate] - Tanggal mulai cadangan.
 * @returns {number|null} - Hari ke-berapa atau null jika tidak dapat dihitung.
 */
export const getStudyDayNumber = (date, options = {}) => {
  if (!date) return null;

  const { semesterMetadata = null, semesterInfo = null } = options || {};
  const { startDate: explicitStartDate = null, fallbackStartDate = null } =
    options || {};

  const toDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const recordDate = toDate(date);
  if (!recordDate) return null;

  const candidateStarts = [
    explicitStartDate,
    semesterMetadata?.tanggalMulai,
    semesterMetadata?.startDate,
    semesterInfo?.tanggalMulai,
    semesterInfo?.startDate,
    fallbackStartDate,
  ];

  for (const candidate of candidateStarts) {
    const start = toDate(candidate);
    if (!start) continue;

    const recordUTC = Date.UTC(
      recordDate.getUTCFullYear(),
      recordDate.getUTCMonth(),
      recordDate.getUTCDate()
    );
    const startUTC = Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate()
    );

    const diff = Math.floor((recordUTC - startUTC) / (1000 * 60 * 60 * 24));
    if (Number.isFinite(diff) && diff >= 0) {
      return diff + 1;
    }
  }

  return null;
};

/**
 * Mendapatkan warna berdasarkan nilai
 * @param {number} nilai - Nilai numerik
 * @returns {string} - Class warna CSS
 */
export const getGradeColor = (nilai) => {
  if (nilai >= 90) return "text-success";
  if (nilai >= 80) return "text-accent";
  if (nilai >= 70) return "text-warning";
  if (nilai >= 60) return "text-primary";
  return "text-destructive";
};

/**
 * Mendapatkan predikat nilai
 * @param {number} nilai - Nilai numerik
 * @returns {string} - Predikat nilai
 */
export const getGradePredicate = (nilai) => {
  if (nilai >= 90) return "A (Sangat Baik)";
  if (nilai >= 80) return "B (Baik)";
  if (nilai >= 70) return "C (Cukup)";
  return "D (Kurang)";
};

/**
 * Mendapatkan status kehadiran dengan warna
 * @param {string} status - Status kehadiran
 * @returns {Object} - Status dengan warna dan label
 */
export const getAttendanceStatus = (status) => {
  const statusMap = {
    hadir: { label: "Hadir", color: "text-success", bgColor: "bg-success/10" },
    sakit: { label: "Sakit", color: "text-warning", bgColor: "bg-warning/10" },
    alfa: {
      label: "Alfa",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    izin: { label: "Izin", color: "text-primary", bgColor: "bg-primary/10" },
  };

  return (
    statusMap[status] || {
      label: "Unknown",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    }
  );
};

/**
 * Generate ID unik
 * @returns {string} - ID unik
 */
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Validasi NISN (10 digit)
 * @param {string} nisn - NISN yang akan divalidasi
 * @returns {boolean} - Valid atau tidak
 */
export const validateNISN = (nisn) => {
  return /^\d{10}$/.test(nisn);
};

/**
 * Validasi NIP (18 digit)
 * @param {string} nip - NIP yang akan divalidasi
 * @returns {boolean} - Valid atau tidak
 */
export const validateNIP = (nip) => {
  return /^\d{18}$/.test(nip);
};

/**
 * Filter data berdasarkan tahun ajaran dan semester
 * @param {Array} data - Data yang akan difilter
 * @param {string} tahunAjaran - Tahun ajaran
 * @param {number} semester - Semester
 * @returns {Array} - Data terfilter
 */
export const filterByAcademicPeriod = (data, tahunAjaran, semester) => {
  if (!data || !tahunAjaran) return [];

  return data.filter(
    (item) =>
      item.tahunAjaran === tahunAjaran &&
      (!semester || item.semester === semester)
  );
};

/**
 * Format tahun ajaran untuk display
 * @param {string} tahunAjaran - Tahun ajaran (format: 2024/2025)
 * @param {number} semester - Semester
 * @returns {string} - Format display
 */
export const formatAcademicPeriod = (
  tahunAjaranOrMetadata,
  semesterValue,
  semesterInfo = null
) => {
  const isObject =
    tahunAjaranOrMetadata && typeof tahunAjaranOrMetadata === "object";

  const metadata = isObject
    ? tahunAjaranOrMetadata
    : typeof semesterInfo === "object" && semesterInfo
    ? semesterInfo
    : null;

  const resolvedTahunAjaran = (() => {
    if (isObject) {
      return (
        tahunAjaranOrMetadata?.tahunAjaran ||
        tahunAjaranOrMetadata?.tahun ||
        tahunAjaranOrMetadata?.academicYear ||
        null
      );
    }

    if (metadata) {
      return (
        metadata?.tahunAjaran ||
        metadata?.tahun ||
        metadata?.academicYear ||
        tahunAjaranOrMetadata ||
        null
      );
    }

    return tahunAjaranOrMetadata || null;
  })();

  const resolvedSemester = (() => {
    if (isObject) {
      return (
        tahunAjaranOrMetadata?.semesterNumber ||
        tahunAjaranOrMetadata?.semester ||
        tahunAjaranOrMetadata?.semesterValue ||
        null
      );
    }

    if (
      semesterValue === undefined ||
      semesterValue === null ||
      semesterValue === ""
    ) {
      if (metadata) {
        return (
          metadata?.semesterNumber ||
          metadata?.semester ||
          metadata?.semesterValue ||
          null
        );
      }
      return null;
    }

    return semesterValue;
  })();

  const semesterLabel = (() => {
    if (resolvedSemester === undefined || resolvedSemester === null) {
      return "";
    }

    const numericValue = Number(resolvedSemester);
    if (!Number.isNaN(numericValue)) {
      if (numericValue === 1) return "Semester Ganjil";
      if (numericValue === 2) return "Semester Genap";
      return `Semester ${numericValue}`;
    }

    if (typeof resolvedSemester === "string" && resolvedSemester.trim()) {
      const normalized = resolvedSemester.toLowerCase();
      if (normalized === "ganjil" || normalized === "genap") {
        return `Semester ${resolvedSemester[0].toUpperCase()}${resolvedSemester
          .slice(1)
          .toLowerCase()}`;
      }
      return resolvedSemester;
    }

    return "";
  })();

  if (!resolvedTahunAjaran && !semesterLabel) {
    return "-";
  }

  if (!resolvedTahunAjaran) {
    return semesterLabel || "-";
  }

  if (!semesterLabel) {
    return resolvedTahunAjaran;
  }

  return `${resolvedTahunAjaran} - ${semesterLabel}`;
};

/**
 * Mengecek apakah nilai sudah terverifikasi
 * @param {Object} grade - Data nilai
 * @returns {boolean} - Status verifikasi
 */
export const isGradeVerified = (grade) => {
  return grade && grade.verified === true;
};

/**
 * Mendapatkan nama mata pelajaran berdasarkan ID
 * @param {string} subjectId - ID mata pelajaran
 * @returns {string} - Nama mata pelajaran
 */
export const getSubjectName = (subjectId) => {
  const subjects = [
    { id: "1", nama: "Matematika" },
    { id: "2", nama: "Bahasa Indonesia" },
    { id: "3", nama: "Bahasa Inggris" },
    { id: "4", nama: "Fisika" },
    { id: "5", nama: "Kimia" },
    { id: "6", nama: "Biologi" },
  ];

  const subject = subjects.find((s) => s.id === subjectId);
  return subject ? subject.nama : "Mata Pelajaran";
};

/**
 * Menghitung nilai harian dari kuis dan tugas
 * @param {Array} grades - Array nilai
 * @returns {number} - Nilai rata-rata harian
 */
export const calculateDailyGrade = (grades) => {
  const dailyGrades = grades.filter(
    (g) => g.jenis === "Kuis" || g.jenis === "Tugas"
  );
  if (dailyGrades.length === 0) return 0;

  const total = dailyGrades.reduce((sum, grade) => sum + (grade.nilai || 0), 0);
  return Math.round((total / dailyGrades.length) * 100) / 100;
};

/**
 * Mengelompokkan nilai berdasarkan mata pelajaran
 * @param {Array} grades - Array nilai
 * @returns {Object} - Nilai terkelompok per subject
 */
export const groupGradesBySubject = (grades) => {
  const grouped = {};

  grades.forEach((grade) => {
    const subjectId = grade.subjectId;
    if (!grouped[subjectId]) {
      grouped[subjectId] = {
        subjectId,
        subjectName: grade.subjectName,
        kuis: [],
        tugas: [],
        uts: null,
        uas: null,
        ulangan: [],
      };
    }

    switch (grade.jenis) {
      case "Kuis":
        grouped[subjectId].kuis.push(grade);
        break;
      case "Tugas":
        grouped[subjectId].tugas.push(grade);
        break;
      case "UTS":
        grouped[subjectId].uts = grade;
        break;
      case "UAS":
        grouped[subjectId].uas = grade;
        break;
      case "Ulangan Harian":
        grouped[subjectId].ulangan.push(grade);
        break;
    }
  });

  // Hitung nilai harian untuk setiap mata pelajaran
  Object.keys(grouped).forEach((subjectId) => {
    const subject = grouped[subjectId];
    const dailyGrades = [...subject.kuis, ...subject.tugas];
    subject.nilaiHarian = calculateDailyGrade(dailyGrades);
    subject.rataUlangan = calculateAverage(subject.ulangan);
  });

  return grouped;
};

export const getFinalGrade = (finalGradeArr) => {
  if (!Array.isArray(finalGradeArr) || finalGradeArr.length === 0) {
    return 0; // default kalau kosong
  }

  const total = finalGradeArr.reduce((sum, val) => sum + val, 0);
  const average = total / finalGradeArr.length;

  return parseFloat(average.toFixed(2)); // hasil rata-rata 2 digit desimal
};

export const normalizeData = (data) => {
  // kalau sudah array, kembalikan apa adanya
  if (Array.isArray(data)) return data;

  // kalau object, ambil values → jadikan array
  if (typeof data === "object" && data !== null) {
    return Object.values(data).filter(
      (item) =>
        typeof item === "object" ||
        typeof item === "string" ||
        typeof item === "number"
    );
  }

  // fallback → bungkus jadi array
  return [data];
};

/**
 * Generate raport HTML untuk print
 * @param {Object} reportData - Data raport
 * @returns {string} - HTML raport
 */
export const generateReportHTML = (reportData) => {
  const {
    student,
    grades,
    attendance,
    tahunAjaran,
    semester,
    semesterInfo,
    semesterTanggalMulai,
    semesterTanggalSelesai,
    semesterJumlahHariBelajar,
    walikelas,
    profileSchool,
  } = reportData;

  if (!student) return "";

  // Pastikan grades jadi array dan nilai float
  const gradesArray = Array.isArray(grades)
    ? grades
    : Object.values(grades).filter((item) => typeof item === "object");

  // Convert nilai ke float
  const normalizedGrades = gradesArray.map((g) => ({
    ...g,
    nilai: g.nilai !== undefined ? parseFloat(g.nilai) : null,
  }));

  const resolvedSemesterInfo = (() => {
    if (semesterInfo && typeof semesterInfo === "object") {
      return semesterInfo;
    }

    return null;
  })();

  const semesterLearningDays =
    semesterJumlahHariBelajar ??
    resolvedSemesterInfo?.jumlahHariBelajar ??
    resolvedSemesterInfo?.learningDays ??
    resolvedSemesterInfo?.totalSchoolDays ??
    resolvedSemesterInfo?.hariEfektif ??
    null;

  const groupedGrades = groupGradesBySubject(gradesArray);
  const averageGrade = calculateAverage(normalizedGrades);
  const attendanceStats = calculateAttendanceStats(attendance, {
    totalSchoolDays: semesterLearningDays,
    semesterMetadata: resolvedSemesterInfo,
  });
  const finalGradeArr = [];

  const semesterStartDate =
    resolvedSemesterInfo?.tanggalMulai ||
    resolvedSemesterInfo?.startDate ||
    semesterTanggalMulai ||
    resolvedSemesterInfo?.periodeMulai ||
    resolvedSemesterInfo?.mulai ||
    null;

  const semesterEndDate =
    resolvedSemesterInfo?.tanggalSelesai ||
    resolvedSemesterInfo?.endDate ||
    semesterTanggalSelesai ||
    resolvedSemesterInfo?.periodeSelesai ||
    resolvedSemesterInfo?.selesai ||
    null;

  const formattedSemesterPeriod = formatAcademicPeriod(
    tahunAjaran,
    semester,
    resolvedSemesterInfo
  );

  const formattedSemesterDateRange = (() => {
    if (!semesterStartDate || !semesterEndDate) return "";
    return `${formatDate(semesterStartDate)} - ${formatDate(semesterEndDate)}`;
  })();

  const formattedLearningDays = (() => {
    if (
      semesterLearningDays === null ||
      semesterLearningDays === undefined ||
      semesterLearningDays === ""
    ) {
      return "-";
    }

    const numericValue = Number(semesterLearningDays);
    if (!Number.isNaN(numericValue)) {
      return `${numericValue} hari`;
    }

    return `${semesterLearningDays}`;
  })();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Raport ${student.nama} - ${formattedSemesterPeriod}</title>
      <style>
        @page { size: A4; margin: 20mm; }
    body { 
      font-family: 'Times New Roman', serif; 
      font-size: 12pt; 
      line-height: 1.4;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .header h1 { margin: 5px 0; font-size: 18pt; }
    .header h2 { margin: 5px 0; font-size: 16pt; }
    .header p { margin: 2px 0; font-size: 12pt; }

    .student-info {
      margin-bottom: 20px;
    }
    .student-info table {
      width: 100%;
      border-collapse: collapse;
    }
    .student-info td {
      padding: 4px 8px;
      border: 1px solid #333;
    }

    .grades-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .grades-table th,
    .grades-table td {
      border: 1px solid #333;
      padding: 8px 4px;
      text-align: center;
    }
    .grades-table th {
      background-color: #f0f0f0;
      font-weight: bold;
    }

    .grade-info {
      margin-bottom: 20px;
      font-size: 11pt;
    }

    .grade-info p {
      margin: 2px 0;
    }

    /* Flexbox section for nilai rata-rata + periode akademik */
    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 20px;
    }

    .summary-left {
      flex: 1;
    }
    .summary-right {
      flex: 1;
    }
    .summary-right p {
      margin: 4px 0;
    }

    .footer {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
    }
    .footer div {
      text-align: center;
      width: 30%;
    }
    .signature-space {
      height: 60px;
      border-bottom: 1px solid #333;
      margin: 10px auto;
      width: 90%;
    }
    .signature-block {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>RAPOR SISWA</h1>
        <h2>SMA NEGERI 1 NOSU</h2>
        <p>${profileSchool?.alamat}</p>
        <p>Telepon: ${profileSchool?.telepon} | Email: ${
    profileSchool?.email
  }</p>
        <p>${formattedSemesterPeriod}</p>
        ${
          formattedSemesterDateRange
            ? `<p>${formattedSemesterDateRange}</p>`
            : ""
        }
      </div>
      
      <div class="student-info">
        <table>
          <tr>
            <td><strong>Nama Siswa</strong></td>
            <td>${student.nama}</td>
            <td><strong>NIS</strong></td>
            <td>${student.nis ?? "-"}</td>
          </tr>
          <tr>
            <td><strong>NISN</strong></td>
            <td>${student.nisn ?? "-"}</td>
            <td><strong>Kelas</strong></td>
            <td>${student.kelasId}</td>
          </tr>
          <tr>
            <td><strong>Semester</strong></td>
            <td>${formattedSemesterPeriod}</td>
            <td><strong>Tahun Ajaran</strong></td>
            <td>${tahunAjaran}</td>
          </tr>
          <tr>
            <td><strong>Wali Kelas</strong></td>
            <td>${walikelas?.nama || "-"}</td>
            <td></td>
            <td></td>
          </tr>
        </table>
      </div>
      
      <table class="grades-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Mata Pelajaran</th>
            <th>Nilai Harian</th>
            <th>UTS</th>
            <th>UAS</th>
            <th>Nilai Akhir</th>
            <th>Predikat</th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(groupedGrades)
            .map((subject, index) => {
              const finalGrade = (() => {
                console.log("Subject :", subject);
                const nilaiHarian = parseFloat(subject.rataUlangan) || 0;
                const uts = parseFloat(subject.uts?.nilai) || 0;
                const uas = parseFloat(subject.uas?.nilai) || 0;

                const total = nilaiHarian + uts + uas;
                const average = total / 3;

                const final = parseFloat(average.toFixed(2));

                finalGradeArr.push(final);

                return final; // dua digit desimal
              })();
              return `
            <tr>
              <td>${index + 1}</td>
              <td style="text-align: left;">${subject.subjectName}</td>
              <td>${
                subject.nilaiHarian > 0
                  ? subject.nilaiHarian
                  : subject.rataUlangan > 0
                  ? subject.rataUlangan
                  : "-"
              }</td>
              <td>${subject.uts?.nilai || "-"}</td>
              <td>${subject.uas?.nilai || "-"}</td>
              <td><strong>${finalGrade}</strong></td>
              <td>${getGradePredicate(finalGrade)}</td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-left">
          <p><strong>Nilai Rata-rata:</strong> ${getFinalGrade(
            finalGradeArr
          )} (${getGradePredicate(getFinalGrade(finalGradeArr))})</p>
          <p><strong>Kehadiran:</strong> Hadir: ${
            attendanceStats.hadir
          }, Sakit: ${attendanceStats.sakit}, Alfa: ${
    attendanceStats.alfa
  }, Izin: ${attendanceStats.izin}</p>
          <p><strong>Persentase Kehadiran:</strong> ${
            attendanceStats.persentase
          }%</p>
        </div>

        <div class="summary-right">
          <p><strong>Jumlah Hari Belajar:</strong> ${formattedLearningDays}</p>
          <div class="grade-info">
            <p><strong>Keterangan Predikat:</strong></p>
            <p>A (Sangat Baik) = 90 - 100</p>
            <p>B (Baik) = 80 - 89</p>
            <p>C (Cukup) = 70 - 79</p>
            <p>D (Kurang) = 0 - 69</p>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <div class="signature-block">
          <p>Mengetahui, <br> <strong>Kepala Sekolah</strong></p>
          <div class="signature-space"></div>
          <p>${profileSchool?.kepalaSekolah}</p>
          <p>NIP. ${profileSchool?.nipKepalaSekolah}</p>
        </div>
        <div class="signature-block">
          <p><br>Wali Kelas</p>
          <div class="signature-space"></div>
          <p>${walikelas?.nama || "Nama Wali Kelas"}</p>
          <p>NIP. ${walikelas?.nip || "-"}</p>
        </div>
        <div class="signature-block">
          <p>Nosu, ${formatDate(
            new Date()
          )} <br> <strong>Orang Tua/Wali</strong></p>
          <div class="signature-space"></div>
          <p>(...........................)</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Print raport
 * @param {Object} reportData - Data raport
 */
export const printReport = (reportData) => {
  const htmlContent = generateReportHTML(reportData);
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
