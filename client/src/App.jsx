import { Routes, Route, Outlet } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/ui/Navbar'
import { HomePage } from './pages/HomePage'
import { AdminDashboard } from './Dashboard/AdminDashboard/AdminDashboard'
import { FarmerManagement } from './Dashboard/AdminDashboard/FarmerManagement/FarmerManagement'
import { FarmerDashboard } from './Dashboard/FarmerDashboard/FarmerDashboard'
import { DronePestDetection } from './Dashboard/FarmerDashboard/DronePestDetection/DronePestDetection'
import { MarketIntelligence } from './Dashboard/FarmerDashboard/MarketIntelligence/MarketIntelligence'
import { WeatherDashboard } from './Dashboard/FarmerDashboard/Weather/WeatherDashboard'
import { CropInsurance } from './Dashboard/FarmerDashboard/CropInsurance/CropInsurance'
import { SoilIntelligence } from './Dashboard/FarmerDashboard/SoilIntelligence/SoilIntelligence'
import { CropInsuranceManagement } from './Dashboard/AdminDashboard/CropInsuranceManagement/CropInsuranceManagement'
import { DroneOperations } from './Dashboard/AdminDashboard/DroneOperations/DroneOperations'

/**
 * Layout wrapper — renders the shared Navbar once,
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
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/farmer-management" element={<FarmerManagement />} />
        <Route path="/admin/crop-insurance" element={<CropInsuranceManagement />} />
        <Route path="/admin/drone-operations" element={<DroneOperations />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/farmer/drone-pest-detection" element={<DronePestDetection />} />
        <Route path="/farmer/market-intelligence" element={<MarketIntelligence />} />
        <Route path="/farmer/weather-intelligence" element={<WeatherDashboard />} />
        <Route path="/farmer/crop-insurance" element={<CropInsurance />} />
        <Route path="/farmer/soil-intelligence" element={<SoilIntelligence />} />
      </Route>
    </Routes>
  )
}

export default App
