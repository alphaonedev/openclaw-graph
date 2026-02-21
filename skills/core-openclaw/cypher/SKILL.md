---
name: cypher
cluster: core-openclaw
description: "Cypher query language: MATCH CREATE MERGE DELETE path expressions BFS/DFS aggregations graph algorithms"
tags: ["cypher","query-language","graph","ladybugdb"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "cypher query graph MATCH CREATE MERGE relationship path ladybugdb"
---

## Purpose
This skill allows OpenClaw to execute Cypher queries for interacting with graph databases, specifically LadybugDB, enabling operations like node matching, relationship creation, and graph traversals.

## When to Use
Use this skill when working with graph-structured data, such as social networks or recommendation systems. For example, query relationships in a user graph or perform BFS on a knowledge base. Avoid it for relational data; opt for SQL-based skills instead.

## Key Capabilities
- Execute core Cypher clauses: MATCH, CREATE, MERGE, DELETE.
- Handle path expressions for traversals (e.g., shortest paths).
- Support BFS/DFS traversals via algorithms like shortestPath().
- Perform aggregations (e.g., COUNT, SUM) on graph data.
- Run graph algorithms such as PageRank or community detection.
- Integrate with LadybugDB for querying nodes and relationships.

## Usage Patterns
To execute a Cypher query via OpenClaw, structure your request as a JSON payload sent to the LadybugDB API endpoint. Always include authentication via the $LADYBUG_API_KEY environment variable. For simple queries, use a single-line invocation; for complex ones, chain clauses like MATCH followed by RETURN.

Example 1: Match all nodes and return their labels.
```cypher
MATCH (n) RETURN n.label LIMIT 10;
```
Invoke it in OpenClaw by: `openclaw execute cypher --query "MATCH (n) RETURN n.label LIMIT 10;" --env $LADYBUG_API_KEY`.

Example 2: Create a relationship between two nodes.
```cypher
MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'}) 
CREATE (a)-[:KNOWS]->(b);
```
Run via OpenClaw: `openclaw execute cypher --query "MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'}) CREATE (a)-[:KNOWS]->(b);" --api-key $LADYBUG_API_KEY`.

## Common Commands/API
Use the LadybugDB API endpoint for queries: POST to https://api.ladybugdb.com/v1/query. Include the Authorization header with Bearer $LADYBUG_API_KEY. CLI flags for OpenClaw: `--query` for the Cypher string, `--env` for environment variables, and `--format json` for output.

To run a query:
```bash
curl -X POST -H "Authorization: Bearer $LADYBUG_API_KEY" \
-H "Content-Type: application/json" \
-d '{"query": "MATCH (n:Person) RETURN n.name"}' \
https://api.ladybugdb.com/v1/query
```
Config format: Queries must be in JSON like {"query": "YOUR_CYPHER_QUERY"}. For aggregations, add clauses like RETURN COUNT(n) AS count. Use MERGE for upsert operations: MERGE (n:Person {name: 'Alice'}).

## Integration Notes
Integrate this skill in OpenClaw by setting $LADYBUG_API_KEY in your environment. For example, export it in a .env file: `LADYBUG_API_KEY=your_key_here`. Ensure LadybugDB is running or accessible via the API. To test, use OpenClaw's invoke command: `openclaw invoke cypher --params '{"query": "MATCH (n) RETURN n"}'`. Handle rate limits by adding a delay between requests, e.g., via OpenClaw's --wait 5 flag.

## Error Handling
Common errors include syntax issues (e.g., missing semicolons) or authentication failures. Check for "Neo4jError: Invalid input" by validating queries first. If authentication fails (HTTP 401), verify $LADYBUG_API_KEY. In code, wrap API calls in try-catch blocks:

```python
try:
    response = requests.post('https://api.ladybugdb.com/v1/query', headers={'Authorization': f'Bearer {os.environ.get("LADYBUG_API_KEY")}'}, json={'query': 'MATCH (n) RETURN n'})
    response.raise_for_status()
except requests.exceptions.HTTPError as e:
    print(f"Error: {e} - Check API key or query syntax.")
```
For graph-specific errors like missing nodes, use OPTIONAL MATCH. Always log errors with details for debugging.

## Graph Relationships
- Nodes: Person, Movie, Organization.
- Relationships: (:Person)-[:KNOWS]-(:Person), (:Person)-[:ACTED_IN]-(:Movie), (:Organization)-[:EMPLOYS]-(:Person).
- Path examples: Shortest path via shortestPath((:Person {name: 'Alice'})-[:KNOWS*]-(:Person {name: 'Bob'})).
- Aggregations: Use on relationships, e.g., RETURN COUNT((:Person)-[:KNOWS]-()) AS connections.
