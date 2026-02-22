# LadybugDB Performance Benchmarks

**Run date:** 2026-02-22 00:25 EST  
**Host:** Mac mini (Apple M-series, 32 GB RAM)  
**DB:** 316 skills · 27 clusters · 545,072 Reference nodes · 718 docsets

---

## In-Process Queries (lbug embedded engine)

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| PK lookup — skill by id (warm) | 0.15ms | 0.15ms | 0.24ms | 0.12ms |
| Cluster scan — 10 skills | 0.25ms | 0.25ms | 0.27ms | 0.23ms |
| Full skill scan — 316 nodes | 2.19ms | 2.19ms | 2.32ms | 2.10ms |
| Soul workspace query — 15 nodes | 0.47ms | 0.47ms | 0.53ms | 0.42ms |
| Memory query — 5 nodes | 0.17ms | 0.17ms | 0.23ms | 0.14ms |
| AgentConfig — AGENTS.md hot path (6 nodes) | 0.26ms | 0.26ms | 0.31ms | 0.22ms |
| Tool query — TOOLS.md hot path (25 nodes) | 0.38ms | 0.38ms | 0.52ms | 0.33ms |
| Reference PK lookup (single, 545k table) | **0.11ms** | 0.11ms | 0.13ms | 0.09ms |
| Reference count aggregate (545k nodes) | 0.26ms | 0.26ms | 0.29ms | 0.24ms |
| Reference source scan — ~12k nodes | 1.35ms | 1.36ms | 1.40ms | 1.32ms |

## CLI Subprocess (workspace.ts GRAPH directive resolution)

> `execFileAsync(node, [query.js, '--workspace', '--cypher', ...])` — cost paid once per 60s TTL per unique query

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| Text search (cold process) | 94.29ms | 89.89ms | 103.11ms | 89.87ms |
| Workspace AGENTS.md | 84.36ms | 84.35ms | 84.52ms | 84.25ms |
| Workspace TOOLS.md | 85.01ms | 84.57ms | 88.68ms | 83.04ms |
| Workspace Soul default | 83.23ms | 83.25ms | 84.04ms | 82.46ms |

## Key Takeaways

- **Sub-millisecond** for all hot-path workspace queries (AGENTS.md: 0.26ms, TOOLS.md: 0.38ms, Memory: 0.17ms)
- **0.11ms** Reference PK lookup — KuzuDB primary key index unaffected by 545k table size
- **2.19ms** for full 316-skill scan — entire corpus fits comfortably in RAM
- **~83-85ms** CLI subprocess startup — Node.js + lbug init cost; amortized by 60s adaptive TTL cache
- **System76 projection** (96 GB RAM, PCIe 5): DB permanently in page cache; in-process queries expected <0.05ms

---

*Previous benchmarks: see git history for pre-DevDocs-import baseline*
