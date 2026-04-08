import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  LogOut, 
  GraduationCap,
  ChevronRight 
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link 
      to={to} 
      className={`nav-item ${isActive(to) ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span>{label}</span>
      {isActive(to) && <ChevronRight size={16} className="ml-auto" />}
    </Link>
  );

  return (
    <aside className="sidebar">
      <div className="logo-area">
        <GraduationCap size={32} strokeWidth={2.5} />
        <span>Gridaan.edu</span>
      </div>

      <nav className="nav-menu">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/students" icon={Users} label="Students" />
        <NavItem to="/tasks" icon={ClipboardList} label="Tasks & Homework" />
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <button 
          onClick={onLogout} 
          className="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-none bg-transparent cursor-pointer"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
