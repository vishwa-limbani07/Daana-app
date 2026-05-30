// themes.js — central palette config for the auth pages (and easily extended
// to the whole app later).
//
// Each theme exposes Tailwind class names rather than raw hex values so the
// compiler picks them up. (If you use dynamic strings like `bg-${color}-600`
// Tailwind purges them — these have to be full literal class names.)

export const THEMES = {
  indigo: {
    name: 'Indigo Aurora',
    description: 'Modern fintech — the current look.',
    showcaseGradient: 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600',
    pageBg: 'bg-gray-50',
    button: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
    buttonShadow: 'shadow-indigo-200',
    focusRing: 'focus:ring-indigo-500',
    labelFocus: 'peer-focus:text-indigo-600',
    link: 'hover:text-indigo-600',
    linkBorder: 'hover:border-indigo-400',
    accentText: 'text-indigo-100',
    blob1: 'bg-white/10',
    blob2: 'bg-purple-300/20',
    showcaseText: 'text-white',
    chipBg: 'bg-white/15',
    chipDot: 'bg-emerald-300',
    valueBg: 'bg-white/10 border-white/15',
    valueIconBg: 'bg-white/20',
    devaColor: 'text-white/10',
  },

  sunset: {
    name: 'Marigold Sunset',
    description: 'Warm Indian-festival vibes. Daana means giving — this palette feels generous.',
    showcaseGradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500',
    pageBg: 'bg-amber-50/40',
    button: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800',
    buttonShadow: 'shadow-rose-200',
    focusRing: 'focus:ring-rose-500',
    labelFocus: 'peer-focus:text-rose-600',
    link: 'hover:text-rose-600',
    linkBorder: 'hover:border-rose-400',
    accentText: 'text-amber-50',
    blob1: 'bg-yellow-200/30',
    blob2: 'bg-rose-300/30',
    showcaseText: 'text-white',
    chipBg: 'bg-white/20',
    chipDot: 'bg-yellow-200',
    valueBg: 'bg-white/15 border-white/20',
    valueIconBg: 'bg-white/25',
    devaColor: 'text-white/15',
  },

  emerald: {
    name: 'Emerald Trust',
    description: 'Calm and professional. Signals reliability — good for fundraising.',
    showcaseGradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700',
    pageBg: 'bg-emerald-50/30',
    button: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800',
    buttonShadow: 'shadow-emerald-200',
    focusRing: 'focus:ring-emerald-500',
    labelFocus: 'peer-focus:text-emerald-600',
    link: 'hover:text-emerald-600',
    linkBorder: 'hover:border-emerald-400',
    accentText: 'text-emerald-50',
    blob1: 'bg-white/10',
    blob2: 'bg-cyan-300/20',
    showcaseText: 'text-white',
    chipBg: 'bg-white/15',
    chipDot: 'bg-lime-300',
    valueBg: 'bg-white/10 border-white/15',
    valueIconBg: 'bg-white/20',
    devaColor: 'text-white/10',
  },

  midnight: {
    name: 'Midnight Premium',
    description: 'Dark, editorial luxury. Linear / Vercel energy.',
    showcaseGradient: 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950',
    pageBg: 'bg-slate-100',
    button: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950',
    buttonShadow: 'shadow-slate-300',
    focusRing: 'focus:ring-slate-700',
    labelFocus: 'peer-focus:text-slate-900',
    link: 'hover:text-slate-900',
    linkBorder: 'hover:border-slate-500',
    accentText: 'text-slate-300',
    blob1: 'bg-violet-500/20',
    blob2: 'bg-indigo-500/20',
    showcaseText: 'text-white',
    chipBg: 'bg-white/10',
    chipDot: 'bg-violet-400',
    valueBg: 'bg-white/5 border-white/10',
    valueIconBg: 'bg-white/10',
    devaColor: 'text-violet-400/10',
  },
};

export const THEME_KEYS = Object.keys(THEMES);
export const DEFAULT_THEME = 'emerald';
