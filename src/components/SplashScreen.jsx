import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import './SplashScreen.css';

export function SplashScreen({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [showingText, setShowingText] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Загрузка интерфейса...');
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Функция проверки соединения
  const checkConnection = async () => {
    try {
      setStatusMessage('Проверка соединения с сервером...');
      setIsRetrying(true);
      
      const result = await invoke('check_server_connection');
      
      if (result.connected) {
        setStatusMessage('Соединение с сервером установлено');
        setProgress(85);
        setConnectionFailed(false);
        
        // После установки соединения через 2 секунды завершаем загрузку
        setTimeout(() => {
          setProgress(100);
          setTimeout(() => {
            onFinished();
          }, 500);
        }, 2000);
        
      } else {
        setStatusMessage(`Сервер недоступен: ${result.message}`);
        setProgress(70);
        setConnectionFailed(true);
      }
    } catch (error) {
      setStatusMessage('Ошибка проверки соединения');
      setConnectionFailed(true);
      console.error('Connection check error:', error);
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Обработчик нажатия кнопки повтора
  const handleRetry = () => {
    checkConnection();
  };
  
  useEffect(() => {
    // Показываем текст через небольшую задержку
    setTimeout(() => {
      setShowingText(true);
    }, 600);
    
    // Плавно увеличиваем прогресс до 60%
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 60) {
          const newProgress = prev + (60 - prev) / 10;
          return newProgress > 59 ? 60 : newProgress;
        }
        return prev;
      });
    }, 200);
    
    // Выполняем проверку соединения после короткой задержки
    setTimeout(() => {
      checkConnection();
    }, 2000);
    
    return () => clearInterval(progressInterval);
  }, []);
  
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="logo-container">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 512 512" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="splash-logo"
          >
            <path d="M189.895,77.707c6.935-17.31,20.551-31.902,39.134-39.606c18.571-7.7,38.529-7.027,55.667,0.303
              l3.88,23.346l-32.324,42.024l-61.758-6.942" fill="#12f0ff" />
            <path d="M308.109,430.278l-84.374-5.25c21.97-51.163,31.322-106.248,28.021-160.759l-17.246-50.541
              l-11.314-33.176l15.44-69.784l37.11-32.338l28.978,53.172c9.197,24.23,16.145,49.082,20.833,74.256
              C339.503,280.51,333.679,357.971,308.109,430.278z" fill="#00c0db" />
            <g>
              <path d="M256.253,103.772c-21.467-0.897-42.528,5.298-59.989,17.234
                c-15.308,10.465-27.866,25.354-35.484,43.772c-16.313,39.418-5.238,83.346,24.445,110.625c-11.278-0.466-22.651-2.894-33.69-7.451
                c-50.445-20.881-74.424-78.705-53.543-129.162c20.881-50.445,78.705-74.424,129.151-53.543
                C238.182,89.816,247.941,96.141,256.253,103.772z" fill="#12f0ff" />
              <path d="M446.409,145.702c-4.569,11.027-10.895,20.786-18.525,29.097
                c1.674-40.28-21.587-79.16-61.005-95.473c-15.739-6.518-32.207-8.659-48.041-6.996h-0.012c-23.811,2.5-46.188,13.61-62.572,31.441
                c0.466-11.266,2.882-22.651,7.451-33.678c20.881-50.457,78.705-74.436,129.162-53.555c11.804,4.891,22.161,11.804,30.832,20.176
                h0.012C452.078,64.103,462.399,107.061,446.409,145.702z" fill="#12f0ff" />
            </g>
            <path d="M440.482,503.03c-105.597-105.597-276.805-105.597-382.403,0" fill="#00c0db" strokeWidth="2" stroke="#008B9E" strokeLinecap="round" />
          </svg>
          <div className="logo-particles"></div>
        </div>
        
        <h1 className={`splash-title ${showingText ? 'visible' : ''}`}>Paradise</h1>
        
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className={`splash-text ${showingText ? 'visible' : ''}`}>
          {statusMessage}
        </p>
        
        {/* Диалоговое окно для повторного подключения */}
        {connectionFailed && (
          <div className="connection-retry-dialog">
            <span className="error-icon">⚠</span>
            <p>Не удалось подключиться к серверу</p>
            <button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="retry-button"
            >
              {isRetrying ? (
                <>
                  <span className="spinner"></span>
                  Подключение...
                </>
              ) : 'Повторить попытку'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 