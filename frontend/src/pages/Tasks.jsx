import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, CheckCircle, Circle, Trash2, X, Calendar, User, FileText, Send, ClipboardCheck, Clock, CheckCircle2 } from 'lucide-react';

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
    } catch { toast.error('Sync failed'); }
    finally { setLoading(false); }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!form.students || form.students.length === 0) return toast.error('Select students');
    try {
      await API.post('/tasks', form);
      toast.success('Assigned!');
      setModalOpen(false);
      setForm({ title: '', description: '', students: [], dueDate: '' });
      fetchData();
    } catch { toast.error('Error'); }
  };

  const handleStudentSubmission = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/tasks/${submittingTask._id}/submit`, { submission: submissionText });
      toast.success('Submitted!');
      setSubmitModal(false);
      fetchData();
    } catch { toast.error('Error'); }
  };

  const toggleComplete = async (id, status) => {
    try {
      const { data } = await API.patch(`/tasks/${id}`, { completed: !status });
      setTasks(tasks.map(t => t._id === id ? data : t));
      toast.success(data.completed ? 'Task Completed!' : 'Task Re-opened');
    } catch { toast.error('Error'); }
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

  const filteredTasks = tasks.filter(t => activeTab === 'done' ? t.completed : !t.completed);

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`btn ${activeTab === id ? 'btn-accent' : ''}`}
      style={{
        background: activeTab === id ? '#2563eb' : 'white',
        color: activeTab === id ? 'white' : '#64748b',
        border: activeTab === id ? 'none' : '1px solid #e2e8f0',
        padding: '0.75rem 2rem',
        borderRadius: '100px',
        fontWeight: 700
      }}
    >
      <Icon size={18} /> {label} ({count})
    </button>
  );

  return (
    <div style={{paddingBottom: '5rem'}}>
      <div className="page-header flex gap-4" style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">{userInfo.role === 'admin' ? 'Assignment Hub' : 'My Tasks'}</h1>
          <p className="page-desc">The central place for all schoolwork.</p>
        </div>
        {userInfo.role === 'admin' && (
          <button onClick={() => setModalOpen(true)} className="btn btn-accent">
            <Plus size={20} /> Create Assignment
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-10" style={{justifyContent: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '2.5rem'}}>
        <TabButton 
          id="active" 
          label="Active Assignments" 
          icon={Clock} 
          count={tasks.filter(t => !t.completed).length} 
        />
        <TabButton 
          id="done" 
          label="Completed Work" 
          icon={CheckCircle2} 
          count={tasks.filter(t => t.completed).length} 
        />
      </div>

      {loading ? <h3>Loading...</h3> : (
        <div className="grid">
          {filteredTasks.length > 0 ? filteredTasks.map(t => (
            <TaskCard 
              key={t._id} 
              t={t} 
              userInfo={userInfo} 
              onToggle={toggleComplete} 
              onRemove={remove} 
              onSubmit={() => { setSubmittingTask(t); setSubmitModal(true); }} 
            />
          )) : (
            <div className="card text-center" style={{padding: '5rem', border: '3px dashed #f1f5f9', background: 'transparent'}}>
              <h2 style={{color: '#cbd5e1', fontWeight: 700}}>
                No {activeTab === 'done' ? 'Completed' : 'Active'} Tasks Found
              </h2>
            </div>
          )}
        </div>
      )}

      {/* Modals remain same ... */}
      {modalOpen && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{maxWidth: '550px', width: '90%'}}>
            <div className="flex" style={{justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2 style={{fontWeight: 700}}>Assign Task</h2>
              <button onClick={() => setModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmitAssignment} className="grid" style={{gap: '1.25rem'}}>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment Name" required />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Instructions..." rows="2" />
              <div style={{maxHeight: '150px', overflowY: 'auto', background: '#f8fafc', padding: '1rem', borderRadius: '12px'}}>
                {students.map(s => (
                  <label key={s._id} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.4rem 0'}}>
                    <input type="checkbox" checked={form.students.includes(s._id)} onChange={() => toggleStudent(s._id)} />
                    {s.name} ({s.class})
                  </label>
                ))}
              </div>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              <button type="submit" className="btn btn-accent" style={{justifyContent: 'center', padding: '1.25rem'}}>Assign to {form.students.length} Students</button>
            </form>
          </div>
        </div>
      )}

      {submitModal && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{maxWidth: '500px', width: '90%'}}>
            <div className="flex" style={{justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2 style={{fontWeight: 700}}>Submit Your Work</h2>
              <button onClick={() => setSubmitModal(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleStudentSubmission} className="grid" style={{gap: '1.25rem'}}>
              <textarea value={submissionText} onChange={e => setSubmissionText(e.target.value)} placeholder="Write your answer..." rows="5" required />
              <button type="submit" className="btn btn-accent" style={{justifyContent: 'center', padding: '1.25rem'}}><Send size={18} /> Send Submission</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ t, userInfo, onToggle, onRemove, onSubmit }) => (
  <div className="card" style={{
    borderLeft: t.completed ? '8px solid #10b981' : (t.status === 'Submitted' ? '8px solid #2563eb' : '8px solid #f59e0b'),
    opacity: t.completed ? 0.9 : 1
  }}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
        {userInfo.role === 'admin' ? (
          <button onClick={() => onToggle(t._id, t.completed)} style={{background: 'none', border: 'none', cursor: 'pointer', color: t.completed ? '#10b981' : '#cbd5e1'}}>
            {t.completed ? <CheckCircle size={36} /> : <Circle size={36} />}
          </button>
        ) : (
          <div style={{color: t.completed ? '#10b981' : t.status === 'Submitted' ? '#2563eb' : '#cbd5e1'}}>
            {t.completed ? <CheckCircle size={36} /> : <FileText size={36} />}
          </div>
        )}
        <div>
          <h3 style={{fontSize: '1.25rem', fontWeight: 800, textDecoration: t.completed ? 'line-through' : 'none'}}>{t.title}</h3>
          <div style={{display: 'flex', wrap: 'wrap', gap: '1rem', color: '#64748b', fontSize: '0.9rem'}}>
            {userInfo.role === 'admin' && <span className="flex gap-1 items-center font-bold"><User size={14}/> {t.student?.name}</span>}
            <span className={`font-bold ${t.completed ? 'text-emerald-600' : 'text-amber-500'}`}>Status: {t.status}</span>
          </div>
        </div>
      </div>
      {userInfo.role === 'admin' && (
        <button onClick={() => onRemove(t._id)} className="btn btn-red" style={{background: '#fee2e2', padding: '0.75rem', borderRadius: '12px'}}><Trash2 size={18} /></button>
      )}
    </div>
    
    {t.submission && (
      <div style={{marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
        <p style={{fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.5rem'}}>STUDENT RESPONSE:</p>
        <p style={{fontSize: '0.95rem'}}>{t.submission}</p>
      </div>
    )}

    {userInfo.role === 'student' && !t.completed && t.status !== 'Submitted' && (
      <button onClick={onSubmit} className="btn btn-accent" style={{marginTop: '1.5rem', width: '100%', justifyContent: 'center'}}>
        <Send size={18} /> Submit Work
      </button>
    )}
  </div>
);

export default Tasks;
