// LayoutBento.jsx — modular bento-grid layout.
//
// Mixed-size cards give visual rhythm:
//   ┌─────────────────────────────────────┐
//   │              STORY (3 col)          │
//   ├──────────────────┬──────────────────┤
//   │  CREATOR (1 col) │   TIERS (2 col)  │
//   ├──────────────────┴──────────────────┤
//   │            BACKERS (3 col)          │
//   └─────────────────────────────────────┘
//
// Each panel becomes a distinct "card" with rounded background — feels like
// a designed dashboard rather than a vertical scroll.

import DonationsFeed from '../../DonationsFeed.jsx';
import TiersPanel from '../../TiersPanel.jsx';
import { StoryBlock, CreatorCard } from '../shared.jsx';

export default function LayoutBento({
  campaign, creator, isCreator, canDonate, latestDonation, onDonateForTier,
}) {
  return (
    <article className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Story — full row */}
      <section className="md:col-span-3 bg-white rounded-3xl border border-gray-100 p-6 md:p-10">
        <StoryBlock story={campaign.story} creator={creator} createdAt={campaign.createdAt} />
      </section>

      {/* Creator — 1 col */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-center">
        <CreatorCardInline creator={creator} />
      </section>

      {/* Tiers — 2 col */}
      <section className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Reward tiers</h2>
        <TiersPanel
          campaignId={campaign._id}
          isCreator={isCreator}
          onSelect={canDonate ? onDonateForTier : undefined}
        />
      </section>

      {/* Backers — full row */}
      <section className="md:col-span-3 bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Recent backers</h2>
        <DonationsFeed campaignId={campaign._id} newDonation={latestDonation} />
      </section>
    </article>
  );
}

// Inline variant of the creator card — since the bento cell already has the
// card frame, the inner content shouldn't add its own.
function CreatorCardInline({ creator }) {
  if (!creator?.name) return null;
  const initial = creator.name[0].toUpperCase();
  const colors = ['bg-indigo-500','bg-rose-500','bg-emerald-500','bg-amber-500','bg-sky-500','bg-purple-500'];
  const idx = [...creator.name].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

  return (
    <>
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">About the creator</h2>
      <div className="flex items-center gap-4">
        {creator.avatar ? (
          <img src={creator.avatar} alt={creator.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <span className={`w-14 h-14 rounded-full ${colors[idx]} text-white flex items-center justify-center text-lg font-semibold flex-shrink-0`}>
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-gray-900">{creator.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">Campaign creator on Daana</div>
        </div>
      </div>
    </>
  );
}
