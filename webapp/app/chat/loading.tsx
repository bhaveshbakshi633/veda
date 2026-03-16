// chat page loading skeleton — messaging UI layout
export default function ChatLoading() {
  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse mb-6" />

      {/* message skeletons */}
      <div className="space-y-4 mb-8">
        {/* assistant message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 max-w-[80%]">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* user message */}
        <div className="flex justify-end">
          <div className="max-w-[75%]">
            <div className="bg-ayurv-primary/10 rounded-2xl p-4">
              <div className="h-4 w-48 bg-ayurv-primary/20 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* another assistant message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 max-w-[80%]">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* input bar skeleton */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
