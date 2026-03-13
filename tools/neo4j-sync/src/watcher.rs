use notify::RecursiveMode;
use notify_debouncer_mini::new_debouncer;
use std::path::PathBuf;
use std::time::Duration;
use tokio::sync::mpsc;

/// Events emitted by the file watcher.
#[derive(Debug)]
pub enum WatchEvent {
    IdentityChanged(PathBuf),
}

/// Guard that keeps the watcher alive. Drop to stop watching.
pub struct WatcherGuard {
    _debouncer: notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>,
}

/// Set up file watchers on workspace directories.
/// Returns a guard (must be held alive) and a receiver for watch events.
pub fn setup(
    workspace: &PathBuf,
    workspace_lite: &PathBuf,
    debounce_ms: u64,
) -> (WatcherGuard, mpsc::Receiver<WatchEvent>) {
    let (tx, rx) = mpsc::channel::<WatchEvent>(32);

    let mut debouncer = new_debouncer(
        Duration::from_millis(debounce_ms),
        move |res: Result<Vec<notify_debouncer_mini::DebouncedEvent>, notify::Error>| {
            if let Ok(events) = res {
                for event in events {
                    if is_identity_file(&event.path) {
                        let _ = tx.blocking_send(WatchEvent::IdentityChanged(
                            event.path.clone(),
                        ));
                    }
                }
            }
        },
    )
    .expect("Failed to create file watcher");

    // Watch workspace directories (non-recursive: only top-level files)
    debouncer
        .watcher()
        .watch(workspace.as_path(), RecursiveMode::NonRecursive)
        .expect("Failed to watch workspace");

    if workspace_lite.exists() {
        debouncer
            .watcher()
            .watch(workspace_lite.as_path(), RecursiveMode::NonRecursive)
            .unwrap_or_else(|e| {
                tracing::warn!("Could not watch workspace-lite: {e}");
            });
    }

    tracing::info!(
        "Watching: {} + {}",
        workspace.display(),
        workspace_lite.display()
    );

    let guard = WatcherGuard {
        _debouncer: debouncer,
    };
    (guard, rx)
}

fn is_identity_file(path: &std::path::Path) -> bool {
    path.file_name()
        .and_then(|f| f.to_str())
        .map(|f| f == "IDENTITY.md")
        .unwrap_or(false)
}
