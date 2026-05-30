// LayoutCover.jsx — magazine-cover hero. Image-dominant, title overlaid in serif white.

import DonationsFeed from '../DonationsFeed.jsx';
import TiersPanel from '../TiersPanel.jsx';
import ShareRow from '../ShareRow.jsx';
import { MetaStrip, StoryBlock, CreatorCard, DonateCard, CATEGORY_META } from './shared.jsx';
import { Globe } from '../../common/icons.jsx';

export default function LayoutCover({
  campaign, creator, pct, flash, canDonate, isExpired, isCreator,
  latestDonation, onDonateFreeAmount, onDonateForTier,
}) {
  const meta = CATEGORY_META[campaign.category] || { label: campaign.category, Icon: Globe };
  const { Icon } = meta;

  return (
    <>
      {/* HERO with overlay title */}
      <section className="relative rounded-3xl overflow-hidden shadow-sm">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full aspect-[16/8] md:aspect-[16/7] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-gray-800 shadow-sm">
          <Icon size={14} />
          {meta.label}
        </span>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.05] max-w-3xl">
            {campaign.title}
          </h1>
        </div>
      </section>

      <article className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-10">
        <div className="lg:col-span-2 space-y-12">
          <MetaStrip campaign={campaign} creator={creator} />
          <ShareRow campaign={campaign} />
          <StoryBlock story={campaign.story} creator={creator} createdAt={campaign.createdAt} />
          <CreatorCard creator={creator} />
          <section>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Recent backers</h2>
            <DonationsFeed campaignId={campaign._id} newDonation={latestDonation} />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          <DonateCard
            campaign={campaign} pct={pct} flash={flash}
            canDonate={canDonate} isExpired={isExpired}
            onDonate={onDonateFreeAmount}
          />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <TiersPanel
              campaignId={campaign._id}
              isCreator={isCreator}
              onSelect={canDonate ? onDonateForTier : undefined}
            />
          </div>
        </aside>
      </article>
    </>
  );
}
