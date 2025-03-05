import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api'

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
        <h1>Ваши друзья</h1>
        <p>Управляйте списком друзей и следите за их статусом</p>
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
        <h2>Список друзей</h2>
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