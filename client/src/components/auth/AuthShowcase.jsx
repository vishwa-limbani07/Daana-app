// AuthShowcase.jsx — themed right-column visual on auth pages.
// Pass a `theme` from utils/themes.js to swap palettes.

const VALUES = [
  {
    icon: '🔒',
    title: 'Secured by Razorpay',
    text: 'PCI-DSS compliant payments, HMAC-verified transactions.',
  },
  {
    icon: '⚡',
    title: 'Live progress updates',
    text: 'See raised amounts tick up in real time as donations arrive.',
  },
  {
    icon: '🎁',
    title: 'Reward your backers',
    text: 'Offer Kickstarter-style tiers with atomic claim limits.',
  },
];

export default function AuthShowcase({ heading, sub, theme }) {
  return (
    <div className={`hidden lg:flex relative overflow-hidden rounded-2xl
      ${theme.showcaseGradient} ${theme.showcaseText}
      p-10 flex-col justify-between min-h-[560px]`}>

      <div className={`absolute -top-20 -right-20 w-72 h-72 ${theme.blob1} rounded-full blur-3xl pointer-events-none`} />
      <div className={`absolute -bottom-24 -left-24 w-80 h-80 ${theme.blob2} rounded-full blur-3xl pointer-events-none`} />

      <div
        aria-hidden
        className={`absolute right-2 bottom-2 text-[18rem] leading-none font-bold ${theme.devaColor} select-none pointer-events-none`}
      >
        दान
      </div>

      <div className="relative">
        <div className={`inline-flex items-center gap-2 ${theme.chipBg} backdrop-blur px-3 py-1 rounded-full text-xs font-medium`}>
          <span className={`w-1.5 h-1.5 rounded-full ${theme.chipDot} animate-pulse`} />
          Live on Vercel + Render
        </div>
        <h2 className="mt-6 text-3xl font-bold leading-tight">{heading}</h2>
        <p className={`mt-3 ${theme.accentText} text-base max-w-sm`}>{sub}</p>
      </div>

      <div className="relative space-y-3 mt-10">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className={`${theme.valueBg} border backdrop-blur rounded-xl p-3 flex items-start gap-3`}
          >
            <div className={`w-9 h-9 rounded-lg ${theme.valueIconBg} flex items-center justify-center text-lg flex-shrink-0`}>
              {v.icon}
            </div>
            <div>
              <div className="font-semibold text-sm">{v.title}</div>
              <div className={`text-xs ${theme.accentText} mt-0.5`}>{v.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
