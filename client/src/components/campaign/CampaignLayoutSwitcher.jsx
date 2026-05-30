// CampaignLayoutSwitcher.jsx — pill switcher pinned above the campaign page.

import { CAMPAIGN_LAYOUTS } from '../../hooks/useCampaignLayout.js';

const META = {
  cover:    { name: 'Cover',    desc: 'Image-dominant magazine cover (current).' },
  magazine: { name: 'Magazine', desc: 'Title-first editorial article.' },
  product:  { name: 'Product',  desc: 'Kickstarter-style info-dense.' },
};

const SWATCH = { cover: IconCover, magazine: IconMagazine, product: IconProduct };

export default function CampaignLayoutSwitcher({ active, onChange }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
        <span className="text-xs text-gray-400 px-2">Layout:</span>
        {CAMPAIGN_LAYOUTS.map((k) => {
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

function IconCover({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="9" rx="1" fill={c} fillOpacity="0.6"/>
      <rect x="3" y="7" width="6" height="2" rx="0.5" fill="white"/>
      <rect x="1" y="13" width="9" height="1.5" rx="0.5" fill={c} fillOpacity="0.4"/>
    </svg>
  );
}
function IconMagazine({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="12" height="1.5" rx="0.5" fill={c}/>
      <rect x="1" y="5" width="14" height="6" rx="1" stroke={c} strokeWidth="1" fillOpacity="0.3" fill={c}/>
      <rect x="1" y="13" width="9" height="1.5" rx="0.5" fill={c} fillOpacity="0.4"/>
    </svg>
  );
}
function IconProduct({ active }) {
  const c = active ? 'currentColor' : '#9ca3af';
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="7" height="9" rx="1" fill={c} fillOpacity="0.5"/>
      <rect x="10" y="2" width="5" height="1.5" rx="0.5" fill={c}/>
      <rect x="10" y="5" width="5" height="0.8" rx="0.4" fill={c} fillOpacity="0.5"/>
      <rect x="10" y="7" width="5" height="0.8" rx="0.4" fill={c} fillOpacity="0.5"/>
      <rect x="10" y="9" width="5" height="2" rx="0.5" fill={c}/>
    </svg>
  );
}
