// ProgressBar.jsx — visual fundraising progress.
//
// Optional `showMilestones` prop adds tick markers at 25/50/75/100%
// with subtle celebratory icons when crossed.
// Used on CampaignDetail; the basic bar is used on CampaignCard.

export default function ProgressBar({ percent, showMilestones = false }) {
  if (!showMilestones) {
    return (
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }

  const milestones = [25, 50, 75, 100];
  return (
    <div className="relative mt-3">
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Milestone ticks */}
      <div className="relative h-4 mt-1">
        {milestones.map((m) => {
          const crossed = percent >= m;
          return (
            <div
              key={m}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${m}%` }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors -mt-3 ${
                  crossed ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              />
              <span className={`text-[10px] mt-0.5 transition-colors ${
                crossed ? 'text-emerald-700 font-medium' : 'text-gray-400'
              }`}>
                {m === 100 ? '🎉' : `${m}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
