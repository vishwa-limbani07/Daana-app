// LayoutSpotlight.jsx — full-bleed gradient background, single floating glass card.
// Apple keynote / premium SaaS feel. Form is the focus, everything else is texture.

import { Link } from 'react-router-dom';
import AuthForm from '../AuthForm.jsx';

export default function LayoutSpotlight({ mode, formProps, copy }) {
  const isSignup = mode === 'signup';

  return (
    <div className="relative">
      {/* Full-bleed gradient background — uses negative margins to break out of
          the page wrapper's max-width container. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -mx-4 sm:-mx-6 lg:-mx-12 h-full
          bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700
          overflow-hidden rounded-2xl"
      >
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] bg-cyan-300/20 rounded-full blur-3xl" />
        {/* Giant दान behind everything */}
        <div className="absolute right-8 bottom-4 text-[24rem] leading-none font-bold text-white/5 select-none pointer-events-none">
          दान
        </div>
      </div>

      {/* Foreground content sits on top of the gradient */}
      <div className="relative py-12 md:py-20 min-h-[600px]">
        {/* Brand mark up top */}
        <div className="text-center mb-8 text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-300 animate-pulse" />
            दान · The art of giving
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-2 text-emerald-50 text-base max-w-md mx-auto">{copy.subtitle}</p>
        </div>

        {/* The glass card */}
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 ring-1 ring-white/40">
          <AuthForm mode={mode} {...formProps} variant="boxed" />

          <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            {isSignup ? 'Already have an account?' : 'New to Daana?'}
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            to={isSignup ? '/login' : '/signup'}
            className="block w-full text-center bg-white border border-gray-300 hover:border-emerald-400 hover:text-emerald-700
              text-gray-700 font-medium rounded-lg py-3 transition-colors"
          >
            {isSignup ? 'Log in →' : 'Create an account →'}
          </Link>
        </div>

        <p className="text-center text-emerald-50 text-xs mt-6">
          <Link to="/" className="hover:text-white transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
