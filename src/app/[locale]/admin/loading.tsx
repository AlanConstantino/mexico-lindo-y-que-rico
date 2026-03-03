export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 w-48 bg-cream/5 rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-cream/5 rounded-xl animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-navy-light/30 border border-cream/5 p-5"
            >
              <div className="h-4 w-24 bg-cream/5 rounded mb-3 animate-pulse" />
              <div className="h-8 w-16 bg-cream/5 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 bg-cream/5 rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-2xl bg-navy-light/30 border border-cream/5 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-cream/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-cream/5 rounded animate-pulse" />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-5 gap-4 p-4 border-b border-cream/5 last:border-0"
            >
              {Array.from({ length: 5 }).map((_, col) => (
                <div
                  key={col}
                  className="h-4 bg-cream/5 rounded animate-pulse"
                  style={{ animationDelay: `${(row * 5 + col) * 30}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
