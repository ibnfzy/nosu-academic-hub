/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Edit, 
  Trophy, 
  BookOpen, 
  Link as LinkIcon, 
  Plus, 
  Trash2,
  Calendar,
  ExternalLink 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

interface SchoolProfileManagementProps {
  onDataChange: () => void;
}

export default function SchoolProfileManagement({
  onDataChange,
}: SchoolProfileManagementProps) {
  // School Profile State
  const [showSchoolProfileDialog, setShowSchoolProfileDialog] = useState(false);
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [schoolProfileForm, setSchoolProfileForm] = useState({
    namaSekolah: "",
    npsn: "",
    alamat: "",
    kodePos: "",
    telepon: "",
    email: "",
    website: "",
    kepalaSekolah: "",
    nipKepalaSekolah: "",
    akreditasi: "",
    tahunAkreditasi: "",
    visi: "",
    misi: "",
  });

  // Achievements State
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [achievementForm, setAchievementForm] = useState({
    nama: "",
    deskripsi: "",
    tanggal: "",
    tingkat: "",
    kategori: "",
  });

  // Programs State
  const [programs, setPrograms] = useState<any[]>([]);
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [programForm, setProgramForm] = useState({
    nama: "",
    deskripsi: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    status: "Aktif",
    penanggungJawab: "",
  });

  // Registration Links State
  const [registrationLinks, setRegistrationLinks] = useState<any[]>([]);
  const [showRegistrationLinkDialog, setShowRegistrationLinkDialog] = useState(false);
  const [editingRegistrationLink, setEditingRegistrationLink] = useState<any>(null);
  const [registrationLinkForm, setRegistrationLinkForm] = useState({
    nama: "",
    deskripsi: "",
    url: "",
    status: "Aktif",
    tanggalMulai: "",
    tanggalSelesai: "",
  });

  const { toast } = useToast();

  // Load all data from apiService
  const loadData = useCallback(async () => {
    try {
      // Load school profile
      const profileData = await apiService.getSchoolProfile();
      setSchoolProfile(profileData);
      if (profileData) {
        setSchoolProfileForm(profileData);
      }

      // Load achievements
      const achievementsData = await apiService.getAchievements();
      setAchievements(Array.isArray(achievementsData) ? achievementsData : []);

      // Load programs
      const programsData = await apiService.getPrograms();
      setPrograms(Array.isArray(programsData) ? programsData : []);

      // Load registration links
      const registrationLinksData = await apiService.getRegistrationLinks();
      setRegistrationLinks(Array.isArray(registrationLinksData) ? registrationLinksData : []);

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSchoolProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolProfileForm.namaSekolah) {
      toast({
        title: "Error",
        description: "Nama sekolah wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await apiService.updateSchoolProfile(schoolProfileForm);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Profil sekolah berhasil diperbarui",
        });

        loadData(); // Reload data
        onDataChange();
        setShowSchoolProfileDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan profil sekolah",
        variant: "destructive",
      });
    }
  };

  const resetSchoolProfileForm = () => {
    if (schoolProfile) {
      setSchoolProfileForm(schoolProfile);
    }
  };

  // Achievement handlers
  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!achievementForm.nama) {
      toast({
        title: "Error",
        description: "Nama prestasi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      if (editingAchievement) {
        result = await apiService.updateAchievement(editingAchievement.id, achievementForm);
      } else {
        result = await apiService.addAchievement(achievementForm);
      }

      if (result.success || result.data) {
        toast({
          title: "Berhasil",
          description: editingAchievement ? "Prestasi berhasil diperbarui" : "Prestasi berhasil ditambahkan",
        });
        
        loadData();
        onDataChange();
        setShowAchievementDialog(false);
        resetAchievementForm();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan prestasi",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus prestasi ini?")) return;

    try {
      const result = await apiService.deleteAchievement(id);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Prestasi berhasil dihapus",
        });
        loadData();
        onDataChange();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus prestasi",
        variant: "destructive",
      });
    }
  };

  const resetAchievementForm = () => {
    setAchievementForm({
      nama: "",
      deskripsi: "",
      tanggal: "",
      tingkat: "",
      kategori: "",
    });
    setEditingAchievement(null);
  };

  // Program handlers
  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!programForm.nama) {
      toast({
        title: "Error",
        description: "Nama program wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      if (editingProgram) {
        result = await apiService.updateProgram(editingProgram.id, programForm);
      } else {
        result = await apiService.addProgram(programForm);
      }

      if (result.success || result.data) {
        toast({
          title: "Berhasil",
          description: editingProgram ? "Program berhasil diperbarui" : "Program berhasil ditambahkan",
        });
        
        loadData();
        onDataChange();
        setShowProgramDialog(false);
        resetProgramForm();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan program",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus program ini?")) return;

    try {
      const result = await apiService.deleteProgram(id);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Program berhasil dihapus",
        });
        loadData();
        onDataChange();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus program",
        variant: "destructive",
      });
    }
  };

  const resetProgramForm = () => {
    setProgramForm({
      nama: "",
      deskripsi: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      status: "Aktif",
      penanggungJawab: "",
    });
    setEditingProgram(null);
  };

  // Registration Link handlers
  const handleRegistrationLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationLinkForm.nama || !registrationLinkForm.url) {
      toast({
        title: "Error",
        description: "Nama dan URL wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      if (editingRegistrationLink) {
        result = await apiService.updateRegistrationLink(editingRegistrationLink.id, registrationLinkForm);
      } else {
        result = await apiService.addRegistrationLink(registrationLinkForm);
      }

      if (result.success || result.data) {
        toast({
          title: "Berhasil",
          description: editingRegistrationLink ? "Link pendaftaran berhasil diperbarui" : "Link pendaftaran berhasil ditambahkan",
        });
        
        loadData();
        onDataChange();
        setShowRegistrationLinkDialog(false);
        resetRegistrationLinkForm();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan link pendaftaran",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRegistrationLink = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus link pendaftaran ini?")) return;

    try {
      const result = await apiService.deleteRegistrationLink(id);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Link pendaftaran berhasil dihapus",
        });
        loadData();
        onDataChange();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus link pendaftaran",
        variant: "destructive",
      });
    }
  };

  const resetRegistrationLinkForm = () => {
    setRegistrationLinkForm({
      nama: "",
      deskripsi: "",
      url: "",
      status: "Aktif",
      tanggalMulai: "",
      tanggalSelesai: "",
    });
    setEditingRegistrationLink(null);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Manajemen Profil Sekolah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profil Sekolah</TabsTrigger>
              <TabsTrigger value="achievements">Prestasi</TabsTrigger>
              <TabsTrigger value="programs">Program</TabsTrigger>
              <TabsTrigger value="registration">Link Pendaftaran</TabsTrigger>
            </TabsList>

            {/* School Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Informasi Profil Sekolah</h3>
                <Dialog
                  open={showSchoolProfileDialog}
                  onOpenChange={(open) => {
                    setShowSchoolProfileDialog(open);
                    if (!open) resetSchoolProfileForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Profil Sekolah</DialogTitle>
                      <DialogDescription>
                        Perbarui informasi profil sekolah
                      </DialogDescription>
                    </DialogHeader>
              <form onSubmit={handleSchoolProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Sekolah *</Label>
                    <Input
                      value={schoolProfileForm.namaSekolah}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          namaSekolah: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>NPSN</Label>
                    <Input
                      value={schoolProfileForm.npsn}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          npsn: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kepala Sekolah</Label>
                    <Input
                      value={schoolProfileForm.kepalaSekolah}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          kepalaSekolah: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>NIP Kepala Sekolah</Label>
                    <Input
                      value={schoolProfileForm.nipKepalaSekolah}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          nipKepalaSekolah: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Textarea
                    value={schoolProfileForm.alamat}
                    onChange={(e) =>
                      setSchoolProfileForm((prev) => ({
                        ...prev,
                        alamat: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telepon</Label>
                    <Input
                      value={schoolProfileForm.telepon}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          telepon: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={schoolProfileForm.email}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={schoolProfileForm.website}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kode Pos</Label>
                    <Input
                      value={schoolProfileForm.kodePos}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          kodePos: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Akreditasi</Label>
                    <Input
                      value={schoolProfileForm.akreditasi}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          akreditasi: e.target.value,
                        }))
                      }
                      placeholder="contoh: A"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tahun Akreditasi</Label>
                    <Input
                      type="number"
                      value={schoolProfileForm.tahunAkreditasi}
                      onChange={(e) =>
                        setSchoolProfileForm((prev) => ({
                          ...prev,
                          tahunAkreditasi: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visi</Label>
                  <Textarea
                    value={schoolProfileForm.visi}
                    onChange={(e) =>
                      setSchoolProfileForm((prev) => ({
                        ...prev,
                        visi: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Misi</Label>
                  <Textarea
                    value={schoolProfileForm.misi}
                    onChange={(e) =>
                      setSchoolProfileForm((prev) => ({
                        ...prev,
                        misi: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Simpan Perubahan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSchoolProfileDialog(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
              {schoolProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Informasi Dasar
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Nama:</span>{" "}
                          {schoolProfile.namaSekolah || "-"}
                        </div>
                        <div>
                          <span className="font-medium">NPSN:</span>{" "}
                          {schoolProfile.npsn || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Kepala Sekolah:</span>{" "}
                          {schoolProfile.kepalaSekolah || "-"}
                        </div>
                        <div>
                          <span className="font-medium">NIP Kepala Sekolah:</span>{" "}
                          {schoolProfile.nipKepalaSekolah || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Akreditasi:</span>{" "}
                          {schoolProfile.akreditasi || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Tahun Akreditasi:</span>{" "}
                          {schoolProfile.tahunAkreditasi || "-"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Kontak</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Telepon:</span>{" "}
                          {schoolProfile.telepon || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {schoolProfile.email || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Website:</span>{" "}
                          {schoolProfile.website || "-"}
                        </div>
                        <div>
                          <span className="font-medium">Kode Pos:</span>{" "}
                          {schoolProfile.kodePos || "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Alamat</h4>
                    <p className="text-sm text-muted-foreground">
                      {schoolProfile.alamat || "Alamat belum diisi"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Visi</h4>
                    <p className="text-sm text-muted-foreground">
                      {schoolProfile.visi || "Visi belum diisi"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Misi</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {schoolProfile.misi || "Misi belum diisi"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Data profil sekolah belum tersedia</p>
                </div>
              )}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Prestasi Sekolah</h3>
                <Dialog
                  open={showAchievementDialog}
                  onOpenChange={(open) => {
                    setShowAchievementDialog(open);
                    if (!open) resetAchievementForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Prestasi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAchievement ? "Edit Prestasi" : "Tambah Prestasi"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAchievement ? "Perbarui" : "Tambahkan"} informasi prestasi sekolah
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAchievementSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nama Prestasi *</Label>
                        <Input
                          value={achievementForm.nama}
                          onChange={(e) =>
                            setAchievementForm((prev) => ({
                              ...prev,
                              nama: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea
                          value={achievementForm.deskripsi}
                          onChange={(e) =>
                            setAchievementForm((prev) => ({
                              ...prev,
                              deskripsi: e.target.value,
                            }))
                          }
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tanggal</Label>
                          <Input
                            type="date"
                            value={achievementForm.tanggal}
                            onChange={(e) =>
                              setAchievementForm((prev) => ({
                                ...prev,
                                tanggal: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tingkat</Label>
                          <Input
                            value={achievementForm.tingkat}
                            onChange={(e) =>
                              setAchievementForm((prev) => ({
                                ...prev,
                                tingkat: e.target.value,
                              }))
                            }
                            placeholder="contoh: Nasional"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Kategori</Label>
                        <Input
                          value={achievementForm.kategori}
                          onChange={(e) =>
                            setAchievementForm((prev) => ({
                              ...prev,
                              kategori: e.target.value,
                            }))
                          }
                          placeholder="contoh: Akademik"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingAchievement ? "Perbarui" : "Simpan"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAchievementDialog(false)}
                          className="flex-1"
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <Card key={achievement.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingAchievement(achievement);
                              setAchievementForm(achievement);
                              setShowAchievementDialog(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAchievement(achievement.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{achievement.nama}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.deskripsi}
                      </p>
                      <div className="flex gap-2 text-xs">
                        {achievement.tingkat && (
                          <Badge variant="secondary">{achievement.tingkat}</Badge>
                        )}
                        {achievement.kategori && (
                          <Badge variant="outline">{achievement.kategori}</Badge>
                        )}
                      </div>
                      {achievement.tanggal && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(achievement.tanggal).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada prestasi yang ditambahkan</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Programs Tab */}
            <TabsContent value="programs" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Program Sekolah</h3>
                <Dialog
                  open={showProgramDialog}
                  onOpenChange={(open) => {
                    setShowProgramDialog(open);
                    if (!open) resetProgramForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Program
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProgram ? "Edit Program" : "Tambah Program"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProgram ? "Perbarui" : "Tambahkan"} informasi program sekolah
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProgramSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nama Program *</Label>
                        <Input
                          value={programForm.nama}
                          onChange={(e) =>
                            setProgramForm((prev) => ({
                              ...prev,
                              nama: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea
                          value={programForm.deskripsi}
                          onChange={(e) =>
                            setProgramForm((prev) => ({
                              ...prev,
                              deskripsi: e.target.value,
                            }))
                          }
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tanggal Mulai</Label>
                          <Input
                            type="date"
                            value={programForm.tanggalMulai}
                            onChange={(e) =>
                              setProgramForm((prev) => ({
                                ...prev,
                                tanggalMulai: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tanggal Selesai</Label>
                          <Input
                            type="date"
                            value={programForm.tanggalSelesai}
                            onChange={(e) =>
                              setProgramForm((prev) => ({
                                ...prev,
                                tanggalSelesai: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Penanggung Jawab</Label>
                        <Input
                          value={programForm.penanggungJawab}
                          onChange={(e) =>
                            setProgramForm((prev) => ({
                              ...prev,
                              penanggungJawab: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingProgram ? "Perbarui" : "Simpan"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowProgramDialog(false)}
                          className="flex-1"
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.length > 0 ? (
                  programs.map((program) => (
                    <Card key={program.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingProgram(program);
                              setProgramForm(program);
                              setShowProgramDialog(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProgram(program.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{program.nama}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {program.deskripsi}
                      </p>
                      <div className="flex gap-2 text-xs mb-2">
                        <Badge variant={program.status === "Aktif" ? "default" : "secondary"}>
                          {program.status}
                        </Badge>
                      </div>
                      {program.penanggungJawab && (
                        <p className="text-xs text-muted-foreground mb-2">
                          PJ: {program.penanggungJawab}
                        </p>
                      )}
                      {(program.tanggalMulai || program.tanggalSelesai) && (
                        <div className="text-xs text-muted-foreground">
                          {program.tanggalMulai && (
                            <div>Mulai: {new Date(program.tanggalMulai).toLocaleDateString('id-ID')}</div>
                          )}
                          {program.tanggalSelesai && (
                            <div>Selesai: {new Date(program.tanggalSelesai).toLocaleDateString('id-ID')}</div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada program yang ditambahkan</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Registration Links Tab */}
            <TabsContent value="registration" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Link Pendaftaran</h3>
                <Dialog
                  open={showRegistrationLinkDialog}
                  onOpenChange={(open) => {
                    setShowRegistrationLinkDialog(open);
                    if (!open) resetRegistrationLinkForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRegistrationLink ? "Edit Link Pendaftaran" : "Tambah Link Pendaftaran"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingRegistrationLink ? "Perbarui" : "Tambahkan"} link pendaftaran
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRegistrationLinkSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nama Link *</Label>
                        <Input
                          value={registrationLinkForm.nama}
                          onChange={(e) =>
                            setRegistrationLinkForm((prev) => ({
                              ...prev,
                              nama: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>URL *</Label>
                        <Input
                          type="url"
                          value={registrationLinkForm.url}
                          onChange={(e) =>
                            setRegistrationLinkForm((prev) => ({
                              ...prev,
                              url: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea
                          value={registrationLinkForm.deskripsi}
                          onChange={(e) =>
                            setRegistrationLinkForm((prev) => ({
                              ...prev,
                              deskripsi: e.target.value,
                            }))
                          }
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tanggal Mulai</Label>
                          <Input
                            type="date"
                            value={registrationLinkForm.tanggalMulai}
                            onChange={(e) =>
                              setRegistrationLinkForm((prev) => ({
                                ...prev,
                                tanggalMulai: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tanggal Selesai</Label>
                          <Input
                            type="date"
                            value={registrationLinkForm.tanggalSelesai}
                            onChange={(e) =>
                              setRegistrationLinkForm((prev) => ({
                                ...prev,
                                tanggalSelesai: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingRegistrationLink ? "Perbarui" : "Simpan"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowRegistrationLinkDialog(false)}
                          className="flex-1"
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registrationLinks.length > 0 ? (
                  registrationLinks.map((link) => (
                    <Card key={link.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingRegistrationLink(link);
                              setRegistrationLinkForm(link);
                              setShowRegistrationLinkDialog(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRegistrationLink(link.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{link.nama}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {link.deskripsi}
                      </p>
                      <div className="flex gap-2 text-xs mb-2">
                        <Badge variant={link.status === "Aktif" ? "default" : "secondary"}>
                          {link.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1"
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Buka Link
                          </a>
                        </Button>
                      </div>
                      {(link.tanggalMulai || link.tanggalSelesai) && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {link.tanggalMulai && (
                            <div>Mulai: {new Date(link.tanggalMulai).toLocaleDateString('id-ID')}</div>
                          )}
                          {link.tanggalSelesai && (
                            <div>Selesai: {new Date(link.tanggalSelesai).toLocaleDateString('id-ID')}</div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada link pendaftaran yang ditambahkan</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
