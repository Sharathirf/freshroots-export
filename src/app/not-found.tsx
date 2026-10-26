import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-stone-900 text-center">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-stone-200">
        <span className="text-5xl font-black text-emerald-800">404</span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">Page Not Found</h2>
        <p className="mt-2 text-sm text-stone-600">
          The agricultural produce or catalog page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition"
          >
            Return to Farm Store
          </Link>
        </div>
      </div>
    </div>
  );
}
