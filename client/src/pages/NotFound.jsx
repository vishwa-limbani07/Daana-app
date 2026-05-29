// NotFound.jsx — 404 page. Rendered by the wildcard route in App.jsx.
//
// Small but important polish:
//   - Friendly tone, not just "404 Not Found"
//   - Clear CTA back home so users aren't stuck
//   - Same visual language (indigo accents) as the rest of the app

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="text-7xl mb-4">🧭</div>
      <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="text-gray-500 mt-2 max-w-md">
        We couldn't find what you were looking for. The campaign might have been
        removed, or the link is broken.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-lg font-medium transition"
      >
        ← Back to home
      </Link>
    </div>
  );
}
