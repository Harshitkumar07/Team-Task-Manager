import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

const TaskModal = ({ isOpen, onClose, projectId, onTaskCreated, userRole }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setAssignedTo('');
      setDueDate('');
      setError('');
      
      const fetchProjectDetails = async () => {
        try {
          const res = await api.get(`/projects/${projectId}`);
          setMembers(res.data.data.members || []);
        } catch (err) {
          console.error("Failed to fetch project members", err);
        }
      };
      if (userRole === 'admin') {
        fetchProjectDetails();
      }
    }
  }, [isOpen, projectId, userRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        projectId,
        status,
        dueDate: dueDate || undefined,
        assignedTo: assignedTo || undefined
      };

      await api.post('/tasks', payload);
      onTaskCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-slate-900">Create New Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5 bg-white">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title *</label>
              <input
                type="text"
                required
                className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select
                  className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            
            {userRole === 'admin' && members.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assign To</label>
                <select
                  className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map(member => (
                    <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-5 py-2.5 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
