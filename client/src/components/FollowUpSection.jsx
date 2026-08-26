import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FOLLOW_UP_TYPES } from '../constants/leadOptions';
import { getApiErrorMessage } from '../services/api';
import { addFollowUp, getFollowUps } from '../services/followUpService';
import { formatDate } from '../utils/leadFormatters';
import LoadingIndicator from './LoadingIndicator';
import StatusMessage from './StatusMessage';

const today = () => new Date().toISOString().slice(0, 10);
const initialForm = () => ({ date: today(), followUpType: 'Call', remarks: '', nextFollowUpDate: '' });

export default function FollowUpSection({ leadId }) {
  const [followUps, setFollowUps] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getFollowUps(leadId)
      .then((response) => { if (!cancelled) setFollowUps(response.data); })
      .catch((requestError) => { if (!cancelled) setError(getApiErrorMessage(requestError, 'Unable to load follow-ups.')); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [leadId]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!form.date || !form.followUpType || !form.remarks.trim()) {
      setError('Date, follow-up type, and remarks are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await addFollowUp(leadId, { ...form, remarks: form.remarks.trim(), nextFollowUpDate: form.nextFollowUpDate || null });
      setFollowUps((current) => [response.data, ...current].sort((first, second) => new Date(second.date) - new Date(first.date)));
      setForm(initialForm());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to add the follow-up.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold text-slate-950">Follow-up history</h2>
        <p className="mt-1 text-sm text-slate-600">Newest follow-ups appear first.</p>
        {isLoading ? <div className="mt-5"><LoadingIndicator label="Loading follow-ups…" /></div> : followUps.length === 0 ? <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No follow-ups have been recorded yet.</p> : (
          <ol className="mt-5 space-y-4 border-l border-slate-200 pl-5">
            {followUps.map((followUp) => <li key={followUp._id} className="relative"><span className="absolute -left-[1.72rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600" /><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="font-semibold text-slate-950">{followUp.followUpType}</p><span className="text-sm text-slate-500">{formatDate(followUp.date)}</span></div><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{followUp.remarks}</p>{followUp.nextFollowUpDate && <p className="mt-2 text-xs font-medium text-blue-700">Next follow-up: {formatDate(followUp.nextFollowUpDate)}</p>}</li>)}
          </ol>
        )}
      </div>
      <div className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Add follow-up</h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {error && <StatusMessage tone="error">{error}</StatusMessage>}
          <label className="block text-sm font-medium text-slate-700">Date<input className="mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm" name="date" onChange={updateField} required type="date" value={form.date} /></label>
          <label className="block text-sm font-medium text-slate-700">Follow-up type<select className="mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm" name="followUpType" onChange={updateField} required value={form.followUpType}>{FOLLOW_UP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-700">Remarks<textarea className="mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm" name="remarks" onChange={updateField} required rows="4" value={form.remarks} /></label>
          <label className="block text-sm font-medium text-slate-700">Next follow-up date <span className="font-normal text-slate-500">(optional)</span><input className="mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm" min={form.date} name="nextFollowUpDate" onChange={updateField} type="date" value={form.nextFollowUpDate} /></label>
          <button className="min-h-11 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Adding…' : 'Add follow-up'}</button>
        </form>
      </div>
    </section>
  );
}

FollowUpSection.propTypes = { leadId: PropTypes.string.isRequired };
