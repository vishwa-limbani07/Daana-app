// LayoutStacked.jsx — current pattern, linear vertical sections.
// Simple, scannable, works for any length.

import DonationsFeed from '../../DonationsFeed.jsx';
import TiersPanel from '../../TiersPanel.jsx';
import { StoryBlock, CreatorCard } from '../shared.jsx';

export default function LayoutStacked({
  campaign, creator, isCreator, canDonate, latestDonation, onDonateForTier,
}) {
  return (
    <article className="space-y-16 max-w-4xl mx-auto">
      <StoryBlock story={campaign.story} creator={creator} createdAt={campaign.createdAt} />

      <section>
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Reward tiers</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <TiersPanel
            campaignId={campaign._id}
            isCreator={isCreator}
            onSelect={canDonate ? onDonateForTier : undefined}
          />
        </div>
      </section>

      <CreatorCard creator={creator} />

      <section>
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Recent backers</h2>
        <DonationsFeed campaignId={campaign._id} newDonation={latestDonation} />
      </section>
    </article>
  );
}
