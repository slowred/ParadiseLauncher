use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::net::TcpStream;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModData {
    pub id: i32,
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    pub link: String,
    #[serde(alias = "media")]  // Это позволит принимать как "media", так и "media_links"
    pub media_links: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub message: String,
    pub last_check: String,
}

// Глобальное состояние для отслеживания последней попытки подключения
lazy_static::lazy_static! {
    static ref LAST_CONNECTION_ATTEMPT: Arc<Mutex<Instant>> = Arc::new(Mutex::new(Instant::now().checked_sub(Duration::from_secs(1)).unwrap_or_else(Instant::now)));
}

// Глобальная переменная для отслеживания выполнения запроса
lazy_static::lazy_static! {
    static ref FETCH_IN_PROGRESS: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
}

// Проверяет состояние соединения с сервером
pub fn check_server_connection() -> ConnectionStatus {
    let now = Instant::now();
    
    // Проверка, прошло ли 1 секунда с последней попытки
    let mut last_attempt = LAST_CONNECTION_ATTEMPT.lock().unwrap();
    if now.duration_since(*last_attempt).as_secs() < 1 {
        return ConnectionStatus {
            connected: false,
            message: "Пожалуйста, подождите 1 секунду перед повторной попыткой".to_string(),
            last_check: format!("{:?}", now),
        };
    }
    
    // Обновление времени последней попытки
    *last_attempt = now;
    
    // Проверка TCP соединения
    match TcpStream::connect_timeout(&"127.0.0.1:6512".parse().unwrap(), Duration::from_secs(3)) {
        Ok(mut stream) => {
            // Отправляем простую команду для проверки, что сервер отвечает
            println!("Отправка команды PING");
            if let Err(e) = stream.write_all(b"PING\n") {
                return ConnectionStatus {
                    connected: false,
                    message: format!("Ошибка отправки команды: {}", e),
                    last_check: format!("{:?}", now),
                };
            }
            
            // Установка таймаута для чтения
            if let Err(e) = stream.set_read_timeout(Some(Duration::from_secs(3))) {
                return ConnectionStatus {
                    connected: false,
                    message: format!("Ошибка установки таймаута: {}", e),
                    last_check: format!("{:?}", now),
                };
            }
            
            // Чтение ответа
            let mut reader = BufReader::new(stream);
            let mut response = String::new();
            match reader.read_line(&mut response) {
                Ok(_) => {
                    // Обрезаем пробелы и перевод строки
                    let trimmed_response = response.trim();
                    println!("Получен ответ на PING: '{}'", trimmed_response);
                    
                    // Проверяем, что ответ содержит "PONG"
                    if trimmed_response == "PONG" {
                        println!("Соединение успешно установлено, переходим к загрузке модов");
                        return ConnectionStatus {
                            connected: true,
                            message: "Соединение установлено".to_string(),
                            last_check: format!("{:?}", now),
                        };
                    } else if trimmed_response.starts_with("ERROR:") {
                        // Получена ошибка
                        return ConnectionStatus {
                            connected: false,
                            message: format!("Неожиданный ответ: {}", trimmed_response),
                            last_check: format!("{:?}", now),
                        };
                    } else {
                        // Другой ответ
                        return ConnectionStatus {
                            connected: false,
                            message: format!("Неожиданный ответ: {}", trimmed_response),
                            last_check: format!("{:?}", now),
                        };
                    }
                },
                Err(e) => {
                    println!("Ошибка при чтении ответа: {}", e);
                    return ConnectionStatus {
                        connected: false,
                        message: format!("Ошибка чтения ответа: {}", e),
                        last_check: format!("{:?}", now),
                    };
                }
            }
        },
        Err(e) => {
            println!("Ошибка подключения к серверу: {}", e);
            return ConnectionStatus {
                connected: false,
                message: format!("Ошибка соединения: {}", e),
                last_check: format!("{:?}", now),
            };
        }
    }
}

