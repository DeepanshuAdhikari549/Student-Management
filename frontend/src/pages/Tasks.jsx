import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, CheckCircle, Circle, Trash2, X, Calendar, User, FileText, Send } from 'lucide-react';

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
    if (!form.students || form.students.length === 0) return toast.error('Select at least one student');
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
      toast.success('Work submitted successfully!');
      setSubmitModal(false);
      setSubmissionText('');
      fetchData();
    } catch { toast.error('Submission failed'); }
  };

  const toggleComplete = async (id, status) => {
    try {
      const { data } = await API.patch(`/tasks/${id}`, { completed: !status });
      setTasks(tasks.map(t => t._id === id ? data : t));
      toast.success(data.completed ? 'Marked as Completed' : 'Marked as Pending');
    } catch { toast.error('Failed to update status'); }
  };

  const remove = async (id) => {
    if (confirm('Delete task?')) {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    }
  };

  const toggleStudentSelection = (id) => {
    const prev = form.students || [];
    const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
    setForm({ ...form, students: next });
  };

  return (
    <div style={{paddingBottom: '5rem'}}>
      <div className="page-header flex gap-4" style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">{userInfo.role === 'admin' ? 'Assignments' : 'My Tasks'}</h1>
          <p className="page-desc">{userInfo.role === 'admin' ? 'Track and delegate homework tasks.' : 'View and submit your work.'}</p>
        </div>
        {userInfo.role === 'admin' && (
          <button onClick={() => setModalOpen(true)} className="btn btn-accent">
            <Plus size={20} /> Assign Task
          </button>
        )}
      </div>

      <div className="grid">
        {loading ? <h3>Loading...</h3> : tasks.map(t => (
          <div key={t._id} className="card" style={{opacity: t.completed ? 0.6 : 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                {userInfo.role === 'admin' ? (
                  <button onClick={() => toggleComplete(t._id, t.completed)} style={{background: 'none', border: 'none', cursor: 'pointer', color: t.completed ? '#10b981' : '#cbd5e1'}}>
                    {t.completed ? <CheckCircle size={32} /> : <Circle size={32} />}
                  </button>
                ) : (
                  <div style={{color: t.completed ? '#10b981' : t.status === 'Submitted' ? '#2563eb' : '#cbd5e1'}}>
                    {t.completed ? <CheckCircle size={32} /> : <FileText size={32} />}
                  </div>
                )}
                <div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 700, textDecoration: t.completed ? 'line-through' : 'none'}}>{t.title}</h3>
                  <div style={{display: 'flex', wrap: 'wrap', gap: '1rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem'}}>
                    {userInfo.role === 'admin' && <span className="flex gap-1 items-center"><User size={14}/> {t.student?.name}</span>}
                    <span className={`flex gap-1 items-center font-bold ${t.completed ? 'text-emerald-600' : t.status === 'Submitted' ? 'text-blue-600' : 'text-amber-500'}`}>
                      Status: {t.status}
                    </span>
                    {t.dueDate && <span className="flex gap-1 items-center"><Calendar size={14}/> Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              {userInfo.role === 'admin' && (
                <button onClick={() => remove(t._id)} className="btn btn-red" style={{background: '#fee2e2', padding: '0.75rem'}}><Trash2 size={18} /></button>
              )}
            </div>

            {/* Submission Preview for Admin */}
            {userInfo.role === 'admin' && t.submission && (
              <div style={{marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                <p style={{fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem'}}>STUDENT SUBMISSION:</p>
                <p style={{fontSize: '0.95rem'}}>{t.submission}</p>
              </div>
            )}

            {/* Actions for Student */}
            {userInfo.role === 'student' && !t.completed && (
              <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9'}}>
                {t.status === 'Submitted' ? (
                  <div className="flex gap-2" style={{color: '#2563eb'}}>
                    <CheckCircle size={18} />
                    <span className="font-bold text-sm">Waiting for Admin to mark as Completed</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setSubmittingTask(t); setSubmitModal(true); }}
                    className="btn btn-accent" 
                    style={{padding: '0.75rem 1.5rem'}}
                  >
                    <Send size={18} /> Submit Work
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Admin: Assign Modal */}
      {modalOpen && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{maxWidth: '550px', width: '90%'}}>
            <div className="flex" style={{justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2 style={{fontWeight: 700}}>Assign Task</h2>
              <button onClick={() => setModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmitAssignment} className="grid" style={{gap: '1.25rem'}}>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Assignment Name" required />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Special Instructions" rows="2" />
              <div>
                <label style={{fontSize: '0.85rem', fontWeight: 700, color: '#64748b'}}>Select Students</label>
                <div style={{maxHeight: '150px', overflowY: 'auto', background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginTop: '0.5rem'}}>
                  {students.map(s => (
                    <label key={s._id} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.4rem 0'}}>
                      <input type="checkbox" checked={form.students.includes(s._id)} onChange={() => toggleStudentSelection(s._id)} />
                      {s.name} ({s.class})
                    </label>
                  ))}
                </div>
              </div>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              <button type="submit" className="btn btn-accent" style={{justifyContent: 'center', padding: '1.25rem'}}>Assign to {form.students.length} Students</button>
            </form>
          </div>
        </div>
      )}

      {/* Student: Submit Modal */}
      {submitModal && (
        <div className="modal-overlay" style={{background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{maxWidth: '500px', width: '90%'}}>
            <div className="flex" style={{justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2 style={{fontWeight: 700}}>Submit Your Work</h2>
              <button onClick={() => setSubmitModal(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleStudentSubmission} className="grid" style={{gap: '1.25rem'}}>
              <p style={{fontSize: '0.9rem', color: '#64748b'}}>Task: <b>{submittingTask.title}</b></p>
              <textarea 
                value={submissionText} 
                onChange={e => setSubmissionText(e.target.value)} 
                placeholder="Write your answer or paste a link to your work here..." 
                rows="5" 
                required 
              />
              <button type="submit" className="btn btn-accent" style={{justifyContent: 'center', padding: '1.25rem'}}>
                <Send size={18} /> Send Submission
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
