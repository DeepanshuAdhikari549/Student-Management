import { useState } from 'react';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { username, password });
      onLogin(data);
      toast.success('Welcome to SchoolHub!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', regData);
      onLogin(data);
      toast.success('Account created! Welcome.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
      toast.error('Admin already initialized.');
    }
  };

  return (
    <div style={{minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
      <div className="card" style={{width: '100%', maxWidth: '450px', textAlign: 'center'}}>
        <div style={{color: '#2563eb', marginBottom: '2rem'}}>
          <GraduationCap size={64} className="mx-auto" />
        </div>
        <h1 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem'}}>SchoolHub</h1>
        <p style={{color: '#64748b', marginBottom: '2.5rem'}}>
          {isRegister ? 'Create your student account' : 'Sign in to your account'}
        </p>

        {isRegister ? (
          <form onSubmit={handleRegister} className="grid" style={{gap: '1rem'}}>
            <input placeholder="Full Name" required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
            <input placeholder="Roll Number" required value={regData.rollNumber} onChange={e => setRegData({...regData, rollNumber: e.target.value})} />
            <input placeholder="Class (e.g. 10th A)" required value={regData.class} onChange={e => setRegData({...regData, class: e.target.value})} />
            <input type="email" placeholder="Email Address" required value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
            <input type="password" placeholder="Create Password" required value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
            <button type="submit" className="btn btn-accent" style={{justifyContent: 'center', padding: '1.25rem'}} disabled={loading}>
              <UserPlus size={20} /> {loading ? 'Creating...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="grid" style={{gap: '1.25rem'}}>
            <input placeholder="Username / Roll Number" required value={username} onChange={e => setUsername(e.target.value)} style={{padding: '1.25rem'}} />
            <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{padding: '1.25rem'}} />
            <button type="submit" className="btn btn-accent" style={{justifyContent: 'center', padding: '1.25rem'}} disabled={loading}>
              <LogIn size={20} /> {loading ? 'Entering...' : 'Sign In'}
            </button>
          </form>
        )}

        <div style={{marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem'}}>
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            style={{background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '1rem'}}
          >
            {isRegister ? 'Already have an account? Sign In' : 'New student? Create an account here'}
          </button>
          
          {!isRegister && (
            <div style={{marginTop: '1.5rem'}}>
              <button onClick={handleSeed} style={{background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer'}}>
                Admin Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
