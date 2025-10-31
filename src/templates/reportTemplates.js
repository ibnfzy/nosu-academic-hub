// Template untuk Rapor Siswa - Academic Information System

export const reportCardTemplate = {
  header: {
    schoolName: "SMA NEGERI 1 JAKARTA",
    schoolAddress: "Jl. Pendidikan No. 123, Jakarta Pusat",
    schoolPhone: "Telp: (021) 123-4567",
    reportTitle: "RAPOR SISWA",
    semester: "SEMESTER {semester}",
    academicYear: "TAHUN PELAJARAN {tahunAjaran}"
  },
  
  studentInfo: {
    fields: [
      { label: "Nama Siswa", key: "nama" },
      { label: "NIS", key: "nis" },
      { label: "NISN", key: "nisn" },
      { label: "Kelas", key: "kelas" },
      { label: "Semester", key: "semester" },
      { label: "Tahun Pelajaran", key: "tahunAjaran" }
    ]
  },
  
  gradeTable: {
    headers: [
      "No",
      "Mata Pelajaran", 
      "KKM",
      "Nilai Pengetahuan",
      "Predikat",
      "Deskripsi"
    ],
    subjects: [
      { code: "PAI", name: "Pendidikan Agama Islam", kkm: 75 },
      { code: "PKN", name: "Pendidikan Pancasila dan Kewarganegaraan", kkm: 75 },
      { code: "BIND", name: "Bahasa Indonesia", kkm: 75 },
      { code: "MTK", name: "Matematika", kkm: 75 },
      { code: "BING", name: "Bahasa Inggris", kkm: 75 },
      { code: "SEJ", name: "Sejarah Indonesia", kkm: 75 },
      { code: "PJOK", name: "Pendidikan Jasmani dan Kesehatan", kkm: 75 }
    ]
  },
  
  attendanceSection: {
    title: "KETIDAKHADIRAN",
    fields: [
      { label: "Sakit", key: "sakit", unit: "hari" },
      { label: "Izin", key: "izin", unit: "hari" },
      { label: "Tanpa Keterangan", key: "alpha", unit: "hari" }
    ]
  },
  
  achievementSection: {
    title: "PRESTASI",
    headers: ["No", "Jenis Prestasi", "Keterangan"]
  },
  
  noteSection: {
    title: "CATATAN WALI KELAS",
    placeholder: "Catatan dan saran dari wali kelas..."
  },
  
  signature: {
    locations: [
      {
        position: "left",
        title: "Orang Tua/Wali",
        name: "(...........................)",
        date: "Jakarta, {tanggal}"
      },
      {
        position: "right", 
        title: "Wali Kelas",
        name: "{namaWaliKelas}",
        nip: "NIP. {nipWaliKelas}",
        date: "Jakarta, {tanggal}"
      }
    ]
  },
  
  styles: {
    page: {
      margin: "20mm",
      fontSize: "12pt",
      fontFamily: "Arial, sans-serif"
    },
    header: {
      textAlign: "center",
      marginBottom: "20px",
      borderBottom: "2px solid #000"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "15px"
    },
    tableHeader: {
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
      textAlign: "center",
      padding: "8px",
      border: "1px solid #000"
    },
    tableCell: {
      padding: "6px",
      border: "1px solid #000",
      textAlign: "left"
    },
    signature: {
      marginTop: "30px",
      display: "flex",
      justifyContent: "space-between"
    }
  }
};

export const miniReportTemplate = {
  header: {
    title: "LAPORAN NILAI SISWA",
    subtitle: "Ringkasan Akademik"
  },
  sections: [
    "Informasi Siswa",
    "Nilai Mata Pelajaran", 
    "Kehadiran",
    "Ranking Kelas"
  ]
};

export const progressReportTemplate = {
  header: {
    title: "LAPORAN KEMAJUAN BELAJAR",
    period: "Periode: {startDate} - {endDate}"
  },
  sections: [
    "Progress Pembelajaran",
    "Tugas dan Ujian",
    "Keaktifan Siswa",
    "Rekomendasi"
  ]
};

// Fungsi helper untuk template
export const getTemplateByType = (type) => {
  const templates = {
    'full': reportCardTemplate,
    'mini': miniReportTemplate, 
    'progress': progressReportTemplate
  };
  
  return templates[type] || reportCardTemplate;
};

export const formatTemplateData = (template, data) => {
  let formattedTemplate = JSON.parse(JSON.stringify(template));
  
  // Replace placeholders in template with actual data
  const replacePlaceholders = (obj, data) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/{(\w+)}/g, (match, placeholder) => {
          return data[placeholder] || match;
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        replacePlaceholders(obj[key], data);
      }
    }
  };
  
  replacePlaceholders(formattedTemplate, data);
  return formattedTemplate;
};