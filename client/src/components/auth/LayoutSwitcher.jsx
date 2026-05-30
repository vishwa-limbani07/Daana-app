// LayoutSwitcher.jsx — floating pill that swaps the auth-page layout in real time.
// Each chip has a tiny SVG icon hinting at the layout's structure.

import { LAYOUT_KEYS } from '../../hooks/useAuthLayout.js';

const META = {
  split:      { name: 'Split',      icon: IconSplit },
  spotlight:  { name: 'Spotlight',  icon: IconSpotlight },
  editorial:  { name: 'Editorial',  icon: IconEditorial },
};

export default function LayoutSwitcher({ active, onChange }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
        <span className="text-xs text-gray-400 px-2">Layout:</span>
        {LAYOUT_KEYS.map((k) => {
          const Icon = META[k].icon;
          const isActive = k === active;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition
                ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Icon active={isActive} />
              {META[k].name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IconSplit({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="6" height="12" rx="1" stroke={c} strokeWidth="1.5"/>
      <rect x="9" y="2" width="6" height="12" rx="1" fill={c} fillOpacity="0.6" stroke={c} strokeWidth="1.5"/>
    </svg>
  );
}
function IconSpotlight({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="12" rx="1" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1.5"/>
      <rect x="5" y="5" width="6" height="6" rx="1" fill="white" stroke={c} strokeWidth="1.5"/>
    </svg>
  );
}
function IconEditorial({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="3" x2="13" y2="3" stroke={c} strokeWidth="2"/>
      <line x1="3" y1="6" x2="10" y2="6" stroke={c} strokeWidth="1"/>
      <line x1="3" y1="8" x2="13" y2="8" stroke={c} strokeWidth="1"/>
      <line x1="3" y1="10" x2="11" y2="10" stroke={c} strokeWidth="1"/>
      <line x1="3" y1="13" x2="8" y2="13" stroke={c} strokeWidth="2"/>
    </svg>
  );
}
