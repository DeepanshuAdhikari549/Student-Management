import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, CheckCircle, Circle, Trash2, X, Calendar, User, FileText, Send, ClipboardCheck } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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
      toast.success(data.completed ? 'Task Finished' : 'Task Re-opened');
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

  const activeTasks = tasks.filter(t => !t.completed);
  const finishedTasks = tasks.filter(t => t.completed);

  return (
    <div style={{paddingBottom: '5rem'}}>
      <div className="page-header flex gap-4" style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">{userInfo.role === 'admin' ? 'Management Center' : 'My Learning'}</h1>
          <p className="page-desc">Track and submit all educational work here.</p>
        </div>
        {userInfo.role === 'admin' && (
          <button onClick={() => setModalOpen(true)} className="btn btn-accent">
            <Plus size={20} /> Assign Task
          </button>
        )}
      </div>

      {loading ? <h3>Loading...</h3> : (
        <div className="grid" style={{gap: '3rem'}}>
          
          {/* Section 1: Active Tasks */}
          <div>
            <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <FileText size={24} color="#2563eb" /> Active Assignments
            </h2>
            <div className="grid">
              {activeTasks.length > 0 ? activeTasks.map(t => (
                <TaskCard 
                  key={t._id} 
                  t={t} 
                  userInfo={userInfo} 
                  onToggle={toggleComplete} 
                  onRemove={remove} 
                  onSubmit={() => { setSubmittingTask(t); setSubmitModal(true); }}
                />
              )) : (
                <div className="card text-center" style={{padding: '2rem', color: '#94a3b8', background: 'transparent', borderStyle: 'dashed'}}>
                  No active tasks found.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Completed Tasks */}
          <div>
            <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981'}}>
              <ClipboardCheck size={24} /> Finished Records (Done)
            </h2>
            <div className="grid">
              {finishedTasks.length > 0 ? finishedTasks.map(t => (
                <TaskCard 
                  key={t._id} 
                  t={t} 
                  userInfo={userInfo} 
                  onToggle={toggleComplete} 
                  onRemove={remove} 
                />
              )) : (
                <div className="card text-center" style={{padding: '2rem', color: '#94a3b8', background: 'transparent', borderStyle: 'dashed'}}>
                   Complete your first task to see it here!
                </div>
              )}
            </div>
          </div>

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
  <div className="card" style={{opacity: t.completed ? 0.7 : 1, transition: 'all 0.3s'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
      <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
        {userInfo.role === 'admin' ? (
          <button onClick={() => onToggle(t._id, t.completed)} style={{background: 'none', border: 'none', cursor: 'pointer', color: t.completed ? '#10b981' : '#cbd5e1'}}>
            {t.completed ? <CheckCircle size={32} /> : <Circle size={32} />}
          </button>
        ) : (
          <div style={{color: t.completed ? '#10b981' : t.status === 'Submitted' ? '#2563eb' : '#cbd5e1'}}>
            {t.completed ? <CheckCircle size={32} /> : <FileText size={32} />}
          </div>
        )}
        <div>
          <h3 style={{fontSize: '1.25rem', fontWeight: 700}}>{t.title}</h3>
          <div style={{display: 'flex', wrap: 'wrap', gap: '1rem', color: '#64748b', fontSize: '0.9rem'}}>
            {userInfo.role === 'admin' && <span className="flex gap-1 items-center"><User size={14}/> {t.student?.name}</span>}
            <span className={`font-bold ${t.completed ? 'text-emerald-600' : 'text-amber-500'}`}>Status: {t.status}</span>
          </div>
        </div>
      </div>
      {userInfo.role === 'admin' && (
        <button onClick={() => onRemove(t._id)} className="btn btn-red" style={{background: '#fee2e2', padding: '0.75rem'}}><Trash2 size={18} /></button>
      )}
    </div>

    {t.submission && (
      <div style={{marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
        <p style={{fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase'}}>Submission:</p>
        <p>{t.submission}</p>
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
