import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/ui/Navbar'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { CompleteProfilePage } from './pages/CompleteProfilePage'
import { FarmerSettingsPage } from './pages/FarmerSettingsPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { AdminDashboard } from './Dashboard/AdminDashboard/AdminDashboard'
import { FarmerManagement } from './Dashboard/AdminDashboard/FarmerManagement/FarmerManagement'
import { FarmerDashboard } from './Dashboard/FarmerDashboard/FarmerDashboard'
import { DronePestDetection } from './Dashboard/FarmerDashboard/DronePestDetection/DronePestDetection'
import { MarketIntelligence } from './Dashboard/FarmerDashboard/MarketIntelligence/MarketIntelligence'
import { WeatherDashboard } from './Dashboard/FarmerDashboard/Weather/WeatherDashboard'
import { CropInsurance } from './Dashboard/FarmerDashboard/CropInsurance/CropInsurance'
import { SoilIntelligence } from './Dashboard/FarmerDashboard/SoilIntelligence/SoilIntelligence'
import { AIAssistant } from './Dashboard/FarmerDashboard/AIAssistant/AIAssistant'
import { CropInsuranceManagement } from './Dashboard/AdminDashboard/CropInsuranceManagement/CropInsuranceManagement'
import { DroneOperations } from './Dashboard/AdminDashboard/DroneOperations/DroneOperations'
import { DiseaseAnalytics } from './Dashboard/AdminDashboard/DiseaseAnalytics/DiseaseAnalytics'
import { CropYieldAnalytics } from './Dashboard/AdminDashboard/CropYieldAnalytics/CropYieldAnalytics'

/**
 * Layout wrapper for authenticated pages - renders the shared Navbar once,
 * then the matched child route below it via <Outlet />.
 */
function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function App() {
  return (
    <Routes>
      {/* Public auth pages (no Navbar) */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Auth-required pages with no Navbar */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route element={<ProtectedRoute role="farmer" />}>
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
        </Route>
      </Route>

      {/* Pages with Navbar */}
      <Route element={<AppLayout />}>
        {/* Public home */}
        <Route path="/" element={<HomePage />} />

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin"                      element={<AdminDashboard />} />
          <Route path="/admin/farmer-management"    element={<FarmerManagement />} />
          <Route path="/admin/crop-insurance"       element={<CropInsuranceManagement />} />
          <Route path="/admin/drone-operations"     element={<DroneOperations />} />
          <Route path="/admin/disease-analytics"    element={<DiseaseAnalytics />} />
          <Route path="/admin/crop-yield-analytics" element={<CropYieldAnalytics />} />
          <Route path="/admin/settings"             element={<AdminSettingsPage />} />
        </Route>

        {/* Farmer-only routes */}
        <Route element={<ProtectedRoute role="farmer" />}>
          <Route path="/farmer"                       element={<FarmerDashboard />} />
          <Route path="/farmer/drone-pest-detection"  element={<DronePestDetection />} />
          <Route path="/farmer/market-intelligence"   element={<MarketIntelligence />} />
          <Route path="/farmer/weather-intelligence"  element={<WeatherDashboard />} />
          <Route path="/farmer/crop-insurance"        element={<CropInsurance />} />
          <Route path="/farmer/soil-intelligence"     element={<SoilIntelligence />} />
          <Route path="/farmer/ai-assistant"          element={<AIAssistant />} />
          <Route path="/farmer/settings"              element={<FarmerSettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
