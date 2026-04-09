import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        background: 'var(--accent-soft)', 
        color: 'var(--accent)', 
        padding: '2rem', 
        borderRadius: '50%', 
        marginBottom: '2rem' 
      }}>
        <AlertTriangle size={64} />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-light)' }}>
        Oops! The page you're looking for doesn't exist.
      </h2>
      <p style={{ marginBottom: '2.5rem', maxWidth: '400px', lineHeight: 1.6, color: 'var(--text-light)' }}>
        It might have been moved, deleted, or you might have mistyped the address.
      </p>
      <Link to="/" className="btn btn-accent" style={{ padding: '0.75rem 2rem' }}>
        <Home size={20} /> Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
