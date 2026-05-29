// ToastContainer.jsx — fixed-position stack of active toasts.
//
// Rendered once at the App root. Subscribes to state.toast.items and
// renders one Toast for each. Each Toast schedules its own auto-dismiss.

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/toastSlice.js';

const STYLES = {
  success: 'bg-emerald-600 text-white',
  error:   'bg-red-600 text-white',
  info:    'bg-gray-900 text-white',
};

const ICONS = {
  success: '✓',
  error:   '!',
  info:    'ℹ',
};

export default function ToastContainer() {
  const items = useSelector((s) => s.toast.items);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {items.map((t) => <Toast key={t.id} toast={t} />)}
    </div>
  );
}

function Toast({ toast }) {
  const dispatch = useDispatch();

  // Auto-dismiss after `duration`. Cleanup if the toast is removed manually.
  useEffect(() => {
    const id = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration);
    return () => clearTimeout(id);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div
      className={`pointer-events-auto rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 animate-[slideIn_0.2s_ease-out] ${STYLES[toast.type] || STYLES.info}`}
      style={{
        // Inline keyframe so we don't need to touch tailwind.config.js.
        // The animate-[...] class above references this name.
      }}
    >
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
        {ICONS[toast.type] || 'ℹ'}
      </span>
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-white/70 hover:text-white text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
