// DashboardLayoutSwitcher.jsx — floating pill at the top of the dashboard.
// Lets you preview the 3 layouts. Once you pick one, set DEFAULT in the hook
// and delete the switcher import.

import { DASHBOARD_LAYOUTS } from '../../hooks/useDashboardLayout.js';

const META = {
  tabs:     { name: 'Tabs',     desc: 'Sectioned panels (current).' },
  insights: { name: 'Insights', desc: 'Single-page editorial scroll.' },
  command:  { name: 'Command',  desc: 'Sidebar + canvas (power-user).' },
};

const SWATCH = {
  tabs:     IconTabs,
  insights: IconInsights,
  command:  IconCommand,
};

export default function DashboardLayoutSwitcher({ active, onChange }) {
  return (
    <div className="flex justify-center -mt-2 mb-2">
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
        <span className="text-xs text-gray-400 px-2">Layout:</span>
        {DASHBOARD_LAYOUTS.map((k) => {
          const Icon = SWATCH[k];
          const isActive = k === active;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition
                ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title={META[k].desc}
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

function IconTabs({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="2" fill={c} />
      <rect x="1" y="7" width="14" height="6" rx="1" fill={c} fillOpacity="0.4" stroke={c} strokeWidth="1"/>
    </svg>
  );
}
function IconInsights({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="5" rx="1" fill={c} fillOpacity="0.6" />
      <rect x="1" y="8" width="6" height="7" rx="1" stroke={c} strokeWidth="1"/>
      <rect x="9" y="8" width="6" height="7" rx="1" stroke={c} strokeWidth="1"/>
    </svg>
  );
}
function IconCommand({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="4" height="14" rx="1" fill={c} fillOpacity="0.6"/>
      <rect x="7" y="1" width="8" height="14" rx="1" stroke={c} strokeWidth="1"/>
    </svg>
  );
}
