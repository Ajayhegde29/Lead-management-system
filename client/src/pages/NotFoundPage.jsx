import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Page not found</h1>
      <Link className="mt-6 w-fit font-medium text-blue-700 hover:text-blue-800" to="/">
        Return to the application
      </Link>
    </main>
  );
}
