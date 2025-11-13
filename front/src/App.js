import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import React, { Suspense } from 'react';

import MySidebar from './Components/Sidebar';
import Header from './Components/Header';
import Profile from './Views/Profile';
import Test from './Views/Test';
import Dictionary from './Views/Dictionary';
import Dashboard from './Views/Dashboard';
import useAuth from './Hooks/UseAuth';

const Login = React.lazy(() => import('./Views/Login'));
const Home = React.lazy(() => import('./Views/Home'));
const Log = React.lazy(() => import('./Views/Log'));
const Nodes = React.lazy(() => import('./Views/Nodes'));
const Statistic = React.lazy(() => import('./Views/Statistic'));
const Users = React.lazy(() => import('./Views/Users'));
const NodeInfo = React.lazy(() => import('./Views/NodeInfo'));
const PleaseLogin = React.lazy(() => import('./Components/PleaseLogin'));
const CmdLog = React.lazy(() => import('./Views/CmdLog'));
const UserInfo = React.lazy(() => import('./Views/UserInfo'));

function App() {
  const { authenticated, user, loading, setAuthenticated, setUser } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('authToken');
    setAuthenticated(false);

    setUser(null);
    window.location.href = '/';
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) return   // ⏳ wait before deciding
    return authenticated ? children : <Navigate to="/" />;
  };

  const Layout = ({ children }) => (
    <>
      {currentPath !== '/' && <Header user={user} onLogout={handleLogout} />}
      <div id="main_window">
        {currentPath !== '/' && <MySidebar user={user} />}
        {children}
      </div>
    </>
  );

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout><Home /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nodes"
            element={
              <ProtectedRoute>
                <Layout><Nodes /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nodeInfo/:id"
            element={
              <ProtectedRoute>
                <Layout><NodeInfo /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/userInfo/:id"
            element={
              <ProtectedRoute>
                <Layout><UserInfo /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/log"
            element={
              <ProtectedRoute>
                <Layout><Log /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistic"
            element={
              <ProtectedRoute>
                <Layout><Statistic /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cmdlog"
            element={
              <ProtectedRoute>
                <Layout><CmdLog /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout><Users /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <Layout><Test /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dictionary"
            element={
              <ProtectedRoute>
                <Layout><Dictionary /></Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<PleaseLogin />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
