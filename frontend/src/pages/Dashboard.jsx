import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, ClipboardList, Clock } from 'lucide-react';

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
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="page-header"><h2>Loading...</h2></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{userInfo.role === 'admin' ? 'SchoolHub Dashboard' : `Hello, ${userInfo.name}`}</h1>
        <p className="page-desc">{userInfo.role === 'admin' ? 'The simplest view of your school operations.' : 'Track your personal task progress.'}</p>
      </div>

      <div className="grid grid-cols-3 mb-10">
        {userInfo.role === 'admin' && (
          <div className="card text-center">
            <div style={{color: '#2563eb', marginBottom: '1rem'}}><Users size={40} className="mx-auto" /></div>
            <h2 style={{fontSize: '3rem', fontWeight: 800}}>{stats.students}</h2>
            <p style={{color: '#64748b', fontWeight: 600}}>Students Enrolled</p>
          </div>
        )}
        <div className="card text-center">
          <div style={{color: '#8b5cf6', marginBottom: '1rem'}}><ClipboardList size={40} className="mx-auto" /></div>
          <h2 style={{fontSize: '3rem', fontWeight: 800}}>{stats.tasks}</h2>
          <p style={{color: '#64748b', fontWeight: 600}}>{userInfo.role === 'admin' ? 'Total Assignments' : 'My Total Tasks'}</p>
        </div>
        <div className="card text-center">
          <div style={{color: '#f59e0b', marginBottom: '1rem'}}><Clock size={40} className="mx-auto" /></div>
          <h2 style={{fontSize: '3rem', fontWeight: 800}}>{stats.pending}</h2>
          <p style={{color: '#64748b', fontWeight: 600}}>Pending Tasks</p>
        </div>
      </div>
      
      <div className="card" style={{border: 'none', background: '#eff6ff', borderRadius: '32px'}}>
        <h3 className="mb-4" style={{fontSize: '1.5rem', fontWeight: 700}}>Fast Access</h3>
        <p className="mb-6" style={{color: '#1e40af'}}>Ready to manage your school? Choose an action below.</p>
        <div className="flex gap-4">
           {/* Navigation is already in Top Nav, but these are big action buttons */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