// Получает список всех модов с сервера
pub fn get_all_mods() -> Result<Vec<ModData>, String> {
    let mut stream = TcpStream::connect("127.0.0.1:6512")
        .map_err(|e| format!("Ошибка соединения: {}", e))?;
    
    // Отправка команды на сервер
    stream.write_all(b"GET_ALL_MODS\n")
        .map_err(|e| format!("Ошибка отправки команды: {}", e))?;
    
    // Устанавливаем таймаут на чтение
    stream.set_read_timeout(Some(Duration::from_secs(5)))
        .map_err(|e| format!("Ошибка установки таймаута: {}", e))?;
    
    // Чтение ответа
    let mut reader = BufReader::new(stream);
    let mut response = String::new();
    reader.read_line(&mut response)
        .map_err(|e| format!("Ошибка чтения ответа: {}", e))?;
    
    // Отладочная информация
    println!("Получен ответ от сервера: {}", response);
    
    // Проверка на пустой ответ
    if response.trim().is_empty() {
        return Err("Получен пустой ответ от сервера".to_string());
    }
    
    // Проверка на ошибку в ответе
    if response.starts_with("ERROR:") {
        return Err(response);
    }
    
    // Парсинг JSON-ответа
    match serde_json::from_str::<Vec<ModData>>(&response) {
        Ok(mods) => Ok(mods),
        Err(e) => {
            println!("Ошибка парсинга JSON: {}", e);
            println!("Полученный JSON: {}", response);
            Err(format!("Ошибка парсинга ответа: {}", e))
        }
    }
}

// Получает конкретный мод по ID
pub fn get_mod_by_id(mod_id: i32) -> Result<ModData, String> {
    let mut stream = TcpStream::connect("127.0.0.1:6512")
        .map_err(|e| format!("Ошибка соединения: {}", e))?;
    
    // Отправка команды на сервер
    let command = format!("GET_MOD_BY_ID\n{}\n", mod_id);
    stream.write_all(command.as_bytes())
        .map_err(|e| format!("Ошибка отправки команды: {}", e))?;
    
    // Устанавливаем таймаут на чтение
    stream.set_read_timeout(Some(Duration::from_secs(5)))
        .map_err(|e| format!("Ошибка установки таймаута: {}", e))?;
    
    // Чтение ответа
    let mut reader = BufReader::new(stream);
    let mut response = String::new();
    reader.read_line(&mut response)
        .map_err(|e| format!("Ошибка чтения ответа: {}", e))?;
    
    // Отладочная информация
    println!("Получен ответ от сервера для мода {}: {}", mod_id, response);
    
    // Проверка на пустой ответ
    if response.trim().is_empty() {
        return Err("Получен пустой ответ от сервера".to_string());
    }
    
    // Проверка на ошибку в ответе
    if response.starts_with("ERROR:") {
        return Err(response[6..].trim().to_string());
    }
    
    // Парсинг JSON-ответа
    match serde_json::from_str::<ModData>(&response) {
        Ok(mod_data) => Ok(mod_data),
        Err(e) => {
            println!("Ошибка парсинга JSON: {}", e);
            println!("Полученный JSON: {}", response);
            Err(format!("Ошибка парсинга ответа: {}", e))
        }
    }
}

// Подавляем предупреждение о неиспользуемом коде
#[allow(dead_code)]
pub fn fetch_all_mods() -> Result<Vec<ModData>, String> {
    // Проверяем, не выполняется ли уже запрос
    let mut in_progress = FETCH_IN_PROGRESS.lock().unwrap();
    if *in_progress {
        return Err("Запрос уже выполняется".to_string());
    }
    
    // Устанавливаем флаг выполнения
    *in_progress = true;
    
    // Сохраняем результат выполнения запроса
    let result = fetch_all_mods_impl();
    
    // Сбрасываем флаг выполнения
    *in_progress = false;
    
    result
}

