// Skeleton.jsx — content-shaped loading placeholders.
//
// Why skeletons instead of spinners:
//   - Users perceive load time as SHORTER when they see content-shaped
//     placeholders (vs. a spinner). This is a well-documented UX finding.
//   - Layout doesn't shift when real content arrives — the page already
//     looks right, just filled in.
//
// Three exports:
//   <Skeleton />          — raw building block, accepts className for size
//   <CardSkeleton />      — campaign-card-shaped (image + title + bar + meta)
//   <CardGridSkeleton />  — grid of CardSkeleton placeholders

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export default Skeleton;

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <Skeleton className="h-48 rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-2 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  </div>
);

export const CardGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
  </div>
);

export const CampaignDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-6">
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2 pt-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
    <div className="bg-white rounded-lg shadow p-6 h-fit space-y-4">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-2 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="h-10 w-full mt-6" />
    </div>
  </div>
);
