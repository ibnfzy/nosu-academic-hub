export interface BaseUserRecord {
  id?: string | number | null;
  username?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface StudentRecord {
  id?: string | number | null;
  userId?: string | number | null;
  [key: string]: unknown;
}

export interface TeacherRecord {
  id?: string | number | null;
  userId?: string | number | null;
  role?: string;
  [key: string]: unknown;
}

export interface MergedUserRecord extends BaseUserRecord {
  id?: string | number | null;
  userId?: string | number | null;
  username: string;
  password: string;
  email: string;
  role: string;
  nama: string;
  nisn: string;
  nip: string;
  kelasId: string | number | null;
  jenisKelamin: string;
  tanggalLahir: string;
  alamat: string;
  nomorHP: string;
  namaOrangTua: string;
  pekerjaanOrangTua: string;
  tahunMasuk: string;
  studentId: string | number | null;
  teacherId: string | number | null;
  walikelasId: string | number | null;
  [key: string]: unknown;
}

export function mergeUserData(
  users?: BaseUserRecord[],
  students?: StudentRecord[],
  teachers?: TeacherRecord[]
): MergedUserRecord[];

export default mergeUserData;
