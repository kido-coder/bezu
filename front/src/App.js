import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import MySidebar from './Components/Sidebar';
import Header from './Components/Header'
import Login from './Views/Login';
import Home from './Views/Home';
import Log from './Views/Log';
import Nodes from './Views/Nodes';
import Statistic from './Views/Statistic';
import Users from './Views/Users';
import NodeInfo from './Views/NodeInfo'
import PleaseLogin from './Components/PleaseLogin';
import CmdLog from './Views/CmdLog';
import UserInfo from './Views/UserInfo';
import Profile from './Views/Profile';
import Test from './Views/Test';
import Dictionary from './Views/Dictionary';
import Dashboard from './Views/Dashboard';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authenticated, setauthenticated] = useState(null);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser) {
      setauthenticated(loggedInUser);
    }
  }, []);

  if (authenticated)
    return (
      <Router>
        {currentPath !== '/' && <Header />}
        <div id="main_window">
          {currentPath !== '/' && <MySidebar />}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/nodeInfo/:id" element={<NodeInfo />} />
            <Route path="/userInfo/:id" element={<UserInfo />} />
            <Route path="/log" element={<Log />} />
            <Route path="/statistic" element={<Statistic />} />
            <Route path="/cmdlog" element={<CmdLog />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/test" element={<Test />} />
            <Route path="/dictionary" element={<Dictionary />} />
          </Routes>
        </div>
      </Router>
    );
  else
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<PleaseLogin />} />
          <Route path="/dashboard" element={<PleaseLogin />} />
          <Route path="/nodes" element={<PleaseLogin />} />
          <Route path="/nodeInfo/:id" element={<PleaseLogin />} />
          <Route path="/userInfo/:id" element={<PleaseLogin />} />
          <Route path="/log" element={<PleaseLogin />} />
          <Route path="/statistic" element={<PleaseLogin />} />
          <Route path="/cmdlog" element={<PleaseLogin />} />
          <Route path="/profile" element={<PleaseLogin />} />
          <Route path="/users" element={<PleaseLogin />} />
          <Route path="/test" element={<Test />} />
          <Route path="/dictionary" element={<PleaseLogin />} />
        </Routes>
      </Router>
    );
}

export default App;