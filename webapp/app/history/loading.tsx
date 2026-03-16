// assessment history loading skeleton
export default function HistoryLoading() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-6" />

      {/* history item skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="w-16 h-6 bg-gray-100 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}
