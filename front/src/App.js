import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import React, { Suspense } from 'react';

import MySidebar from './Components/Sidebar';
import Header from './Components/Header';
import Profile from './Views/Profile';
import Dictionary from './Views/Dictionary';
import Dashboard from './Views/Dashboard';
import useAuth from './Hooks/UseAuth';

const Login     = React.lazy(() => import('./Views/Login'));
const Home      = React.lazy(() => import('./Views/Home'));
const Log       = React.lazy(() => import('./Views/Log'));
const Nodes     = React.lazy(() => import('./Views/Nodes'));
const Statistic = React.lazy(() => import('./Views/Statistic'));
const Users     = React.lazy(() => import('./Views/Users'));
const NodeInfo  = React.lazy(() => import('./Views/NodeInfo'));
const PleaseLogin = React.lazy(() => import('./Components/PleaseLogin'));
const CmdLog    = React.lazy(() => import('./Views/CmdLog'));
const UserInfo  = React.lazy(() => import('./Views/UserInfo'));
const Test      = React.lazy(() => import('./Views/Test'));

// ── Inner shell: needs useLocation, so must live inside <Router> ─────────────
function AppShell({ authenticated, loading, user, handleLogout, open, setOpen }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  // Close sidebar whenever the route changes (e.g. after a link click)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  const ProtectedRoute = ({ children }) => {
    if (loading) return null;
    return authenticated ? children : <Navigate to="/" replace />;
  };

  const Layout = ({ children }) => (
    <>
      {!isLoginPage && <Header user={user} onLogout={handleLogout} />}

      {/* Mobile top bar */}
      {!isLoginPage && (
        <div className="mobile-header">
          <button className="menu-btn" onClick={() => setOpen(prev => !prev)} aria-label="Toggle menu">
            {open ? '✕' : '☰'}
          </button>
          <span className="app-title">Хяналтын систем</span>
        </div>
      )}

      <div id="main_window">
        {!isLoginPage && (
          <MySidebar
            user={user}
            className={`sidebar${open ? ' open' : ''}`}
          />
        )}

        {/* Backdrop: closes sidebar when tapping outside on mobile */}
        {!isLoginPage && open && (
          <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
        )}

        <div className="page-content">
          {children}
        </div>
      </div>
    </>
  );

  return (
    <Suspense fallback={<div className="page-loading">Ачааллаж байна...</div>}>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/home"      element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/nodes"     element={<ProtectedRoute><Layout><Nodes /></Layout></ProtectedRoute>} />
        <Route path="/nodeInfo/:id" element={<ProtectedRoute><Layout><NodeInfo /></Layout></ProtectedRoute>} />
        <Route path="/userInfo/:id" element={<ProtectedRoute><Layout><UserInfo /></Layout></ProtectedRoute>} />
        <Route path="/log"       element={<ProtectedRoute><Layout><Log /></Layout></ProtectedRoute>} />
        <Route path="/statistic" element={<ProtectedRoute><Layout><Statistic /></Layout></ProtectedRoute>} />
        <Route path="/cmdlog"    element={<ProtectedRoute><Layout><CmdLog /></Layout></ProtectedRoute>} />
        <Route path="/users"     element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/test"      element={<ProtectedRoute><Layout><Test /></Layout></ProtectedRoute>} />
        <Route path="/dictionary" element={<ProtectedRoute><Layout><Dictionary /></Layout></ProtectedRoute>} />

        <Route path="*" element={<PleaseLogin />} />
      </Routes>
    </Suspense>
  );
}

// ── Root: owns auth state, wraps everything in Router ────────────────────────
function App() {
  const { authenticated, user, loading, setAuthenticated, setUser } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('type');
    localStorage.removeItem('userDisplayName');
    setAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <AppShell
        authenticated={authenticated}
        loading={loading}
        user={user}
        handleLogout={handleLogout}
        open={open}
        setOpen={setOpen}
      />
    </Router>
  );
}

export default App;
