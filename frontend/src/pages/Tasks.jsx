import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, CheckCircle, Circle, Trash2, X, FileText, Send, Clock, CheckCircle2, User, Hash, Calendar } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'done'
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [form, setForm] = useState({ title: '', description: '', students: [], dueDate: '' });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        API.get('/tasks'),
        userInfo.role === 'admin' ? API.get('/students') : Promise.resolve({ data: [] })
      ]);
      setTasks(tRes.data);
      setStudents(sRes.data);
    } catch { 
        toast.error('Sync failed. Check your data connection.'); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!form.students || form.students.length === 0) return toast.error('Please select at least one student');
    try {
      await API.post('/tasks', form);
      toast.success(`Broadcasting assignment to ${form.students.length} students...`);
      setModalOpen(false);
      setForm({ title: '', description: '', students: [], dueDate: '' });
      fetchData();
    } catch { 
        toast.error('Failed to create assignment'); 
    }
  };

  const handleStudentSubmission = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/tasks/${submittingTask._id}/submit`, { submission: submissionText });
      toast.success('Work submitted for review!');
      setSubmitModal(false);
      fetchData();
    } catch { 
        toast.error('Submission failed'); 
    }
  };

  const toggleComplete = async (id, status) => {
    try {
      const { data } = await API.patch(`/tasks/${id}`, { completed: !status });
      setTasks(tasks.map(t => t._id === id ? data : t));
      toast.success(data.completed ? 'Assignment Marked as Completed!' : 'Assignment Re-opened');
    } catch { 
        toast.error('Update failed'); 
    }
  };

  const remove = async (id) => {
    if (window.confirm('Archive this assignment?')) {
      try {
        await API.delete(`/tasks/${id}`);
        setTasks(tasks.filter(t => t._id !== id));
        toast.success('Assignment deleted');
      } catch {
        toast.error('Deletion failed');
      }
    }
  };

  const toggleStudent = (id) => {
    const prev = form.students || [];
    const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
    setForm({ ...form, students: next });
  };

  const filteredTasks = tasks.filter(t => activeTab === 'done' ? t.completed : !t.completed);

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className="btn"
      style={{
        background: activeTab === id ? 'var(--accent)' : 'white',
        color: activeTab === id ? 'white' : 'var(--text-light)',
        border: activeTab === id ? 'none' : '1px solid var(--border)',
        padding: '0.6rem 1.25rem',
        borderRadius: '12px',
        fontWeight: 700,
        flex: 1,
        maxWidth: '220px'
      }}
    >
      <Icon size={16} /> <span style={{ display: 'none', sm: 'inline' }}>{label}</span> <span className="badge" style={{ background: activeTab === id ? 'rgba(255,255,255,0.2)' : 'var(--bg-gray)', marginLeft: '0.5rem' }}>{count}</span>
    </button>
  );

  return (
    <div style={{ paddingBottom: '6rem' }}>
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h1 className="page-title">{userInfo.role === 'admin' ? 'Assignment Hub' : 'Personal Tasks'}</h1>
                <p className="page-desc">Track progress, submit work and manage academic activities.</p>
            </div>
            {userInfo.role === 'admin' && (
              <button onClick={() => setModalOpen(true)} className="btn btn-accent" style={{ display: 'none', md: 'inline-flex' }}>
                <Plus size={20} /> Create Assignment
              </button>
            )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <TabButton 
              id="active" 
              label="Pending" 
              icon={Clock} 
              count={tasks.filter(t => !t.completed).length} 
            />
            <TabButton 
              id="done" 
              label="Completed" 
              icon={CheckCircle2} 
              count={tasks.filter(t => t.completed).length} 
            />
        </div>
        
        {userInfo.role === 'admin' && (
          <button onClick={() => setModalOpen(true)} className="btn btn-accent" style={{ display: 'inline-flex', md: 'none', width: '100%', justifyContent: 'center' }}>
            <Plus size={20} /> New Assignment
          </button>
        )}
      </div>

      <div className="grid">
        {loading ? (
            <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
                <div className="badge badge-blue" style={{ marginBottom: '1rem' }}>Syncing Tasks...</div>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Taking too long? Check your connection.</p>
                <button 
                  onClick={() => { localStorage.removeItem('userInfo'); window.location.reload(); }} 
                  className="btn btn-ghost" 
                >
                  Force Logout
                </button>
            </div>
        ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem' }}>
               {filteredTasks.map(t => (
                  <TaskCard 
                    key={t._id} 
                    t={t} 
                    userInfo={userInfo} 
                    onToggle={toggleComplete} 
                    onRemove={remove} 
                    onSubmit={() => { setSubmittingTask(t); setSubmissionText(''); setSubmitModal(true); }} 
                  />
               ))}
            </div>
        ) : (
            <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem', border: '2px dashed var(--border)', background: 'transparent' }}>
                <Clock size={48} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ color: 'var(--text-light)', fontWeight: 700 }}>
                    Great job! No {activeTab === 'done' ? 'completed' : 'pending'} tasks found.
                </h3>
            </div>
        )}
      </div>

      {modalOpen && (
        <div className="mobile-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setModalOpen(false)}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Assign Work</h2>
              <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmitAssignment} className="grid" style={{ gap: '1.25rem' }}>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment Title" required />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Project description and instructions..." rows="3" />
              
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Select Recipients</label>
                <div style={{ maxHeight: '180px', overflowY: 'auto', background: 'var(--bg-gray)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  {students.map(s => (
                    <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.6rem', borderRadius: '8px', marginBottom: '0.25rem' }} className="menu-link">
                      <input type="checkbox" style={{ width: 'auto' }} checked={form.students.includes(s._id)} onChange={() => toggleStudent(s._id)} />
                      <span style={{ fontSize: '0.9rem' }}>{s.name} <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>({s.class})</span></span>
                    </label>
                  ))}
                  {students.length === 0 && <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-light)', padding: '1rem' }}>No students enrolled yet.</p>}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.5rem', color: 'var(--text-light)' }}>DUE DATE</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required />
                </div>
              </div>

              <button type="submit" className="btn btn-accent" style={{ marginTop: '0.5rem', width: '100%', padding: '1.25rem' }}>
                <Plus size={18} /> Broadcast to {form.students.length} Students
              </button>
            </form>
          </div>
        </div>
      )}

      {submitModal && (
        <div className="mobile-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSubmitModal(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Submit Work</h2>
              <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setSubmitModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleStudentSubmission} className="grid" style={{ gap: '1.25rem' }}>
              <div style={{ background: 'var(--accent-soft)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.25rem' }}>ASSIGNMENT:</p>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{submittingTask.title}</p>
              </div>
              <textarea 
                value={submissionText} 
                onChange={e => setSubmissionText(e.target.value)} 
                placeholder="Type your submission, answers or links to your work here..." 
                rows="6" 
                required 
              />
              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '1.25rem' }}>
                <Send size={18} /> Confirm Submission
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ t, userInfo, onToggle, onRemove, onSubmit }) => {
  const isDone = t.completed;
  const isSubmitted = t.status === 'Submitted';
  
  return (
    <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.25rem',
        borderLeft: isDone ? '4px solid var(--success)' : (isSubmitted ? '4px solid var(--accent)' : '4px solid #f59e0b'),
        background: isDone ? 'rgba(255,255,255,0.6)' : 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
            {userInfo.role === 'admin' ? (
                <button 
                  onClick={() => onToggle(t._id, isDone)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDone ? 'var(--success)' : 'var(--border)', padding: 0 }}
                >
                  {isDone ? <CheckCircle size={28} /> : <Circle size={28} />}
                </button>
            ) : (
                <div style={{ color: isDone ? 'var(--success)' : (isSubmitted ? 'var(--accent)' : 'var(--text-light)') }}>
                    {isDone ? <CheckCircle size={28} /> : <FileText size={28} />}
                </div>
            )}
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-light)' : 'var(--primary)' }}>{t.title}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
                    {userInfo.role === 'admin' && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={12} /> {t.student?.name}
                        </div>
                    )}
                    <div className={`badge ${isDone ? 'badge-green' : (isSubmitted ? 'badge-blue' : 'badge-red')}`} style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                        {isDone ? 'DONE' : t.status.toUpperCase()}
                    </div>
                    {t.dueDate && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} /> {new Date(t.dueDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {userInfo.role === 'admin' && (
            <button onClick={() => onRemove(t._id)} className="btn btn-ghost" style={{ color: 'var(--danger)', padding: '0.5rem' }}>
                <Trash2 size={18} />
            </button>
        )}
      </div>

      {t.description && !isDone && (
         <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', lineBreak: 'anywhere' }}>{t.description}</p>
      )}

      {t.submission && (
        <div style={{ padding: '1rem', background: 'var(--bg-gray)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>SUBMISSION CONTENT</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--primary)', whiteSpace: 'pre-wrap' }}>{t.submission}</p>
        </div>
      )}

      {userInfo.role === 'student' && !isDone && !isSubmitted && (
        <button onClick={onSubmit} className="btn btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>
           <Send size={16} /> Submit Task
        </button>
      )}
    </div>
  );
};

export default Tasks;
