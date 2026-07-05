import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import Gallery from './pages/Gallery';
import ArtworkDetail from './pages/ArtworkDetail';
import Artists from './pages/public/Artists';
import ArtistProfile from './pages/public/ArtistProfile';
import Classes from './pages/public/Classes';
import CommissionRequest from './pages/public/CommissionRequest';
import Inquire from './pages/public/Inquire';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';
import About from './pages/About';
import Login from './pages/auth/Login';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageArtworks from './pages/admin/ManageArtworks';
import ManageArtists from './pages/admin/ManageArtists';
import InquiryQueue from './pages/admin/InquiryQueue';
import ManageCommissions from './pages/admin/ManageCommissions';
import ManageProjects from './pages/admin/ManageProjects';
import ManageClasses from './pages/admin/ManageClasses';
import ManageTestimonials from './pages/admin/ManageTestimonials';
import ManageBlog from './pages/admin/ManageBlog';
import PaymentLog from './pages/admin/PaymentLog';

function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="font-serif text-2xl text-stone-300">Loading…</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="font-serif text-2xl text-stone-300">Loading…</span>
    </div>
  );

  // Only one role exists now (BR-GEN-001) so there's nothing further to check
  // beyond "is this a valid admin session" — no role param needed anymore.
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public site */}
          <Route path="/"                 element={<Gallery />} />
          <Route path="/artwork/:id"      element={<ArtworkDetail />} />
          <Route path="/artists"          element={<Artists />} />
          <Route path="/artists/:id"      element={<ArtistProfile />} />
          <Route path="/classes"          element={<Classes />} />
          <Route path="/commission"       element={<CommissionRequest />} />
          <Route path="/inquire"          element={<Inquire />} />
          <Route path="/blog"             element={<Blog />} />
          <Route path="/blog/:slug"       element={<BlogPost />} />
          <Route path="/about"            element={<About />} />
          <Route path="/login"            element={<Login />} />

          {/* Admin — single-admin dashboard, no artist portal (Section 2.2) */}
          <Route path="/admin"                    element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/artworks"           element={<ProtectedRoute><ManageArtworks /></ProtectedRoute>} />
          <Route path="/admin/artists"            element={<ProtectedRoute><ManageArtists /></ProtectedRoute>} />
          <Route path="/admin/inquiries"          element={<ProtectedRoute><InquiryQueue /></ProtectedRoute>} />
          <Route path="/admin/commissions"        element={<ProtectedRoute><ManageCommissions /></ProtectedRoute>} />
          <Route path="/admin/projects"           element={<ProtectedRoute><ManageProjects /></ProtectedRoute>} />
          <Route path="/admin/classes"            element={<ProtectedRoute><ManageClasses /></ProtectedRoute>} />
          <Route path="/admin/testimonials"       element={<ProtectedRoute><ManageTestimonials /></ProtectedRoute>} />
          <Route path="/admin/blog"               element={<ProtectedRoute><ManageBlog /></ProtectedRoute>} />
          <Route path="/admin/payments"           element={<ProtectedRoute><PaymentLog /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
