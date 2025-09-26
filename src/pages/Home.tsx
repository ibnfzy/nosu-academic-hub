import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  School,
  Users,
  BookOpen,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Trophy,
  Target,
  Heart,
  Globe,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiService from "@/services/apiService";

interface Users {
  id: number;
  role: string;
}

const Home = ({ currentUser, onLogin, onLogout }) => {
  const [schoolProfile, setSchoolProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalGuru: 0,
    totalProgram: 0,
    totalPrestasi: 0,
  });

  useEffect(() => {
    // apiService.forceInitializeData();
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    // apiService.forceInitializeData();
    try {
      // Load school profile
      const profileData = await apiService.getSchoolProfile();
      setSchoolProfile(profileData);

      // Load achievements
      const achievementsData = await apiService.getAchievements();
      setAchievements(achievementsData);

      // Load programs
      const programsData = await apiService.getPrograms();
      setPrograms(programsData);

      // Calculate stats
      const usersData = await apiService.getUsersHomepage();

      const users: Users[] = Array.isArray(usersData)
        ? (usersData as Users[])
        : (Object.values(usersData).filter(
            (item): item is Users => typeof item === "object"
          ) as Users[]);

      const siswa = users.filter((u) => u.role === "siswa");
      const guru = users.filter(
        (u) => u.role === "guru" || u.role === "walikelas"
      );

      setStats({
        totalSiswa: siswa.length,
        totalGuru: guru.length,
        totalProgram: programsData.length,
        totalPrestasi: achievementsData.length,
      });
    } catch (error) {
      console.error("Error loading home data:", error);
    }
  };

  const schoolStats = [
    {
      icon: Users,
      label: "Total Siswa",
      value: stats.totalSiswa?.toString() || "0",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: GraduationCap,
      label: "Tenaga Pengajar",
      value: stats.totalGuru?.toString() || "0",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: BookOpen,
      label: "Program Studi",
      value: stats.totalProgram?.toString() || "0",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Trophy,
      label: "Prestasi",
      value: stats.totalPrestasi?.toString() || "0",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  // Data akan diload dari state yang sudah diatur di useEffect

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentUser={currentUser} onLogin={onLogin} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="relative overflow-hidden rounded-3xl shadow-strong">
            <div
              className="hero-background"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80"
              aria-hidden="true"
            />
            <div className="relative z-10 p-8 sm:p-12 text-white">
              <div className="flex justify-center mb-6">
                <School className="h-20 w-20 float-animation" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {schoolProfile?.nama || "SMA Negeri 1 Nosu"}
              </h1>
              <p className="text-xl md:text-2xl mb-2 opacity-90">
                Sulawesi Barat
              </p>
              <p className="text-lg opacity-75 max-w-2xl mx-auto">
                {schoolProfile?.visi ||
                  "Sistem Informasi Akademik Digital untuk transparansi dan kemudahan akses informasi pendidikan"}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Target className="h-4 w-4 mr-2" />
                  Unggul dalam Prestasi
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Berkarakter Mulia
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolStats.map((stat, index) => (
              <Card
                key={index}
                className="gradient-card shadow-soft hover:shadow-medium transition-smooth"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Profile Sekolah */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="h-5 w-5 text-primary" />
                <span>Profil Sekolah</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Alamat */}
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Alamat</p>
                  <p className="text-sm text-muted-foreground">
                    {schoolProfile?.alamat ||
                      "Jl. Pendidikan No. 1, Nosu, Sulawesi Barat"}
                  </p>
                </div>
              </div>

              {/* Kontak */}
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Kontak</p>
                  <p className="text-sm text-muted-foreground">
                    {schoolProfile?.telepon || "(0421) 123456"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {schoolProfile?.email || "info@sman1nosu.sch.id"}
                  </p>
                </div>
              </div>

              {/* Website */}
              {schoolProfile?.website && (
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-sm text-muted-foreground">
                      <a
                        href={`https://${schoolProfile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {schoolProfile.website}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Tahun Berdiri */}
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Tahun Berdiri</p>
                  <p className="text-sm text-muted-foreground">
                    {schoolProfile?.tahunBerdiri || "1985"}
                  </p>
                </div>
              </div>

              {/* Kepala Sekolah */}
              {schoolProfile?.kepalaSekolah && (
                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <p className="font-medium">Kepala Sekolah</p>
                    <p className="text-sm text-muted-foreground">
                      {schoolProfile.kepalaSekolah}
                    </p>
                  </div>
                </div>
              )}

              {/* Akreditasi */}
              {schoolProfile?.akreditasi && (
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-accent mt-1" />
                  <div>
                    <p className="font-medium">Akreditasi</p>
                    <p className="text-sm text-muted-foreground">
                      {schoolProfile.akreditasi} (
                      {schoolProfile.tahunAkreditasi})
                    </p>
                  </div>
                </div>
              )}

              {/* Visi */}
              {schoolProfile?.visi && (
                <div>
                  <p className="font-medium">Visi</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {schoolProfile.visi}
                  </p>
                </div>
              )}

              {/* Misi */}
              {schoolProfile?.misi && (
                <div>
                  <p className="font-medium">Misi</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {schoolProfile.misi}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prestasi Sekolah */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-warning" />
                <span>Prestasi Terbaru</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.length > 0 ? (
                  achievements.map((achievement, index) => (
                    <div
                      key={achievement.id || index}
                      className="p-4 bg-gradient-to-r from-muted/20 to-warning/5 rounded-lg border border-border"
                    >
                      <Trophy className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        {/* Nama Prestasi */}
                        <p className="text-sm text-foreground font-medium">
                          {achievement.nama}
                        </p>

                        {/* Kategori, Tingkat & Tahun */}
                        <p className="text-xs text-muted-foreground">
                          {achievement.kategori} • {achievement.tingkat} •{" "}
                          {achievement.tahun}
                        </p>

                        {/* Deskripsi */}
                        {achievement.deskripsi && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.deskripsi}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada prestasi yang ditambahkan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Developed by JULTDEV
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
