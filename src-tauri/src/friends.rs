use std::sync::Mutex;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;
use once_cell::sync::Lazy;

// Структура для представления друга
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Friend {
    pub id: String,
    pub username: String,
    pub online: bool,
}

// Хранилище друзей с возможностью мьютекса для безопасности потоков
static FRIENDS: Lazy<Mutex<HashMap<String, Friend>>> = Lazy::new(|| {
    let map = load_friends_from_file().unwrap_or_default();
    Mutex::new(map)
});

// Путь к файлу с друзьями
fn get_friends_file_path() -> PathBuf {
    let mut path = dirs::data_dir().unwrap_or_default();
    path.push("ParadiseLauncher");
    fs::create_dir_all(&path).ok();
    path.push("friends.json");
    path
}

// Загрузить друзей из файла
fn load_friends_from_file() -> Result<HashMap<String, Friend>, Box<dyn std::error::Error>> {
    let path = get_friends_file_path();
    
    if !path.exists() {
        return Ok(HashMap::new());
    }
    
    let data = fs::read_to_string(path)?;
    let friends: Vec<Friend> = serde_json::from_str(&data)?;
    
    // Преобразуем вектор в хешмапу
    let mut friends_map = HashMap::new();
    for friend in friends {
        friends_map.insert(friend.id.clone(), friend);
    }
    
    Ok(friends_map)
}

// Сохранить друзей в файл
fn save_friends_to_file(friends: &HashMap<String, Friend>) -> Result<(), Box<dyn std::error::Error>> {
    let path = get_friends_file_path();
    let friends_vec: Vec<Friend> = friends.values().cloned().collect();
    let data = serde_json::to_string(&friends_vec)?;
    fs::write(path, data)?;
    Ok(())
}

// Получить всех друзей
pub fn get_friends() -> Vec<Friend> {
    let friends = FRIENDS.lock().unwrap();
    friends.values().cloned().collect()
}

// Добавить друга
pub fn add_friend(username: &str) -> Result<Friend, String> {
    if username.trim().is_empty() {
        return Err("Имя пользователя не может быть пустым".to_string());
    }
    
    let friend_id = uuid::Uuid::new_v4().to_string();
    
    let new_friend = Friend {
        id: friend_id.clone(),
        username: username.to_string(),
        online: false, // По умолчанию не в сети
    };
    
    let mut friends = FRIENDS.lock().unwrap();
    
    // Проверяем, не существует ли уже такой пользователь
    for friend in friends.values() {
        if friend.username.to_lowercase() == username.to_lowercase() {
            return Err("Пользователь с таким именем уже добавлен в друзья".to_string());
        }
    }
    
    friends.insert(friend_id.clone(), new_friend.clone());
    
    // Сохраняем изменения в файл
    if let Err(e) = save_friends_to_file(&friends) {
        return Err(format!("Не удалось сохранить список друзей: {}", e));
    }
    
    Ok(new_friend)
}

// Удалить друга
pub fn remove_friend(friend_id: &str) -> Result<(), String> {
    let mut friends = FRIENDS.lock().unwrap();
    
    if !friends.contains_key(friend_id) {
        return Err("Друг не найден".to_string());
    }
    
    friends.remove(friend_id);
    
    // Сохраняем изменения в файл
    if let Err(e) = save_friends_to_file(&friends) {
        return Err(format!("Не удалось сохранить список друзей: {}", e));
    }
    
    Ok(())
}

// Обновить статус друга
#[allow(dead_code)]
pub fn update_friend_status(friend_id: &str, online: bool) -> Result<Friend, String> {
    let mut friends = FRIENDS.lock().unwrap();
    
    // Находим друга и клонируем его
    let friend_opt = friends.get(friend_id);
    
    if let Some(existing_friend) = friend_opt {
        // Создаем обновленную копию
        let mut updated_friend = existing_friend.clone();
        updated_friend.online = online;
        
        // Обновляем друга в словаре
        friends.insert(friend_id.to_string(), updated_friend.clone());
        
        // Сохраняем изменения в файл
        if let Err(e) = save_friends_to_file(&friends) {
            return Err(format!("Не удалось сохранить список друзей: {}", e));
        }
        
        return Ok(updated_friend);
    } else {
        return Err("Друг не найден".to_string());
    }
}

// Ответ на добавление друга
#[derive(Serialize, Deserialize)]
pub struct AddFriendResponse {
    pub success: bool,
    pub message: Option<String>,
    pub friend: Option<Friend>,
} 