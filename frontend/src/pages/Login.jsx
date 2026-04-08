import { useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { LogIn, GraduationCap } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { username, password });
      onLogin(data);
      toast.success('Welcome!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const { data } = await API.post('/auth/seed');
      toast.success(data.message);
      // Automatically set credentials for the user to make it easy
      setUsername('admin');
      setPassword('admin123');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already setup');
    }
  };

  return (
    <div style={{minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="card" style={{width: '100%', maxWidth: '400px', textAlign: 'center'}}>
        <div style={{color: '#2563eb', marginBottom: '2rem'}}>
          <GraduationCap size={64} className="mx-auto" />
        </div>
        <h1 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem'}}>SchoolHub</h1>
        <p style={{color: '#64748b', marginBottom: '2.5rem'}}>Sign in to manage your school.</p>

        <form onSubmit={handleSubmit} className="grid" style={{gap: '1rem'}}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            required 
            style={{padding: '1.25rem'}}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required 
            style={{padding: '1.25rem'}}
          />
          <button type="submit" className="btn btn-accent" style={{justifyContent: 'center', padding: '1.25rem'}} disabled={loading}>
            <LogIn size={20} />
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>

        <div style={{marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem'}}>
          <p style={{fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem'}}>Don't have an account?</p>
          <button onClick={handleSeed} style={{background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer'}}>
            Setup Initial Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
