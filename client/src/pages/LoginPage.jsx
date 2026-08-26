import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';
import StatusMessage from '../components/StatusMessage';
import { useAuth } from '../context/authState';
import { getApiErrorMessage } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setCredentials((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!credentials.username.trim() || !credentials.password) {
      setError('Enter both your username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ username: credentials.username.trim(), password: credentials.password });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.38),_transparent_35rem),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.3),_transparent_28rem)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/15 bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-700 text-xl text-white shadow-lg shadow-blue-200">↗</span><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">LeadFlow</p><p className="mt-0.5 text-xs font-medium text-slate-500">Lead management workspace</p></div></div>
        <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-950">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to manage your sales leads, pipeline, and follow-ups.</p>
        <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
          {error && <StatusMessage tone="error">{error}</StatusMessage>}
          <label className="field-label">
            Username
            <input autoComplete="username" className="field-control" disabled={isSubmitting} name="username" onChange={updateField} placeholder="Enter your username" value={credentials.username} />
          </label>
          <label className="field-label">
            Password
            <input autoComplete="current-password" className="field-control" disabled={isSubmitting} name="password" onChange={updateField} placeholder="Enter your password" type="password" value={credentials.password} />
          </label>
          <button className="primary-button flex w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? <LoadingIndicator label="Signing in…" /> : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
