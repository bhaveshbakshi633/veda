// herbs index loading skeleton — grid layout
export default function HerbsLoading() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-72 bg-gray-100 rounded animate-pulse mb-6" />

      {/* search bar skeleton */}
      <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse mb-6" />

      {/* herb grid skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
