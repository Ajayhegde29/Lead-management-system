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
    ['Total leads', stats.totalLeads, 'All leads in the database'],
    ['New leads', stats.newLeads, 'Awaiting first contact'],
    ['Proposal sent', stats.proposalSent, 'Active proposals'],
    ['Won', stats.won, 'Successful conversions'],
    ['Lost', stats.lost, 'Closed opportunities'],
    ['Pipeline value', formatCurrency(stats.potentialBusinessValue), 'New through negotiation'],
  ];

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">Dashboard</h1><p className="mt-1 text-slate-600">An up-to-date view of your lead pipeline.</p></div><Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800" to="/leads/new">Add lead</Link></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(([label, value, description]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-slate-950">{value}</p><p className="mt-2 text-xs text-slate-500">{description}</p></article>)}</div>
      {stats.totalLeads === 0 ? <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold text-slate-950">No lead data yet</p><p className="mt-1 text-sm text-slate-600">Create your first lead to populate the dashboard.</p><Link className="mt-4 inline-block font-semibold text-blue-700 hover:text-blue-800" to="/leads/new">Add your first lead</Link></div> : <div className="mt-6"><StatusBreakdownChart breakdown={stats.statusBreakdown} /></div>}
    </section>
  );
}
