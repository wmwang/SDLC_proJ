import { useState, useEffect } from 'react'
import { AlarmPage } from './components/AlarmPage'
import { WeatherPage } from './components/WeatherPage'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return window.location.hash === '#weather' ? 'weather' : 'alarm'
  })

  useEffect(() => {
    const handleHashChange = () => {
      const tab = window.location.hash === '#weather' ? 'weather' : 'alarm'
      setActiveTab(tab)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <button
          type="button"
          className={`nav-tab ${activeTab === 'alarm' ? 'active' : ''}`}
          onClick={() => handleTabChange('alarm')}
        >
          鬧鐘設定
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => handleTabChange('weather')}
        >
          天氣資訊
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === 'alarm' ? <AlarmPage /> : <WeatherPage />}
      </main>
    </div>
  )
}

export default App
