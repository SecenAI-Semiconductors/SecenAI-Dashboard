import { Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage'
import { AdminDashboard } from './Dashboard/AdminDashboard/AdminDashboard'
import { FarmerManagement } from './Dashboard/AdminDashboard/FarmerManagement/FarmerManagement'
import { FarmerDashboard } from './Dashboard/FarmerDashboard/FarmerDashboard'
import { DronePestDetection } from './Dashboard/FarmerDashboard/DronePestDetection/DronePestDetection'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/farmer-management" element={<FarmerManagement />} />
      <Route path="/farmer" element={<FarmerDashboard />} />
      <Route path="/farmer/drone-pest-detection" element={<DronePestDetection />} />
    </Routes>
  )
}

export default App
