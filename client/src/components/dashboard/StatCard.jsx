// StatCard.jsx — refined stat card with colored icon, big value, label, optional sublabel.
//
// `tone` controls the icon background gradient — different tones group
// related stats (raised + donated use emerald, count stats use slate).

const TONES = {
  emerald: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
  amber:   'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  rose:    'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
  slate:   'bg-gradient-to-br from-slate-600 to-slate-800 text-white',
};

export default function StatCard({ icon, tone = 'slate', label, value, sublabel }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500">{label}</div>
          <div className="mt-2 text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">{value}</div>
          {sublabel && <div className="mt-1 text-xs text-gray-500">{sublabel}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${TONES[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
