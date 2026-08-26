import PropTypes from 'prop-types';
import { LEAD_SOURCES, LEAD_STATUSES, SERVICE_REQUIRED } from '../constants/leadOptions';

const inputClassName = 'mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

export default function LeadForm({ form, onChange, onSubmit, submitLabel, isSubmitting, user, fieldErrors }) {
  const fieldClassName = (field) => `${inputClassName} ${fieldErrors[field] ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-100' : ''}`;
  const errorText = (field) => fieldErrors[field] && <span className="mt-1 block text-xs text-rose-700">{fieldErrors[field]}</span>;
  function selectOptions(options) {
    return options.map((option) => <option key={option} value={option}>{option}</option>);
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Lead name<input aria-invalid={Boolean(fieldErrors.leadName)} className={fieldClassName('leadName')} name="leadName" onChange={onChange} required value={form.leadName} />{errorText('leadName')}</label>
        <label className="text-sm font-medium text-slate-700">Company name<input aria-invalid={Boolean(fieldErrors.companyName)} className={fieldClassName('companyName')} name="companyName" onChange={onChange} required value={form.companyName} />{errorText('companyName')}</label>
        <label className="text-sm font-medium text-slate-700">Mobile<input aria-invalid={Boolean(fieldErrors.mobile)} className={fieldClassName('mobile')} inputMode="tel" name="mobile" onChange={onChange} required value={form.mobile} />{errorText('mobile')}</label>
        <label className="text-sm font-medium text-slate-700">Email<input aria-invalid={Boolean(fieldErrors.email)} className={fieldClassName('email')} name="email" onChange={onChange} required type="email" value={form.email} />{errorText('email')}</label>
        <label className="text-sm font-medium text-slate-700">Service required<select aria-invalid={Boolean(fieldErrors.serviceRequired)} className={fieldClassName('serviceRequired')} name="serviceRequired" onChange={onChange} required value={form.serviceRequired}><option value="">Select a service</option>{selectOptions(SERVICE_REQUIRED)}</select>{errorText('serviceRequired')}</label>
        <label className="text-sm font-medium text-slate-700">Lead source<select aria-invalid={Boolean(fieldErrors.leadSource)} className={fieldClassName('leadSource')} name="leadSource" onChange={onChange} required value={form.leadSource}><option value="">Select a source</option>{selectOptions(LEAD_SOURCES)}</select>{errorText('leadSource')}</label>
        <label className="text-sm font-medium text-slate-700">Estimated value<input aria-invalid={Boolean(fieldErrors.estimatedValue)} className={fieldClassName('estimatedValue')} min="0" name="estimatedValue" onChange={onChange} type="number" value={form.estimatedValue} />{errorText('estimatedValue')}</label>
        <label className="text-sm font-medium text-slate-700">Assigned to<select aria-invalid={Boolean(fieldErrors.assignedTo)} className={fieldClassName('assignedTo')} name="assignedTo" onChange={onChange} required value={form.assignedTo}><option value="">Select an owner</option><option value={user.id}>{user.username}</option></select>{errorText('assignedTo')}</label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">Lead status<select aria-invalid={Boolean(fieldErrors.leadStatus)} className={fieldClassName('leadStatus')} name="leadStatus" onChange={onChange} required value={form.leadStatus}>{selectOptions(LEAD_STATUSES)}</select>{errorText('leadStatus')}</label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">Remarks<textarea aria-invalid={Boolean(fieldErrors.remarks)} className={fieldClassName('remarks')} name="remarks" onChange={onChange} rows="4" value={form.remarks} />{errorText('remarks')}</label>
      </div>
      <button className="min-h-11 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving…' : submitLabel}</button>
    </form>
  );
}

LeadForm.propTypes = {
  form: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  user: PropTypes.shape({ id: PropTypes.string.isRequired, username: PropTypes.string.isRequired }).isRequired,
  fieldErrors: PropTypes.objectOf(PropTypes.string).isRequired,
};
