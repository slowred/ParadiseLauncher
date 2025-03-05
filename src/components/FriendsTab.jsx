import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api'
import './FriendsTab.css'

export function FriendsTab() {
  const [friends, setFriends] = useState([])
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    setIsLoading(true)
    try {
      const friendsList = await invoke('get_friends')
      setFriends(friendsList)
      setError(null)
    } catch (err) {
      setError('Не удалось загрузить список друзей: ' + err)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const addFriend = async () => {
    if (!username.trim()) return
    
    try {
      const result = await invoke('add_friend', { username: username.trim() })
      if (result.success) {
        setUsername('')
        await loadFriends()
      } else {
        setError(result.message || 'Не удалось добавить пользователя')
      }
    } catch (err) {
      setError('Ошибка при добавлении пользователя: ' + err)
      console.error(err)
    }
  }

  const removeFriend = async (friendId) => {
    try {
      await invoke('remove_friend', { friendId })
      await loadFriends()
    } catch (err) {
      setError('Ошибка при удалении пользователя: ' + err)
      console.error(err)
    }
  }

  return (
    <div className="friends-tab">
      <div className="friends-header">
        <div className="header-text">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 3C14.76 3 13.09 3.81 12 5.09C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.42 2 8.5C2 12.28 5.4 15.36 10.55 20.04L12 21.35L13.45 20.03C18.6 15.36 22 12.28 22 8.5C22 5.42 19.58 3 16.5 3ZM12.1 18.55L12 18.65L11.9 18.55C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5C9.04 5 10.54 5.99 11.07 7.36H12.94C13.46 5.99 14.96 5 16.5 5C18.5 5 20 6.5 20 8.5C20 11.39 16.86 14.24 12.1 18.55Z" fill="currentColor"/>
            </svg>
            Ваши друзья
          </h1>
          <p>Управляйте списком друзей и следите за их статусом</p>
        </div>
      </div>
      
      <div className="add-friend-section">
        <div className="add-friend-form">
          <input 
            type="text" 
            placeholder="Введите имя пользователя" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="friend-input"
          />
          <button onClick={addFriend} className="add-friend-button">
            Добавить друга
          </button>
        </div>
        {error && <div className="friends-error">{error}</div>}
      </div>
      
      <div className="friends-list">
        <h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 12C18.1569 12 19.5 10.6569 19.5 9C19.5 7.34315 18.1569 6 16.5 6C14.8431 6 13.5 7.34315 13.5 9C13.5 10.6569 14.8431 12 16.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7.5 12C9.15685 12 10.5 10.6569 10.5 9C10.5 7.34315 9.15685 6 7.5 6C5.84315 6 4.5 7.34315 4.5 9C4.5 10.6569 5.84315 12 7.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M19.5 15C19.5 16.6569 17.4853 18 15 18H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4.5 15C4.5 16.6569 6.51472 18 9 18H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Друзья
        </h2>
        {isLoading ? (
          <div className="friends-loading">Загрузка списка друзей...</div>
        ) : friends.length > 0 ? (
          friends.map(friend => (
            <div className="friend-item" key={friend.id}>
              <div className="friend-info">
                <div className="friend-name">{friend.username}</div>
                <div className={`friend-status ${friend.online ? 'online' : 'offline'}`}>
                  {friend.online ? 'В сети' : 'Не в сети'}
                </div>
              </div>
              <div className="friend-actions">
                <button 
                  className="remove-friend"
                  onClick={() => removeFriend(friend.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-friends">
            У вас пока нет друзей. Добавьте друзей, чтобы видеть их статус.
          </div>
        )}
      </div>
    </div>
  )
} 