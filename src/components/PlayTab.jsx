import { useState, useEffect, useRef } from 'react';
import { ServerDialog } from './ServerDialog';
import './PlayTab.css';

export function PlayTab() {
  const [activeServer, setActiveServer] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [bannerKey, setBannerKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const cardRefs = useRef({});
  
  useEffect(() => {
    setBannerKey(prev => prev + 1);
  }, []);
  
  const handleMouseMove = (e, serverId) => {
    const card = cardRefs.current[serverId];
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - y) / 10;
    const rotateY = (x - centerX) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  };
  
  const handleMouseLeave = (serverId) => {
    const card = cardRefs.current[serverId];
    if (!card) return;
    
    card.style.transform = 'translateY(-8px)';
    
    setTimeout(() => {
      if (card) card.style.transform = '';
    }, 100);
  };
  
  const servers = [
    { 
      id: 'atlanta', 
      name: 'Atlanta', 
      status: 'online', 
      category: 'beginner',
      description: 'Идеальный старт вашего путешествия. Усиленная защита от вредителей и дружелюбное сообщество.',
      players: 1245, 
      maxPlayers: 2000,
      rating: 4.9 
    },
    { 
      id: 'detroit', 
      name: 'Detroit', 
      status: 'online', 
      category: 'recent',
      description: 'Промышленный рай с продвинутой экономикой. Богатые месторождения и оживленные города.',
      players: 876, 
      maxPlayers: 1500,
      rating: 4.7 
    },
    { 
      id: 'chicago', 
      name: 'Chicago', 
      status: 'online', 
      category: 'all',
      description: 'Классический опыт с повышенным спаунрейтом мобов и динамичным PvP-режимом.',
      players: 623, 
      maxPlayers: 1000,
      rating: 4.5 
    },
    { 
      id: 'vegas', 
      name: 'Las Vegas', 
      status: 'online', 
      category: 'beginner',
      description: 'Развлекательная столица с мини-играми, казино и особыми событиями каждую неделю.',
      players: 1120, 
      maxPlayers: 1500,
      rating: 4.8 
    },
    { 
      id: 'miami', 
      name: 'Miami', 
      status: 'online', 
      category: 'all',
      description: 'Тропический рай с уникальными биомами, экзотическими существами и морскими приключениями.',
      players: 935, 
      maxPlayers: 1200,
      rating: 4.6 
    },
    { 
      id: 'newyork', 
      name: 'New York', 
      status: 'online', 
      category: 'recent',
      description: 'Высокие требования к ресурсам, но впечатляющие возможности для строительства мегаполисов.',
      players: 1022, 
      maxPlayers: 1300,
      rating: 4.7 
    }
  ];
  
  const categories = [
    { id: 'all', name: 'ВСЕ СЕРВЕРА' },
    { id: 'beginner', name: 'СОВЕТУЕМ ДЛЯ НОВИЧКОВ' },
    { id: 'recent', name: 'ЗАХОДИЛИ В ПОСЛЕДНИЙ РАЗ' }
  ];
  
  const filteredServers = activeCategory === 'all' 
    ? servers 
    : servers.filter(server => server.category === activeCategory);

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
      
      <div className="server-categories">
        {categories.map(category => (
          <button 
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="servers-section">
        {filteredServers.map(server => (
          <div 
            key={server.id}
            className={`server-card ${activeServer === server.id ? 'active' : ''}`}
            onClick={() => setActiveServer(server.id)}
            ref={el => cardRefs.current[server.id] = el}
            onMouseMove={(e) => handleMouseMove(e, server.id)}
            onMouseLeave={() => handleMouseLeave(server.id)}
          >
            <div className="server-tag">
              {categories.find(cat => cat.id === server.category)?.name || 'СЕРВЕР'}
            </div>
            <div className="server-info">
              <h3>{server.name}</h3>
              <p className="server-description">{server.description}</p>
              
              <div className="server-stats">
                <div className="stat">
                  <span className="stat-label">Игроки</span>
                  <span className="stat-value">
                    <i className="player-icon-stat"></i>
                    {server.players}/{server.maxPlayers}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Рейтинг</span>
                  <span className="stat-value">{server.rating} <span className="custom-star">★</span></span>
                </div>
              </div>
              
              <div className="server-details">
                <span className={`server-status ${server.status}`}>
                  {server.status}
                </span>
                <span className="server-load">
                  Загрузка: {Math.floor((server.players / server.maxPlayers) * 100)}%
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