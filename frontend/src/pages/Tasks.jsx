import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, CheckCircle, Circle, Trash2, X, Calendar, User, Users } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', students: [], dueDate: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([API.get('/tasks'), API.get('/students')]);
      setTasks(tRes.data);
      setStudents(sRes.data);
    } catch { toast.error('Sync failed'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.students || form.students.length === 0) return toast.error('Select at least one student');
    try {
      await API.post('/tasks', form);
      toast.success('Assigned to all selected!');
      setModalOpen(false);
      setForm({ title: '', description: '', students: [], dueDate: '' });
      fetchData();
    } catch { toast.error('Error'); }
  };

  const toggle = async (id, status) => {
    try {
      const { data } = await API.patch(`/tasks/${id}`, { completed: !status });
      setTasks(tasks.map(t => t._id === id ? data : t));
    } catch { toast.error('Failed'); }
  };

  const remove = async (id) => {
    if (confirm('Delete task?')) {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    }
  };

  const toggleStudent = (id) => {
    const prev = form.students || [];
    const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
    setForm({ ...form, students: next });
  };

  const selectAll = () => {
    if (form.students.length === students.length) setForm({ ...form, students: [] });
    else setForm({ ...form, students: students.map(s => s._id) });
  };

  return (
    <div style={{paddingBottom: '5rem'}}>
      <div className="page-header flex gap-4" style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-desc">Track and delegate homework tasks.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-accent">
          <Plus size={20} /> Assign Task
        </button>
      </div>

      <div className="grid">
        {loading ? <h3>Loading...</h3> : tasks.map(t => (
          <div key={t._id} className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: t.completed ? 0.6 : 1}}>
            <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
              <button onClick={() => toggle(t._id, t.completed)} style={{background: 'none', border: 'none', cursor: 'pointer', color: t.completed ? '#10b981' : '#cbd5e1'}}>
                {t.completed ? <CheckCircle size={32} /> : <Circle size={32} />}
              </button>
              <div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 700, textDecoration: t.completed ? 'line-through' : 'none'}}>{t.title}</h3>
                <div style={{display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem'}}>
                  <span className="flex gap-1 items-center"><User size={14}/> {t.student?.name} (Roll: {t.student?.rollNumber})</span>
                  {t.dueDate && <span className="flex gap-1 items-center"><Calendar size={14}/> {new Date(t.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
            <button onClick={() => remove(t._id)} className="btn btn-red" style={{background: '#fee2e2', padding: '0.75rem'}}><Trash2 size={18} /></button>
          </div>
        ))}
        {!loading && tasks.length === 0 && <div className="card text-center" style={{padding: '4rem', color: '#94a3b8'}}>No tasks yet. Start assigning!</div>}
      </div>

      {modalOpen && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{maxWidth: '550px', width: '90%'}}>
            <div className="flex" style={{justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2 style={{fontWeight: 700}}>Assign Task</h2>
              <button onClick={() => setModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="grid" style={{gap: '1.25rem'}}>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment Name (e.g. Unit Test 1)" required />
              
              <div>
                <div className="flex" style={{justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center'}}>
                  <label style={{fontSize: '0.85rem', fontWeight: 700, color: '#64748b'}}>Select Students</label>
                  <button type="button" onClick={selectAll} style={{fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600}}>
                    {form.students.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={{maxHeight: '180px', overflowY: 'auto', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9'}}>
                  {students.map(s => (
                    <label key={s._id} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem 0'}}>
                      <input 
                        type="checkbox" 
                        checked={form.students.includes(s._id)} 
                        onChange={() => toggleStudent(s._id)}
                        style={{width: '18px', height: '18px'}}
                      />
                      <span style={{fontSize: '0.95rem'}}>{s.name} <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>— {s.class}</span></span>
                    </label>
                  ))}
                  {students.length === 0 && <p style={{fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center'}}>No students found.</p>}
                </div>
              </div>

              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              
              <button type="submit" className="btn btn-accent" style={{marginTop: '0.5rem', justifyContent: 'center', padding: '1.25rem'}}>
                Deploy Assignment to {form.students.length} Student{form.students.length !== 1 ? 's' : ''}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
