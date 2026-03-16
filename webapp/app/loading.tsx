// global loading state — jab bhi koi page load ho raha ho
export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* header skeleton */}
      <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-3" />
      <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mb-8" />

      {/* card skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-50 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
