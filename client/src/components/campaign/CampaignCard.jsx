// CampaignCard.jsx — campaign preview tile for grids and lists.
//
// Visual upgrades over the basic version:
//   - Image hover zoom + gradient overlay (text readable over any image)
//   - Category badge floating on the image with emoji
//   - Hover lift via translate-y + shadow change
//   - Compact "X% funded · Y days left" footer line

import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { daysLeft } from '../../utils/formatDate.js';

// Emoji-only icons — zero dependencies. Visually distinguishable at a glance.
const CATEGORY_EMOJI = {
  education: '📚',
  medical:   '🏥',
  community: '🏘️',
  tech:      '💻',
  creative:  '🎨',
  other:     '✨',
};

export default function CampaignCard({ campaign }) {
  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  const days = daysLeft(campaign.deadline);
  const emoji = CATEGORY_EMOJI[campaign.category] || CATEGORY_EMOJI.other;

  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image with hover zoom + bottom gradient + floating badge */}
      <div className="relative overflow-hidden">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-700">
          <span>{emoji}</span>
          <span className="capitalize">{campaign.category}</span>
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors min-h-[3rem]">
          {campaign.title}
        </h3>

        <ProgressBar percent={pct} />

        <div className="flex justify-between items-baseline mt-3">
          <span className="text-sm">
            <span className="font-semibold text-gray-900">{formatCurrency(campaign.raisedAmount)}</span>
            <span className="text-gray-500"> raised</span>
          </span>
          <span className="text-xs font-medium text-emerald-700">{pct}%</span>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{campaign.donorCount} {campaign.donorCount === 1 ? 'backer' : 'backers'}</span>
          <span>{days === 0 ? 'Ended' : `${days} days left`}</span>
        </div>
      </div>
    </Link>
  );
}
