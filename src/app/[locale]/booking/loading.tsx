export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header skeleton */}
        <div className="text-center mb-10">
          <div className="h-10 w-64 bg-cream/5 rounded-lg mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-48 bg-cream/5 rounded mx-auto animate-pulse" />
        </div>

        {/* Progress steps skeleton */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cream/5 animate-pulse" />
              {i < 3 && <div className="w-8 h-px bg-cream/5" />}
            </div>
          ))}
        </div>

        {/* Calendar skeleton */}
        <div className="rounded-2xl bg-navy-light/30 border border-cream/5 p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-10 rounded-full bg-cream/5 animate-pulse" />
            <div className="h-7 w-40 bg-cream/5 rounded animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-cream/5 animate-pulse" />
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 bg-cream/5 rounded mx-2 animate-pulse" />
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-cream/5 animate-pulse"
                style={{ animationDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="mt-8 space-y-4">
          <div className="h-12 bg-cream/5 rounded-xl animate-pulse" />
          <div className="h-12 bg-cream/5 rounded-xl animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="mt-8 flex justify-end">
          <div className="h-12 w-32 bg-amber/10 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
