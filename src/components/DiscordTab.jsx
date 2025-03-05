import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api';
import './DiscordTab.css';

export function DiscordTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Храним ID канала Discord 
  const CHANNEL_ID = "1346658628761026570"; // ID вашего канала
  const BOT_TOKEN = "ВАШ_НОВЫЙ_ТОКЕН"; // Замените на ваш новый токен
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // В разработке используем моки
        setMessages(mockMessages);
        
        try {
          const discordMessages = await invoke('get_discord_messages', { 
            channelId: CHANNEL_ID, 
            botToken: BOT_TOKEN 
          });
          setMessages(discordMessages);
        } catch (apiError) {
          console.error('API ошибка:', apiError);
          setError('Не удалось загрузить сообщения с Discord API. Ошибка: ' + apiError);
          setMessages([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при получении сообщений Discord:', err);
        setError('Не удалось загрузить сообщения. Пожалуйста, проверьте подключение к интернету или повторите попытку позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Обновляем сообщения каждые 60 секунд
    const interval = setInterval(fetchMessages, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Форматирование даты в удобный вид
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="discord-tab">
      <div className="discord-header">
        <h2 className="discord-title">
          <svg className="discordTab-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Icons">
              <g>
                <path d="M20.1,20.5a2.3,2.3,0,0,0-2.2,2.4,2.3,2.3,0,0,0,2.2,2.4,2.4,2.4,0,0,0,0-4.8Z" className="discord-logo-center"/>
                <path d="M28,20.5a2.4,2.4,0,1,0,2.2,2.4A2.3,2.3,0,0,0,28,20.5Z" className="discord-logo-center"/>
                <path d="M38.5,2H9.5A4.5,4.5,0,0,0,5,6.5V36.3a4.5,4.5,0,0,0,4.5,4.5H34.1l-1.2-4.1,2.8,2.7,2.6,2.4L43,46V6.5A4.5,4.5,0,0,0,38.5,2ZM30.2,30.7l-1.5-1.8a6.9,6.9,0,0,0,4-2.6,15.1,15.1,0,0,1-2.5,1.3,14.6,14.6,0,0,1-3.2,1,15,15,0,0,1-5.6,0,20.2,20.2,0,0,1-3.2-1l-1.6-.7h-.2c0-.1,0-.1-.1-.1l-.6-.4a6.9,6.9,0,0,0,3.8,2.6l-1.4,1.8a8,8,0,0,1-6.7-3.3,29,29,0,0,1,3.2-12.8,10.3,10.3,0,0,1,6.1-2.3l.2.2a15.4,15.4,0,0,0-5.7,2.9l1.3-.6a12.7,12.7,0,0,1,4.9-1.4h.4a20.6,20.6,0,0,1,4.3,0,16.3,16.3,0,0,1,6.6,2.1,13.5,13.5,0,0,0-5.4-2.8l.3-.3a10.3,10.3,0,0,1,6.1,2.3,29.7,29.7,0,0,1,3.1,12.8S35,30.6,30.2,30.7Z" className="discord-logo-outer"/>
              </g>
            </g>
          </svg>
          Discord сообщения
          <div className="discord-subtitle">Последние обновления сервера</div>
        </h2>
      </div>
      
      <div className="discord-messages-container">
        {loading ? (
          <div className="loading-messages">
            <div className="loading-spinner"></div>
            <p>Загрузка сообщений...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">!</div>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Попробовать снова</button>
          </div>
        ) : messages.length > 0 ? (
          <div className="messages-list">
            {messages.map(message => (
              <div key={message.id} className="message-item">
                <div className="message-author">
                  <img 
                    src={message.author.avatar 
                      ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png` 
                      : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                    alt={message.author.username} 
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <div className="author-name">{message.author.global_name || message.author.username}</div>
                    <div className="message-time">{formatDate(message.timestamp)}</div>
                  </div>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-messages">
            <p>Нет сообщений для отображения</p>
          </div>
        )}
      </div>
      
      <div className="discord-footer">
        <a 
          href="https://discord.gg/paradise" 
          target="_blank" 
          rel="noopener noreferrer"
          className="join-discord-button"
        >
          Присоединиться к Discord
        </a>
      </div>
    </div>
  );
} 