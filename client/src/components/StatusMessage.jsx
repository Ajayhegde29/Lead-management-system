import PropTypes from 'prop-types';

export default function StatusMessage({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'border-slate-200 bg-white text-slate-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  };

  return <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

StatusMessage.propTypes = {
  tone: PropTypes.oneOf(['neutral', 'success', 'warning', 'error']),
  children: PropTypes.node.isRequired,
};
