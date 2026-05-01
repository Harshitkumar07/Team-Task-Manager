import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ChevronLeft, Filter, Search, User, Calendar, AlertCircle } from 'lucide-react';

const TaskList = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || '';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', {
        params: { status: statusFilter || undefined }
      });
      setTasks(res.data.data);
    } catch (err) {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task._id === taskId ? { ...task, status: newStatus } : task
    ));
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      alert('Failed to update task status');
      fetchTasks();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'done': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.role === 'admin' ? 'Global task view' : 'Tasks assigned to you'}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            className="block w-full sm:w-48 border border-slate-300 rounded-lg shadow-sm py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No tasks found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {statusFilter ? 'Try clearing your filters.' : 'You have no tasks assigned to you right now.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {tasks.map((task) => (
              <li key={task._id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          <Link to={`/projects/${task.projectId?._id}`} className="hover:text-blue-600 transition-colors">
                            {task.title}
                          </Link>
                        </p>
                        <p className="text-xs font-medium text-blue-600 mt-1 uppercase tracking-wide">
                          Project: {task.projectId?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-3 sm:flex sm:justify-between">
                      <div className="sm:flex sm:items-center gap-4 text-sm text-slate-500 font-medium">
                        {task.assignedTo && (
                          <p className="flex items-center">
                            <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                            {task.assignedTo.name}
                          </p>
                        )}
                        {task.dueDate && (
                          <p className="flex items-center mt-2 sm:mt-0">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {((user?.role === 'admin') || (user?.role === 'member' && task.assignedTo?._id === user?._id)) && (
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <select
                        className="block w-full sm:w-auto text-sm border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskList;
