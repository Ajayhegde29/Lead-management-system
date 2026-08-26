import PropTypes from 'prop-types';

export default function Pagination({ pagination, onPageChange }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-sm text-slate-600">Page {pagination.page} of {pagination.totalPages} · {pagination.total} leads</p>
      <div className="flex gap-2">
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50" disabled={pagination.page === 1} onClick={() => onPageChange(pagination.page - 1)} type="button">Previous</button>
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50" disabled={pagination.page === pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)} type="button">Next</button>
      </div>
    </nav>
  );
}

Pagination.propTypes = {
  pagination: PropTypes.shape({ page: PropTypes.number.isRequired, total: PropTypes.number.isRequired, totalPages: PropTypes.number.isRequired }).isRequired,
  onPageChange: PropTypes.func.isRequired,
};
