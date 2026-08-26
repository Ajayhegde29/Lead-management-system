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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">LeadFlow</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to manage your sales leads and follow-ups.</p>
        <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
          {error && <StatusMessage tone="error">{error}</StatusMessage>}
          <label className="block text-sm font-medium text-slate-700">
            Username
            <input autoComplete="username" className="mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" disabled={isSubmitting} name="username" onChange={updateField} value={credentials.username} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input autoComplete="current-password" className="mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" disabled={isSubmitting} name="password" onChange={updateField} type="password" value={credentials.password} />
          </label>
          <button className="flex w-full min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
            {isSubmitting ? <LoadingIndicator label="Signing in…" /> : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
