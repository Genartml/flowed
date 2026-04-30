"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CockpitBarSkeleton() {
  return (
    <div className="bg-zinc-950 border-b border-zinc-800 p-4 md:p-6 lg:p-8 flex flex-col sm:flex-row gap-6 md:gap-12 items-start sm:items-center">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 bg-zinc-800" />
          <Skeleton className="h-4 w-4 rounded-full bg-zinc-800" />
        </div>
        <Skeleton className="h-10 w-40 bg-zinc-800" />
      </div>
      <div className="hidden sm:block w-px h-12 bg-zinc-800" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 bg-zinc-800" />
        <Skeleton className="h-10 w-32 bg-zinc-800" />
      </div>
      <div className="hidden sm:block w-px h-12 bg-zinc-800" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 bg-zinc-800" />
        <Skeleton className="h-10 w-24 bg-zinc-800" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8 page-fade-in">
      {/* Action Center Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
            <Skeleton className="h-12 w-12 rounded-xl bg-zinc-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4 bg-zinc-800" />
              <Skeleton className="h-4 w-1/2 bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Second Row Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
            <Skeleton className="h-12 w-12 rounded-xl bg-zinc-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4 bg-zinc-800" />
              <Skeleton className="h-4 w-1/2 bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm h-[400px] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-48 bg-zinc-800" />
          <Skeleton className="h-8 w-32 bg-zinc-800 rounded-full" />
        </div>
        <Skeleton className="flex-1 w-full bg-zinc-800/50 rounded-xl" />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm h-[500px] p-6 flex flex-col space-y-6">
          <Skeleton className="h-6 w-48 bg-zinc-800" />
          <div className="space-y-4">
             <Skeleton className="h-24 w-full bg-zinc-800 rounded-xl" />
             <Skeleton className="h-24 w-full bg-zinc-800 rounded-xl" />
             <Skeleton className="h-24 w-full bg-zinc-800 rounded-xl" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm h-[500px] p-6 flex flex-col space-y-6">
           <Skeleton className="h-6 w-48 bg-zinc-800" />
           <div className="space-y-4 flex-1">
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex justify-between items-center">
                 <Skeleton className="h-10 w-1/2 bg-zinc-800 rounded-lg" />
                 <Skeleton className="h-10 w-1/4 bg-zinc-800 rounded-lg" />
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center">
        <Skeleton className="h-6 w-48 bg-zinc-800" />
        <Skeleton className="h-8 w-64 bg-zinc-800 rounded-full hidden sm:block" />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between pb-4 border-b border-zinc-800">
            <Skeleton className="h-4 w-24 bg-zinc-800" />
            <Skeleton className="h-4 w-24 bg-zinc-800 hidden sm:block" />
            <Skeleton className="h-4 w-24 bg-zinc-800 hidden md:block" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex justify-between py-2">
              <Skeleton className="h-5 w-32 bg-zinc-800" />
              <Skeleton className="h-5 w-24 bg-zinc-800 hidden sm:block" />
              <Skeleton className="h-5 w-32 bg-zinc-800 hidden md:block" />
              <Skeleton className="h-5 w-20 bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
