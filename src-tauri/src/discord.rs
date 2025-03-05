use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordMessage {
    pub id: String,
    pub content: String,
    pub author: DiscordAuthor,
    pub timestamp: String,
    #[serde(default)]
    pub attachments: Vec<DiscordAttachment>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordAuthor {
    pub id: String,
    pub username: String,
    pub avatar: Option<String>,
    pub global_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscordAttachment {
    pub url: String,
    pub filename: String,
}

pub async fn get_discord_messages(channel_id: &str, bot_token: &str) -> Result<Vec<DiscordMessage>, String> {
    // Формируем URL для получения сообщений из канала
    let messages_url = format!(
        "https://discord.com/api/v10/channels/{}/messages?limit=5", 
        channel_id
    );
    
    // Отправляем запрос к API Discord с токеном бота
    let client = reqwest::Client::new();
    let response = client
        .get(&messages_url)
        .header("Authorization", format!("Bot {}", bot_token))
        .send()
        .await
        .map_err(|e| format!("Ошибка при получении сообщений: {}", e))?;
    
    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_else(|_| "Не удалось получить текст ошибки".to_string());
        return Err(format!("Ошибка API Discord: {} - {}", status, error_text));
    }
    
    // Получаем JSON с сообщениями
    let messages: Vec<DiscordMessage> = response
        .json()
        .await
        .map_err(|e| format!("Не удалось разобрать сообщения: {}", e))?;
    
    Ok(messages)
} 