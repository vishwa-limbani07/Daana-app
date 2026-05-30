// shared.jsx — atomic pieces every campaign-detail layout reuses.

import { useMemo } from 'react';
import ProgressBar from '../ProgressBar.jsx';
import Button from '../../common/Button.jsx';
import {
  BookOpen, Stethoscope, Users, Code, Palette, Sparkles, Globe, Calendar, Clock,
} from '../../common/icons.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { formatDate, daysLeft } from '../../../utils/formatDate.js';

export const CATEGORY_META = {
  education: { label: 'Education', Icon: BookOpen },
  medical:   { label: 'Medical',   Icon: Stethoscope },
  community: { label: 'Community', Icon: Users },
  tech:      { label: 'Tech',      Icon: Code },
  creative:  { label: 'Creative',  Icon: Palette },
  other:     { label: 'Other',     Icon: Sparkles },
};

// Deterministic-color avatar circle for users without an avatar.
const HASH_COLORS = ['bg-indigo-500','bg-rose-500','bg-emerald-500','bg-amber-500','bg-sky-500','bg-purple-500'];
const hashColor = (name = '?') => HASH_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % HASH_COLORS.length];

// ─────────────────────────── META STRIP ───────────────────────────

export function MetaStrip({ campaign, creator }) {
  const meta = CATEGORY_META[campaign.category] || { label: campaign.category, Icon: Globe };
  const { Icon } = meta;
  const initial = (creator?.name || '?')[0].toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
      <div className="flex items-center gap-2">
        {creator?.avatar ? (
          <img src={creator.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <span className={`w-8 h-8 rounded-full ${hashColor(creator?.name)} text-white flex items-center justify-center text-sm font-semibold`}>
            {initial}
          </span>
        )}
        <span className="text-gray-600">
          by <span className="font-medium text-gray-900">{creator?.name || 'Unknown'}</span>
        </span>
      </div>

      <span className="text-gray-300">·</span>
      <div className="inline-flex items-center gap-1.5 text-gray-600">
        <Icon size={14} /> <span className="capitalize">{meta.label}</span>
      </div>

      <span className="text-gray-300">·</span>
      <div className="inline-flex items-center gap-1.5 text-gray-600">
        <Calendar size={14} /> Ends {formatDate(campaign.deadline)}
      </div>
    </div>
  );
}

// ─────────────────────────── STORY BLOCK ───────────────────────────

// Editorial story layout:
//   - Eyebrow + reading-time pill on the right (sets expectations)
//   - First paragraph = lede (larger text, lighter weight)
//   - First letter = serif emerald drop cap
//   - End signature: em-dash + creator name + posted date in serif italic
//
// Reading time uses the journalism-standard 200 wpm average.
export function StoryBlock({ story, creator, createdAt, withDropCap = true }) {
  const { paragraphs, readingTime } = useMemo(() => {
    if (!story) return { paragraphs: [], readingTime: 1 };
    const parts = story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const words = story.trim().split(/\s+/).length;
    return {
      paragraphs: parts.length > 0 ? parts : [story],
      readingTime: Math.max(1, Math.ceil(words / 200)),
    };
  }, [story]);

  return (
    <section>
      {/* Header strip — eyebrow + reading time */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xs uppercase tracking-widest text-gray-500">The story</h2>
        <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} />
          <span>{readingTime} min read</span>
        </div>
      </div>

      <div className="max-w-prose">
        {paragraphs.map((p, i) => {
          const isLede = i === 0;
          const dropCap = withDropCap && isLede
            ? 'first-letter:font-serif first-letter:text-6xl md:first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:text-emerald-700'
            : '';

          return (
            <p
              key={i}
              className={`whitespace-pre-wrap ${
                isLede
                  ? 'text-xl md:text-2xl text-gray-700 leading-relaxed font-light mb-6'
                  : 'text-[17px] text-gray-800 leading-relaxed mb-5 last:mb-0'
              } ${dropCap}`}
            >
              {p}
            </p>
          );
        })}

        {/* End signature — treats the story like a letter from the creator */}
        {creator?.name && (
          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col items-start gap-1">
            <p className="font-serif italic text-gray-700">
              — {creator.name}
            </p>
            {createdAt && (
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Shared on {formatDate(createdAt)}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────── CREATOR CARD ───────────────────────────

export function CreatorCard({ creator }) {
  if (!creator?.name) return null;
  const initial = creator.name[0].toUpperCase();

  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">About the creator</h2>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        {creator.avatar ? (
          <img src={creator.avatar} alt={creator.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
        ) : (
          <span className={`w-16 h-16 rounded-full ${hashColor(creator.name)} text-white flex items-center justify-center text-xl font-semibold flex-shrink-0`}>
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-gray-900">{creator.name}</div>
          <div className="text-sm text-gray-500 mt-0.5">Campaign creator on Daana</div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────── DONATE CARD ───────────────────────────

export function DonateCard({ campaign, pct, flash, canDonate, isExpired, onDonate, compact = false }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${compact ? 'p-5' : 'p-6'} transition-all ${
        flash ? 'ring-4 ring-emerald-300 shadow-lg' : ''
      }`}
    >
      <div className="flex items-baseline gap-2">
        <span className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 tabular-nums`}>
          {formatCurrency(campaign.raisedAmount)}
        </span>
        <span className="text-sm text-gray-500">raised</span>
      </div>
      <div className="text-sm text-gray-500">
        of {formatCurrency(campaign.goalAmount)} goal ·{' '}
        <span className="text-emerald-700 font-medium">{pct}%</span>
      </div>

      <ProgressBar percent={pct} showMilestones />

      <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-gray-100">
        <Stat value={campaign.donorCount} label={campaign.donorCount === 1 ? 'backer' : 'backers'} />
        <Stat value={daysLeft(campaign.deadline)} label={daysLeft(campaign.deadline) === 1 ? 'day left' : 'days left'} />
      </div>

      <Button className="w-full mt-6 !py-3" onClick={onDonate} disabled={!canDonate}>
        {canDonate ? 'Back this campaign →' : isExpired ? 'Campaign ended' : 'Not accepting'}
      </Button>

      {!canDonate && isExpired && (
        <p className="text-xs text-center text-gray-500 mt-2">The deadline has passed.</p>
      )}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-gray-900 tabular-nums">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
