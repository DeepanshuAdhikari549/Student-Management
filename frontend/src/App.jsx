import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import { useState, useEffect } from 'react';
import { GraduationCap, LogOut, Menu as MenuIcon, X } from 'lucide-react';

const NavLinks = ({ userInfo, active }) => (
  <>
    <Link to="/" className={`menu-link ${active('/')}`}>Overview</Link>
    {userInfo.role === 'admin' && <Link to="/students" className={`menu-link ${active('/students')}`}>Students</Link>}
    <Link to="/tasks" className={`menu-link ${active('/tasks')}`}>
      {userInfo.role === 'admin' ? 'Assignments' : 'My Tasks'}
    </Link>
  </>
);

const Navbar = ({ userInfo, handleLogout, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu }) => {
  const loc = useLocation();
  const active = (p) => loc.pathname === p ? 'active' : '';

  // Close menu when location changes
  useEffect(() => {
    closeMobileMenu();
  }, [loc.pathname]);

  return (
    <>
      <nav className="nav">
        <div className="container" style={{ width: '100%' }}>
          <div className="nav-inner">
            <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--accent)', color: 'white', padding: '0.4rem', borderRadius: '10px', display: 'flex' }}>
                <GraduationCap size={24} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SchoolHub</span>
            </Link>

            <div className="menu">
              <NavLinks userInfo={userInfo} active={active} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }} className="user-badge">
                <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{userInfo.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>{userInfo.role}</p>
              </div>
              <button onClick={handleLogout} className="btn-red btn md-flex hidden" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={18} /> Exit
              </button>
              <button className="mobile-toggle" onClick={toggleMobileMenu} aria-label="Toggle Menu" style={{ zIndex: 1001 }}>
                {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
         <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>{userInfo.name}</p>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{userInfo.role.toUpperCase()}</p>
            </div>
            <button onClick={closeMobileMenu} style={{ background: 'none', border: 'none', color: 'var(--text-light)' }}>
              <X size={24} />
            </button>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLinks userInfo={userInfo} active={active} />
         </div>
         <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
           <button onClick={handleLogout} className="btn-red btn" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              <LogOut size={20} /> Logout
           </button>
         </div>
      </div>
    </>
  );
};

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

  return (
    <Router>
      {userInfo && (
        <Navbar 
          userInfo={userInfo} 
          handleLogout={handleLogout} 
          isMobileMenuOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu} 
          closeMobileMenu={closeMobileMenu} 
        />
      )}
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
