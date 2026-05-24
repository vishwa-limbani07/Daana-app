// ProgressBar.jsx — visual fundraising progress.
// Re-renders smoothly when parent updates `percent` (e.g. from Socket.io event).

export default function ProgressBar({ percent }) {
  return (
    <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 bg-indigo-600 transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
