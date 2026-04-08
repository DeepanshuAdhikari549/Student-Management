import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import { useState, useEffect } from 'react';
import { GraduationCap, LogOut, Menu as MenuIcon, X } from 'lucide-react';

function App() {
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (data) => {
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const handleLogout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const Navbar = () => {
    const loc = useLocation();
    const active = (p) => loc.pathname === p ? 'active' : '';

    // Close menu when location changes
    useEffect(() => {
      closeMobileMenu();
    }, [loc]);

    const NavLinks = () => (
      <>
        <Link to="/" className={`menu-link ${active('/')}`}>Overview</Link>
        {userInfo.role === 'admin' && <Link to="/students" className={`menu-link ${active('/students')}`}>Students</Link>}
        <Link to="/tasks" className={`menu-link ${active('/tasks')}`}>
          {userInfo.role === 'admin' ? 'Assignments' : 'My Tasks'}
        </Link>
      </>
    );

    return (
      <>
        <nav className="nav">
          <div className="container" style={{ width: '100%' }}>
            <div className="nav-inner">
              <div className="brand">
                <div style={{ background: 'var(--accent)', color: 'white', padding: '0.4rem', borderRadius: '10px', display: 'flex' }}>
                  <GraduationCap size={24} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SchoolHub</span>
              </div>

              <div className="menu">
                <NavLinks />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }} className="user-badge">
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{userInfo.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>{userInfo.role}</p>
                </div>
                <button onClick={handleLogout} className="btn-red btn md-flex hidden" style={{ padding: '0.5rem 1rem' }}>
                  <LogOut size={18} /> Exit
                </button>
                <button className="mobile-toggle" onClick={toggleMobileMenu}>
                  {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile menu drawer */}
        <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
        <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
           <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{userInfo.name}</p>
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{userInfo.role.toUpperCase()}</p>
           </div>
           <NavLinks />
           <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
             <button onClick={handleLogout} className="btn-red btn" style={{ width: '100%', justifyContent: 'center' }}>
                <LogOut size={18} /> Logout
             </button>
           </div>
        </div>
      </>
    );
  };

  return (
    <Router>
      {userInfo && <Navbar />}
      <div className={userInfo ? "container" : ""}>
        <Routes>
          <Route path="/login" element={!userInfo ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={userInfo ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/students" element={userInfo ? <Students /> : <Navigate to="/login" />} />
          <Route path="/tasks" element={userInfo ? <Tasks /> : <Navigate to="/login" />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
