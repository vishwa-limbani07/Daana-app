// MoreCampaigns.jsx — "More like this" grid at the bottom of a campaign page.
//
// Fetches the same-category campaigns (limited to 4 server-side) and shows
// up to 3 excluding the current one. Quiet, optional — disappears if there
// are no other campaigns in the category.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCampaigns } from '../../api/campaignApi.js';
import CampaignCard from './CampaignCard.jsx';
import { ArrowUpRight } from '../common/icons.jsx';

export default function MoreCampaigns({ category, excludeId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await listCampaigns({ category, limit: 4 });
        if (!cancelled) {
          setItems(data.items.filter((c) => c._id !== excludeId).slice(0, 3));
        }
      } catch {
        // non-fatal — section is optional
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category, excludeId]);

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-1">More like this</div>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-tight capitalize">
            Other {category} campaigns.
          </h2>
        </div>
        <Link
          to={`/browse?category=${category}`}
          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          See all in {category} <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((c) => <CampaignCard key={c._id} campaign={c} />)}
      </div>
    </section>
  );
}
