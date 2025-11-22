
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, LayoutDashboard, CreditCard, LogOut, Settings, ChevronRight, ChevronLeft, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden font-sans selection:bg-brand-500/30">
      {/* Sidebar */}
      <aside 
        className={`${isExpanded ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out bg-[#09090b] border-r border-dark-border flex flex-col z-50 h-full relative flex-shrink-0`}
      >
        <div className="h-14 flex items-center justify-center border-b border-dark-border/50">
            <Link to="/" className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                    <Code2 size={18} className="text-white" />
                </div>
                <span className={`font-bold text-lg text-white whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Cupcake-S
                </span>
            </Link>
        </div>

        <nav className="flex-1 py-6 px-2 space-y-1">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all group relative ${isActive('/dashboard') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Dashboard</span>
            {!isExpanded && <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Dashboard</div>}
          </Link>
          
          <Link 
            to="/billing" 
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all group relative ${isActive('/billing') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <CreditCard size={20} />
            <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Billing</span>
            {!isExpanded && <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Billing</div>}
          </Link>

          <Link 
            to="/profile" 
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all group relative ${isActive('/profile') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={20} />
            <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Settings</span>
            {!isExpanded && <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Settings</div>}
          </Link>
        </nav>

        {/* Collapse Toggle */}
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3 top-20 bg-dark-surface text-gray-400 hover:text-white p-1 rounded-full border border-dark-border shadow-lg z-50 hover:bg-brand-600 hover:border-brand-500 transition-colors"
        >
            {isExpanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        <div className="p-3 border-t border-dark-border/50">
          <div className={`flex items-center gap-3 mb-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors overflow-hidden ${!isExpanded && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-600">
              <img src={user?.avatar} alt="User" className="w-full h-full object-cover"/>
            </div>
            <div className={`min-w-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">{user?.plan} Plan</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-colors ${!isExpanded && 'justify-center'}`}
          >
             <LogOut size={18} className="flex-shrink-0" />
             <span className={`whitespace-nowrap text-sm ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative bg-dark-bg">
        {children}
      </main>
    </div>
  );
};
