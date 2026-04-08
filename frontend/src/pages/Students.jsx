import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Search, GraduationCap } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ name: '', rollNumber: '', class: '', email: '', phone: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await API.get('/students');
      setStudents(data);
    } catch { toast.error('Check your connection'); }
    finally { setLoading(false); }
  };

  const handleOpen = (s = null) => {
    if (s) {
      setCurrent(s);
      setForm({ ...s });
    } else {
      setCurrent(null);
      setForm({ name: '', rollNumber: '', class: '', email: '', phone: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (current) await API.put(`/students/${current._id}`, form);
      else await API.post('/students', form);
      toast.success('Done!');
      fetchStudents();
      setModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete student?')) {
      await API.delete(`/students/${id}`);
      fetchStudents();
    }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{paddingBottom: '5rem'}}>
      <div className="page-header flex gap-4" style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-desc">Manage all enrolled students here.</p>
        </div>
        <button onClick={() => handleOpen()} className="btn btn-accent">
          <Plus size={20} /> Add Student
        </button>
      </div>

      <div className="mb-8 card" style={{padding: '1rem 1.5rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <Search size={22} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{background: 'transparent', padding: '0.5rem'}}
          />
        </div>
      </div>

      <div className="grid">
        {loading ? <h3>Loading...</h3> : filtered.map(s => (
          <div key={s._id} className="card" style={{padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
              <div style={{background: '#f1f5f9', padding: '1rem', borderRadius: '12px'}}>
                <GraduationCap size={24} color="#64748b" />
              </div>
              <div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 700}}>{s.name}</h3>
                <p style={{color: '#64748b'}}>Class: <b>{s.class}</b> | Roll: <b>{s.rollNumber}</b></p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpen(s)} className="btn" style={{background: '#f1f5f9', padding: '0.75rem'}}><Edit size={18} /></button>
              <button onClick={() => handleDelete(s._id)} className="btn btn-red" style={{background: '#fee2e2', padding: '0.75rem'}}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{maxWidth: '500px', width: '90%'}}>
            <div className="flex" style={{justifyContent: 'space-between', marginBottom: '2rem'}}>
              <h2 style={{fontWeight: 700}}>{current ? 'Edit Student' : 'New Student'}</h2>
              <button onClick={() => setModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="grid" style={{gap: '1rem'}}>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name" required />
              <input value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} placeholder="Roll Number" required />
              <input value={form.class} onChange={e => setForm({...form, class: e.target.value})} placeholder="Class (e.g. 10th A)" required />
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" required />
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" />
              <button type="submit" className="btn btn-accent" style={{marginTop: '1rem', justifyContent: 'center'}}>Save Student</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
