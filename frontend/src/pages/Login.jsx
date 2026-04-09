import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { LogIn, GraduationCap, UserPlus } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({ name: '', rollNumber: '', class: '', email: '', password: '' });

  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    let checkCount = 0;
    const checkHealth = async () => {
      try {
        const { data } = await API.get('/health');
        if (data.database === 'connected') setServerStatus('online');
        else setServerStatus('db_error');
      } catch (err) {
        checkCount++;
        if (checkCount > 5) setServerStatus('offline');
        else setServerStatus('checking');
      }
    };
    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (serverStatus === 'offline') {
      toast.error('The server seems to be offline. Please wait or check your connection.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { username, password });
      onLogin(data);
      toast.success('Welcome back to SchoolHub!');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        toast.error('Connection timed out. The server is responding very slowly.');
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (serverStatus === 'offline') {
      toast.error('The server seems to be offline.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', regData);
      onLogin(data);
      toast.success('Account created! Welcome to SchoolHub.');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        toast.error('Connection timed out. Registration took too long.');
      } else {
        toast.error(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const { data } = await API.post('/auth/seed');
      toast.success(data.message);
      setUsername('admin');
      setPassword('admin123');
    } catch (err) {
      toast.error('Admin account already exists.');
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-flex', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '1rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
          <GraduationCap size={48} />
          <div 
            title={`Server is ${serverStatus}`}
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: serverStatus === 'online' ? '#10b981' : (serverStatus === 'db_error' ? '#f59e0b' : '#ef4444'),
              border: '2px solid white'
            }} 
          />
        </div>
        <h1 className="page-title" style={{ fontSize: '1.75rem' }}>SchoolHub</h1>
        <p className="page-desc" style={{ marginBottom: '2.5rem' }}>
          {isRegister ? 'Enter your details to register as a student' : 'Sign in to access your dashboard'}
        </p>

        {isRegister ? (
          <form onSubmit={handleRegister} className="grid" style={{ gap: '0.75rem' }}>
            <input placeholder="Full Name" required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
            <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
              <input placeholder="Roll Number" required value={regData.rollNumber} onChange={e => setRegData({...regData, rollNumber: e.target.value})} />
              <input placeholder="Class (e.g. 10A)" required value={regData.class} onChange={e => setRegData({...regData, class: e.target.value})} />
            </div>
            <input type="email" placeholder="Email Address" required value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
            <input type="password" placeholder="Create Password" required value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
            <button type="submit" className="btn btn-accent" style={{ marginTop: '0.5rem' }} disabled={loading}>
              <UserPlus size={20} /> {loading ? 'Creating...' : 'Register Now'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="grid" style={{ gap: '1rem' }}>
            <input placeholder="Username / Roll Number" required value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="btn btn-accent" style={{ marginTop: '0.5rem' }} disabled={loading}>
              <LogIn size={20} /> {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button 
            className="btn btn-ghost"
            onClick={() => setIsRegister(!isRegister)} 
            style={{ width: '100%', fontSize: '0.875rem' }}
          >
            {isRegister ? 'Already have an account? Sign In' : 'New student? Create an account'}
          </button>
          
          {!isRegister && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={handleSeed} style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '0.75rem', cursor: 'pointer', opacity: 0.6 }}>
                Initialize Admin System
              </button>
              {serverStatus !== 'online' && (
                <p style={{ fontSize: '0.7rem', color: '#ef4444' }}>
                  {serverStatus === 'offline' ? '⚠️ Cannot reach backend server' : '⚠️ Database connection issue'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
