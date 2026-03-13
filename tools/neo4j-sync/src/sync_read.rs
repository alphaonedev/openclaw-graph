use std::path::Path;

use crate::config::Config;
use crate::db::Db;
use crate::formatter;
use crate::stub;

/// Sync all graph-stub-backed files in one workspace directory.
/// Returns count of files successfully synced.
pub async fn sync_workspace(db: &Db, workspace_dir: &Path, graph_files: &[&str]) -> usize {
    let mut synced = 0;

    for filename in graph_files {
        let file_path = workspace_dir.join(filename);
        if !file_path.exists() {
            continue;
        }

        // Resolve Cypher from file content or .graph-stub sidecar
        let cypher = match stub::resolve_cypher(&file_path) {
            Some(c) => c,
            None => continue,
        };

        // Ensure sidecar exists for future re-resolution
        stub::ensure_stub(&file_path, &cypher);

        // Execute query against Neo4j
        let (keys, rows) = match db.execute_query(&cypher).await {
            Ok(r) if !r.1.is_empty() => r,
            Ok(_) => {
                tracing::warn!("{filename}: Neo4j returned empty");
                continue;
            }
            Err(e) => {
                tracing::error!("{filename}: query failed: {e}");
                continue;
            }
        };

        // Format and write
        let content = formatter::format_csv(&keys, &rows);
        match std::fs::write(&file_path, format!("{content}\n")) {
            Ok(_) => {
                synced += 1;
                tracing::info!("{filename}: {} rows synced", rows.len());
            }
            Err(e) => {
                tracing::error!("{filename}: write failed: {e}");
            }
        }
    }

    synced
}

/// Run full read sync across all active workspaces.
pub async fn sync_all(db: &Db, config: &Config) -> usize {
    let mut total = 0;
    for ws in config.active_workspaces() {
        let ws_name = ws.file_name().unwrap_or_default().to_string_lossy();
        tracing::debug!("[{ws_name}] syncing...");
        total += sync_workspace(db, ws, &config.graph_files).await;
    }
    total
}
