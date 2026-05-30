// Tabs.jsx — controlled tab list. Parent owns the active state.
//
// Visual: text labels with an emerald underline that slides between
// the active tab. The slider uses transform/scaleX so the GPU composites
// it cheaply (no layout reflow).
//
// API:
//   <Tabs
//     value={current}
//     onChange={setCurrent}
//     items={[{ value: 'overview', label: 'Overview' }, ...]}
//   />

export default function Tabs({ value, onChange, items, className = '' }) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <div className="flex gap-1 overflow-x-auto -mb-px">
        {items.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${active ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {item.label}
              {item.count !== undefined && (
                <span className={`ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 text-xs rounded-full px-1.5
                  ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.count}
                </span>
              )}

              {/* Active underline */}
              <span
                className={`absolute left-3 right-3 -bottom-px h-0.5 bg-emerald-600 origin-left transition-transform duration-200
                  ${active ? 'scale-x-100' : 'scale-x-0'}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
