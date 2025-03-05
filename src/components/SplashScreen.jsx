import { useEffect, useState } from 'react';
import './SplashScreen.css';

export function SplashScreen({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [showingText, setShowingText] = useState(false);
  
  useEffect(() => {
    // Минимальное время отображения - 5 секунд
    const minDisplayTime = 5000;
    const startTime = Date.now();
    
    // Плавно увеличиваем прогресс
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 - prev) / 20;
        return newProgress > 99 ? 100 : newProgress;
      });
    }, 200);
    
    // Показываем текст через небольшую задержку
    setTimeout(() => {
      setShowingText(true);
    }, 600);
    
    // Скрываем экран загрузки после минимального времени
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onFinished();
      }, 500); // Дополнительное время для финальной анимации
    }, Math.max(0, minDisplayTime - (Date.now() - startTime)));
    
    return () => clearInterval(progressInterval);
  }, [onFinished]);
  
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
          Загрузка интерфейса...
        </p>
      </div>
    </div>
  );
} 