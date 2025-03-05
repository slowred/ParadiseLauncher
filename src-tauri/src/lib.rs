mod settings;
mod discord;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
}
