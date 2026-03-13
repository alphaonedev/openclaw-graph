use neo4rs::{query, Graph};
use regex::Regex;
use std::collections::HashMap;

/// Wrapper around a persistent neo4rs connection.
pub struct Db {
    graph: Graph,
}

impl Db {
    /// Connect to Neo4j. Auth disabled — pass empty creds.
    pub async fn new(uri: &str) -> Result<Self, neo4rs::Error> {
        let graph = Graph::new(uri, "", "").await?;
        Ok(Db { graph })
    }

    /// Ping Neo4j with `RETURN 1` to verify connectivity.
    pub async fn verify(&self) -> Result<(), neo4rs::Error> {
        let mut result = self.graph.execute(query("RETURN 1 AS n")).await?;
        let _row = result.next().await?;
        Ok(())
    }

    /// Execute a read-only Cypher query.
    /// Returns (column_names, rows) where each cell is Option<String>.
    /// Column names are extracted from the RETURN clause of the Cypher query
    /// (neo4rs 0.8 Row doesn't expose keys publicly).
    pub async fn execute_query(
        &self,
        cypher: &str,
    ) -> Result<(Vec<String>, Vec<Vec<Option<String>>>), neo4rs::Error> {
        let keys = parse_return_columns(cypher);
        let mut result = self.graph.execute(query(cypher)).await?;

        let mut rows: Vec<Vec<Option<String>>> = Vec::new();
        while let Some(row) = result.next().await? {
            let mut vals = Vec::with_capacity(keys.len());
            for key in &keys {
                vals.push(extract_value(&row, key));
            }
            rows.push(vals);
        }

        Ok((keys, rows))
    }

    /// Execute a write query with a single string parameter.
    pub async fn execute_write(
        &self,
        cypher: &str,
        params: HashMap<&str, String>,
    ) -> Result<(), neo4rs::Error> {
        let mut q = query(cypher);
        for (k, v) in params {
            q = q.param(k, v);
        }
        let mut result = self.graph.execute(q).await?;
        // Drain the stream to ensure the write executes
        while result.next().await?.is_some() {}
        Ok(())
    }
}

/// Extract column aliases from a Cypher RETURN clause.
///
/// Examples:
///   "MATCH ... RETURN s.section AS section, s.content AS content ..."
///     → ["section", "content"]
///   "MATCH ... RETURN m.domain, m.content ORDER BY ..."
///     → ["m.domain", "m.content"]
fn parse_return_columns(cypher: &str) -> Vec<String> {
    // Find the RETURN clause (case-insensitive)
    let upper = cypher.to_uppercase();
    let return_pos = match upper.find("RETURN ") {
        Some(p) => p + 7,
        None => return vec![],
    };

    let after_return = &cypher[return_pos..];

    // Truncate at ORDER BY, LIMIT, SKIP, or end of string
    let end_keywords = Regex::new(r"(?i)\b(ORDER\s+BY|LIMIT|SKIP)\b").unwrap();
    let clause = match end_keywords.find(after_return) {
        Some(m) => &after_return[..m.start()],
        None => after_return,
    };

    // Split by comma, extract alias or raw expression
    clause
        .split(',')
        .map(|part| {
            let trimmed = part.trim();
            // Check for "expr AS alias" pattern (case-insensitive)
            let as_re = Regex::new(r"(?i)\bAS\s+(\w+)\s*$").unwrap();
            if let Some(caps) = as_re.captures(trimmed) {
                caps[1].to_string()
            } else {
                // No AS — use the raw expression (e.g., "s.section" → "s.section")
                trimmed.to_string()
            }
        })
        .filter(|s| !s.is_empty())
        .collect()
}

/// Extract a cell value as Option<String>.
fn extract_value(row: &neo4rs::Row, key: &str) -> Option<String> {
    // Try String first (most common for our workspace queries)
    if let Ok(v) = row.get::<String>(key) {
        return Some(v);
    }
    // Try i64
    if let Ok(v) = row.get::<i64>(key) {
        return Some(v.to_string());
    }
    // Try f64
    if let Ok(v) = row.get::<f64>(key) {
        return Some(v.to_string());
    }
    // Try bool
    if let Ok(v) = row.get::<bool>(key) {
        return Some(v.to_string());
    }
    // Null or unsupported type
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_return_with_aliases() {
        let cypher = "MATCH (s:Soul) WHERE s.workspace = 'test' RETURN s.section AS section, s.content AS content ORDER BY s.priority";
        assert_eq!(
            parse_return_columns(cypher),
            vec!["section", "content"]
        );
    }

    #[test]
    fn test_parse_return_without_aliases() {
        let cypher = "MATCH (s:Soul) RETURN s.section, s.content ORDER BY s.priority";
        assert_eq!(
            parse_return_columns(cypher),
            vec!["s.section", "s.content"]
        );
    }

    #[test]
    fn test_parse_return_mixed() {
        let cypher = "MATCH (t:OCTool) RETURN t.name AS name, t.notes AS notes ORDER BY t.name";
        assert_eq!(
            parse_return_columns(cypher),
            vec!["name", "notes"]
        );
    }

    #[test]
    fn test_parse_return_with_limit() {
        let cypher = "MATCH (s:Soul) RETURN s.section AS section LIMIT 8";
        assert_eq!(parse_return_columns(cypher), vec!["section"]);
    }
}
