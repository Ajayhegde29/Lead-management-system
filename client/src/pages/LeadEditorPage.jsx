import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LeadForm from '../components/LeadForm';
import LoadingIndicator from '../components/LoadingIndicator';
import StatusMessage from '../components/StatusMessage';
import { useAuth } from '../context/authState';
import { getApiErrorMessage, getFieldErrors } from '../services/api';
import { createLead, getLead, updateLead } from '../services/leadService';
import { getAssignedUserId } from '../utils/leadFormatters';

const blankLead = (userId) => ({ leadName: '', companyName: '', mobile: '', email: '', serviceRequired: '', leadSource: '', estimatedValue: '', assignedTo: userId, remarks: '', leadStatus: 'New' });

export default function LeadEditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(() => blankLead(user.id));
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEditing) return undefined;
    let cancelled = false;
    getLead(id).then((response) => {
      if (cancelled) return;
      const lead = response.data;
      setForm({ ...blankLead(user.id), ...lead, assignedTo: getAssignedUserId(lead.assignedTo), estimatedValue: lead.estimatedValue ?? '' });
    }).catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, 'Unable to load the lead.')); }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id, isEditing, user.id]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const errors = {};
    ['leadName', 'companyName', 'mobile', 'email', 'serviceRequired', 'leadSource', 'assignedTo', 'leadStatus'].forEach((field) => {
      if (!form[field]?.trim()) errors[field] = 'This field is required.';
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';
    if (form.mobile && !/^[0-9+()\-\s]{7,20}$/.test(form.mobile)) errors.mobile = 'Enter a valid phone number.';
    if (form.estimatedValue !== '' && (Number.isNaN(Number(form.estimatedValue)) || Number(form.estimatedValue) < 0)) errors.estimatedValue = 'Enter a non-negative value.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) { setError('Fix the highlighted fields before saving.'); return; }
    try {
      setIsSubmitting(true);
      const response = isEditing ? await updateLead(id, form) : await createLead(form);
      navigate(`/leads/${response.data._id}`, { replace: true });
    } catch (requestError) {
      setFieldErrors(getFieldErrors(requestError));
      setError(getApiErrorMessage(requestError, 'Unable to save the lead.'));
    } finally { setIsSubmitting(false); }
  }

  if (isLoading) return <LoadingIndicator label="Loading lead…" />;
  return (
    <section className="max-w-7xl">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800" to="/leads">← Back to leads</Link>
      <div className="mt-5"><p className="section-label text-blue-700">{isEditing ? 'Update opportunity' : 'New opportunity'}</p><h1 className="page-title mt-2">{isEditing ? 'Keep the lead moving.' : 'Add a new lead.'}</h1><p className="page-subtitle">Capture the essentials now. You can update details and follow-ups anytime.</p></div>
      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="surface-card p-5 sm:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5"><div><p className="text-base font-bold text-slate-950">Lead information</p><p className="mt-1 text-sm text-slate-600">Fields marked by the form are required.</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">Step 1 of 1</span></div>
          {error && <div className="mb-5"><StatusMessage tone="error">{error}</StatusMessage></div>}
          <LeadForm fieldErrors={fieldErrors} form={form} isSubmitting={isSubmitting} onChange={updateField} onSubmit={handleSubmit} submitLabel={isEditing ? 'Save changes' : 'Create lead'} user={user} />
        </div>
        <aside className="surface-card p-5 xl:sticky xl:top-28">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">✦</span>
          <h2 className="mt-4 text-lg font-bold text-slate-950">Create a stronger lead</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">A complete record helps the team prioritize follow-ups and forecast potential revenue.</p>
          <ul className="mt-5 space-y-4 border-t border-slate-100 pt-5 text-sm text-slate-700"><li className="flex gap-3"><span className="font-bold text-blue-700">01</span><span>Use the prospect’s direct email and mobile number.</span></li><li className="flex gap-3"><span className="font-bold text-blue-700">02</span><span>Add an estimated value when it is known.</span></li><li className="flex gap-3"><span className="font-bold text-blue-700">03</span><span>Record first-contact details in follow-ups after saving.</span></li></ul>
          <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Duplicate protection</p><p className="mt-1 text-xs leading-5 text-slate-600">Email and mobile numbers are checked before a new lead is saved.</p></div>
        </aside>
      </div>
    </section>
  );
}
