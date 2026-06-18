import { useState } from 'react'
import './App.css'
import { HomePage } from './pages/HomePage'
import { Dashboard } from './Dashboard/Dashboard'

function App() {
  const [currentView, setCurrentView] = useState('home')

  if (currentView === 'home') {
    return <HomePage onNavigate={setCurrentView} />
  }

  return (
    <Dashboard
      role={currentView}
      onBack={() => setCurrentView('home')}
    />
  )
}

export default App
