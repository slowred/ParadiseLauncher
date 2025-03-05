use std::path::Path;
use winreg::enums::*;
use winreg::RegKey;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Settings {
    pub autostart: bool,
    pub minimize_to_tray: bool,
    pub gta_path: String,
    pub theme: String,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            autostart: false,
            minimize_to_tray: true,
            gta_path: String::new(),
            theme: String::from("dark"),
        }
    }
}

pub fn save_settings(settings: &Settings) -> Result<(), Box<dyn std::error::Error>> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let (key, _) = hkcu.create_subkey("SOFTWARE\\ParadiseLauncher")?;
    
    key.set_value("autostart", &(settings.autostart as u32))?;
    key.set_value("minimize_to_tray", &(settings.minimize_to_tray as u32))?;
    key.set_value("gta_path", &settings.gta_path)?;
    key.set_value("theme", &settings.theme)?;
    
    if settings.autostart {
        set_autostart(true)?;
    } else {
        set_autostart(false)?;
    }
    
    Ok(())
}

pub fn load_settings() -> Settings {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    if let Ok(key) = hkcu.open_subkey("SOFTWARE\\ParadiseLauncher") {
        let autostart: u32 = key.get_value("autostart").unwrap_or(0);
        let minimize_to_tray: u32 = key.get_value("minimize_to_tray").unwrap_or(1);
        let gta_path: String = key.get_value("gta_path").unwrap_or_default();
        let theme: String = key.get_value("theme").unwrap_or_default();
        
        Settings {
            autostart: autostart != 0,
            minimize_to_tray: minimize_to_tray != 0,
            gta_path,
            theme,
        }
    } else {
        Settings::default()
    }
}

fn set_autostart(enable: bool) -> Result<(), Box<dyn std::error::Error>> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let path = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run";
    let key = hkcu.open_subkey_with_flags(path, KEY_ALL_ACCESS)?;
    
    if enable {
        let exe_path = std::env::current_exe()?;
        key.set_value("ParadiseLauncher", &exe_path.to_str().unwrap())?;
    } else {
        let _ = key.delete_value("ParadiseLauncher");
    }
    
    Ok(())
}

pub fn validate_gta_path(path: &str) -> bool {
    if path.is_empty() {
        return false;
    }
    
    let gta_exe = Path::new(path).join("GTA5.exe");
    gta_exe.exists()
}

pub fn reset_settings() -> Result<(), Box<dyn std::error::Error>> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    // Удаляем ключ ParadiseLauncher полностью
    let _ = hkcu.delete_subkey_all("SOFTWARE\\ParadiseLauncher")?;
    
    // Удаляем автозапуск
    let path = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run";
    if let Ok(key) = hkcu.open_subkey_with_flags(path, KEY_ALL_ACCESS) {
        let _ = key.delete_value("ParadiseLauncher");
    }
    
    Ok(())
} 