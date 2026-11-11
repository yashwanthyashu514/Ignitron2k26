import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import CyberLoader from './components/CyberLoader';
import Home from './pages/Home';
import Events from './pages/Events';
import Scoreboard from './pages/Scoreboard';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import Timeline from './pages/Timeline';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import './App.css';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>{children}</main>
    </>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, authToken, authLoading } = useApp();

  if (authLoading) {
    return (
      <CyberLoader
        fullScreen
        text="VERIFYING ACCESS PERMISSIONS..."
        subtext="Ignitron 2K26 · Security Protocol Active"
      />
    );
  }

  // Without valid login token and session, immediately bounce to /admin
  if (!authToken || !currentUser) {
    return <Navigate to="/admin" replace />;
  }

  // Role protection: Super Admin vs Coordinator
  if (requiredRole && currentUser.role !== requiredRole) {
    if (currentUser.role === 'coordinator') {
      return <Navigate to="/coordinator/dashboard" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function App() {
  const [initialLoading, setInitialLoading] = useState(() => {
    // Only show the system boot loader on direct portal routes (/admin, /coordinator)
    // The public site directly renders the cinematic IntroExperience on Home!
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path.startsWith('/admin') || path.startsWith('/coordinator');
    }
    return false;
  });

  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [initialLoading]);

  if (initialLoading) {
    return (
      <CyberLoader
        fullScreen
        text="ESTABLISHING SECURE PORTAL UPLINK..."
        subtext="Ignitron 2K26 · GM University Central Operations"
      />
    );
  }

  return (
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
          <Route path="/timeline" element={<PublicLayout><Timeline /></PublicLayout>} />
          <Route path="/scoreboard" element={<PublicLayout><Scoreboard /></PublicLayout>} />
          <Route path="/team" element={<PublicLayout><Team /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="superadmin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/dashboard"
            element={
              <ProtectedRoute requiredRole="coordinator">
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
