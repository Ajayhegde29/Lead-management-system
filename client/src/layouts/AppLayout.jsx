import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authState';

const navClassName = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`;

export default function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink className="font-bold tracking-tight text-slate-950" to="/dashboard">LeadFlow</NavLink>
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            <NavLink className={navClassName} to="/dashboard">Dashboard</NavLink>
            <NavLink className={navClassName} to="/leads">Leads</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.username}</span>
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Outlet /></main>
    </div>
  );
}
