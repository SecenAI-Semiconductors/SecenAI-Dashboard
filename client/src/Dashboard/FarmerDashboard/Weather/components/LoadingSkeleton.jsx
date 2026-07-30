export function LoadingSkeleton() {
  return (
    <div className="skeleton-grid">
      <div className="skeleton-hero glass-card" />
      <div className="skeleton-row">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
      <div className="skeleton-row horizontal-scroll-skeleton">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton-hourly" />
        ))}
      </div>
      <div className="skeleton-row weekly-skeleton">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-weekly" />
        ))}
      </div>
      <div className="skeleton-row">
        <div className="skeleton-chart" />
        <div className="skeleton-chart" />
      </div>
    </div>
  )
}
