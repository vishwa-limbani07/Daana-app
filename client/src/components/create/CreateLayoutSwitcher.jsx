// CreateLayoutSwitcher.jsx — pill switcher for the Create Campaign layout.

import { CREATE_LAYOUTS } from '../../hooks/useCreateLayout.js';

const META = {
  classic:   { name: 'Classic',   desc: 'Single sectioned card.' },
  wizard:    { name: 'Wizard',    desc: 'Step-by-step with progress.' },
  preview:   { name: 'Preview',   desc: 'Form + live card preview.' },
  editorial: { name: 'Editorial', desc: 'Magazine-style writing.' },
};

const SWATCH = {
  classic:   IconClassic,
  wizard:    IconWizard,
  preview:   IconPreview,
  editorial: IconEditorial,
};

export default function CreateLayoutSwitcher({ active, onChange }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
        <span className="text-xs text-gray-400 px-2">Layout:</span>
        {CREATE_LAYOUTS.map((k) => {
          const Icon = SWATCH[k];
          const isActive = k === active;
          return (
            <button
              key={k} type="button"
              onClick={() => onChange(k)}
              title={META[k].desc}
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

function IconClassic({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="1.5" stroke={c} strokeWidth="1" fillOpacity="0.3" fill={c}/>
      <rect x="3" y="4" width="10" height="1.5" rx="0.3" fill="white"/>
      <rect x="3" y="7" width="10" height="1.5" rx="0.3" fill="white"/>
      <rect x="3" y="10" width="6" height="1.5" rx="0.3" fill="white"/>
    </svg>
  );
}
function IconWizard({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="3" cy="8" r="1.5" fill={c}/>
      <line x1="5" y1="8" x2="7" y2="8" stroke={c} strokeWidth="1"/>
      <circle cx="8" cy="8" r="1.5" fill={c} fillOpacity="0.5"/>
      <line x1="10" y1="8" x2="12" y2="8" stroke={c} strokeWidth="1"/>
      <circle cx="13" cy="8" r="1.5" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1"/>
    </svg>
  );
}
function IconPreview({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="6" height="12" rx="1" fill={c} fillOpacity="0.5"/>
      <rect x="9" y="2" width="6" height="4" rx="0.5" fill={c}/>
      <rect x="9" y="7" width="6" height="2" rx="0.3" fill={c} fillOpacity="0.4"/>
      <rect x="9" y="10" width="6" height="2" rx="0.3" fill={c} fillOpacity="0.4"/>
      <rect x="9" y="13" width="3" height="1" rx="0.3" fill={c} fillOpacity="0.4"/>
    </svg>
  );
}
function IconEditorial({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <line x1="4" y1="3" x2="12" y2="3" stroke={c} strokeWidth="2"/>
      <line x1="3" y1="6" x2="13" y2="6" stroke={c} strokeWidth="1"/>
      <line x1="3" y1="8" x2="13" y2="8" stroke={c} strokeWidth="1"/>
      <line x1="3" y1="10" x2="11" y2="10" stroke={c} strokeWidth="1"/>
      <line x1="3" y1="13" x2="8" y2="13" stroke={c} strokeWidth="2"/>
    </svg>
  );
}
