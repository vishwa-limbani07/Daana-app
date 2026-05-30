// LayoutSplit.jsx — story left, secondary content right (NOT sticky — visual split).
//
// Story takes the wider column (2/3). The right column stacks Tiers and
// Creator. Backers feed runs full-width at the bottom — it gets enough
// breathing room that way and is the most "active" section so it deserves
// its own canvas.

import DonationsFeed from '../../DonationsFeed.jsx';
import TiersPanel from '../../TiersPanel.jsx';
import { StoryBlock, CreatorCard } from '../shared.jsx';

export default function LayoutSplit({
  campaign, creator, isCreator, canDonate, latestDonation, onDonateForTier,
}) {
  return (
    <article className="space-y-16 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Story column */}
        <div className="lg:col-span-2">
          <StoryBlock story={campaign.story} creator={creator} createdAt={campaign.createdAt} />
        </div>

        {/* Secondary column */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Reward tiers</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <TiersPanel
                campaignId={campaign._id}
                isCreator={isCreator}
                onSelect={canDonate ? onDonateForTier : undefined}
              />
            </div>
          </section>

          <CreatorCard creator={creator} />
        </div>
      </div>

      {/* Backers — full-width at the bottom */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Recent backers</h2>
        <DonationsFeed campaignId={campaign._id} newDonation={latestDonation} />
      </section>
    </article>
  );
}
