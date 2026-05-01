import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ChevronLeft, Plus, Search, Filter, Calendar, User, Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import MemberModal from '../components/MemberModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const fetchProjectAndTasks = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`, {
          params: {
            page,
            limit: 10,
            status: statusFilter || undefined,
            search: searchQuery || undefined
          }
        })
      ]);
      
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
      setTotalPages(tasksRes.data.pagination.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [id, page, statusFilter, searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI Update
    setTasks(prevTasks => prevTasks.map(task => 
      task._id === taskId ? { ...task, status: newStatus } : task
    ));
    
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
      fetchProjectAndTasks();
    }
  };

  const handleAssigneeChange = async (taskId, newAssigneeId) => {
    // Optimistic UI Update
    const member = project.members.find(m => m._id === newAssigneeId);
    setTasks(prevTasks => prevTasks.map(task => 
      task._id === taskId ? { ...task, assignedTo: member || null } : task
    ));

    try {
      await api.put(`/tasks/${taskId}`, { assignedTo: newAssigneeId || null });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task assignee');
      fetchProjectAndTasks();
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

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
        {error}
        <div className="mt-4">
          <Link to="/projects" className="text-red-700 font-medium hover:underline flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <Link to="/projects" className="hover:text-blue-600 flex items-center transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Projects
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{project?.name}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project?.name}</h1>
            <p className="mt-2 text-slate-600 max-w-3xl">{project?.description}</p>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            className="block w-full sm:w-48 border border-slate-300 rounded-lg shadow-sm py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow bg-white"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No tasks found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery || statusFilter ? 'Try adjusting your filters.' : 'Get started by creating a task.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {tasks.map((task) => (
              <li key={task._id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 truncate">{task.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{task.description}</p>
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
                  
                  {/* Status update controls */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 mt-4 sm:mt-0">
                    {user?.role === 'admin' && project?.members && (
                      <select
                        className="block w-full sm:w-auto text-sm border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={task.assignedTo?._id || ''}
                        onChange={(e) => handleAssigneeChange(task._id, e.target.value)}
                        title="Reassign Task"
                      >
                        <option value="">Unassigned</option>
                        {project.members.map(member => (
                          <option key={member._id} value={member._id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {((user?.role === 'admin') || (user?.role === 'member' && task.assignedTo?._id === user?._id)) && (
                      <select
                        className="block w-full sm:w-auto text-sm border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        title="Change Status"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-sm sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transform rotate-180"
                >
                  <span className="sr-only">Next</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={id}
        userRole={user?.role}
        onTaskCreated={fetchProjectAndTasks}
      />

      {project && (
        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          project={project}
          onMembersUpdated={fetchProjectAndTasks}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
