// interaction checker loading skeleton
export default function CheckLoading() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mb-8" />

      {/* input skeletons */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse mb-4" />
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
      </div>

      <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );
}
