import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';
import Pagination from '../components/Pagination';
import StatusMessage from '../components/StatusMessage';
import { LEAD_STATUSES, SERVICE_REQUIRED } from '../constants/leadOptions';
import { getApiErrorMessage } from '../services/api';
import { deleteLead, getLeads } from '../services/leadService';
import { formatCurrency, formatDate } from '../utils/leadFormatters';
import { getStatusStyle } from '../utils/statusStyles';

const emptyPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

export default function LeadsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', status: '', service: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1 });
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const params = { ...filters, search: submittedSearch };
    Object.keys(params).forEach((key) => { if (params[key] === '') delete params[key]; });
    setIsLoading(true);
    setError('');
    getLeads(params)
      .then((response) => { if (!cancelled) { setLeads(response.data); setPagination(response.pagination); } })
      .catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, 'Unable to load leads.')); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [filters, submittedSearch]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  }

  function submitSearch(event) {
    event.preventDefault();
    setSubmittedSearch(filters.search);
    setFilters((current) => ({ ...current, page: 1 }));
  }

  async function handleDelete(lead) {
    if (!window.confirm(`Delete ${lead.leadName}? This permanently removes the lead and its follow-ups.`)) return;
    try {
      await deleteLead(lead._id);
      setFilters((current) => ({ ...current }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to delete the lead.'));
    }
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="section-label text-blue-700">Lead workspace</p><h1 className="page-title mt-2">Manage every opportunity.</h1><p className="page-subtitle">Search, qualify, and move leads through your sales process.</p></div>
        <Link className="primary-button" to="/leads/new"><span className="mr-2 text-lg leading-none">+</span>Add lead</Link>
      </div>
      <div className="surface-card mt-8 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">⌕</span><div><p className="text-sm font-bold text-slate-900">Find your leads</p><p className="text-xs text-slate-500">Use filters to narrow the pipeline.</p></div></div>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)_minmax(140px,1fr)_auto]" onSubmit={submitSearch}>
          <input className="field-control min-w-0 mt-0" name="search" onChange={updateFilter} placeholder="Search name, company, email, mobile" value={filters.search} />
          <select className="field-control min-w-0 mt-0" name="status" onChange={updateFilter} value={filters.status}><option value="">All statuses</option>{LEAD_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>
          <select className="field-control min-w-0 mt-0" name="service" onChange={updateFilter} value={filters.service}><option value="">All services</option>{SERVICE_REQUIRED.map((service) => <option key={service} value={service}>{service}</option>)}</select>
          <button className="secondary-button" type="submit">Search</button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Sort by</span>
          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700" name="sortBy" onChange={updateFilter} value={filters.sortBy}><option value="createdAt">Created date</option><option value="estimatedValue">Estimated value</option></select>
          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700" name="sortOrder" onChange={updateFilter} value={filters.sortOrder}><option value="desc">Descending</option><option value="asc">Ascending</option></select>
        </div>
      </div>
      <div className="surface-card mt-5 overflow-hidden">
        {error && <div className="p-4"><StatusMessage tone="error">{error}</StatusMessage></div>}
        {isLoading ? <div className="p-7"><LoadingIndicator label="Loading leads…" /></div> : leads.length === 0 ? <div className="p-12 text-center"><span className="grid mx-auto h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-500">⌕</span><p className="mt-4 font-bold text-slate-900">No leads found</p><p className="mt-1 text-sm text-slate-600">Add a lead or change the active filters.</p></div> : (
          <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-4">Lead</th><th className="px-5 py-4">Service</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Value</th><th className="px-5 py-4">Created</th><th className="px-5 py-4"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr className="transition hover:bg-blue-50/40" key={lead._id}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">{lead.leadName.slice(0, 1).toUpperCase()}</span><div><Link className="font-bold text-slate-950 hover:text-blue-700" to={`/leads/${lead._id}`}>{lead.leadName}</Link><p className="mt-0.5 text-xs text-slate-500">{lead.companyName}</p></div></div></td><td className="px-5 py-4 font-medium text-slate-700">{lead.serviceRequired}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusStyle(lead.leadStatus)}`}>{lead.leadStatus}</span></td><td className="px-5 py-4 font-semibold text-slate-700">{formatCurrency(lead.estimatedValue)}</td><td className="px-5 py-4 text-slate-600">{formatDate(lead.createdAt)}</td><td className="whitespace-nowrap px-5 py-4 text-right"><button className="mr-4 font-bold text-blue-700 hover:text-blue-800" onClick={() => navigate(`/leads/${lead._id}/edit`)} type="button">Edit</button><button className="font-bold text-rose-600 hover:text-rose-700" onClick={() => handleDelete(lead)} type="button">Delete</button></td></tr>)}</tbody></table></div>
        )}
      </div>
      <Pagination onPageChange={(page) => setFilters((current) => ({ ...current, page }))} pagination={pagination} />
    </section>
  );
}
