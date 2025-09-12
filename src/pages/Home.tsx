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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiService from "@/services/apiService";

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
      const users = await apiService.getUsers();
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
          <div className="gradient-hero rounded-3xl p-12 text-white shadow-strong">
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
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Alamat</p>
                  <p className="text-sm text-muted-foreground">
                    {schoolProfile?.alamat ||
                      "Jl. Pendidikan No. 1, Nosu, Kabupaten Mamuju Utara, Sulawesi Barat 91571"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Kontak</p>
                  <p className="text-sm text-muted-foreground">
                    {schoolProfile?.telepon || "(0426) 123456"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {schoolProfile?.email || "info@sman1nosu.sch.id"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="font-medium">Tahun Berdiri</p>
                  <p className="text-sm text-muted-foreground">
                    {schoolProfile?.tahunBerdiri || "1985"}
                  </p>
                </div>
              </div>

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
                      className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <Trophy className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium">
                          {achievement.judul}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.tingkat} • {achievement.tahun}
                        </p>
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

        {/* Program Studi */}
        <section className="mb-12">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-success" />
                <span>Program Studi</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programs.length > 0 ? (
                  programs.map((program, index) => (
                    <div
                      key={program.id || index}
                      className="p-4 border border-border rounded-lg"
                    >
                      <h3 className="font-semibold text-foreground mb-2">
                        {program.nama}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {program.deskripsi}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {program.mataPelajaran?.map((subject, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                      {program.prospek && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">
                            Prospek Karir:
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {program.prospek}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Belum ada program studi yang ditambahkan
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="gradient-card shadow-medium">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Bergabunglah dengan Keluarga Besar{" "}
                {schoolProfile?.nama || "SMA Negeri 1 Nosu"}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {schoolProfile?.misi ||
                  "Wujudkan masa depan gemilang bersama pendidikan berkualitas, fasilitas modern, dan tenaga pengajar profesional."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="px-4 py-2 bg-primary text-primary-foreground">
                  Pendaftaran Tahun Ajaran 2025/2026
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  Informasi: {schoolProfile?.telepon || "(0426) 123456"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>
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
