// CampaignCard.jsx — preview card shown in lists.

import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { daysLeft } from '../../utils/formatDate.js';

export default function CampaignCard({ campaign }) {
  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  return (
    <Link to={`/campaigns/${campaign._id}`} className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      <img src={campaign.coverImage} alt={campaign.title} className="w-full h-44 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2">{campaign.title}</h3>
        <ProgressBar percent={pct} />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{formatCurrency(campaign.raisedAmount)} raised</span>
          <span>{daysLeft(campaign.deadline)} days left</span>
        </div>
      </div>
    </Link>
  );
}
