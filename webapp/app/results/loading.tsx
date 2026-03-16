// results page loading skeleton — herb card layout
export default function ResultsLoading() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* header */}
      <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mb-6" />

      {/* summary card skeleton */}
      <div className="bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-xl p-4 mb-6">
        <div className="h-4 w-full bg-ayurv-primary/10 rounded animate-pulse" />
      </div>

      {/* safety score skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="h-1.5 w-full bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>

      {/* herb card skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-6 bg-green-100 rounded-full animate-pulse" />
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
