# Neo4j Performance Benchmarks

**Run date:** 2026-03-13 08:03 ET  
**Host:** Apple Silicon, 32 GB RAM  
**DB:** 316 skills · 27 clusters · 217 RELATED_TO · 316 IN_CLUSTER  
**Workspace:** 4 Soul · 2 OCMemory · 9 AgentConfig · 26 OCTool

---

## In-Process Queries (neo4j Python driver)

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| PK lookup — skill by name (warm) | 0.51ms | 0.31ms | 1.54ms | 0.27ms |
| Cluster scan — devops-sre (via SkillCluster) | 0.62ms | 0.46ms | 0.9ms | 0.35ms |
| Full skill scan — 316 nodes | 4.06ms | 3.71ms | 4.93ms | 3.4ms |
| SkillCluster traversal — all clusters | 1.13ms | 0.89ms | 1.49ms | 0.69ms |
| RELATED_TO graph walk (2 hops) | 0.65ms | 0.39ms | 0.63ms | 0.31ms |
| Soul workspace query — default (4 nodes) | 0.45ms | 0.32ms | 0.6ms | 0.26ms |
| OCMemory query — default (2 nodes) | 0.32ms | 0.25ms | 0.54ms | 0.22ms |
| AgentConfig — AGENTS.md hot path (9 nodes) | 0.47ms | 0.35ms | 0.6ms | 0.29ms |
| OCTool query — TOOLS.md hot path (26 nodes) | 0.64ms | 0.53ms | 1.02ms | 0.47ms |

## CLI Subprocess (cypher-shell, GRAPH directive resolution)

> `cypher-shell -a bolt://localhost:7687 --format plain "..."` — cost paid once per 60s TTL per unique query

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| workspace AGENTS.md (subprocess) | 855.34ms | 849.73ms | 850.47ms | 834.07ms |
| workspace TOOLS.md (subprocess) | 849.19ms | 848.27ms | 850.71ms | 843.07ms |
| workspace Soul default (subprocess) | 866.7ms | 860.08ms | 870.34ms | 853.32ms |

## Key Takeaways

- **Sub-millisecond** for all hot-path workspace queries (AgentConfig: 0.47ms, TOOLS.md: 0.64ms, OCMemory: 0.32ms)
- **4.06ms** for full 316-skill scan — Neo4j keeps the entire corpus in page cache
- **~10 MB** total Neo4j footprint vs 3.2 GB embedded SQLite
- **cypher-shell** subprocess startup amortized by 60s adaptive TTL cache

---

*Previous benchmarks (LadybugDB/lbug): see git history for pre-v1.4 baseline*
