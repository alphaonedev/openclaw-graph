# Neo4j Performance Benchmarks

**Run date:** 2026-03-13 10:32 ET  
**Host:** Apple Silicon, 32 GB RAM  
**DB:** 315 skills · 27 clusters · 213 RELATED_TO · 315 IN_CLUSTER  
**Workspace:** 4 Soul · 4 OCMemory · 9 AgentConfig · 29 OCTool

---

## In-Process Queries (neo4j Python driver)

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| PK lookup — skill by name (warm) | 0.41ms | 0.29ms | 0.61ms | 0.25ms |
| Cluster scan — devops-sre (via SkillCluster) | 0.49ms | 0.31ms | 0.56ms | 0.27ms |
| Full skill scan — 315 nodes | 3.39ms | 3.28ms | 3.56ms | 3.11ms |
| SkillCluster traversal — all clusters | 0.81ms | 0.57ms | 1.33ms | 0.51ms |
| RELATED_TO graph walk (2 hops) | 0.54ms | 0.39ms | 0.68ms | 0.25ms |
| Soul workspace query — default (4 nodes) | 0.36ms | 0.25ms | 0.42ms | 0.23ms |
| OCMemory query — default (4 nodes) | 0.28ms | 0.22ms | 0.4ms | 0.19ms |
| AgentConfig — AGENTS.md hot path (9 nodes) | 0.31ms | 0.27ms | 0.33ms | 0.24ms |
| OCTool query — TOOLS.md hot path (29 nodes) | 0.52ms | 0.46ms | 0.61ms | 0.39ms |

## CLI Subprocess (cypher-shell, GRAPH directive resolution)

> `cypher-shell -a bolt://localhost:7687 --format plain "..."` — cost paid once per 60s TTL per unique query

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| workspace AGENTS.md (subprocess) | 840.14ms | 836.03ms | 840.04ms | 835.34ms |
| workspace TOOLS.md (subprocess) | 846.84ms | 845.52ms | 851.0ms | 829.23ms |
| workspace Soul default (subprocess) | 845.77ms | 842.13ms | 847.67ms | 836.55ms |

## Key Takeaways

- **Sub-millisecond** for all hot-path workspace queries (AgentConfig: 0.31ms, TOOLS.md: 0.52ms, OCMemory: 0.28ms)
- **3.39ms** for full 315-skill scan — Neo4j keeps the entire corpus in page cache
- **~10 MB** total Neo4j footprint vs 3.2 GB embedded SQLite
- **cypher-shell** subprocess startup amortized by 60s adaptive TTL cache

---

*Previous benchmarks (pre-v1.4): see git history for baseline*
