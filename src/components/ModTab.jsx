import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api';
import './ModTab.css';

export function ModTab() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMod, setSelectedMod] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, message: 'Проверка соединения...' });
  const [isVisible, setIsVisible] = useState(true);
  
  // Используем ref для отслеживания актуальных запросов
  const activeRequestRef = useRef(null);
  // Добавляем задержку между запросами
  const lastRequestTimeRef = useRef(0);

  // Первая загрузка и обработка видимости компонента
  useEffect(() => {
    // Сбрасываем состояние при первом рендере
    setError(null);
    setLoading(true);
    
    // Генерируем уникальный идентификатор для текущего запроса
    const requestId = Date.now();
    activeRequestRef.current = requestId;
    lastRequestTimeRef.current = requestId;
    
    checkServerConnection(requestId);

    // Обработчик видимости вкладки
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsVisible(true);
        
        // Проверяем, прошла ли секунда с последнего запроса
        const now = Date.now();
        if (now - lastRequestTimeRef.current < 1000) {
          // Если прошло меньше секунды, не делаем запрос
          return;
        }
        
        // Новый requestId для нового запроса
        const newRequestId = now;
        activeRequestRef.current = newRequestId;
        lastRequestTimeRef.current = newRequestId;
        
        checkServerConnection(newRequestId);
      } else {
        setIsVisible(false);
      }
    };

    // Подписываемся на события видимости
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Очистка при размонтировании компонента
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Сбрасываем активный requestId при размонтировании
      activeRequestRef.current = null;
    };
  }, []);

  // Reset image index when selecting a new mod
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedMod]);

  const checkServerConnection = async (requestId) => {
    // Если это не самый последний запрос, прерываем выполнение
    if (activeRequestRef.current !== requestId) return;
    
    // Сбрасываем ошибки перед новой проверкой
    setError(null);
    setLoading(true);
    
    try {
      const status = await invoke('check_server_connection');
      
      // Проверяем, что запрос все еще актуален
      if (activeRequestRef.current !== requestId) return;
      
      setConnectionStatus(status);
      
      if (status.connected) {
        fetchMods(requestId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      // Проверяем, что запрос все еще актуален
      if (activeRequestRef.current !== requestId) return;
      
      setConnectionStatus({ connected: false, message: err.toString() });
      setLoading(false);
    }
  };

  const fetchMods = async (requestId) => {
    // Если это не самый последний запрос, прерываем выполнение
    if (activeRequestRef.current !== requestId) return;
    
    try {
      const modsData = await invoke('get_all_mods');
      
      // Проверяем, что запрос все еще актуален
      if (activeRequestRef.current !== requestId) return;
      
      // Если получили данные, значит соединение точно успешно
      setMods(modsData);
      setConnectionStatus(prev => ({ ...prev, connected: true }));
      setError(null);
    } catch (err) {
      // Проверяем, что запрос все еще актуален
      if (activeRequestRef.current !== requestId) return;
      
      setError(`Ошибка загрузки модов: ${err}`);
    } finally {
      // Проверяем, что запрос все еще актуален
      if (activeRequestRef.current !== requestId) return;
      
      setLoading(false);
    }
  };

  const handleModClick = async (modId) => {
    try {
      const modData = await invoke('get_mod_by_id', { modId });
      setSelectedMod(modData);
    } catch (err) {
      console.error('Ошибка загрузки детальной информации о моде:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedMod(null);
  };

  const handleCloseErrorDialog = () => {
    setError(null);
  };

  const openModLink = async (url) => {
    try {
      await invoke('open_browser', { url });
    } catch (err) {
      console.error('Ошибка при открытии ссылки:', err);
    }
  };

  const nextImage = () => {
    if (selectedMod && selectedMod.media_links && selectedMod.media_links.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % selectedMod.media_links.length);
    }
  };

  const prevImage = () => {
    if (selectedMod && selectedMod.media_links && selectedMod.media_links.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + selectedMod.media_links.length) % selectedMod.media_links.length);
    }
  };

  // Функция для повторной попытки соединения с новым requestId
  const retryConnection = () => {
    // Проверяем, прошла ли секунда с последнего запроса
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 1000) {
      // Если не прошла секунда, показываем временное сообщение
      setError("Пожалуйста, подождите 1 секунду перед повторной попыткой");
      return;
    }
    
    const newRequestId = now;
    activeRequestRef.current = newRequestId;
    lastRequestTimeRef.current = newRequestId;
    checkServerConnection(newRequestId);
  };

  return (
    <div className="mod-tab">
      <div className="mod-header">
        <div className="mod-title-container">
          <h1>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mods-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="url(#modIconGradient)"/>
              <defs>
                <linearGradient id="modIconGradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff"/>
                  <stop offset="1" stopColor="#00e5ff"/>
                </linearGradient>
              </defs>
            </svg>
            Моды
          </h1>
        </div>
        
        <div className={`connection-status ${connectionStatus.connected ? 'connected' : 'disconnected'}`}>
          <div className="status-icon"></div>
          <span className="status-text">{connectionStatus.connected ? 'Соединение установлено' : 'Нет соединения'}</span>
        </div>
      </div>

      {/* Показываем сообщение о соединении только если:
          1. Соединение не установлено
          2. Нет загруженных модов (или они загружаются) */}
      {!connectionStatus.connected && mods.length === 0 && (
        <div className="connection-error">
          <p>{connectionStatus.message}</p>
          <button onClick={retryConnection}>Повторить попытку</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка модов...</p>
        </div>
      ) : (
        <div className="mods-grid">
          {mods.map((mod) => (
            <div className="mod-card" key={mod.id} onClick={() => handleModClick(mod.id)}>
              <div className="mod-image">
                {mod.media_links && mod.media_links.length > 0 ? (
                  <img src={mod.media_links[0]} alt={mod.name} />
                ) : (
                  <div className="placeholder-image">Нет изображения</div>
                )}
              </div>
              <div className="mod-info">
                <h3>{mod.name}</h3>
                <p>{mod.description ? mod.description.substring(0, 100) + '...' : 'Нет описания'}</p>
              </div>
              <button className="view-details-button">Подробнее</button>
            </div>
          ))}
        </div>
      )}

      {selectedMod && (
        <div className="mod-modal-overlay" onClick={handleCloseModal}>
          <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={handleCloseModal}>×</button>
            
            {selectedMod.media_links && selectedMod.media_links.length > 0 && (
              <div className="mod-gallery">
                <img 
                  src={selectedMod.media_links[currentImageIndex]} 
                  alt={selectedMod.name} 
                  className="main-mod-image" 
                />
                
                {selectedMod.media_links.length > 1 && (
                  <div className="gallery-controls">
                    <button className="gallery-control prev" onClick={prevImage}>❮</button>
                    <button className="gallery-control next" onClick={nextImage}>❯</button>
                    <div className="gallery-indicators">
                      {selectedMod.media_links.map((_, index) => (
                        <span 
                          key={index} 
                          className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mod-modal-content">
              <h2>{selectedMod.name}</h2>
              <div className="mod-description">
                <p>{selectedMod.description || 'Нет описания'}</p>
              </div>
              
              <button className="download-mod-button" onClick={() => openModLink(selectedMod.link)}>
                Скачать мод
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Диалоговое окно с ошибкой */}
      {error && (
        <div className="error-dialog-overlay" onClick={handleCloseErrorDialog}>
          <div className="error-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon-container">
              <div className="error-icon">!</div>
            </div>
            <h2>Ошибка</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={retryConnection}>Повторить</button>
              <button onClick={handleCloseErrorDialog}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}