// Подавляем предупреждение о неиспользуемом коде
#[allow(dead_code)]
fn fetch_all_mods_impl() -> Result<Vec<ModData>, String> {
    // Проверяем статус соединения
    let connection_status = check_server_connection();
    
    if !connection_status.connected {
        return Err(format!("Сервер недоступен: {}", connection_status.message));
    }
    
    // Соединение установлено, отправляем запрос на получение модов
    let mut stream = match TcpStream::connect("127.0.0.1:6512") {
        Ok(s) => s,
        Err(e) => return Err(format!("Ошибка соединения: {}", e)),
    };
    
    // Устанавливаем таймаут чтения
    stream.set_read_timeout(Some(Duration::from_secs(5)))
        .map_err(|e| format!("Ошибка установки таймаута: {}", e))?;
        
    // Отправляем команду GET_ALL_MODS
    let command = "GET_ALL_MODS\n";
    if let Err(e) = stream.write(command.as_bytes()) {
        return Err(format!("Ошибка отправки команды: {}", e));
    }
    
    // Читаем ответ
    let mut reader = BufReader::new(stream);
    let mut response = String::new();
    if let Err(e) = reader.read_line(&mut response) {
        return Err(format!("Ошибка чтения ответа: {}", e));
    }
    
    // Парсим JSON-ответ
    match serde_json::from_str::<Vec<ModData>>(&response) {
        Ok(mods) => Ok(mods),
        Err(e) => {
            println!("Полученный JSON: {}", response);
            Err(format!("Ошибка парсинга ответа: {}", e))
        }
    }
}

// Проверка в функции соединения с сервером
pub fn connect_to_server() -> ConnectionStatus {
    let now = Instant::now();
    
    // Проверка, прошло ли 1 секунда с последней попытки
    let mut last_attempt = LAST_CONNECTION_ATTEMPT.lock().unwrap();
    if now.duration_since(*last_attempt).as_secs() < 1 {
        return ConnectionStatus {
            connected: false,
            message: "Пожалуйста, подождите 1 секунду перед повторной попыткой".to_string(),
            last_check: format!("{:?}", now),
        };
    }
    
    // Обновление времени последней попытки
    *last_attempt = now;
    
    // Проверка TCP соединения
    match TcpStream::connect_timeout(&"127.0.0.1:6512".parse().unwrap(), Duration::from_secs(3)) {
        Ok(mut stream) => {
            // Отправляем простую команду для проверки, что сервер отвечает
            println!("Отправка команды PING");
            if let Err(e) = stream.write_all(b"PING\n") {
                return ConnectionStatus {
                    connected: false,
                    message: format!("Ошибка отправки команды: {}", e),
                    last_check: format!("{:?}", now),
                };
            }
            
            // Установка таймаута для чтения
            if let Err(e) = stream.set_read_timeout(Some(Duration::from_secs(3))) {
                return ConnectionStatus {
                    connected: false,
                    message: format!("Ошибка установки таймаута: {}", e),
                    last_check: format!("{:?}", now),
                };
            }
            
            // Чтение ответа
            let mut reader = BufReader::new(stream);
            let mut response = String::new();
            match reader.read_line(&mut response) {
                Ok(_) => {
                    // Обрезаем пробелы и перевод строки
                    let trimmed_response = response.trim();
                    println!("Получен ответ на PING: '{}'", trimmed_response);
                    
                    // Проверяем, что ответ содержит "PONG"
                    if trimmed_response == "PONG" {
                        println!("Соединение успешно установлено, переходим к загрузке модов");
                        return ConnectionStatus {
                            connected: true,
                            message: "Соединение установлено".to_string(),
                            last_check: format!("{:?}", now),
                        };
                    } else if trimmed_response.starts_with("ERROR:") {
                        // Получена ошибка
                        return ConnectionStatus {
                            connected: false,
                            message: format!("Неожиданный ответ: {}", trimmed_response),
                            last_check: format!("{:?}", now),
                        };
                    } else {
                        // Другой ответ
                        return ConnectionStatus {
                            connected: false,
                            message: format!("Неожиданный ответ: {}", trimmed_response),
                            last_check: format!("{:?}", now),
                        };
                    }
                },
                Err(e) => {
                    println!("Ошибка при чтении ответа: {}", e);
                    return ConnectionStatus {
                        connected: false,
                        message: format!("Ошибка чтения ответа: {}", e),
                        last_check: format!("{:?}", now),
                    };
                }
            }
        },
        Err(e) => {
            println!("Ошибка подключения к серверу: {}", e);
            return ConnectionStatus {
                connected: false,
                message: format!("Ошибка соединения: {}", e),
                last_check: format!("{:?}", now),
            };
        }
    }
}