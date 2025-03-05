import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api';
import './NewsTab.css';

export function NewsTab() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const posts = await invoke('get_vk_posts');
      setNews(posts);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="news-loading">Загрузка новостей...</div>;
  }

  return (
    <div className="news-container">
      {news.map((post, index) => (
        <div 
          key={post.id}
          className="news-card"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          {post.attachments?.map((attachment, i) => (
            attachment.photo && (
              <img 
                key={i}
                src={attachment.photo.sizes[0].url}
                alt=""
                className="news-image"
              />
            )
          ))}
          <div className="news-content">
            <p className="news-text">{post.text}</p>
            <span className="news-date">
              {new Date(post.date * 1000).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
