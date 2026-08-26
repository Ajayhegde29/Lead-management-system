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
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-bold text-slate-950">Leads by status</h2>
      <p className="mt-1 text-sm text-slate-600">Current distribution across the sales pipeline.</p>
      <div className="mt-6 space-y-4" role="img" aria-label="Lead count grouped by status">
        {LEAD_STATUSES.map((status) => {
          const count = breakdown[status] || 0;
          return <div key={status} className="grid grid-cols-[120px_minmax(0,1fr)_32px] items-center gap-3 text-sm"><span className="text-slate-700">{status}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${barColors[status]}`} style={{ width: `${(count / maximum) * 100}%` }} /></div><span className="text-right font-semibold tabular-nums text-slate-950">{count}</span></div>;
        })}
      </div>
    </section>
  );
}

StatusBreakdownChart.propTypes = { breakdown: PropTypes.objectOf(PropTypes.number).isRequired };
