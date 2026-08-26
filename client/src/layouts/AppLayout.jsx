import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authState';

const navClassName = ({ isActive }) =>
  `rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`;

export default function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <NavLink className="flex items-center gap-2.5 font-bold tracking-tight text-slate-950" to="/dashboard"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-lg text-white shadow-sm">↗</span><span>LeadFlow</span></NavLink>
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            <NavLink className={navClassName} to="/dashboard">Dashboard</NavLink>
            <NavLink className={navClassName} to="/leads">Leads</NavLink>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-700 sm:inline">{user?.username}</span>
            <button className="secondary-button min-h-0 px-3 py-2" onClick={handleLogout} type="button">Logout</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10"><Outlet /></main>
    </div>
  );
}
