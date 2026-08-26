import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FollowUpSection from '../components/FollowUpSection';
import LoadingIndicator from '../components/LoadingIndicator';
import StatusMessage from '../components/StatusMessage';
import { getApiErrorMessage } from '../services/api';
import { deleteLead, getLead } from '../services/leadService';
import { formatCurrency, formatDate } from '../utils/leadFormatters';
import { getStatusStyle } from '../utils/statusStyles';

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
  return <section className="max-w-5xl"><Link className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800" to="/leads">← Back to leads</Link><div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="section-label text-blue-700">Lead profile</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="page-title">{lead.leadName}</h1><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(lead.leadStatus)}`}>{lead.leadStatus}</span></div><p className="mt-2 text-base text-slate-600">{lead.companyName}</p></div><div className="flex gap-3"><Link className="secondary-button" to={`/leads/${id}/edit`}>Edit lead</Link><button className="danger-button" onClick={handleDelete} type="button">Delete</button></div></div><div className="surface-card mt-7 p-5 sm:p-8"><div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="section-label">Opportunity details</p><p className="mt-1 text-sm text-slate-600">Contact, ownership, and opportunity information.</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 font-bold text-blue-700">{lead.leadName.slice(0, 1).toUpperCase()}</span></div><dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="section-label">{label}</dt><dd className="mt-2 text-sm font-semibold text-slate-900">{value}</dd></div>)}<div className="border-t border-slate-100 pt-5 sm:col-span-2"><dt className="section-label">Remarks</dt><dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{lead.remarks || 'No remarks added.'}</dd></div></dl></div><FollowUpSection leadId={lead._id} /></section>;
}
