import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';
import StatusBreakdownChart from '../components/StatusBreakdownChart';
import StatusMessage from '../components/StatusMessage';
import { getApiErrorMessage } from '../services/api';
import { getDashboardStats } from '../services/dashboardService';
import { formatCurrency } from '../utils/leadFormatters';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
      .then((response) => { if (!cancelled) setStats(response.data); })
      .catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, 'Unable to load dashboard statistics.')); });
    return () => { cancelled = true; };
  }, []);

  if (error) return <StatusMessage tone="error">{error}</StatusMessage>;
  if (!stats) return <LoadingIndicator label="Loading dashboard…" />;

  const metrics = [
    ['Total leads', stats.totalLeads, 'All active records', '◎', 'text-blue-700 bg-blue-50'],
    ['New leads', stats.newLeads, 'Awaiting first contact', '✦', 'text-sky-700 bg-sky-50'],
    ['Proposal sent', stats.proposalSent, 'Proposals in progress', '◈', 'text-violet-700 bg-violet-50'],
    ['Won', stats.won, 'Successful conversions', '✓', 'text-emerald-700 bg-emerald-50'],
    ['Lost', stats.lost, 'Closed opportunities', '−', 'text-rose-700 bg-rose-50'],
    ['Pipeline value', formatCurrency(stats.potentialBusinessValue), 'New through negotiation', '₹', 'text-amber-700 bg-amber-50'],
  ];

  return (
    <section>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-label text-blue-700">Workspace overview</p><h1 className="page-title mt-2">Sales pipeline, simplified.</h1><p className="page-subtitle">See what needs attention, measure progress, and keep every opportunity moving.</p></div><Link className="primary-button" to="/leads/new"><span className="mr-2 text-lg leading-none">+</span>Add lead</Link></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(([label, value, description, icon, accent]) => <article key={label} className="surface-card p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-600">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-slate-950">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-bold ${accent}`}>{icon}</span></div><p className="mt-3 text-xs font-medium text-slate-500">{description}</p></article>)}</div>
      {stats.totalLeads === 0 ? <div className="surface-card mt-6 p-10 text-center"><span className="grid mx-auto h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-700">+</span><p className="mt-4 font-bold text-slate-950">No lead data yet</p><p className="mt-1 text-sm text-slate-600">Create your first lead to populate the dashboard.</p><Link className="mt-5 inline-block font-semibold text-blue-700 hover:text-blue-800" to="/leads/new">Add your first lead →</Link></div> : <div className="mt-6"><StatusBreakdownChart breakdown={stats.statusBreakdown} /></div>}
    </section>
  );
}
