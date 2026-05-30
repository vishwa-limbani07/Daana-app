// FloatingInput.jsx — input with a label that animates inside → above on focus.
//
// THE TRICK (no JS, pure CSS via Tailwind peer-* selectors):
//   The input has placeholder=" " (a space — important, not empty).
//   When the input is empty, the placeholder is "shown" → label sits inside.
//   When focused OR when typed into (placeholder hidden), label floats up.
//
// All animation is one CSS class chain on the label. No state. No useEffect.
// This is the standard Tailwind floating-label recipe.

import { forwardRef } from 'react';

const FloatingInput = forwardRef(function FloatingInput(
  { label, id, type = 'text', error, className = '', ...rest },
  ref
) {
  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder=" "
        className={`peer w-full border ${
          error ? 'border-red-400' : 'border-gray-300'
        } rounded-lg pt-5 pb-2 px-3 text-gray-900 placeholder-transparent
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
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default FloatingInput;
