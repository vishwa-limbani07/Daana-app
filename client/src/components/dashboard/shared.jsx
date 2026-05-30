// shared.jsx — components reused across the 3 dashboard layouts.
//
// Centralizing these makes each layout file purely about LAYOUT —
// the cells themselves are identical, only their arrangement differs.

import { Link } from 'react-router-dom';
import ProgressBar from '../campaign/ProgressBar.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate, daysLeft, timeAgo } from '../../utils/formatDate.js';
import { Plus, Rocket, HandHeart, ArrowRight } from '../common/icons.jsx';

// ─────────────────────────── STAT CARD ───────────────────────────

const TONES = {
  emerald: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
  amber:   'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  rose:    'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
  slate:   'bg-gradient-to-br from-slate-600 to-slate-800 text-white',
};

export function StatCard({ icon: Icon, tone = 'slate', label, value, sublabel }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500">{label}</div>
          <div className="mt-2 text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">{value}</div>
          {sublabel && <div className="mt-1 text-xs text-gray-500">{sublabel}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${TONES[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── ROW VARIANTS ───────────────────────────

export function CampaignRow({ campaign }) {
  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-emerald-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-4">
        <img src={campaign.coverImage} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{campaign.title}</h3>
            <StatusBadge status={campaign.status} />
          </div>
          <ProgressBar percent={pct} />
          <div className="flex flex-wrap justify-between text-xs text-gray-500 mt-2 gap-2">
            <span><span className="font-medium text-gray-900">{formatCurrency(campaign.raisedAmount)}</span> of {formatCurrency(campaign.goalAmount)}</span>
            <span>{campaign.donorCount} {campaign.donorCount === 1 ? 'backer' : 'backers'}</span>
            <span>{daysLeft(campaign.deadline)} days left</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DonationCompactRow({ donation }) {
  const c = donation.campaign;
  return (
    <li>
      <Link to={c ? `/campaigns/${c._id}` : '#'} className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
        {c?.coverImage && <img src={c.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-gray-900">{c?.title || '(deleted)'}</div>
          <div className="text-xs text-gray-500">{timeAgo(donation.createdAt)}</div>
        </div>
        <div className="text-sm font-semibold text-emerald-700 whitespace-nowrap">{formatCurrency(donation.amount)}</div>
      </Link>
    </li>
  );
}

export function DonationFullRow({ donation }) {
  const c = donation.campaign;
  return (
    <Link to={c ? `/campaigns/${c._id}` : '#'} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      {c?.coverImage && <img src={c.coverImage} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate text-gray-900">{c?.title || '(deleted campaign)'}</h3>
        <p className="text-xs text-gray-500">{formatDate(donation.createdAt)} · {timeAgo(donation.createdAt)}</p>
      </div>
      <div className="text-lg font-semibold text-emerald-700 tabular-nums">{formatCurrency(donation.amount)}</div>
    </Link>
  );
}

// ─────────────────────────── STATUS BADGE ───────────────────────────

const STATUS_STYLES = {
  active:    { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending:   { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500'   },
  completed: { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500'    },
  failed:    { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
  banned:    { bg: 'bg-gray-100',    text: 'text-gray-700',    dot: 'bg-gray-500'    },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.banned;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}

// ─────────────────────────── EMPTY STATE ───────────────────────────

const EMPTY_PRESETS = {
  campaigns: {
    icon: Rocket,
    iconColor: 'text-emerald-600 bg-emerald-50',
  },
  donations: {
    icon: HandHeart,
    iconColor: 'text-rose-600 bg-rose-50',
  },
};

export function EmptyTile({ preset = 'campaigns', title, text, ctaText, ctaTo, large = false }) {
  const { icon: Icon, iconColor } = EMPTY_PRESETS[preset];
  return (
    <div className={`text-center bg-stone-50 rounded-xl border border-dashed border-gray-200 ${large ? 'py-16 px-6' : 'py-10 px-4'}`}>
      <div className={`mx-auto w-14 h-14 rounded-2xl ${iconColor} flex items-center justify-center mb-4`}>
        <Icon size={26} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">{text}</p>
      {ctaText && (
        <Link
          to={ctaTo}
          className="inline-flex items-center gap-1 mt-5 text-sm text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
        >
          {ctaText} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────── HEADER ───────────────────────────

export function DashboardHeader({ name }) {
  const firstName = name?.split(' ')[0] || 'there';
  const initial = (name || '?')[0].toUpperCase();
  return (
    <header className="flex flex-wrap items-start gap-6 justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg font-semibold shadow-sm shadow-emerald-200">
          {initial}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hey, {firstName}</h1>
          <p className="text-gray-500 mt-0.5">Manage your campaigns and donation history.</p>
        </div>
      </div>
      <Link
        to="/create"
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
      >
        <Plus size={16} /> Start a campaign
      </Link>
    </header>
  );
}
