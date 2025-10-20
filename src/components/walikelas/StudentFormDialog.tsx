import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentForm {
  id?: string;
  userId?: string;
  nisn: string;
  nama: string;
  jenisKelamin: string;
  tanggalLahir: string;
  alamat: string;
  nomorHP: string;
  namaOrangTua: string;
  pekerjaanOrangTua: string;
  tahunMasuk: string;
  username: string;
  password: string;
  email: string;
}

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  isEditing: boolean;
  studentForm: StudentForm;
  onFieldChange: (field: keyof StudentForm, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

const StudentFormDialog = ({
  open,
  onOpenChange,
  trigger,
  isEditing,
  studentForm,
  onFieldChange,
  onSubmit,
  onCancel,
}: StudentFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-md mx-4 md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                value={studentForm.nama}
                onChange={(e) => onFieldChange("nama", e.target.value)}
                placeholder="Masukkan nama siswa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>NISN</Label>
              <Input
                value={studentForm.nisn}
                onChange={(e) => onFieldChange("nisn", e.target.value)}
                placeholder="Masukkan NISN"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={studentForm.username}
                onChange={(e) => onFieldChange("username", e.target.value)}
                placeholder="Username akun siswa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={studentForm.password}
                onChange={(e) => onFieldChange("password", e.target.value)}
                placeholder="Password sementara"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={studentForm.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                placeholder="Email orang tua atau siswa"
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor HP</Label>
              <Input
                value={studentForm.nomorHP}
                onChange={(e) => onFieldChange("nomorHP", e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select
                value={studentForm.jenisKelamin}
                onValueChange={(value) => onFieldChange("jenisKelamin", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                value={studentForm.tanggalLahir}
                onChange={(e) => onFieldChange("tanggalLahir", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tahun Masuk</Label>
              <Input
                value={studentForm.tahunMasuk}
                onChange={(e) => onFieldChange("tahunMasuk", e.target.value)}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Nama Orang Tua</Label>
              <Input
                value={studentForm.namaOrangTua}
                onChange={(e) => onFieldChange("namaOrangTua", e.target.value)}
                placeholder="Nama Ayah/Ibu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pekerjaan Orang Tua</Label>
              <Input
                value={studentForm.pekerjaanOrangTua}
                onChange={(e) => onFieldChange("pekerjaanOrangTua", e.target.value)}
                placeholder="Petani, Guru, dsb."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Alamat</Label>
              <Input
                value={studentForm.alamat}
                onChange={(e) => onFieldChange("alamat", e.target.value)}
                placeholder="Alamat lengkap"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <Button type="submit" className="flex-1">
              {isEditing ? "Update" : "Simpan"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;
