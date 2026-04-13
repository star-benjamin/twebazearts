import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Gallery from './pages/Gallery';
import ArtworkDetail from './pages/ArtworkDetail';
import Services from './pages/Services';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ArtistDashboard from './pages/artist/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
 
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="font-serif text-2xl text-stone-300">Loading…</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
 
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"            element={<Gallery />} />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
          <Route path="/services"    element={<Services />} />
          <Route path="/about"       element={<About />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/dashboard/*" element={<ProtectedRoute role="ARTIST"><ArtistDashboard /></ProtectedRoute>} />
          <Route path="/admin/*"     element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}