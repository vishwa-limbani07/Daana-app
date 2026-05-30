// LayoutTabbed.jsx — Kickstarter-style tabbed content.
// Pills navigate between sections. One section visible at a time.

import { useState, useEffect } from 'react';
import DonationsFeed from '../../DonationsFeed.jsx';
import TiersPanel from '../../TiersPanel.jsx';
import Tabs from '../../../common/Tabs.jsx';
import { listCampaignDonations } from '../../../../api/donationApi.js';
import { listTiers } from '../../../../api/tierApi.js';
import { StoryBlock, CreatorCard } from '../shared.jsx';

export default function LayoutTabbed({
  campaign, creator, isCreator, canDonate, latestDonation, onDonateForTier,
}) {
  const [tab, setTab] = useState('story');
  const [backerCount, setBackerCount] = useState(0);
  const [tierCount, setTierCount] = useState(0);

  // Pull counts once for the tab badges (cheap, one-off).
  useEffect(() => {
    (async () => {
      try {
        const [donRes, tierRes] = await Promise.all([
          listCampaignDonations(campaign._id, 1),
          listTiers(campaign._id),
        ]);
        setBackerCount(campaign.donorCount || donRes.data.items.length);
        setTierCount(tierRes.data.items.length);
      } catch { /* non-fatal */ }
    })();
  }, [campaign._id, campaign.donorCount]);

  return (
    <article className="max-w-4xl mx-auto">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'story',    label: 'The story' },
          { value: 'tiers',    label: 'Reward tiers', count: tierCount },
          { value: 'creator',  label: 'Creator' },
          { value: 'backers',  label: 'Backers', count: backerCount },
        ]}
        className="mb-10"
      />

      {tab === 'story' && (
        <StoryBlock story={campaign.story} creator={creator} createdAt={campaign.createdAt} />
      )}

      {tab === 'tiers' && (
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
      )}

      {tab === 'creator' && <CreatorCard creator={creator} />}

      {tab === 'backers' && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Recent backers</h2>
          <DonationsFeed campaignId={campaign._id} newDonation={latestDonation} />
        </section>
      )}
    </article>
  );
}
