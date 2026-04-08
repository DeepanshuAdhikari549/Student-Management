import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, ClipboardList, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, tasks: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sRes, tRes] = await Promise.all([
          userInfo.role === 'admin' ? API.get('/students') : Promise.resolve({ data: [] }),
          API.get('/tasks')
        ]);
        const tasks = tRes.data;
        setStats({
          students: sRes.data.length,
          tasks: tasks.length,
          pending: tasks.filter(t => !t.completed).length
        });
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="page-header" style={{ textAlign: 'center', padding: '10rem 0' }}>
      <div className="badge badge-blue">Syncing Database...</div>
    </div>
  );

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <h1 className="page-title">{userInfo.role === 'admin' ? 'SchoolHub Portal' : `Welcome, ${userInfo.name}`}</h1>
        <p className="page-desc">{userInfo.role === 'admin' ? 'A bird\'s eye view of your student management system.' : 'Stay updated with your latest assignments and progress.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ marginBottom: '2.5rem' }}>
        {userInfo.role === 'admin' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '1rem', borderRadius: '16px', marginBottom: '1rem' }}>
                <Users size={32} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.students}</h2>
            <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>Students Enrolled</p>
          </div>
        )}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '1rem', borderRadius: '16px', marginBottom: '1rem' }}>
              <ClipboardList size={32} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.tasks}</h2>
          <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>{userInfo.role === 'admin' ? 'Total Assignments' : 'My Total Tasks'}</p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: '#fffbeb', color: '#f59e0b', padding: '1rem', borderRadius: '16px', marginBottom: '1rem' }}>
              <Clock size={32} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.pending}</h2>
          <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>Pending Actions</p>
        </div>
      </div>
      
      <div className="card" style={{ border: 'none', background: 'var(--primary)', color: 'white', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Quick Navigation</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', maxWidth: '500px' }}>Access your school management tools directly from here to save time.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
               {userInfo.role === 'admin' && (
                 <Link to="/students" className="btn btn-accent">
                    Manage Students <ArrowRight size={18} />
                 </Link>
               )}
               <Link to="/tasks" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  {userInfo.role === 'admin' ? 'Create Assignment' : 'View My Tasks'} <ArrowRight size={18} />
               </Link>
            </div>
        </div>
        {/* Subtle background decoration */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', background: 'var(--accent)', filter: 'blur(80px)', opacity: 0.3 }}></div>
      </div>
    </div>
  );
};

export default Dashboard;
