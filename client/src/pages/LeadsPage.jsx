import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';
import Pagination from '../components/Pagination';
import StatusMessage from '../components/StatusMessage';
import { LEAD_STATUSES, SERVICE_REQUIRED } from '../constants/leadOptions';
import { getApiErrorMessage } from '../services/api';
import { deleteLead, getLeads } from '../services/leadService';
import { formatCurrency, formatDate } from '../utils/leadFormatters';

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-950">Leads</h1><p className="mt-1 text-slate-600">Track and manage every incoming opportunity.</p></div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800" to="/leads/new">Add lead</Link>
      </div>
      <div className="mt-7 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)_minmax(140px,1fr)_auto]" onSubmit={submitSearch}>
          <input className="min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm" name="search" onChange={updateFilter} placeholder="Search name, company, email, mobile" value={filters.search} />
          <select className="min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm" name="status" onChange={updateFilter} value={filters.status}><option value="">All statuses</option>{LEAD_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>
          <select className="min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm" name="service" onChange={updateFilter} value={filters.service}><option value="">All services</option>{SERVICE_REQUIRED.map((service) => <option key={service} value={service}>{service}</option>)}</select>
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50" type="submit">Search</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-3">
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" name="sortBy" onChange={updateFilter} value={filters.sortBy}><option value="createdAt">Created date</option><option value="estimatedValue">Estimated value</option></select>
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" name="sortOrder" onChange={updateFilter} value={filters.sortOrder}><option value="desc">Descending</option><option value="asc">Ascending</option></select>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
        {error && <div className="p-4"><StatusMessage tone="error">{error}</StatusMessage></div>}
        {isLoading ? <div className="p-6"><LoadingIndicator label="Loading leads…" /></div> : leads.length === 0 ? <div className="p-8 text-center text-sm text-slate-600">No leads found. Add a lead or change the active filters.</div> : (
          <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Created</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr key={lead._id}><td className="px-4 py-3"><Link className="font-semibold text-slate-950 hover:text-blue-700" to={`/leads/${lead._id}`}>{lead.leadName}</Link><p className="mt-0.5 text-slate-500">{lead.companyName}</p></td><td className="px-4 py-3 text-slate-700">{lead.serviceRequired}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{lead.leadStatus}</span></td><td className="px-4 py-3 text-slate-700">{formatCurrency(lead.estimatedValue)}</td><td className="px-4 py-3 text-slate-700">{formatDate(lead.createdAt)}</td><td className="whitespace-nowrap px-4 py-3 text-right"><button className="mr-3 font-medium text-blue-700 hover:text-blue-800" onClick={() => navigate(`/leads/${lead._id}/edit`)} type="button">Edit</button><button className="font-medium text-rose-700 hover:text-rose-800" onClick={() => handleDelete(lead)} type="button">Delete</button></td></tr>)}</tbody></table></div>
        )}
      </div>
      <Pagination onPageChange={(page) => setFilters((current) => ({ ...current, page }))} pagination={pagination} />
    </section>
  );
}
