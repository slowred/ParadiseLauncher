mod settings;
mod discord;
mod friends;
mod server_connection;

// Храним глобальный статус соединения и кэш модов
lazy_static::lazy_static! {
    static ref SERVER_STATUS: std::sync::Mutex<Option<server_connection::ConnectionStatus>> = std::sync::Mutex::new(None);
    static ref CONNECTION_CHECKED: std::sync::Mutex<bool> = std::sync::Mutex::new(false);
    static ref MODS_CACHE: std::sync::Mutex<Option<Vec<server_connection::ModData>>> = std::sync::Mutex::new(None);
}

// Функция для получения версии приложения
pub fn get_app_version() -> &'static str {
    "1.0.1"
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Убираем предварительную проверку сервера при старте
    // Теперь проверка будет выполняться только при явном вызове из фронтенда
    
    tauri::Builder::default()
        .setup(|_| {
            #[cfg(debug_assertions)]
            {
                println!("Paradise Launcher started in debug mode");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            crate::commands::minimize_window,
            crate::commands::close_window,
            crate::commands::start_dragging,
            crate::commands::join_server,
            crate::commands::save_settings,
            crate::commands::load_settings,
            crate::commands::validate_gta_path,
            crate::commands::reset_settings,
            crate::commands::get_discord_messages,
            crate::commands::get_friends,
            crate::commands::add_friend,
            crate::commands::remove_friend,
            crate::commands::get_app_version,
            crate::commands::get_app_icon_path,
            // commands for working with server
            crate::commands::check_server_connection,
            crate::commands::get_server_status,
            crate::commands::get_all_mods,
            crate::commands::get_mod_by_id,
            crate::commands::open_browser,
            crate::commands::load_mods,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod commands {
    use tauri::Window;
    use crate::settings::{
        Settings, 
        save_settings as save_settings_to_registry, 
        load_settings as load_settings_from_registry, 
        validate_gta_path as validate_path,
        reset_settings as reset_settings_in_registry
    };
    use crate::discord::{DiscordMessage, get_discord_messages as fetch_discord_messages};
    use crate::friends::{
        Friend,
        get_friends as get_friends_list,
        add_friend as add_new_friend,
        remove_friend as remove_existing_friend,
        AddFriendResponse
    };
    use crate::server_connection::{
        ModData,
        ConnectionStatus,
        check_server_connection as check_connection,
        get_all_mods as fetch_all_mods,
        get_mod_by_id as fetch_mod_by_id,
        check_connection_only
    };
    use std::process::Command;

    #[tauri::command]
    pub async fn minimize_window(window: Window) {
        window.minimize().unwrap();
    }

    #[tauri::command]
    pub async fn close_window(window: Window) {
        window.close().unwrap();
    }

    #[tauri::command]
    pub async fn start_dragging(window: Window) {
        let _ = window.start_dragging();
    }

    #[tauri::command]
    pub async fn join_server(server_id: String) {
        println!("Player attempting to join server: {}", server_id);
    }

    #[tauri::command]
    pub async fn save_settings(settings: Settings) -> Result<(), String> {
        save_settings_to_registry(&settings).map_err(|e| e.to_string())
    }

    #[tauri::command]
    pub async fn load_settings() -> Settings {
        load_settings_from_registry()
    }

    #[tauri::command]
    pub async fn validate_gta_path(path: String) -> bool {
        validate_path(&path)
    }

    #[tauri::command]
    pub async fn reset_settings() -> Result<(), String> {
        reset_settings_in_registry().map_err(|e| e.to_string())
    }

    #[tauri::command]
    pub async fn get_discord_messages(channel_id: String, bot_token: String) -> Result<Vec<DiscordMessage>, String> {
        fetch_discord_messages(&channel_id, &bot_token).await
    }

    #[tauri::command]
    pub async fn get_friends() -> Vec<Friend> {
        get_friends_list()
    }

    #[tauri::command]
    pub async fn add_friend(username: String) -> AddFriendResponse {
        match add_new_friend(&username) {
            Ok(friend) => AddFriendResponse {
                success: true,
                message: None,
                friend: Some(friend),
            },
            Err(error) => AddFriendResponse {
                success: false,
                message: Some(error),
                friend: None,
            },
        }
    }

    #[tauri::command]
    pub async fn remove_friend(friend_id: String) -> Result<(), String> {
        remove_existing_friend(&friend_id)
    }

    #[tauri::command]
    pub async fn get_app_version() -> String {
        crate::get_app_version().to_string()
    }

    #[tauri::command]
    pub async fn get_app_icon_path() -> String {
        // Возвращает относительный путь к иконке в сборке
        "icon.png".to_string()
    }

    // Новые команды для работы с модами
    #[tauri::command]
    pub async fn check_server_connection() -> Result<crate::server_connection::ConnectionStatus, String> {
        // Используем новую функцию, которая только проверяет соединение без загрузки модов
        let status = crate::server_connection::check_connection_only();
        
        // Сохраняем результат в глобальных переменных
        {
            let mut server_status = crate::SERVER_STATUS.lock().unwrap();
            *server_status = Some(status.clone());
        }
        {
            let mut connection_checked = crate::CONNECTION_CHECKED.lock().unwrap();
            *connection_checked = true;
        }
        
        Ok(status)
    }

    #[tauri::command]
    pub async fn get_server_status() -> Result<crate::server_connection::ConnectionStatus, String> {
        let checked;
        let status_option;
        
        {
            checked = *crate::CONNECTION_CHECKED.lock().unwrap();
        }
        
        if checked {
            {
                status_option = crate::SERVER_STATUS.lock().unwrap().clone();
            }
            
            if let Some(status) = status_option {
                return Ok(status);
            }
        }
        
        // Если проверка еще не выполнена или статус не установлен, проверяем заново
        let status = crate::server_connection::check_server_connection();
        
        {
            let mut server_status = crate::SERVER_STATUS.lock().unwrap();
            *server_status = Some(status.clone());
        }
        {
            let mut connection_checked = crate::CONNECTION_CHECKED.lock().unwrap();
            *connection_checked = true;
        }
        
        Ok(status)
    }

    #[tauri::command]
    pub async fn get_all_mods() -> Result<Vec<ModData>, String> {
        // Сначала проверяем кэш
        {
            let mods_cache = crate::MODS_CACHE.lock().unwrap();
            if let Some(mods) = &*mods_cache {
                return Ok(mods.clone());
            }
        }
        
        // Если кэш пуст, загружаем моды с сервера
        fetch_all_mods()
    }

    #[tauri::command]
    pub async fn get_mod_by_id(mod_id: i32) -> Result<ModData, String> {
        fetch_mod_by_id(mod_id)
    }

    // Добавляем команду для открытия ссылок в браузере
    #[tauri::command]
    pub async fn open_browser(url: String) -> Result<(), String> {
        #[cfg(target_os = "windows")]
        {
            Command::new("cmd")
                .args(&["/c", "start", &url])
                .spawn()
                .map_err(|e| format!("Не удалось открыть браузер: {}", e))?;
        }
        
        #[cfg(target_os = "macos")]
        {
            Command::new("open")
                .arg(&url)
                .spawn()
                .map_err(|e| format!("Не удалось открыть браузер: {}", e))?;
        }
        
        #[cfg(target_os = "linux")]
        {
            Command::new("xdg-open")
                .arg(&url)
                .spawn()
                .map_err(|e| format!("Не удалось открыть браузер: {}", e))?;
        }
        
        Ok(())
    }

    #[tauri::command]
    pub async fn load_mods() -> Result<Vec<crate::server_connection::ModData>, String> {
        // Загружаем моды и сохраняем их в глобальной переменной
        let mods = crate::server_connection::get_all_mods()?;
        
        // Сохраняем моды в глобальной переменной для быстрого доступа
        {
            let mut mods_cache = crate::MODS_CACHE.lock().unwrap();
            *mods_cache = Some(mods.clone());
        }
        
        Ok(mods)
    }
}
