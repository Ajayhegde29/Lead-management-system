import { useEffect, useState } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';
import StatusMessage from '../components/StatusMessage';
import { checkApiHealth } from '../services/api';

export default function SystemCheckPage() {
  const [health, setHealth] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    checkApiHealth()
      .then(() => {
        if (!cancelled) setHealth('ok');
      })
      .catch(() => {
        if (!cancelled) setHealth('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Lead Management System</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Frontend foundation is ready</h1>
      <p className="mt-3 text-slate-600">
        The React application now has a centralized API client, service modules, shared status components,
        and a route structure. The login screen is the next phase.
      </p>
      <div className="mt-7">
        {health === 'checking' && <LoadingIndicator label="Checking API connection…" />}
        {health === 'ok' && <StatusMessage tone="success">API connection is working.</StatusMessage>}
        {health === 'error' && (
          <StatusMessage tone="warning">API is unavailable. Start the backend with <code>npm run dev</code> in the server folder.</StatusMessage>
        )}
      </div>
    </main>
  );
}
