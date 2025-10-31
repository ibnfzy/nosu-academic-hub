export function mergeUserData(users = [], students = [], teachers = []) {
  const studentMap = new Map();
  const teacherMap = new Map();

  students.forEach((student) => {
    if (student && student.userId !== undefined && student.userId !== null) {
      studentMap.set(String(student.userId), student);
    }
  });

  teachers.forEach((teacher) => {
    if (teacher && teacher.userId !== undefined && teacher.userId !== null) {
      teacherMap.set(String(teacher.userId), teacher);
    }
  });

  return users.map((user) => {
    const userId = user?.id;
    const userIdKey =
      userId !== undefined && userId !== null ? String(userId) : null;
    const student = userIdKey ? studentMap.get(userIdKey) : undefined;
    const teacher = userIdKey ? teacherMap.get(userIdKey) : undefined;

    const merged = {
      ...user,
      id: userId,
      userId: userId,
      username: user?.username ?? "",
      password: user?.password ?? "",
      email: user?.email ?? "",
      role: teacher?.role ?? student?.role ?? user?.role ?? "",
      nama: user?.nama ?? student?.nama ?? teacher?.nama ?? "",
      nis: student?.nis ?? "",
      nisn: student?.nisn ?? "",
      nip: teacher?.nip ?? user?.nip ?? "",
      kelasId: student?.kelasId ?? teacher?.kelasId ?? user?.kelasId ?? "",
      jenisKelamin:
        user?.jenisKelamin ??
        student?.jenisKelamin ??
        teacher?.jenisKelamin ??
        "",
      tanggalLahir: student?.tanggalLahir ?? teacher?.tanggalLahir ?? "",
      alamat: student?.alamat ?? teacher?.alamat ?? user?.alamat ?? "",
      nomorHP: student?.nomorHP ?? teacher?.nomorHP ?? user?.nomorHP ?? "",
      namaOrangTua: student?.namaOrangTua ?? "",
      pekerjaanOrangTua: student?.pekerjaanOrangTua ?? "",
      tahunMasuk: student?.tahunMasuk ?? "",
      studentId: student?.id ?? null,
      teacherId: teacher?.id ?? null,
      walikelasId: teacher?.walikelasId ?? null,
    };

    return merged;
  });
}

export default mergeUserData;
