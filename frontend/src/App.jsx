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
      <nav className="nav" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.02)', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)'}}>
        <div className="container" style={{maxWidth: '1400px'}}>
          <div className="nav-inner" style={{height: '80px'}}>
            <div className="brand" style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <div style={{background: '#2563eb', color: 'white', padding: '0.5rem', borderRadius: '10px'}}>
                <GraduationCap size={28} />
              </div>
              <span style={{fontSize: '1.5rem', fontWeight: 900, tracking: '-0.02em', color: '#1e293b'}}>SchoolHub</span>
            </div>
            <div className="menu" style={{display: 'flex', gap: '2rem'}}>
              <Link to="/" className={`menu-link ${active('/')}`} style={{fontSize: '1rem', fontWeight: 600}}>Overview</Link>
              {userInfo.role === 'admin' && <Link to="/students" className={`menu-link ${active('/students')}`} style={{fontSize: '1rem', fontWeight: 600}}>Students</Link>}
              <Link to="/tasks" className={`menu-link ${active('/tasks')}`} style={{fontSize: '1rem', fontWeight: 600}}>
                {userInfo.role === 'admin' ? 'Assignments' : 'My Tasks'}
              </Link>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
              <div style={{textAlign: 'right', display: 'none', md: 'block'}}>
                <p style={{fontSize: '0.85rem', fontWeight: 700, color: '#1e293b'}}>{userInfo.name}</p>
                <p style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{userInfo.role}</p>
              </div>
              <button onClick={handleLogout} className="btn-red btn" style={{padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.9rem'}}>
                <LogOut size={18} /> Exit
              </button>
            </div>
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
