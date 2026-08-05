/**
 * LoadingSkeleton.jsx
 *
 * Skeleton loaders for the Crop Insurance page.
 * Uses CSS classes from CropInsurance.css.
 * Follows the MarketIntelligence/components/LoadingSkeleton.jsx pattern.
 */

export function SkeletonOverview() {
  return (
    <section className="ci-section ci-skeleton">
      <div className="ci-skel-bar" style={{ height: 22, width: 240, marginBottom: 8 }} />
      <div className="ci-skel-bar" style={{ height: 14, width: 360, marginBottom: 20 }} />
      <div className="ci-stats-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="ci-skel-card ci-skeleton">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div className="ci-skel-bar" style={{ width: 40, height: 40, borderRadius: 10 }} />
              <div className="ci-skel-bar" style={{ height: 12, width: '60%' }} />
            </div>
            <div className="ci-skel-bar" style={{ height: 28, width: '50%' }} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function SkeletonForm() {
  return (
    <section className="ci-section ci-skeleton">
      <div className="ci-skel-bar" style={{ height: 22, width: 280, marginBottom: 8 }} />
      <div className="ci-skel-bar" style={{ height: 14, width: 400, marginBottom: 20 }} />
      <div className="ci-form-layout">
        <div className="ci-skel-card" style={{ flex: 1 }}>
          <div className="ci-skel-bar" style={{ height: 3, width: '100%', marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, padding: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="ci-skel-bar" style={{ height: 10, width: '40%', marginBottom: 8 }} />
                <div className="ci-skel-bar" style={{ height: 38, width: '100%', borderRadius: 8 }} />
              </div>
            ))}
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            <div className="ci-skel-bar" style={{ height: 44, width: 200, borderRadius: 10 }} />
          </div>
        </div>
        <div className="ci-skel-card" style={{ width: 320 }}>
          <div className="ci-skel-bar" style={{ height: 3, width: '100%', marginBottom: 24 }} />
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div className="ci-skel-bar" style={{ width: 44, height: 44, borderRadius: 10 }} />
              <div>
                <div className="ci-skel-bar" style={{ height: 14, width: 140, marginBottom: 6 }} />
                <div className="ci-skel-bar" style={{ height: 10, width: 80 }} />
              </div>
            </div>
            <div className="ci-skel-bar" style={{ height: 40, width: '80%', marginBottom: 20 }} />
            <div className="ci-skel-bar" style={{ height: 14, width: '100%', marginBottom: 10 }} />
            <div className="ci-skel-bar" style={{ height: 14, width: '100%', marginBottom: 10 }} />
            <div className="ci-skel-bar" style={{ height: 14, width: '100%' }} />
          </div>
        </div>
      </div>
    </section>
  )
}

export function SkeletonRequests() {
  return (
    <section className="ci-section ci-skeleton">
      <div className="ci-skel-bar" style={{ height: 22, width: 260, marginBottom: 8 }} />
      <div className="ci-skel-bar" style={{ height: 14, width: 380, marginBottom: 20 }} />
      <div className="ci-requests-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="ci-skel-card ci-skeleton">
            <div className="ci-skel-bar" style={{ height: 3, width: '100%', marginBottom: 16 }} />
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="ci-skel-bar" style={{ width: 32, height: 32, borderRadius: 8 }} />
                  <div>
                    <div className="ci-skel-bar" style={{ height: 14, width: 100, marginBottom: 4 }} />
                    <div className="ci-skel-bar" style={{ height: 10, width: 80 }} />
                  </div>
                </div>
                <div className="ci-skel-bar" style={{ height: 24, width: 70, borderRadius: 20 }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div className="ci-skel-bar" style={{ height: 10, width: '60%', marginBottom: 4 }} />
                  <div className="ci-skel-bar" style={{ height: 14, width: '80%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="ci-skel-bar" style={{ height: 10, width: '60%', marginBottom: 4 }} />
                  <div className="ci-skel-bar" style={{ height: 14, width: '80%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="ci-skel-bar" style={{ height: 10, width: '60%', marginBottom: 4 }} />
                  <div className="ci-skel-bar" style={{ height: 14, width: '80%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(34,120,60,0.06)', paddingTop: 12 }}>
                <div className="ci-skel-bar" style={{ height: 12, width: 120 }} />
                <div className="ci-skel-bar" style={{ height: 12, width: 90 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
