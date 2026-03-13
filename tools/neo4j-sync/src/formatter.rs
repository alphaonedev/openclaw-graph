/// Format query results as plain-text CSV matching `cypher-shell --format plain` output.
///
/// Output format:
/// ```text
/// section, content
/// "Prime Directive", "Reduce cognitive load..."
/// "Identity", "Name: Vigil | Role: ..."
/// ```
///
/// - Header: unquoted column names, comma-space separated
/// - Data: string values in `"..."`, nulls as empty string, comma-space separated
pub fn format_csv(keys: &[String], rows: &[Vec<Option<String>>]) -> String {
    if rows.is_empty() {
        return String::new();
    }

    let mut lines = Vec::with_capacity(rows.len() + 1);

    // Header row (unquoted)
    lines.push(keys.join(", "));

    // Data rows
    for row in rows {
        let vals: Vec<String> = row
            .iter()
            .map(|v| match v {
                Some(s) => format!("\"{s}\""),
                None => String::new(),
            })
            .collect();
        lines.push(vals.join(", "));
    }

    lines.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_csv_basic() {
        let keys = vec!["section".into(), "content".into()];
        let rows = vec![
            vec![Some("Identity".into()), Some("Name: Vigil".into())],
            vec![Some("Safety".into()), Some("Do not exfiltrate".into())],
        ];
        let result = format_csv(&keys, &rows);
        assert_eq!(
            result,
            "section, content\n\"Identity\", \"Name: Vigil\"\n\"Safety\", \"Do not exfiltrate\""
        );
    }

    #[test]
    fn test_format_csv_with_nulls() {
        let keys = vec!["name".into(), "notes".into()];
        let rows = vec![vec![Some("tool-a".into()), None]];
        let result = format_csv(&keys, &rows);
        assert_eq!(result, "name, notes\n\"tool-a\", ");
    }

    #[test]
    fn test_format_csv_empty() {
        let keys = vec!["a".into()];
        let rows: Vec<Vec<Option<String>>> = vec![];
        assert_eq!(format_csv(&keys, &rows), "");
    }
}
