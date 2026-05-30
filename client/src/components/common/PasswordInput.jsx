// PasswordInput.jsx — same floating-label pattern as FloatingInput, with an
// eye icon that toggles the input between password and text.
//
// Why a separate component (vs a `type="password" + eye prop` on FloatingInput):
//   Show/hide state belongs to this component. Lifting it into FloatingInput
//   would make every input carry state it doesn't need.

import { useState } from 'react';

export default function PasswordInput({ label, id, error, className = '', ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder=" "
        className={`peer w-full border ${
          error ? 'border-red-400' : 'border-gray-300'
        } rounded-lg pt-5 pb-2 pl-3 pr-11 text-gray-900 placeholder-transparent
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          transition-colors`}
        {...rest}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-1.5 text-xs text-gray-500
          transition-all duration-150
          peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-emerald-600"
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Inline icon components — no external dependency.
function Eye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
