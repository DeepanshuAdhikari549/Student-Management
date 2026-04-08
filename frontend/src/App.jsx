import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import { useState } from 'react';
import { GraduationCap, LogOut } from 'lucide-react';

function App() {
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  );

  const handleLogin = (data) => {
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const handleLogout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  const Navbar = () => {
    const loc = useLocation();
    const active = (p) => loc.pathname === p ? 'active' : '';

    return (
      <nav className="nav">
        <div className="container">
          <div className="nav-inner">
            <div className="brand">
              <GraduationCap size={32} />
              <span>SchoolHub</span>
            </div>
            <div className="menu">
              <Link to="/" className={`menu-link ${active('/')}`}>Overview</Link>
              <Link to="/students" className={`menu-link ${active('/students')}`}>Students</Link>
              <Link to="/tasks" className={`menu-link ${active('/tasks')}`}>Assignments</Link>
            </div>
            <button onClick={handleLogout} className="btn-red btn" style={{padding: '0.5rem 1rem'}}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  };

  return (
    <Router>
      {userInfo && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={!userInfo ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={userInfo ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/students" element={userInfo ? <Students /> : <Navigate to="/login" />} />
          <Route path="/tasks" element={userInfo ? <Tasks /> : <Navigate to="/login" />} />
        </Routes>
      </div>
      <Toaster position="bottom-center" />
    </Router>
  );
}

export default App;
