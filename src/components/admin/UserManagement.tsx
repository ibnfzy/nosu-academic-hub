/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { Skeleton } from "@/components/ui/skeleton";

interface UserManagementProps {
  users: any[];
  activeSection: string;
  onDataChange: () => void;
}

export default function UserManagement({
  users,
  activeSection,
  onDataChange,
}: UserManagementProps) {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [userForm, setUserForm] = useState({
    // Users table fields
    username: "",
    password: "",
    email: "",
    role: "",

    // Students/Teachers table fields
    nama: "",
    nis: "",
    nisn: "",
    nip: "",
    kelasId: "",
    jenisKelamin: "",
    tanggalLahir: "",
    alamat: "",
    nomorHP: "",
    namaOrangTua: "",
    pekerjaanOrangTua: "",
    tahunMasuk: "",
  });

  const { toast } = useToast();

  // Validation functions
  const validateNISN = (nisn: string): boolean => {
    return /^\d{10}$/.test(nisn);
  };

  const validateNIP = (nip: string): boolean => {
    return /^\d{18}$/.test(nip);
  };

  // Load classes data
  const loadClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const classesData = await apiService.getClasses();
      setClasses(classesData);
    } catch (error) {
      console.error("Error loading classes:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data kelas",
        variant: "destructive",
      });
    } finally {
      setLoadingClasses(false);
    }
  }, [toast]);

  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (users && users.length === 0) {
      setLoadingUsers(true);
    } else {
      setLoadingUsers(false);
    }
  }, [users]);

  // Auto-set role when activeSection changes
  useEffect(() => {
    if (activeSection !== "guru" && !editingItem) {
      setUserForm((prev) => ({ ...prev, role: activeSection }));
    } else if (activeSection === "guru" && !editingItem && !userForm.role) {
      setUserForm((prev) => ({ ...prev, role: "guru" }));
    }
  }, [activeSection, editingItem, userForm.role]);

  const roles = [
    { value: "admin", label: "Administrator" },
    { value: "guru", label: "Guru" },
    { value: "walikelas", label: "Walikelas" },
    { value: "siswa", label: "Siswa" },
  ];

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-set role based on activeSection if not already set
    const currentRole = userForm.role || activeSection;

    if (!userForm.username || !currentRole) {
      toast({
        title: "Error",
        description: "Mohon lengkapi field wajib",
        variant: "destructive",
      });
      return;
    }

    // ambil id user kalau sedang edit
    const editingId = editingItem?.id;

    // 🔹 Validasi unik berdasarkan role
    const isDuplicateUsername = users.some(
      (u) => u.username === userForm.username && u.id !== editingId
    );
    const isDuplicateEmail = users.some(
      (u) => u.email === userForm.email && u.id !== editingId
    );

    if (isDuplicateUsername) {
      toast({
        title: "Error",
        description: "Username sudah terpakai, silakan gunakan yang lain.",
        variant: "destructive",
      });
      return;
    }

    if (isDuplicateEmail) {
      toast({
        title: "Error",
        description: "Email sudah terpakai, silakan gunakan yang lain.",
        variant: "destructive",
      });
      return;
    }

    if (currentRole === "siswa") {
      const isDuplicateNis = users.some(
        (u) => u.nis === userForm.nis && u.id !== editingId
      );
      const isDuplicateNisn = users.some(
        (u) => u.nisn === userForm.nisn && u.id !== editingId
      );
      if (isDuplicateNis) {
        toast({
          title: "Error",
          description: "NIS sudah terpakai.",
          variant: "destructive",
        });
        return;
      }
      if (isDuplicateNisn) {
        toast({
          title: "Error",
          description: "NISN sudah terpakai.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentRole === "guru" || currentRole === "walikelas") {
      const isDuplicateNip = users.some(
        (u) => u.nip === userForm.nip && u.id !== editingId
      );
      if (isDuplicateNip) {
        toast({
          title: "Error",
          description: "NIP sudah terpakai.",
          variant: "destructive",
        });
        return;
      }
    }

    // Nama wajib untuk semua role kecuali admin
    if (currentRole !== "admin" && !userForm.nama) {
      toast({
        title: "Error",
        description: "Nama lengkap wajib diisi",
        variant: "destructive",
      });
      return;
    }

    // Validate role-specific required fields
    if (currentRole === "siswa" && !userForm.nis) {
      toast({
        title: "Error",
        description: "NIS wajib diisi untuk siswa",
        variant: "destructive",
      });
      return;
    }

    if (currentRole === "siswa" && !userForm.nisn) {
      toast({
        title: "Error",
        description: "NISN wajib diisi untuk siswa",
        variant: "destructive",
      });
      return;
    }

    if (
      currentRole === "siswa" &&
      userForm.nisn &&
      !validateNISN(userForm.nisn)
    ) {
      toast({
        title: "Error",
        description: "NISN harus terdiri dari 10 angka",
        variant: "destructive",
      });
      return;
    }

    if (
      (currentRole === "guru" || currentRole === "walikelas") &&
      !userForm.nip
    ) {
      toast({
        title: "Error",
        description: "NIP wajib diisi untuk guru/walikelas",
        variant: "destructive",
      });
      return;
    }

    if (
      (currentRole === "guru" || currentRole === "walikelas") &&
      userForm.nip &&
      !validateNIP(userForm.nip)
    ) {
      toast({
        title: "Error",
        description: "NIP harus terdiri dari 18 angka",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare payload based on user type
      const baseUserData = {
        username: userForm.username,
        password: userForm.password,
        email: userForm.email,
        role: currentRole,
      };

      let payload;

      if (currentRole === "siswa") {
        payload = {
          users: baseUserData,
          students: {
            nis: userForm.nis,
            nisn: userForm.nisn,
            nama: userForm.nama,
            kelasId: userForm.kelasId,
            jenisKelamin: userForm.jenisKelamin,
            tanggalLahir: userForm.tanggalLahir,
            alamat: userForm.alamat,
            nomorHP: userForm.nomorHP,
            namaOrangTua: userForm.namaOrangTua,
            pekerjaanOrangTua: userForm.pekerjaanOrangTua,
            tahunMasuk: userForm.tahunMasuk,
          },
        };
      } else if (currentRole === "guru") {
        payload = {
          users: baseUserData,
          teachers: {
            nip: userForm.nip,
            nama: userForm.nama,
            role: "guru",
            jenisKelamin: userForm.jenisKelamin,
            alamat: userForm.alamat,
            nomorHP: userForm.nomorHP,
          },
        };
      } else if (currentRole === "walikelas") {
        payload = {
          users: baseUserData,
          teachers: {
            nip: userForm.nip,
            nama: userForm.nama,
            role: "walikelas",
            jenisKelamin: userForm.jenisKelamin,
            alamat: userForm.alamat,
            nomorHP: userForm.nomorHP,
          },
        };
      } else {
        // Admin users only need users table
        payload = baseUserData;
      }

      let result;
      if (editingItem) {
        // For updates
        switch (currentRole) {
          case "siswa":
            result = await apiService.updateStudent(editingItem.id, payload);
            break;
          case "guru":
          case "walikelas":
            result = await apiService.updateTeacher(editingItem.id, payload);
            break;
          default:
            result = await apiService.updateUser(editingItem.id, payload);
        }
      } else {
        // For creation
        switch (currentRole) {
          case "siswa":
            result = await apiService.createStudent(payload);
            break;
          case "guru":
          case "walikelas":
            result = await apiService.createTeacher(payload);
            break;
          default:
            result = await apiService.createUser(payload);
        }
      }

      console.log(result);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: `User berhasil ${
            editingItem ? "diupdate" : "ditambahkan"
          }`,
        });

        resetUserForm();
        onDataChange();
        loadClasses(); // Reload classes data
        setShowUserDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        // Find the user to determine the correct delete method
        const user = users.find((u) => u.id === userId);
        let result;

        if (user) {
          switch (user.role) {
            case "siswa":
              result = await apiService.deleteStudent(userId);
              break;
            case "guru":
            case "walikelas":
              result = await apiService.deleteTeacher(userId);
              break;
            default:
              result = await apiService.deleteUser(userId);
          }
        } else {
          result = await apiService.deleteUser(userId);
        }

        if (result.success) {
          console.log(result);
          toast({
            title: "Berhasil",
            description: "User berhasil dihapus",
          });
          onDataChange();
          loadClasses(); // Reload classes data
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus user",
          variant: "destructive",
        });
      }
    }
  };

  const resetUserForm = () => {
    setUserForm({
      // Users table fields
      username: "",
      password: "",
      email: "",
      role: activeSection === "guru" ? "guru" : activeSection,

      // Students/Teachers table fields
      nama: "",
      nis: "",
      nisn: "",
      nip: "",
      kelasId: "",
      jenisKelamin: "",
      tanggalLahir: "",
      alamat: "",
      nomorHP: "",
      namaOrangTua: "",
      pekerjaanOrangTua: "",
      tahunMasuk: "",
    });
    setEditingItem(null);
  };

  const editUser = (user: any) => {
    console.log("User : ", user);
    const formData = {
      username: user.username || "",
      nama: user.role === "admin" ? "" : user.nama || "",
      email: user.email || "",
      nis: user.nis || "",
      nisn: user.nisn || "",
      nip: user.nip || "",
      role: user.role || "",
      jenisKelamin: user.jenisKelamin || "",
      tahunMasuk: user.tahunMasuk || "",
      tanggalLahir: formatDate(user.tanggalLahir),
      alamat: user.alamat || "",
      nomorHP: user.nomorHP || "",
      namaOrangTua: user.namaOrangTua || "",
      pekerjaanOrangTua: user.pekerjaanOrangTua || "",
      kelasId: user.kelasId ? String(user.kelasId) : "", // tambahkan ini
      password: user.password,
    };

    setUserForm(formData);
    setEditingItem(user);
    setShowUserDialog(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      (user.role !== "admin" &&
        user.nama?.toLowerCase().includes(normalizedSearch)) ||
      user.username?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch) ||
      (user.nis && String(user.nis).toLowerCase().includes(normalizedSearch)) ||
      (user.nisn && String(user.nisn).toLowerCase().includes(normalizedSearch));

    if (activeSection !== "semua") {
      return user.role === activeSection && matchesRole && matchesSearch;
    }
    return matchesRole && matchesSearch;
  });

  const getKelasName = (kelasId: string, classes: any[]) => {
    if (!kelasId) return "-";
    const kelas = classes.find((c) => String(c.id) === String(kelasId));
    return kelas ? kelas.nama : "-";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0]; // hasil: "2024-09-28"
  };

  function getFullJenisKelamin(kode: string): string {
    if (kode === "P") return "Perempuan";
    if (kode === "L") return "Laki-laki";
    return "Tidak diketahui";
  }

  const TableSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <TableRow key={idx}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-16 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Manajemen{" "}
            {activeSection === "siswa"
              ? "Siswa"
              : activeSection === "guru"
              ? "Guru & Wali Kelas"
              : activeSection === "walikelas"
              ? "Wali Kelas"
              : activeSection === "admin"
              ? "Administrator"
              : "Pengguna"}
          </CardTitle>
          <Dialog
            open={showUserDialog}
            onOpenChange={(open) => {
              resetUserForm();
              setShowUserDialog(open);
              if (!open) resetUserForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit User" : "Tambah User Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username *</Label>
                    <Input
                      value={userForm.username}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password {editingItem ? "" : "*"}</Label>
                    <Input
                      type="password"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required={!editingItem} // hanya wajib kalau tambah user baru
                      placeholder={
                        editingItem ? "Kosongkan jika tidak ingin mengubah" : ""
                      }
                    />
                    {editingItem && (
                      <p className="text-sm text-gray-500">
                        Biarkan kosong jika tidak ingin mengubah password
                      </p>
                    )}
                  </div>

                  {userForm.role !== "admin" && (
                    <div className="space-y-2">
                      <Label>Nama Lengkap *</Label>
                      <Input
                        value={userForm.nama}
                        onChange={(e) =>
                          setUserForm((prev) => ({
                            ...prev,
                            nama: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  )}

                  {(userForm.role === "siswa" || activeSection === "siswa") && (
                    <div className="space-y-2">
                      <Label>Kelas *</Label>
                      <Select
                        value={userForm.kelasId}
                        onValueChange={(value) =>
                          setUserForm((prev) => ({ ...prev, kelasId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((kelas) => (
                            <SelectItem key={kelas.id} value={String(kelas.id)}>
                              {kelas.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select
                      value={userForm.role || activeSection}
                      onValueChange={(value) =>
                        setUserForm((prev) => ({ ...prev, role: value }))
                      }
                      disabled={activeSection !== "semua"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeSection === "semua" ? (
                          roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={activeSection}>
                            {roles.find((r) => r.value === activeSection)
                              ?.label || activeSection}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {(userForm.role === "siswa" || activeSection === "siswa") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>NIS *</Label>
                          <Input
                            value={userForm.nis}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              setUserForm((prev) => ({
                                ...prev,
                                nis: value,
                              }));
                            }}
                            placeholder="Masukkan NIS"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>NISN *</Label>
                          <Input
                            value={userForm.nisn}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ""); // Only allow digits
                              setUserForm((prev) => ({
                                ...prev,
                                nisn: value,
                              }));
                            }}
                            placeholder="Masukkan 10 angka NISN"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                          />
                          {userForm.nisn && !validateNISN(userForm.nisn) && (
                            <p className="text-sm text-red-500">
                              NISN harus terdiri dari 10 angka
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Tahun Masuk *</Label>
                        <Input
                          type="number"
                          value={userForm.tahunMasuk}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              tahunMasuk: e.target.value,
                            }))
                          }
                          placeholder="2024"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Lahir</Label>
                        <Input
                          type="date"
                          value={userForm.tanggalLahir}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              tanggalLahir: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                  {(userForm.role === "guru" ||
                    userForm.role === "walikelas" ||
                    activeSection === "guru" ||
                    activeSection === "walikelas") && (
                    <>
                      <div className="space-y-2">
                        <Label>NIP *</Label>
                        <Input
                          value={userForm.nip}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // Only allow digits
                            setUserForm((prev) => ({
                              ...prev,
                              nip: value,
                            }));
                          }}
                          placeholder="Masukkan 18 angka NIP"
                          maxLength={18}
                          pattern="[0-9]{18}"
                          required
                        />
                        {userForm.nip && !validateNIP(userForm.nip) && (
                          <p className="text-sm text-red-500">
                            NIP harus terdiri dari 18 angka
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Additional fields for students and teachers */}
                  {(userForm.role === "siswa" ||
                    userForm.role === "guru" ||
                    userForm.role === "walikelas" ||
                    activeSection === "siswa" ||
                    activeSection === "guru" ||
                    activeSection === "walikelas") && (
                    <>
                      <div className="space-y-2">
                        <Label>Jenis Kelamin *</Label>
                        <Select
                          value={userForm.jenisKelamin}
                          onValueChange={(value) =>
                            setUserForm((prev) => ({
                              ...prev,
                              jenisKelamin: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Laki-laki</SelectItem>
                            <SelectItem value="P">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Alamat</Label>
                        <Input
                          value={userForm.alamat}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              alamat: e.target.value,
                            }))
                          }
                          placeholder="Alamat lengkap"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nomor HP</Label>
                        <Input
                          value={userForm.nomorHP}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              nomorHP: e.target.value,
                            }))
                          }
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                    </>
                  )}

                  {/* Additional fields for students only */}
                  {(userForm.role === "siswa" || activeSection === "siswa") && (
                    <>
                      <div className="space-y-2">
                        <Label>Nama Orang Tua</Label>
                        <Input
                          value={userForm.namaOrangTua}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              namaOrangTua: e.target.value,
                            }))
                          }
                          placeholder="Nama orang tua/wali"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pekerjaan Orang Tua</Label>
                        <Input
                          value={userForm.pekerjaanOrangTua}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              pekerjaanOrangTua: e.target.value,
                            }))
                          }
                          placeholder="Pekerjaan orang tua/wali"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? "Update" : "Tambah"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUserDialog(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama, username, email, NIS, atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {activeSection === "semua" && (
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="rounded-md border">
          <Table className="w-ful text-sm">
            <TableHeader>
              <TableRow>
                {/* Tampilkan Nama & Identitas hanya jika bukan admin */}
                {filteredUsers.some((u) => u.role !== "admin") && (
                  <>
                    <TableHead>Nama</TableHead>
                    <TableHead>Identitas</TableHead>
                  </>
                )}
                <TableHead>Username / Password</TableHead>
                <TableHead>Role</TableHead>
                {filteredUsers.some((u) => u.role === "siswa") && (
                  <TableHead>Kelas</TableHead>
                )}
                <TableHead>Email</TableHead>
                {filteredUsers.some((u) =>
                  ["guru", "walikelas"].includes(u.role)
                ) && (
                  <>
                    <TableHead>Jenis Kelamin</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Nomor HP</TableHead>
                  </>
                )}
                {filteredUsers.some((u) => u.role === "siswa") && (
                  <>
                    <TableHead>Jenis Kelamin</TableHead>
                    <TableHead>Tanggal Lahir</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Nomor HP</TableHead>
                    <TableHead>Nama Orang Tua</TableHead>
                    <TableHead>Pekerjaan Orang Tua</TableHead>
                    <TableHead>Tahun Masuk</TableHead>
                  </>
                )}
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loadingUsers ? (
                <TableSkeleton />
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    {/* Nama hanya tampil jika bukan admin */}
                    {user.role !== "admin" && (
                      <TableCell className="font-medium">{user.nama}</TableCell>
                    )}

                    {/* Identitas hanya tampil jika bukan admin */}
                    {user.role !== "admin" && (
                      <TableCell>
                        {user.role === "siswa" ? (
                          <div className="space-y-1 text-sm">
                            <div>NIS: {user.nis || "-"}</div>
                            <div>NISN: {user.nisn || "-"}</div>
                          </div>
                        ) : user.nip ? (
                          <div className="text-sm">NIP: {user.nip}</div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}

                    <TableCell>
                      {user.username} / {user.password}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {roles.find((r) => r.value === user.role)?.label ||
                          user.role}
                      </Badge>
                    </TableCell>
                    {user.role === "siswa" && (
                      <TableCell>
                        {getKelasName(user.kelasId, classes)}
                      </TableCell>
                    )}
                    <TableCell>{user.email || "-"}</TableCell>
                    {(user.role === "guru" || user.role === "walikelas") && (
                      <>
                        <TableCell>
                          {getFullJenisKelamin(user.jenisKelamin)}
                        </TableCell>
                        <TableCell>{user.alamat}</TableCell>
                        <TableCell>{user.nomorHP}</TableCell>
                      </>
                    )}
                    {user.role === "siswa" && (
                      <>
                        <TableCell>
                          {getFullJenisKelamin(user.jenisKelamin)}
                        </TableCell>
                        <TableCell>{formatDate(user.tanggalLahir)}</TableCell>
                        <TableCell>{user.alamat}</TableCell>
                        <TableCell>{user.nomorHP}</TableCell>
                        <TableCell>{user.namaOrangTua}</TableCell>
                        <TableCell>{user.pekerjaanOrangTua}</TableCell>
                        <TableCell>{user.tahunMasuk}</TableCell>
                      </>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada data pengguna
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
