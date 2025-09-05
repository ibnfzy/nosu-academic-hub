import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import StudentDashboard from "./pages/siswa/Dashboard";
import TeacherDashboard from "./pages/guru/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import WalikelasDashboard from "./pages/walikelas/Dashboard";
import NotFound from "./pages/NotFound";
import apiService from './services/apiService';

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const user = apiService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Route Guard untuk dashboard
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!currentUser) {
      return <Navigate to="/" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Home 
                  currentUser={currentUser}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
              } 
            />

            {/* Dashboard Routes - Protected */}
            <Route 
              path="/dashboard/siswa" 
              element={
                <ProtectedRoute allowedRoles={['siswa']}>
                  <StudentDashboard currentUser={currentUser} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/guru" 
              element={
                <ProtectedRoute allowedRoles={['guru']}>
                  <TeacherDashboard currentUser={currentUser} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard/walikelas" 
              element={
                <ProtectedRoute allowedRoles={['walikelas']}>
                  <WalikelasDashboard currentUser={currentUser} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />

            {/* Auto redirect based on user role */}
            <Route 
              path="/dashboard" 
              element={
                currentUser ? (
                  <Navigate 
                    to={`/dashboard/${currentUser.role}`} 
                    replace 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            {/* Catch all other routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
