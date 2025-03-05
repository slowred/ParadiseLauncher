import { useState, useEffect } from 'react';
import { ServerDialog } from './ServerDialog';
import './PlayTab.css';

export function PlayTab() {
  const [activeServer, setActiveServer] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [bannerKey, setBannerKey] = useState(0);
  
  useEffect(() => {
    setBannerKey(prev => prev + 1);
  }, []);
  
  const servers = [
    { id: 'atlanta', name: 'Atlanta', status: 'online', type: 'СОВЕТУЕМ ДЛЯ НОВИЧКОВ', players: 1245, maxPlayers: 2000 },
    { id: 'detroit', name: 'Detroit', status: 'online', type: 'ЗАХОДИЛИ В ПОСЛЕДНИЙ РАЗ', players: 876, maxPlayers: 1500 },
    { id: 'chicago', name: 'Chicago', status: 'online', type: 'ВСЕ СЕРВЕРА', players: 623, maxPlayers: 1000 },
    { id: 'vegas', name: 'Las Vegas', status: 'online', type: 'ВСЕ СЕРВЕРА', players: 1120, maxPlayers: 1500 },
    { id: 'miami', name: 'Miami', status: 'online', type: 'ВСЕ СЕРВЕРА', players: 935, maxPlayers: 1200 },
    { id: 'newyork', name: 'New York', status: 'online', type: 'ВСЕ СЕРВЕРА', players: 1022, maxPlayers: 1300 }
  ];

  return (
    <>
      <div className="servers-banner" key={bannerKey}>
        <div className="banner-content">
          <h1>Выберите сервер</h1>
          <p>Найдите идеальный мир для ваших приключений</p>
          <div className="banner-stats">
            <div className="banner-stat">
              <span className="stat-number">{servers.reduce((acc, server) => acc + server.players, 0)}</span>
              <span className="stat-label">Игроков онлайн</span>
            </div>
            <div className="banner-stat">
              <span className="stat-number">{servers.length}</span>
              <span className="stat-label">Серверов</span>
            </div>
          </div>
        </div>
        <div className="banner-decoration">
          <div className="glowing-circle"></div>
          <div className="glowing-circle"></div>
          <div className="glowing-circle"></div>
        </div>
      </div>

      <div className="servers-section">
        {servers.map(server => (
          <div 
            key={server.id}
            className={`server-card ${activeServer === server.id ? 'active' : ''}`}
            onClick={() => setActiveServer(server.id)}
          >
            <div className="server-tag">{server.type}</div>
            <div className="server-info">
              <h3>{server.name}</h3>
              <div className="server-details">
                <span className={`server-status ${server.status}`}>
                  {server.status}
                </span>
                <span className="server-players">
                  <i className="player-icon"></i>
                  {server.players}/{server.maxPlayers}
                </span>
              </div>
            </div>
            <div className="server-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${(server.players / server.maxPlayers) * 100}%`}}
                ></div>
              </div>
            </div>
            <button 
              className="play-button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedServer(server);
              }}
            >
              ИГРАТЬ
              <span className="button-glint"></span>
            </button>
          </div>
        ))}
      </div>

      {selectedServer && (
        <ServerDialog 
          server={selectedServer} 
          onClose={() => setSelectedServer(null)} 
        />
      )}
    </>
  );
} 