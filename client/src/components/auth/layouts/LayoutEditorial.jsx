// LayoutEditorial.jsx — minimal, luxurious, magazine feel.
//
// Design choices:
//   - Pure off-white background, plenty of breathing room
//   - Big serif headline (uses 'serif' family — clean fallback on any system)
//   - Underline-only inputs (no boxes) — newspaper-style
//   - Black submit button (not emerald) — high-contrast editorial
//   - Tiny दान mark + section number ("01") as decorative anchors
//   - Two-column on desktop with subtle 1px divider, single column on mobile

import { Link } from 'react-router-dom';
import AuthForm from '../AuthForm.jsx';

export default function LayoutEditorial({ mode, formProps, copy }) {
  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen px-6 py-16 md:py-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
        {/* Left rail — section number + brand mark */}
        <aside className="md:col-span-3">
          <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-12">
            <div className="text-xs uppercase tracking-[0.3em] text-gray-500">
              {isSignup ? '01 — Sign up' : '01 — Log in'}
            </div>
            <div className="text-3xl md:text-5xl font-serif text-gray-900 leading-none">दान</div>
          </div>

          <p className="hidden md:block mt-12 text-sm text-gray-500 leading-relaxed max-w-xs">
            The Sanskrit word <em>Daana</em> means the act of giving.
            A name for a platform where backers and creators meet to fund what matters.
          </p>
        </aside>

        {/* Main form column */}
        <main className="md:col-span-9 md:border-l md:border-gray-200 md:pl-12">
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight tracking-tight">
              {copy.title}.
            </h1>
            <p className="mt-3 text-gray-600 text-base leading-relaxed">{copy.subtitle}</p>

            <hr className="my-10 border-gray-200" />

            <AuthForm mode={mode} {...formProps} variant="underline" />

            <hr className="my-10 border-gray-200" />

            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-500">
              <span>{isSignup ? 'Have an account?' : 'New here?'}</span>
              <Link
                to={isSignup ? '/login' : '/signup'}
                className="text-gray-900 hover:text-emerald-700 transition-colors font-medium"
              >
                {isSignup ? 'Log in →' : 'Create one →'}
              </Link>
            </div>

            <p className="mt-12 text-xs text-gray-400">
              <Link to="/" className="hover:text-gray-700 transition-colors">
                ← Back to home
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
