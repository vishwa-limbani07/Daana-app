// LayoutMagazine.jsx — title-first editorial. The headline IS the hero, image
// is supporting. Reads like a magazine article: eyebrow → headline → byline →
// image → body.

import DonationsFeed from '../DonationsFeed.jsx';
import TiersPanel from '../TiersPanel.jsx';
import ShareRow from '../ShareRow.jsx';
import { MetaStrip, StoryBlock, CreatorCard, DonateCard, CATEGORY_META } from './shared.jsx';
import { Globe } from '../../common/icons.jsx';

export default function LayoutMagazine({
  campaign, creator, pct, flash, canDonate, isExpired, isCreator,
  latestDonation, onDonateFreeAmount, onDonateForTier,
}) {
  const meta = CATEGORY_META[campaign.category] || { label: campaign.category, Icon: Globe };
  const { Icon } = meta;

  return (
    <>
      {/* Headline block above the image */}
      <header className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-5">
          <Icon size={14} />
          <span>{meta.label} · campaign</span>
        </div>

        <h1 className="font-serif text-4xl md:text-6xl text-gray-900 tracking-tight leading-[1.05]">
          {campaign.title}
        </h1>

        <div className="mt-8 flex justify-center">
          <MetaStrip campaign={campaign} creator={creator} />
        </div>
      </header>

      {/* Hero image (no overlay) */}
      <figure className="rounded-3xl overflow-hidden shadow-sm mb-10">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full aspect-[16/9] object-cover"
        />
      </figure>

      <article className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-12">
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
