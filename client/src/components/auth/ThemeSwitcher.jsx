// ThemeSwitcher.jsx — floating pill at the top of auth pages.
//
// Lets you preview the 4 themes live before picking one. Each pill is colored
// with a mini gradient swatch so you can scan by sight, not by name.
//
// This is intended as a dev/design tool. Once a theme is locked in, this
// component can be removed (or kept as a small Easter egg).

import { THEMES, THEME_KEYS } from '../../utils/themes.js';

const SWATCH = {
  indigo:   'from-indigo-500 to-purple-600',
  sunset:   'from-amber-400 to-rose-500',
  emerald:  'from-emerald-500 to-cyan-600',
  midnight: 'from-slate-700 to-indigo-900',
};

export default function ThemeSwitcher({ active, onChange }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
        <span className="text-xs text-gray-400 px-2">Theme:</span>
        {THEME_KEYS.map((k) => {
          const isActive = k === active;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition
                ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title={THEMES[k].description}
            >
              <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${SWATCH[k]} ring-1 ring-black/10`} />
              <span>{THEMES[k].name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
