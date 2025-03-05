import { useState, useEffect } from 'react'
import './App.css'
import { ActivityStatus } from './components/ActivityStatus'
import { MenuIcon } from './components/MenuIcon'
import { invoke } from '@tauri-apps/api'
import { ServerDialog } from './components/ServerDialog'
import { SettingsTab } from './components/SettingsTab'
import { NewsTab } from './components/NewsTab'
import { Sidebar } from './components/Sidebar'
import { appWindow } from '@tauri-apps/api/window'
import { PlayTab } from './components/PlayTab'
import { SplashScreen } from './components/SplashScreen'
import { DiscordTab } from './components/DiscordTab'

function App() {
  const [activeTab, setActiveTab] = useState('play')
  const [onlinePlayers] = useState(22302)
  const [loading, setLoading] = useState(true)
  
  const handleMinimize = () => {
    invoke('minimize_window')
  }

  const handleClose = () => {
    invoke('close_window')
  }

  const startDragging = () => {
    invoke('start_dragging').catch(e => {
      console.error("Ошибка при вызове start_dragging:", e);
      // Запасной вариант, если команда не сработала
      appWindow.startDragging();
    });
  }

  const handleSplashFinished = () => {
    setLoading(false);
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'play':
        return <PlayTab />
      case 'settings':
        return <SettingsTab />
      case 'news':
        return <NewsTab />
      case 'discord':
        return <DiscordTab />
      default:
        return <div className="development-notice">
          <h2>В разработке</h2>
          <p>Данный раздел находится в разработке</p>
        </div>
    }
  }

  return (
    <>
      {loading ? (
        <SplashScreen onFinished={handleSplashFinished} />
      ) : (
        <div className="app-container">
          <div className="titlebar">
            <div 
              className="titlebar-drag"
              onMouseDown={startDragging}
            >
              Paradise Launcher v2.3.31
            </div>
            <div className="titlebar-controls">
              <button 
                className="titlebar-button minimize" 
                onClick={handleMinimize}
              >
                ─
              </button>
              <button 
                className="titlebar-button close" 
                onClick={handleClose}
              >
                ×
              </button>
            </div>
          </div>

          <div className="app-content">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onlinePlayers={onlinePlayers} 
            />
            
            <main className="main-content">
              {renderContent()}
            </main>
          </div>
        </div>
      )}
    </>
  )
}

export default App
