// StoryLayoutSwitcher.jsx — pill switcher for the below-the-fold sub-layout
// on the Campaign Detail (Product) page.

import { STORY_LAYOUTS } from '../../hooks/useStoryLayout.js';

const META = {
  stacked: { name: 'Stacked', desc: 'Linear vertical sections.' },
  tabbed:  { name: 'Tabbed',  desc: 'Pills navigate between sections.' },
  split:   { name: 'Split',   desc: 'Story left, secondary content right.' },
  bento:   { name: 'Bento',   desc: 'Mixed-size cards, modular grid.' },
};

const SWATCH = {
  stacked: IconStacked,
  tabbed:  IconTabbed,
  split:   IconSplit,
  bento:   IconBento,
};

export default function StoryLayoutSwitcher({ active, onChange }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
        <span className="text-xs text-gray-400 px-2">Content layout:</span>
        {STORY_LAYOUTS.map((k) => {
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

function IconStacked({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="2.5" rx="0.5" fill={c} fillOpacity="0.6"/>
      <rect x="2" y="6.5" width="12" height="2.5" rx="0.5" fill={c} fillOpacity="0.6"/>
      <rect x="2" y="11" width="12" height="2.5" rx="0.5" fill={c} fillOpacity="0.6"/>
    </svg>
  );
}
function IconTabbed({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="3" height="2" rx="0.5" fill={c}/>
      <rect x="5" y="2" width="3" height="2" rx="0.5" fill={c} fillOpacity="0.4"/>
      <rect x="9" y="2" width="3" height="2" rx="0.5" fill={c} fillOpacity="0.4"/>
      <rect x="1" y="5" width="14" height="9" rx="1" stroke={c} strokeWidth="1"/>
    </svg>
  );
}
function IconSplit({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="8" height="12" rx="1" fill={c} fillOpacity="0.5"/>
      <rect x="10" y="2" width="5" height="5" rx="1" stroke={c} strokeWidth="1"/>
      <rect x="10" y="9" width="5" height="5" rx="1" stroke={c} strokeWidth="1"/>
    </svg>
  );
}
function IconBento({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="6" rx="1" fill={c} fillOpacity="0.6"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1"/>
      <rect x="9" y="9" width="6" height="6" rx="1" fill={c} fillOpacity="0.4"/>
    </svg>
  );
}
