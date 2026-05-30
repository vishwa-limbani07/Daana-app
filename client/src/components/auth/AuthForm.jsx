// AuthForm.jsx — the actual form fields + submit button.
// Mode-agnostic — pass `mode="login"` or `mode="signup"`.
// Used inside each layout so all layouts share identical logic.
//
// We accept a `variant` prop ('boxed' | 'underline') so the Editorial layout
// can render minimalist underline inputs while Split/Spotlight use the boxed
// floating-label inputs.

import { useMemo } from 'react';
import FloatingInput from '../common/FloatingInput.jsx';
import PasswordInput from '../common/PasswordInput.jsx';

const scorePassword = (pw = '') => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
};
const STRENGTH_LABEL = ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'];
const STRENGTH_COLOR = ['bg-gray-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

export default function AuthForm({
  mode, form, onChange, onSubmit, loading, error, variant = 'boxed',
}) {
  const isSignup = mode === 'signup';
  const strength = useMemo(
    () => (isSignup ? scorePassword(form.password) : 0),
    [form.password, isSignup]
  );

  // Editorial variant: render plain underline inputs without floating labels.
  if (variant === 'underline') {
    return (
      <form onSubmit={onSubmit} className="space-y-6">
        {isSignup && (
          <UnderlineInput
            label="Full name" name="name" value={form.name} onChange={onChange}
            required maxLength={60} autoComplete="name"
          />
        )}
        <UnderlineInput
          label="Email" name="email" type="email" value={form.email} onChange={onChange}
          required autoComplete="email"
        />
        <UnderlineInput
          label="Password" name="password" type="password" value={form.password} onChange={onChange}
          required minLength={8} autoComplete={isSignup ? 'new-password' : 'current-password'}
        />

        {isSignup && form.password && (
          <div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-0.5 flex-1 ${strength >= i ? STRENGTH_COLOR[strength] : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">{STRENGTH_LABEL[strength]}</p>
          </div>
        )}

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium uppercase tracking-widest text-xs py-4 transition-colors disabled:opacity-60"
        >
          {loading ? '...' : (isSignup ? 'Create account' : 'Log in')}
        </button>
      </form>
    );
  }

  // Default (boxed) variant — used by Split and Spotlight.
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignup && (
        <FloatingInput
          id="name" name="name" label="Full name" value={form.name} onChange={onChange}
          required maxLength={60} autoComplete="name"
        />
      )}
      <FloatingInput
        id="email" name="email" type="email" label="Email"
        value={form.email} onChange={onChange} required autoComplete="email"
      />
      <div>
        <PasswordInput
          id="password" name="password" label="Password"
          value={form.password} onChange={onChange} required minLength={isSignup ? 8 : undefined}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
        />
        {isSignup && (
          <>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                  strength >= i ? STRENGTH_COLOR[strength] : 'bg-gray-200'
                }`} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {form.password ? STRENGTH_LABEL[strength] : 'At least 8 characters · mix letters, numbers, symbols'}
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2
          bg-emerald-600 text-white font-semibold rounded-lg py-3
          hover:bg-emerald-700 active:bg-emerald-800
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-colors shadow-sm shadow-emerald-200"
      >
        {loading && <Spinner />}
        {loading ? (isSignup ? 'Creating account...' : 'Logging in...') : (isSignup ? 'Create account' : 'Log in')}
      </button>
    </form>
  );
}

function UnderlineInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-gray-500">{label}</span>
      <input
        {...props}
        placeholder=""
        className="mt-1 w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-0 px-0 py-2 text-base"
      />
    </label>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
