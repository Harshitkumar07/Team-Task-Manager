import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-semibold text-slate-900 tracking-tight">Team Task</span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              <Link 
                to="/" 
                className={`inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'border-blue-500 text-slate-900' 
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link 
                to="/projects" 
                className={`inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive('/projects') || location.pathname.startsWith('/projects/')
                    ? 'border-blue-500 text-slate-900' 
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                Projects
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase font-semibold">
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
