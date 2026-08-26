import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FollowUpSection from '../components/FollowUpSection';
import LoadingIndicator from '../components/LoadingIndicator';
import StatusMessage from '../components/StatusMessage';
import { getApiErrorMessage } from '../services/api';
import { deleteLead, getLead } from '../services/leadService';
import { formatCurrency, formatDate } from '../utils/leadFormatters';

export default function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { let cancelled = false; getLead(id).then((response) => { if (!cancelled) setLead(response.data); }).catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, 'Unable to load the lead.')); }); return () => { cancelled = true; }; }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete ${lead.leadName}? This permanently removes the lead and its follow-ups.`)) return;
    try { await deleteLead(id); navigate('/leads', { replace: true }); } catch (requestError) { setError(getApiErrorMessage(requestError, 'Unable to delete the lead.')); }
  }

  if (error) return <StatusMessage tone="error">{error}</StatusMessage>;
  if (!lead) return <LoadingIndicator label="Loading lead details…" />;
  const fields = [['Company', lead.companyName], ['Mobile', lead.mobile], ['Email', lead.email], ['Service', lead.serviceRequired], ['Source', lead.leadSource], ['Estimated value', formatCurrency(lead.estimatedValue)], ['Assigned to', lead.assignedTo?.username || '—'], ['Status', lead.leadStatus], ['Created', formatDate(lead.createdAt)], ['Last updated', formatDate(lead.updatedAt)]];
  return <section className="max-w-4xl"><Link className="text-sm font-medium text-blue-700 hover:text-blue-800" to="/leads">← Back to leads</Link><div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">{lead.leadName}</h1><p className="mt-1 text-slate-600">{lead.companyName}</p></div><div className="flex gap-3"><Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50" to={`/leads/${id}/edit`}>Edit</Link><button className="rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800" onClick={handleDelete} type="button">Delete</button></div></div><div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-900">{value}</dd></div>)}<div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarks</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{lead.remarks || '—'}</dd></div></dl></div><FollowUpSection leadId={lead._id} /></section>;
}
