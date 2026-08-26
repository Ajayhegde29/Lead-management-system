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
  return <section className="max-w-3xl"><Link className="text-sm font-medium text-blue-700 hover:text-blue-800" to="/leads">← Back to leads</Link><h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{isEditing ? 'Edit lead' : 'Add lead'}</h1><div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">{error && <div className="mb-5"><StatusMessage tone="error">{error}</StatusMessage></div>}<LeadForm fieldErrors={fieldErrors} form={form} isSubmitting={isSubmitting} onChange={updateField} onSubmit={handleSubmit} submitLabel={isEditing ? 'Save changes' : 'Create lead'} user={user} /></div></section>;
}
