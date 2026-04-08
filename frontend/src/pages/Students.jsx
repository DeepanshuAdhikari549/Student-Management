import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Search, GraduationCap, Phone, Mail, Hash } from 'lucide-react';

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
    } catch { 
        toast.error('Failed to connect to school database'); 
    } finally { 
        setLoading(false); 
    }
  };

  if (loading) return (
    <div className="page-header" style={{ textAlign: 'center', padding: '10rem 0' }}>
      <div className="badge badge-blue" style={{ marginBottom: '1rem' }}>Syncing Registry...</div>
      <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>If this takes too long, your backend might be offline.</p>
      <button 
        onClick={() => { localStorage.removeItem('userInfo'); window.location.reload(); }} 
        className="btn btn-ghost" 
        style={{ marginTop: '2rem' }}
      >
        Force Logout
      </button>
    </div>
  );

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
      toast.success(current ? 'Student updated successfully' : 'New student enrolled!');
      fetchStudents();
      setModalOpen(false);
    } catch (err) { 
        toast.error(err.response?.data?.message || 'Transaction failed'); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        await API.delete(`/students/${id}`);
        toast.success('Student record removed');
        fetchStudents();
      } catch (err) {
        toast.error('Failed to delete student');
      }
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '6rem' }}>
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h1 className="page-title">Students Registry</h1>
                <p className="page-desc">Enroll, edit and manage student academic profiles.</p>
            </div>
            <button onClick={() => handleOpen()} className="btn btn-accent" style={{ display: 'none', md: 'inline-flex' }}>
              <Plus size={20} /> Add Student
            </button>
        </div>

        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'white' }}>
          <Search size={20} color="var(--text-light)" />
          <input 
            type="text" 
            placeholder="Search by name or roll number..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: '0.5rem 0', flex: 1 }}
          />
        </div>
        
        <button onClick={() => handleOpen()} className="btn btn-accent" style={{ display: 'inline-flex', md: 'none', width: '100%', justifyContent: 'center' }}>
          <Plus size={20} /> Enroll New Student
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-light)' }}>No students found matching your criteria.</p>
          </div>
        ) : filtered.map(s => (
          <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--accent-soft)', padding: '1rem', borderRadius: '16px', color: 'var(--accent)' }}>
                <GraduationCap size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{s.name}</h3>
                    <div className="badge badge-blue">{s.class}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '0.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                        <Hash size={14} /> <span>{s.rollNumber}</span>
                    </div>
                    {s.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                            <Mail size={14} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</span>
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button onClick={() => handleOpen(s)} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }}>
                <Edit size={16} /> Edit
              </button>
              <button onClick={() => handleDelete(s._id)} className="btn btn-red" style={{ flex: 1 }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="mobile-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setModalOpen(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{current ? 'Update Profile' : 'Student Enrollment'}</h2>
              <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Basic Info</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Student Full Name" required />
              </div>
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <input value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} placeholder="Roll No." required />
                <input value={form.class} onChange={e => setForm({...form, class: e.target.value})} placeholder="Class (e.g. 12A)" required />
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Contact Details</label>
                <div className="grid" style={{ gap: '1rem' }}>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email Address" required />
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number (Optional)" />
                </div>
              </div>
              
              <button type="submit" className="btn btn-accent" style={{ marginTop: '1rem', width: '100%' }}>
                <Plus size={18} /> {current ? 'Save Changes' : 'Confirm Enrollment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
