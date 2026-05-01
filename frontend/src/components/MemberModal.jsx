import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import api from '../services/api';

const MemberModal = ({ isOpen, onClose, project, onMembersUpdated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Array of currently selected member IDs
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSelectedMembers(project.members.map(m => m._id));
      
      const fetchUsers = async () => {
        try {
          const res = await api.get('/auth/users');
          setUsers(res.data.data);
        } catch (err) {
          setError('Failed to fetch users');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUsers();
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/projects/${project._id}`, { members: selectedMembers });
      onMembersUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update members');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-slate-900">Manage Project Members</h3>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-5 overflow-y-auto flex-1 bg-white">
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(u => {
                const isSelected = selectedMembers.includes(u._id);
                return (
                  <div key={u._id} className={`flex items-center justify-between p-3 rounded-lg border ${isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'} transition-colors`}>
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-sm text-slate-500">{u.email} &bull; <span className="uppercase text-xs font-bold text-slate-400">{u.role}</span></p>
                    </div>
                    <button
                      onClick={() => toggleMember(u._id)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        isSelected ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title={isSelected ? "Remove Member" : "Add Member"}
                    >
                      {isSelected ? <Trash2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={submitting || loading}
            className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Members'}
          </button>
          <button
            onClick={onClose}
            className="inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-5 py-2.5 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;
