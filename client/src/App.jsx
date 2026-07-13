import { Routes, Route, Outlet } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/ui/Navbar'
import { HomePage } from './pages/HomePage'
import { AdminDashboard } from './Dashboard/AdminDashboard/AdminDashboard'
import { FarmerManagement } from './Dashboard/AdminDashboard/FarmerManagement/FarmerManagement'
import { FarmerDashboard } from './Dashboard/FarmerDashboard/FarmerDashboard'
import { DronePestDetection } from './Dashboard/FarmerDashboard/DronePestDetection/DronePestDetection'

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
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/farmer/drone-pest-detection" element={<DronePestDetection />} />
      </Route>
    </Routes>
  )
}

export default App
