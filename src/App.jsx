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
import { FriendsTab } from './components/FriendsTab'

function App() {
  const [activeTab, setActiveTab] = useState('play')
  const [onlinePlayers] = useState(22302)
  const [loading, setLoading] = useState(true)
  const [appVersion, setAppVersion] = useState('')
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 })
  const [isMouseMoving, setIsMouseMoving] = useState(false)
  
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await invoke('get_app_version');
        setAppVersion(version);
      } catch (error) {
        console.error('Ошибка при получении версии:', error);
        setAppVersion('Неизвестно');
      }
    };
    
    fetchVersion();
    
    const disableContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    
    const disableDevTools = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableDevTools);
    
    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableDevTools);
    };
  }, []);

  useEffect(() => {
    let timeout;
    
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      setIsMouseMoving(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsMouseMoving(false);
      }, 100);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    // Загружаем настройки при старте приложения
    invoke('load_settings').then((settings) => {
      // Устанавливаем тему из настроек
      document.documentElement.setAttribute('data-theme', settings.theme);
    });
  }, []);

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
      case 'friends':
        return <FriendsTab />
      default:
        return <div className="development-notice">
          <h2>В разработке</h2>
          <p>Данный раздел находится в разработке</p>
        </div>
    }
  }

  return (
    <>
      <div 
        className="cursor-glow" 
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          opacity: isMouseMoving ? 0.4 : 0
        }}
      />
      
      {loading ? (
        <SplashScreen onFinished={handleSplashFinished} />
      ) : (
        <div className="app-container">
          <div className="titlebar">
            <div 
              className="titlebar-drag"
              onMouseDown={startDragging}
            >
              Paradise Launcher v{appVersion}
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
