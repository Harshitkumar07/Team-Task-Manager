import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, Clock, AlertTriangle, LayoutList } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tasks/dashboard');
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
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
      </div>
    );
  }

  const statCards = [
    { name: 'Total Tasks', value: stats.totalTasks, icon: LayoutList, color: 'text-blue-600', bg: 'bg-blue-50', link: '/tasks' },
    { name: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', link: '/tasks?status=done' },
    { name: 'Pending', value: stats.pendingTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', link: '/tasks?status=in-progress' },
    { name: 'Overdue', value: stats.overdueTasks, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', link: '/tasks?status=todo' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="text-sm text-slate-500">
          Welcome back, <span className="font-medium text-slate-900">{user?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <Link 
            key={item.name} 
            to={item.link}
            className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all group block"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 transition-colors ${item.bg} group-hover:bg-opacity-80`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate group-hover:text-slate-700 transition-colors">{item.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {stats.totalTasks === 0 && (
        <div className="mt-10 bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <LayoutList className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No tasks yet</h3>
          <p className="mt-1 text-sm text-slate-500 mb-4">
            {user?.role === 'admin' 
              ? 'Get started by creating a project and assigning tasks.' 
              : 'You have no tasks assigned to you right now.'}
          </p>
          {user?.role === 'admin' && (
             <Link to="/projects" className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
               Go to Projects
             </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
