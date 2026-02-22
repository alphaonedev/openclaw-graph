# LadybugDB Performance Benchmarks

**Run date:** 2026-02-22 11:46 EST  
**Host:** Mac mini (Apple M-series, 32 GB RAM)  
**DB:** 316 skills · 27 clusters · 545,072 Reference nodes · 716 docsets  
**Workspace:** 4 Soul · 2 Memory · 9 AgentConfig · 26 Tool

---

## In-Process Queries (lbug embedded engine)

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| PK lookup — skill by id (warm) | 0.18ms | 0.14ms | 0.44ms | 0.12ms |
| Cluster scan — devops-sre (10 skills) | 0.23ms | 0.22ms | 0.25ms | 0.2ms |
| Full skill scan — 316 nodes | 2.02ms | 1.94ms | 2.26ms | 1.83ms |
| Soul workspace query — default (4 nodes) | 0.3ms | 0.26ms | 0.5ms | 0.2ms |
| Memory query — default (2 nodes) | 0.16ms | 0.16ms | 0.17ms | 0.14ms |
| AgentConfig — default AGENTS.md hot path (9 nodes) | 0.33ms | 0.29ms | 0.41ms | 0.26ms |
| Tool query — TOOLS.md hot path (26 nodes) | 0.41ms | 0.38ms | 0.55ms | 0.3ms |
| Reference PK lookup (single node, 545k table) | 0.11ms | 0.11ms | 0.13ms | 0.1ms |
| Reference count aggregate (545k nodes) | 0.25ms | 0.26ms | 0.26ms | 0.25ms |
| Reference source scan — javascript (~12k nodes) | 13.41ms | 13.25ms | 14.16ms | 13.08ms |

## CLI Subprocess (workspace.ts GRAPH directive resolution)

> `execFileAsync(node, [query.js, '--workspace', '--cypher', ...])` — cost paid once per 60s TTL per unique query

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| text search (subprocess, cold) | 110.62ms | 111.06ms | 112.49ms | 108.31ms |
| workspace AGENTS.md (subprocess) | 127.05ms | 107.79ms | 209.2ms | 102.8ms |
| workspace TOOLS.md (subprocess) | 106.08ms | 105.73ms | 110.83ms | 101ms |
| workspace Soul default (subprocess) | 103.96ms | 103.96ms | 107.06ms | 99.99ms |

## Key Takeaways

- **Sub-millisecond** for all hot-path workspace queries (AgentConfig: 0.33ms, TOOLS.md: 0.41ms, Memory: 0.16ms)
- **0.11ms** Reference PK lookup — KuzuDB primary key index unaffected by 545k table size
- **2.02ms** for full 316-skill scan — entire corpus fits comfortably in RAM
- **~100-110ms** CLI subprocess startup — Node.js + lbug init cost; amortized by 60s adaptive TTL cache
- **System76 projection** (96 GB RAM, PCIe 5): DB permanently in page cache; in-process queries expected <0.05ms

---

*Previous benchmarks: see git history for pre-DevDocs-import baseline*
