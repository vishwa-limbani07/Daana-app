// LayoutProduct.jsx — Kickstarter / Indiegogo info-dense layout.
//
// Above the fold: image LEFT, all key info + DONATE CTA RIGHT.
// Below the fold: full-width story, tiers, backers — no sticky sidebar.
//
// This is the most conversion-focused layout — the donation CTA and key
// stats are visible the moment the page loads. Best for practical fundraisers
// (medical, project funding) where users want to act fast.

import ProgressBar from '../ProgressBar.jsx';
import ShareRow from '../ShareRow.jsx';
import Button from '../../common/Button.jsx';
import LayoutBento from './story-layouts/LayoutBento.jsx';
import { CATEGORY_META } from './shared.jsx';
import { Globe, Calendar } from '../../common/icons.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate, daysLeft } from '../../../utils/formatDate.js';

export default function LayoutProduct({
  campaign, creator, pct, flash, canDonate, isExpired, isCreator,
  latestDonation, onDonateFreeAmount, onDonateForTier,
}) {
  const meta = CATEGORY_META[campaign.category] || { label: campaign.category, Icon: Globe };
  const { Icon } = meta;
  const initial = (creator?.name || '?')[0].toUpperCase();

  return (
    <>
      {/* ======== ABOVE-THE-FOLD ======== */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
        {/* Image — wider column */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl overflow-hidden shadow-sm relative">
            <img src={campaign.coverImage} alt={campaign.title} className="w-full aspect-[4/3] object-cover" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-gray-800 shadow-sm">
              <Icon size={14} />
              {meta.label}
            </span>
          </div>
        </div>

        {/* Info column */}
        <div className="lg:col-span-2 flex flex-col">
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-tight leading-[1.1] mb-3">
            {campaign.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
              {initial}
            </span>
            by <span className="font-medium text-gray-900">{creator?.name || 'Unknown'}</span>
          </div>

          {/* Big stat */}
          <div className={`bg-white rounded-2xl border border-gray-100 p-5 transition-all ${flash ? 'ring-4 ring-emerald-300 shadow-lg' : 'shadow-sm'}`}>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(campaign.raisedAmount)}
              </span>
              <span className="text-sm text-gray-500">raised</span>
            </div>
            <div className="text-sm text-gray-500">
              of {formatCurrency(campaign.goalAmount)} · <span className="text-emerald-700 font-medium">{pct}%</span>
            </div>

            <ProgressBar percent={pct} showMilestones />

            {/* Inline stats */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100 text-center">
              <Stat value={campaign.donorCount} label={campaign.donorCount === 1 ? 'backer' : 'backers'} />
              <Stat value={daysLeft(campaign.deadline)} label="days left" />
              <Stat value={`${pct}%`} label="funded" />
            </div>

            <Button className="w-full mt-6 !py-3.5 !text-base" onClick={onDonateFreeAmount} disabled={!canDonate}>
              {canDonate ? 'Back this campaign →' : isExpired ? 'Campaign ended' : 'Not accepting'}
            </Button>

            <div className="mt-3 flex items-center gap-2 justify-center text-xs text-gray-500">
              <Calendar size={12} /> Ends {formatDate(campaign.deadline)}
            </div>
          </div>

          <div className="mt-5">
            <ShareRow campaign={campaign} />
          </div>
        </div>
      </section>

      {/* ======== BELOW-THE-FOLD (Bento layout) ======== */}
      <LayoutBento
        campaign={campaign}
        creator={creator}
        isCreator={isCreator}
        canDonate={canDonate}
        latestDonation={latestDonation}
        onDonateForTier={onDonateForTier}
      />
    </>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-lg font-bold text-gray-900 tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
    </div>
  );
}
