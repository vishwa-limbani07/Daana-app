// DonationsFeed.jsx — recent backers list with live updates.
//
// Data flow:
//   - Initial fetch on mount: load N most recent successful donations.
//   - When the parent receives a 'donation:new' socket event, it passes the
//     new donation in via the `newDonation` prop. We prepend it to our list
//     and briefly highlight it.
//
// Why we accept the new donation via prop instead of subscribing here:
//   - There's already a single socket subscription in CampaignDetail.
//     Subscribing twice would mean two listeners for the same event.
//     Keeping all socket logic in one place (the parent) is cleaner.

import { useEffect, useState, useRef } from 'react';
import { listCampaignDonations } from '../../api/donationApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { timeAgo } from '../../utils/formatDate.js';

export default function DonationsFeed({ campaignId, newDonation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightId, setHighlightId] = useState(null);
  // Track which IDs we've already added so a socket event doesn't duplicate
  // a row we already have (e.g. the donor who just paid).
  const seenIds = useRef(new Set());

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await listCampaignDonations(campaignId);
        if (!cancelled) {
          setItems(data.items);
          data.items.forEach((d) => seenIds.current.add(d._id));
        }
      } catch (err) {
        console.error('[feed] failed to load:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [campaignId]);

  // Live: when parent passes a new donation, prepend it.
  useEffect(() => {
    if (!newDonation || seenIds.current.has(newDonation._id)) return;
    seenIds.current.add(newDonation._id);
    setItems((prev) => [newDonation, ...prev].slice(0, 30)); // cap at 30 to avoid unbounded growth
    setHighlightId(newDonation._id);
    const t = setTimeout(() => setHighlightId(null), 2000);
    return () => clearTimeout(t);
  }, [newDonation]);

  // Re-render every 30s so timeAgo strings update without a page refresh
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading backers...</p>;
  }
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No donations yet. Be the first to back this campaign!
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((d) => (
        <DonationRow key={d._id} donation={d} highlighted={d._id === highlightId} />
      ))}
    </ul>
  );
}

function DonationRow({ donation, highlighted }) {
  const name = donation.isAnonymous ? 'Anonymous' : donation.donor?.name || 'Unknown';
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <li
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-700 ${
        highlighted
          ? 'border-indigo-400 bg-indigo-50 shadow-sm'
          : 'border-gray-100 bg-white'
      }`}
    >
      <Avatar name={name} avatar={donation.donor?.avatar} initial={initial} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <span className="font-medium text-sm truncate">{name}</span>
          <span className="text-indigo-600 font-semibold text-sm whitespace-nowrap">
            {formatCurrency(donation.amount)}
          </span>
        </div>
        {donation.message && (
          <p className="text-sm text-gray-600 mt-1 break-words">{donation.message}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{timeAgo(donation.createdAt)}</p>
      </div>
    </li>
  );
}

function Avatar({ name, avatar, initial }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  // Deterministic color from name so the same person always gets the same color.
  const colors = [
    'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-sky-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500',
  ];
  const idx = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return (
    <div
      className={`w-10 h-10 rounded-full ${colors[idx]} text-white flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initial}
    </div>
  );
}
