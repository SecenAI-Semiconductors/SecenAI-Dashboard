/**
 * LoadingSkeleton.jsx
 *
 * Skeleton loaders matching the project's green theme.
 * Uses CSS classes from MarketIntelligence.css.
 */

export function SkeletonCard() {
  return (
    <div className="mi-skel-card mi-skeleton">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="mi-skel-bar" style={{ height: 18, width: '40%' }} />
        <div className="mi-skel-bar" style={{ height: 18, width: 60 }} />
      </div>
      <div className="mi-skel-bar" style={{ height: 32, width: '55%', marginBottom: 14 }} />
      <div className="mi-skel-bar" style={{ height: 12, width: '100%', marginBottom: 8 }} />
      <div className="mi-skel-bar" style={{ height: 12, width: '75%', marginBottom: 8 }} />
      <div className="mi-skel-bar" style={{ height: 12, width: '50%', marginBottom: 14 }} />
      <div style={{ borderTop: '1px solid rgba(34,120,60,0.06)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
        <div className="mi-skel-bar" style={{ height: 10, width: 70 }} />
        <div className="mi-skel-bar" style={{ height: 10, width: 70 }} />
      </div>
    </div>
  )
}

export function SkeletonHero() {
  return (
    <section className="mi-section mi-skeleton">
      <div className="mi-skel-bar" style={{ height: 22, width: 260, marginBottom: 8 }} />
      <div className="mi-skel-bar" style={{ height: 14, width: 380, marginBottom: 20 }} />
      <div className="bsc-grid">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  )
}

export function SkeletonChart() {
  return (
    <section className="mi-section mi-skeleton">
      <div className="mi-skel-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="mi-skel-bar" style={{ height: 18, width: 160 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="mi-skel-bar" style={{ height: 30, width: 56, borderRadius: 8 }} />
            <div className="mi-skel-bar" style={{ height: 30, width: 56, borderRadius: 8 }} />
            <div className="mi-skel-bar" style={{ height: 30, width: 56, borderRadius: 8 }} />
          </div>
        </div>
        <div className="mi-skel-chart-body">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="mi-skel-chart-bar"
              style={{ height: `${25 + Math.random() * 65}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export function SkeletonTable() {
  return (
    <section className="mi-section mi-skeleton">
      <div className="mi-skel-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="mi-skel-bar" style={{ height: 18, width: 140 }} />
          <div className="mi-skel-bar" style={{ height: 34, width: 200, borderRadius: 8 }} />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mi-skel-table-row">
            <div className="mi-skel-bar" style={{ height: 14, flex: 2 }} />
            <div className="mi-skel-bar" style={{ height: 14, flex: 1 }} />
            <div className="mi-skel-bar" style={{ height: 14, flex: 1 }} />
            <div className="mi-skel-bar" style={{ height: 14, width: 70 }} />
            <div className="mi-skel-bar" style={{ height: 14, width: 70 }} />
            <div className="mi-skel-bar" style={{ height: 14, width: 70 }} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function SkeletonAI() {
  return (
    <section className="mi-section mi-skeleton">
      <div className="mi-skel-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="mi-skel-bar" style={{ width: 44, height: 44, borderRadius: 8 }} />
          <div className="mi-skel-bar" style={{ height: 18, width: 180 }} />
        </div>
        <div className="mi-skel-bar" style={{ height: 12, width: '100%', marginBottom: 8 }} />
        <div className="mi-skel-bar" style={{ height: 12, width: '85%' }} />
      </div>
    </section>
  )
}
