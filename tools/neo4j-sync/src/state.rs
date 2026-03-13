use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Serialize, Deserialize, Default)]
pub struct SyncState {
    #[serde(default)]
    pub identity_synced_at: f64,
    #[serde(default)]
    pub identity_name: Option<String>,
}

impl SyncState {
    pub fn read(path: &Path) -> Self {
        std::fs::read_to_string(path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default()
    }

    pub fn write(&self, path: &Path) {
        if let Ok(json) = serde_json::to_string_pretty(self) {
            let _ = std::fs::write(path, format!("{json}\n"));
        }
    }
}
