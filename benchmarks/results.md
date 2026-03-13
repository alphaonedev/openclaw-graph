# Neo4j Performance Benchmarks

**Run date:** 2026-03-13 08:39 ET  
**Host:** Apple Silicon, 32 GB RAM  
**DB:** 316 skills · 27 clusters · 217 RELATED_TO · 316 IN_CLUSTER  
**Workspace:** 4 Soul · 2 OCMemory · 9 AgentConfig · 26 OCTool

---

## In-Process Queries (neo4j Python driver)

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| PK lookup — skill by name (warm) | 1.18ms | 1.13ms | 2.05ms | 0.39ms |
| Cluster scan — devops-sre (via SkillCluster) | 0.4ms | 0.31ms | 0.7ms | 0.28ms |
| Full skill scan — 316 nodes | 3.09ms | 3.06ms | 3.33ms | 2.8ms |
| SkillCluster traversal — all clusters | 0.55ms | 0.53ms | 0.62ms | 0.48ms |
| RELATED_TO graph walk (2 hops) | 0.29ms | 0.3ms | 0.3ms | 0.28ms |
| Soul workspace query — default (4 nodes) | 0.23ms | 0.22ms | 0.26ms | 0.2ms |
| OCMemory query — default (2 nodes) | 0.21ms | 0.19ms | 0.31ms | 0.17ms |
| AgentConfig — AGENTS.md hot path (9 nodes) | 0.26ms | 0.26ms | 0.29ms | 0.24ms |
| OCTool query — TOOLS.md hot path (26 nodes) | 0.45ms | 0.4ms | 0.77ms | 0.37ms |

## CLI Subprocess (cypher-shell, GRAPH directive resolution)

> `cypher-shell -a bolt://localhost:7687 --format plain "..."` — cost paid once per 60s TTL per unique query

| Query | avg | p50 | p95 | min |
|-------|-----|-----|-----|-----|
| workspace AGENTS.md (subprocess) | 840.25ms | 835.62ms | 845.29ms | 833.59ms |
| workspace TOOLS.md (subprocess) | 846.99ms | 833.63ms | 853.45ms | 831.82ms |
| workspace Soul default (subprocess) | 843.61ms | 839.98ms | 850.27ms | 836.83ms |

## Rust Sync Daemon (`neo4j-sync` v1.5)

> Long-running Rust binary with persistent Bolt connection and FSEvents file watching.
> Replaces Python polling script — eliminates interpreter startup overhead entirely.

| Metric | Python (v1.4) | Rust (v1.5) | Improvement |
|--------|---------------|-------------|-------------|
| Full sync cycle (8 files, 2 workspaces) | 555ms | 5ms | **111x** |
| Python import overhead (`from neo4j import GraphDatabase`) | 550ms | 0ms | **eliminated** |
| Write-back latency (IDENTITY.md → Neo4j) | up to 60s | <500ms | **120x** |
| Memory (RSS) | ~50 MB | ~4 MB | **12x smaller** |
| Binary size | N/A (interpreter) | 3.8 MB (arm64) | — |
| Neo4j connections per hour | 60 (new each cycle) | 1 (persistent) | **60x fewer** |
| CPU duty cycle (per sync) | 0.9% | <0.01% | — |

### Where the 555ms went (Python profiling)

```
Python interpreter startup:     ~10ms
from neo4j import GraphDatabase: ~540ms  ← 97% of wall time
Neo4j queries (8 files):          ~4ms
File I/O (write .md files):     ~0.5ms
                               ─────────
Total:                          ~555ms
```

The Rust binary eliminates the interpreter startup entirely. With a persistent Bolt connection,
each 60s sync cycle costs only the query + file I/O time (~5ms).

## Key Takeaways

- **Sub-millisecond** for all hot-path workspace queries (AgentConfig: 0.26ms, TOOLS.md: 0.45ms, OCMemory: 0.21ms)
- **3.09ms** for full 316-skill scan — Neo4j keeps the entire corpus in page cache
- **~10 MB** total Neo4j footprint vs 3.2 GB embedded SQLite
- **111x faster** sync cycles with Rust daemon (5ms vs 555ms)
- **<500ms write-back** via FSEvents file watching (vs 60s polling)
- **cypher-shell** subprocess startup amortized by 60s adaptive TTL cache

---

*Previous benchmarks (pre-v1.4): see git history for baseline*
