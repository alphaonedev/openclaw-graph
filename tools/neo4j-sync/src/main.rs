//! neo4j-sync — Event-driven Neo4j ↔ OpenClaw workspace sync daemon
//!
//! Replaces the Python `neo4j_workspace_sync.py` polling script with a
//! long-running Rust binary. Uses FSEvents for instant IDENTITY.md write-back
//! and periodic refresh for Neo4j → flat file materialization.

mod config;
mod db;
mod formatter;
mod state;
mod stub;
mod sync_read;
mod sync_write;
mod watcher;

use std::sync::Arc;
use tokio::signal::unix::{signal, SignalKind};
use tokio::time::{interval, Duration};
use tracing_subscriber::EnvFilter;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    // ── Initialize logging ─────────────────────────────────────────
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .with_target(false)
        .init();

    let config = Arc::new(config::Config::from_env());

    tracing::info!("neo4j-sync daemon starting");
    tracing::info!("Neo4j: {}", config.neo4j_uri);
    tracing::info!("Workspace: {}", config.workspace.display());

    // ── Establish Neo4j connection ─────────────────────────────────
    let mut db = match db::Db::new(&config.neo4j_uri).await {
        Ok(d) => match d.verify().await {
            Ok(_) => {
                tracing::info!("Neo4j connected");
                Some(d)
            }
            Err(e) => {
                tracing::warn!("Neo4j not reachable: {e}, will retry");
                None
            }
        },
        Err(e) => {
            tracing::warn!("Neo4j driver init failed: {e}, will retry");
            None
        }
    };

    // ── Initial sync ──────────────────────────────────────────────
    if let Some(ref d) = db {
        let t0 = std::time::Instant::now();
        let n = sync_read::sync_all(d, &config).await;
        sync_write::sync_identity(d, &config).await;
        tracing::info!("Initial sync: {n} files in {:?}", t0.elapsed());
    }

    // ── Set up file watcher ───────────────────────────────────────
    let (_watcher_guard, mut watch_rx) =
        watcher::setup(&config.workspace, &config.workspace_lite, config.debounce_ms);

    // ── Set up signal handlers ────────────────────────────────────
    let mut sigterm = signal(SignalKind::terminate()).expect("SIGTERM handler");
    let mut sigint = signal(SignalKind::interrupt()).expect("SIGINT handler");

    // ── Main event loop ───────────────────────────────────────────
    let mut ticker = interval(Duration::from_secs(config.sync_interval_secs));
    ticker.tick().await; // Consume the immediate first tick (already did initial sync)

    tracing::info!(
        "Event loop started (interval={}s, debounce={}ms)",
        config.sync_interval_secs,
        config.debounce_ms
    );

    loop {
        tokio::select! {
            // ── Periodic refresh (every 60s) ──────────────────────
            _ = ticker.tick() => {
                // Attempt reconnect if disconnected
                if db.is_none() {
                    match db::Db::new(&config.neo4j_uri).await {
                        Ok(d) => match d.verify().await {
                            Ok(_) => {
                                tracing::info!("Neo4j reconnected");
                                db = Some(d);
                            }
                            Err(e) => {
                                tracing::debug!("Neo4j still unreachable: {e}");
                            }
                        },
                        Err(e) => {
                            tracing::debug!("Neo4j reconnect failed: {e}");
                        }
                    }
                }

                if let Some(ref d) = db {
                    let t0 = std::time::Instant::now();
                    let n = sync_read::sync_all(d, &config).await;
                    sync_write::sync_identity(d, &config).await;
                    tracing::debug!("Sync cycle: {n} files in {:?}", t0.elapsed());
                }
            }

            // ── File change event (IDENTITY.md) ───────────────────
            Some(event) = watch_rx.recv() => {
                match event {
                    watcher::WatchEvent::IdentityChanged(path) => {
                        tracing::info!("IDENTITY.md changed: {}", path.display());
                        if let Some(ref d) = db {
                            sync_write::sync_identity(d, &config).await;
                        }
                    }
                }
            }

            // ── Graceful shutdown ─────────────────────────────────
            _ = sigterm.recv() => {
                tracing::info!("SIGTERM received, shutting down");
                break;
            }
            _ = sigint.recv() => {
                tracing::info!("SIGINT received, shutting down");
                break;
            }
        }
    }

    tracing::info!("neo4j-sync daemon stopped");
}
