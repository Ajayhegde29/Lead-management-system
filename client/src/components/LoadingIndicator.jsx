import PropTypes from 'prop-types';

export default function LoadingIndicator({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      {label}
    </div>
  );
}

LoadingIndicator.propTypes = { label: PropTypes.string };
