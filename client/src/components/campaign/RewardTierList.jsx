// RewardTierList.jsx — shows perks for a campaign and lets the donor pick one.

import { formatCurrency } from '../../utils/formatCurrency.js';

export default function RewardTierList({ tiers, selectedId, onSelect }) {
  if (!tiers?.length) return null;
  return (
    <div className="space-y-3">
      {tiers.map((t) => {
        const soldOut = t.limit !== null && t.claimed >= t.limit;
        const active = t._id === selectedId;
        return (
          <button
            key={t._id}
            disabled={soldOut}
            onClick={() => onSelect?.(t)}
            className={`w-full text-left border rounded p-3 transition ${
              active ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-400'
            } ${soldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">{t.title}</span>
              <span className="text-emerald-600 font-medium">{formatCurrency(t.minAmount)}+</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t.description}</p>
            {t.limit !== null && (
              <p className="text-xs text-gray-500 mt-2">
                {t.claimed} / {t.limit} claimed{soldOut && ' — SOLD OUT'}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
