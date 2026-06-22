import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Interviews from './pages/Interviews';
import MyApplications from './pages/MyApplications';

function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-600">WorkBridge</p>
        <h1 className="mt-4 text-4xl font-black text-slate-900">Frontend starter is live</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          This is a small frontend slice added to the repo so the project has a visible app entry and a few working routes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-xl bg-sky-600 px-4 py-2 font-bold text-white" to="/my-applications">My Applications</Link>
          <Link className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700" to="/interviews">Interviews</Link>
        </div>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-black text-slate-900">404</h1>
      <p className="mt-3 text-slate-600">Page not found.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/my-applications" element={<MyApplications />} />
      <Route path="/interviews" element={<Interviews />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
