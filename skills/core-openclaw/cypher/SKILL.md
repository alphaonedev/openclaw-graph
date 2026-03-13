---
name: cypher
cluster: core-openclaw
description: "Cypher query language: MATCH CREATE MERGE DELETE path expressions BFS/DFS aggregations graph algorithms"
tags: ["cypher","query-language","graph","neo4j"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "cypher query graph MATCH CREATE MERGE relationship path neo4j"
---

## Purpose
This skill allows OpenClaw to execute Cypher queries for interacting with graph databases, specifically Neo4j, enabling operations like node matching, relationship creation, and graph traversals.

## When to Use
Use this skill when working with graph-structured data, such as social networks or recommendation systems. For example, query relationships in a user graph or perform BFS on a knowledge base. Avoid it for relational data; opt for SQL-based skills instead.

## Key Capabilities
- Execute core Cypher clauses: MATCH, CREATE, MERGE, DELETE.
- Handle path expressions for traversals (e.g., shortest paths).
- Support BFS/DFS traversals via algorithms like shortestPath().
- Perform aggregations (e.g., COUNT, SUM) on graph data.
- Run graph algorithms such as PageRank or community detection.
- Integrate with Neo4j for querying nodes and relationships.

## Usage Patterns
To execute a Cypher query, use `cypher-shell` or the Python `neo4j` driver. Neo4j Community Edition runs on `bolt://localhost:7687` with no authentication by default.

Example 1: Match all nodes and return their labels.
```cypher
MATCH (n) RETURN labels(n), count(n) LIMIT 10;
```
Via CLI: `cypher-shell -a bolt://localhost:7687 --format plain "MATCH (n) RETURN labels(n), count(n) LIMIT 10"`

Example 2: Create a relationship between two nodes.
```cypher
MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
CREATE (a)-[:KNOWS]->(b);
```

## Common Commands/API
Use `cypher-shell` for interactive queries or the Python `neo4j` driver for programmatic access:

```bash
# CLI query
cypher-shell -a bolt://localhost:7687 --format plain "MATCH (n:Skill) RETURN n.name LIMIT 10"
```

```python
# Python neo4j driver
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687")
with driver.session() as session:
    result = session.run("MATCH (n:Skill) RETURN n.name LIMIT 10")
    for record in result:
        print(record["n.name"])
driver.close()
```

Config: Connection via `bolt://localhost:7687`, no auth. Use MERGE for upsert operations: `MERGE (n:Person {name: 'Alice'})`.

## Integration Notes
Integrate this skill in OpenClaw by ensuring Neo4j is running (`brew services start neo4j` on macOS, `systemctl start neo4j` on Linux). Connection defaults to `bolt://localhost:7687` with no authentication. Override via `NEO4J_URI` environment variable if needed.

## Error Handling
Common errors include syntax issues (e.g., missing semicolons) or connection failures. Check for "Neo4jError: Invalid input" by validating queries first. If connection fails, verify Neo4j is running. In code, wrap queries in try-catch blocks:

```python
from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable, CypherSyntaxError

driver = GraphDatabase.driver("bolt://localhost:7687")
try:
    with driver.session() as session:
        result = session.run("MATCH (n) RETURN n LIMIT 5")
        records = list(result)
except ServiceUnavailable:
    print("Error: Neo4j is not running. Start with: brew services start neo4j")
except CypherSyntaxError as e:
    print(f"Cypher syntax error: {e}")
finally:
    driver.close()
```
For graph-specific errors like missing nodes, use OPTIONAL MATCH. Always log errors with details for debugging.

## Graph Relationships
- Nodes: Person, Movie, Organization.
- Relationships: (:Person)-[:KNOWS]-(:Person), (:Person)-[:ACTED_IN]-(:Movie), (:Organization)-[:EMPLOYS]-(:Person).
- Path examples: Shortest path via shortestPath((:Person {name: 'Alice'})-[:KNOWS*]-(:Person {name: 'Bob'})).
- Aggregations: Use on relationships, e.g., RETURN COUNT((:Person)-[:KNOWS]-()) AS connections.
