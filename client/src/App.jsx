import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { checkApiHealth } from './services/api';

function SetupPage() {
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
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Lead Management System
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Project setup is running</h1>
      <p className="mt-3 text-slate-600">
        Phase 1 only: separate React and Express apps, environment files, and a
        health endpoint. Login, leads, and the dashboard come in later phases.
      </p>
      <p
        className={`mt-6 rounded-md border px-4 py-3 text-sm ${
          health === 'ok'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : health === 'error'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-slate-200 bg-white text-slate-600'
        }`}
      >
        {health === 'checking' && 'Checking API at VITE_API_URL…'}
        {health === 'ok' && 'API health check succeeded.'}
        {health === 'error' &&
          'API is not reachable yet. Start the server with npm run dev in /server.'}
      </p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
