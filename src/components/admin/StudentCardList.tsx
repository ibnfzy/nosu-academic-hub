import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, User2 } from "lucide-react";

interface StudentCardListProps {
  students: any[];
  classes: any[];
  loading: boolean;
  onEdit: (student: any) => void;
  onDelete: (id: string) => void;
  getKelasName: (kelasId: string, classes: any[]) => string;
  getFullJenisKelamin: (kode: string) => string;
  formatDate: (dateString: string) => string;
}

const StudentCardSkeleton = () => (
  <div className="border rounded-lg p-4 shadow-sm bg-card">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-2 mt-6">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

const StudentCardList = ({
  students,
  classes,
  loading,
  onEdit,
  onDelete,
  getKelasName,
  getFullJenisKelamin,
  formatDate,
}: StudentCardListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <StudentCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Tidak ada data siswa yang ditampilkan.
      </div>
    );
  }

  const renderField = (label: string, value: string | number | null | undefined) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-foreground break-words">
        {value && value !== "" ? value : "-"}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div
          key={student.id}
          className="border rounded-lg p-4 shadow-sm bg-card flex flex-col gap-4"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {student.nama || "-"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  NIS: {student.nis || "-"} • NISN: {student.nisn || "-"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit">
              {student.role === "siswa" ? "Siswa" : student.role}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(
              "Username / Password",
              `${student.username || "-"} / ${student.password || "-"}`
            )}
            {renderField(
              "Kelas",
              getKelasName(student.kelasId, classes)
            )}
            {renderField("Email", student.email)}
            {renderField(
              "Jenis Kelamin",
              student.jenisKelamin
                ? getFullJenisKelamin(student.jenisKelamin)
                : "-"
            )}
            {renderField(
              "Tanggal Lahir",
              formatDate(student.tanggalLahir)
            )}
            {renderField("Alamat", student.alamat)}
            {renderField("Nomor HP", student.nomorHP)}
            {renderField("Nama Orang Tua", student.namaOrangTua)}
            {renderField(
              "Pekerjaan Orang Tua",
              student.pekerjaanOrangTua
            )}
            {renderField("Tahun Masuk", student.tahunMasuk)}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(student)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(student.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentCardList;
