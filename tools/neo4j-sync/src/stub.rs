use std::path::{Path, PathBuf};

const GRAPH_PREFIX: &str = "<!-- GRAPH:";

/// Extract Cypher query from `<!-- GRAPH: <cypher> -->` content.
pub fn extract_graph_directive(content: &str) -> Option<String> {
    let trimmed = content.trim();
    if !trimmed.starts_with(GRAPH_PREFIX) {
        return None;
    }
    let end = trimmed.find("-->")?;
    let cypher = trimmed[GRAPH_PREFIX.len()..end].trim();
    if cypher.is_empty() {
        return None;
    }
    Some(cypher.to_string())
}

/// Resolve the Cypher query for a given .md file.
/// Checks the file content first, then the .graph-stub sidecar.
pub fn resolve_cypher(md_path: &Path) -> Option<String> {
    // Try the .md file itself
    if let Ok(content) = std::fs::read_to_string(md_path) {
        if let Some(cypher) = extract_graph_directive(&content) {
            return Some(cypher);
        }
    }
    // Fall back to sidecar
    let stub = stub_path_for(md_path);
    if let Ok(content) = std::fs::read_to_string(&stub) {
        return extract_graph_directive(&content);
    }
    None
}

/// Create a .graph-stub sidecar if it doesn't already exist.
pub fn ensure_stub(md_path: &Path, cypher: &str) {
    let stub = stub_path_for(md_path);
    if !stub.exists() {
        let content = format!("{GRAPH_PREFIX} {cypher} -->\n");
        let _ = std::fs::write(&stub, content);
    }
}

/// SOUL.md -> SOUL.md.graph-stub
fn stub_path_for(md_path: &Path) -> PathBuf {
    let name = md_path.file_name().unwrap().to_string_lossy();
    md_path.with_file_name(format!("{name}.graph-stub"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_directive() {
        let input = "<!-- GRAPH: MATCH (n) RETURN n -->";
        assert_eq!(
            extract_graph_directive(input),
            Some("MATCH (n) RETURN n".to_string())
        );
    }

    #[test]
    fn test_extract_no_directive() {
        assert_eq!(extract_graph_directive("just markdown"), None);
        assert_eq!(extract_graph_directive(""), None);
    }

    #[test]
    fn test_extract_with_whitespace() {
        let input = "  <!-- GRAPH:   MATCH (s:Soul) RETURN s   -->  ";
        assert_eq!(
            extract_graph_directive(input),
            Some("MATCH (s:Soul) RETURN s".to_string())
        );
    }
}
