// HeroActivity.jsx — floating "live donation" cards stacked on the hero.
//
// These are deliberately mocked so the hero always looks busy even when the
// real database is empty. Each card represents a donor backing a campaign.
//
// Animation choices:
//   - riseIn 600ms on mount (staggered by index for a cascade effect)
//   - float ~5s loop after that (subtle vertical bob)
//   - Live pulsing dot on each card

const ACTIVITIES = [
  { name: 'Priya M.',  amount: '₹2,500', campaign: 'Rural school library',     time: 'just now',  color: 'bg-rose-500'    },
  { name: 'Arjun K.',  amount: '₹1,000', campaign: 'Open-source dev tooling',  time: '2m ago',    color: 'bg-amber-500'   },
  { name: 'Neha S.',   amount: '₹5,000', campaign: 'Cleft-palate surgery fund', time: '8m ago',    color: 'bg-sky-500'     },
];

export default function HeroActivity() {
  return (
    <div className="relative h-full min-h-[420px] flex flex-col items-center justify-center">
      {/* Big translucent दान mark behind the cards */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span className="font-serif text-[18rem] leading-none text-emerald-100">दान</span>
      </div>

      {/* Stack of activity cards — absolute-positioned with slight offsets */}
      <div className="relative w-full max-w-sm space-y-4">
        {ACTIVITIES.map((a, i) => (
          <ActivityCard
            key={i}
            {...a}
            offsetX={i === 0 ? 0 : i === 1 ? -20 : 20}
            delay={i * 150}
          />
        ))}
      </div>

      {/* Sparkles scattered around */}
      <Sparkle className="absolute top-8 right-4" delay={0} />
      <Sparkle className="absolute bottom-16 left-8" delay={700} />
      <Sparkle className="absolute top-1/3 left-2" delay={1400} small />
    </div>
  );
}

function ActivityCard({ name, amount, campaign, time, color, offsetX, delay }) {
  const initial = name[0].toUpperCase();
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-3 flex items-center gap-3 transition-shadow"
      style={{
        opacity: 0,
        transform: `translateX(${offsetX}px)`,
        animation: `riseIn 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms forwards, float 5s ease-in-out ${delay + 600}ms infinite`,
      }}
    >
      <div className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center text-sm font-semibold flex-shrink-0`}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-semibold text-gray-900">{name}</span>
          <span className="text-gray-500"> backed </span>
          <span className="text-gray-700 truncate">{campaign}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-semibold text-emerald-700">{amount}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-xs text-gray-500">{time}</span>
        </div>
      </div>
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    </div>
  );
}

function Sparkle({ className = '', delay = 0, small = false }) {
  const size = small ? 16 : 24;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: `twinkle 2.5s ease-in-out ${delay}ms infinite` }}
    >
      <path
        d="M12 2 L13 10 L21 12 L13 14 L12 22 L11 14 L3 12 L11 10 Z"
        fill="#10b981"
        opacity="0.7"
      />
    </svg>
  );
}
