use std::path::PathBuf;

pub struct Config {
    pub neo4j_uri: String,
    pub workspace: PathBuf,
    pub workspace_lite: PathBuf,
    pub sync_state_path: PathBuf,
    pub sync_interval_secs: u64,
    pub debounce_ms: u64,
    pub graph_files: Vec<&'static str>,
}

impl Config {
    pub fn from_env() -> Self {
        let home = dirs::home_dir().expect("HOME not set");
        let openclaw = home.join(".openclaw");
        Config {
            neo4j_uri: std::env::var("NEO4J_URI")
                .unwrap_or_else(|_| "bolt://localhost:7687".into()),
            workspace: openclaw.join("workspace"),
            workspace_lite: openclaw.join("workspace-lite"),
            sync_state_path: openclaw.join(".neo4j-sync-state.json"),
            sync_interval_secs: 60,
            debounce_ms: 500,
            graph_files: vec!["SOUL.md", "AGENTS.md", "TOOLS.md", "MEMORY.md", "USER.md"],
        }
    }

    /// Returns workspace directories that exist on disk.
    pub fn active_workspaces(&self) -> Vec<&PathBuf> {
        [&self.workspace, &self.workspace_lite]
            .into_iter()
            .filter(|p| p.exists())
            .collect()
    }
}
