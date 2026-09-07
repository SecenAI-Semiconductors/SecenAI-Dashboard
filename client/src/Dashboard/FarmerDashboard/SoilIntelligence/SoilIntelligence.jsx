import { FieldSelector } from './components/FieldSelector'
import { SoilOverview } from './components/SoilOverview'
import { SoilParameterCards } from './components/SoilParameterCards'
import { NPKAnalysis } from './components/NPKAnalysis'
import { SoilMoisture } from './components/SoilMoisture'
import { SoilHealthAnalysis } from './components/SoilHealthAnalysis'
import { NutrientRecommendations } from './components/NutrientRecommendations'
import { FertilizerRecommendation } from './components/FertilizerRecommendation'
import { IrrigationRecommendation } from './components/IrrigationRecommendation'
import { SoilAlerts } from './components/SoilAlerts'
import { AISoilRecommendation } from './components/AISoilRecommendation'
import { SoilTrends } from './components/SoilTrends'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { useSoilData } from './hooks/useSoilData'
import './SoilIntelligence.css'

export function SoilIntelligence() {
  const {
    farmers,
    selectedFarmer,
    selectedFarmerId,
    setSelectedFarmerId,
    farmersLoading,
    currentSoil,
    history,
    soilLoading,
    error,
    health,
    alerts,
    fertilizerRecs,
    aiRec,
    refetch
  } = useSoilData()

  return (
    <div className="si-page" id="soil-intelligence-page">
      <section className="si-content">
        {/* ──── Page Header ──── */}
        <div className="si-page-header">
          <div className="si-page-title-row">
            <span className="si-page-chip">🌱 Smart Soil Management</span>
          </div>
          <h1 className="si-page-title">Soil Intelligence</h1>
          <p className="si-page-subtitle">
            Monitor real-time soil health metrics including pH, moisture, and nutrient levels. 
            Get actionable recommendations to improve your crop yield.
          </p>
        </div>

        {/* ──── Field Selector ──── */}
        <FieldSelector 
          farmers={farmers} 
          selectedFarmerId={selectedFarmerId} 
          onChange={setSelectedFarmerId} 
        />

        {/* ──── Error State ──── */}
        {error && !soilLoading && (
          <div className="si-error-card">
            <div className="si-empty-state">
              <div className="si-error-icon">⚠️</div>
              <div className="si-empty-title">Unable to load soil intelligence data.</div>
              <div className="si-empty-msg">{error}</div>
              <button type="button" onClick={refetch} className="si-retry-btn">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ──── Loading State ──── */}
        {(soilLoading || farmersLoading) && <LoadingSkeleton />}

        {/* ──── Content Sections ──── */}
        {!soilLoading && !farmersLoading && !error && (
          <>
            {!currentSoil ? (
              <div className="si-empty-state-card glass-card">
                <span className="si-empty-icon">🌱</span>
                <h3>No Soil Data Available</h3>
                <p>Soil measurements for this field have not been recorded yet.</p>
              </div>
            ) : (
              <div className="si-dashboard-grid">
                
                {/* Top Section */}
                <SoilOverview 
                  soil={currentSoil} 
                  health={health} 
                  farmerName={selectedFarmer?.fullName} 
                />

                <SoilAlerts alerts={alerts} />

                {/* Main Parameters */}
                <SoilParameterCards soil={currentSoil} />

                <div className="si-two-col">
                  <NPKAnalysis soil={currentSoil} />
                  <div className="si-stacked-col">
                    <SoilMoisture soil={currentSoil} />
                    <SoilHealthAnalysis health={health} />
                  </div>
                </div>

                {/* Recommendations */}
                <div className="si-recs-grid">
                  <div className="si-recs-col">
                    <NutrientRecommendations recs={fertilizerRecs} />
                    <FertilizerRecommendation recs={fertilizerRecs} />
                  </div>
                  <div className="si-recs-col">
                    <IrrigationRecommendation soil={currentSoil} />
                    <AISoilRecommendation aiRec={aiRec} />
                  </div>
                </div>

                {/* Trends */}
                <SoilTrends history={history} />
                
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
