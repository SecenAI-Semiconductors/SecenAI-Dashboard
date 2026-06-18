import { AdminDashboard } from './AdminDashboard/AdminDashboard'
import { FarmerDashboard } from './FarmerDashboard/FarmerDashboard'

export function Dashboard({ role, onBack }) {
  if (role === 'admin') {
    return <AdminDashboard onBack={onBack} />
  }

  return <FarmerDashboard onBack={onBack} />
}
