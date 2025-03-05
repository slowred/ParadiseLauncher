import { useState, useEffect } from 'react'
import './ServerDialog.css'
import { invoke } from '@tauri-apps/api'

export function ServerDialog({ server, onClose }) {
  const [isClosing, setIsClosing] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 400) // Увеличиваем время анимации
  }

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await invoke('join_server', { serverId: server.id })
      // После успешного присоединения к серверу
      setTimeout(() => {
        handleClose()
      }, 800)
    } catch (error) {
      setIsJoining(false)
      // Обработка ошибки (можно добавить уведомление)
    }
  }

  return (
    <div className={`dialog-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="server-dialog" onClick={e => e.stopPropagation()}>
        
        <div className="server-dialog-content">
          <div className="server-header">
            <h2>{server.name}</h2>
            <div className="server-status-indicator">
              <div className="status-dot"></div>
              <span className="status-text">Онлайн</span>
            </div>
          </div>

          <div className="server-image">
            <img src={server.image || "https://paradise-rp.ru/images/home/intro/bg.webp"} alt={server.name} />
          </div>

          <div className="server-details">
            <p className="server-description">
              Добро пожаловать на сервер {server.name}! 
              Здесь вы найдете увлекательный геймплей и дружное комьюнити.
            </p>
            
            <div className="server-stats">
              <div className="stat">
                <span className="stat-label">Игроков онлайн</span>
                <span className="stat-value">{server.players || '1,234'}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Рейтинг</span>
                <span className="stat-value">{server.rating || '4.8'} <span className="custom-star">★</span></span>
              </div>
            </div>
          </div>

          <button 
            className="join-button" 
            onClick={handleJoin} 
            disabled={isJoining}
          >
            {isJoining ? 'ПОДКЛЮЧЕНИЕ...' : 'ПРИСОЕДИНИТЬСЯ'}
          </button>
        </div>
      </div>
    </div>
  )
} 