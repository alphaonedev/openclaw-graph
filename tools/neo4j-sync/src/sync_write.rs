use regex::Regex;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::config::Config;
use crate::db::Db;
use crate::state::SyncState;

/// Check IDENTITY.md files for changes and sync Name back to Neo4j Soul node.
/// Returns true if any sync occurred.
pub async fn sync_identity(db: &Db, config: &Config) -> bool {
    let candidates = [
        config.workspace.join("IDENTITY.md"),
        config.workspace_lite.join("IDENTITY.md"),
    ];

    let mut state = SyncState::read(&config.sync_state_path);
    let mut synced = false;

    for identity_path in &candidates {
        if !identity_path.exists() {
            continue;
        }

        // Check mtime vs last sync
        let mtime = match std::fs::metadata(identity_path) {
            Ok(stat) => stat
                .modified()
                .ok()
                .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                .map(|d| d.as_secs_f64())
                .unwrap_or(0.0),
            Err(_) => continue,
        };

        if mtime <= state.identity_synced_at {
            continue;
        }

        let content = match std::fs::read_to_string(identity_path) {
            Ok(c) if !c.trim().is_empty() => c,
            _ => continue,
        };

        // Extract name from "Name: <value>" (optionally wrapped in **)
        let name_re = Regex::new(r"(?m)\*?\*?Name:\s*(.+?)\*?\*?\s*$").unwrap();
        let name = match name_re.captures(&content) {
            Some(caps) => caps[1].trim().replace('*', ""),
            None => continue,
        };

        if name.is_empty() {
            continue;
        }

        // Read current Soul Identity content from Neo4j
        let read_cypher = "MATCH (s:Soul {workspace:'openclaw_master_conductor', section:'Identity'}) RETURN s.content AS content";
        let (_, rows) = match db.execute_query(read_cypher).await {
            Ok(r) if !r.1.is_empty() => r,
            _ => continue,
        };

        let current_content = match rows.first().and_then(|r| r.first()) {
            Some(Some(c)) => c.clone(),
            _ => continue,
        };

        // Replace the Name field in the existing content
        let name_field_re = Regex::new(r"Name:\s*[^|]+").unwrap();
        let updated = name_field_re
            .replace(&current_content, &format!("Name: {name} "))
            .to_string();

        // Write back to Neo4j with parameterized query
        let write_cypher = "MATCH (s:Soul {workspace:'openclaw_master_conductor', section:'Identity'}) SET s.content = $content";
        let mut params = HashMap::new();
        params.insert("content", updated);

        match db.execute_write(write_cypher, params).await {
            Ok(_) => {
                tracing::info!("Synced identity to Neo4j: Name = {name}");
                state.identity_synced_at = current_time_secs();
                state.identity_name = Some(name);
                state.write(&config.sync_state_path);
                synced = true;
            }
            Err(e) => {
                tracing::error!("Identity write-back failed: {e}");
            }
        }
    }

    synced
}

fn current_time_secs() -> f64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs_f64()
}
