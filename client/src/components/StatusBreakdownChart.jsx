import PropTypes from 'prop-types';
import { LEAD_STATUSES } from '../constants/leadOptions';

const barColors = {
  New: 'bg-blue-600',
  Contacted: 'bg-sky-500',
  'Proposal Sent': 'bg-violet-600',
  Negotiation: 'bg-amber-500',
  Won: 'bg-emerald-600',
  Lost: 'bg-rose-600',
};

export default function StatusBreakdownChart({ breakdown }) {
  const maximum = Math.max(...Object.values(breakdown), 1);

  return (
    <section className="surface-card p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="section-label">Pipeline health</p><h2 className="mt-2 text-xl font-bold text-slate-950">Leads by status</h2><p className="mt-1 text-sm text-slate-600">Current distribution across the sales pipeline.</p></div><span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{Object.values(breakdown).reduce((sum, count) => sum + count, 0)} total</span></div>
      <div className="mt-7 space-y-4" role="img" aria-label="Lead count grouped by status">
        {LEAD_STATUSES.map((status) => {
          const count = breakdown[status] || 0;
          return <div key={status} className="grid grid-cols-[120px_minmax(0,1fr)_32px] items-center gap-3 text-sm"><span className="font-medium text-slate-700">{status}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all duration-500 ${barColors[status]}`} style={{ width: `${(count / maximum) * 100}%` }} /></div><span className="text-right font-bold tabular-nums text-slate-950">{count}</span></div>;
        })}
      </div>
    </section>
  );
}

StatusBreakdownChart.propTypes = { breakdown: PropTypes.objectOf(PropTypes.number).isRequired };
