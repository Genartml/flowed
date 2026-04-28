"use client";

export default function MainLoading() {
  return (
    <div className="min-h-full pb-24 page-fade-in">
      {/* Cockpit Bar Skeleton */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
              <div className="h-7 w-28 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="px-6 py-4 flex gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-zinc-800/50 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-48 bg-zinc-800/60 rounded animate-pulse" />
                <div className="h-4 w-20 bg-zinc-800/60 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-zinc-800/60 rounded-lg animate-pulse" />
                  <div className="h-4 w-32 bg-zinc-800/60 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-zinc-800/60 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
