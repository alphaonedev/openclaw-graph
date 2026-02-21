# Performance Benchmarks — openclaw-graph

Measured on Apple Silicon Mac mini (M2 Pro, 16GB RAM), macOS 15.3, Node.js v22.22.0, LadybugDB 0.14.3.

## Workspace Stub Size Reduction

Replacing flat workspace `.md` files with single-line `<!-- GRAPH: -->` directives:

| File | Flat File | Graph Stub | Reduction |
|------|-----------|------------|-----------|
| SOUL.md | 1,800 bytes | 175 bytes | **90%** |
| MEMORY.md | ~5,000–20,000 bytes | 185 bytes | **96–99%** |
| TOOLS.md | ~2,000 bytes | 155 bytes | **92%** |
| AGENTS.md | ~500 bytes | 143 bytes | **71%** |
| **Total** | **~25,000+ bytes** | **~660 bytes** | **97%** |

> The stub size is constant. The flat-file size grows linearly as you add memory entries, tool documentation, and soul sections. At scale, the flat-file approach results in thousands of tokens injected on every session.

## Graph Query Latency

Cold start vs warm (60s cache TTL):

| Query Type | Cold Start | Warm (cached) |
|------------|-----------|---------------|
| Soul query (8 nodes) | ~102ms | 0ms (in-process) |
| Memory query (8 nodes) | ~98ms | 0ms |
| Tool query (23 nodes) | ~95ms | 0ms |
| Skill text search (312 nodes) | ~101ms | ~0ms |
| Skill cluster list (62 nodes) | ~97ms | ~0ms |
| Stats query | ~105ms | ~0ms |

**Key insight:** After the first load per session, all results are served from an in-process JavaScript `Map` cache. Subsequent prompt builds (tool calls, compaction, re-prompts) cost **0ms** for workspace content.

## System Prompt Token Impact

With 312 skills in the graph and workspace content served from graph:

| Scenario | Approx Tokens in System Prompt |
|----------|-------------------------------|
| Default OpenClaw (flat SOUL + full MEMORY) | ~4,000–8,000 tokens |
| openclaw-graph (stubs only, no pre-load) | ~200 tokens (stubs) |
| openclaw-graph (graph resolved, 4 soul + 5 memory) | ~1,800 tokens |
| Delta: tokens saved per session | **~2,200–6,200 tokens** |

> Token savings compound across long sessions and multi-agent deployments. For an 8-instance fleet, this represents ~50,000+ tokens saved per hour.

## Skill Database

| Metric | Value |
|--------|-------|
| Total skills | 312 |
| Clusters | 27 |
| Relationship edges | 247 |
| DB file size (SQLite via lbug) | 10 MB |
| Auth-required skills | 7 (redteam cluster) |
| Community skills (ClaWHub) | 62 |
| Load time (full 312 skills) | ~1.2s (one-time) |
| Query time (text match, 312 nodes) | ~101ms |

## Scalability

LadybugDB (embedded Cypher graph DB) was benchmarked at:

- **312 nodes**: ~95–105ms query latency
- **1,000 nodes** (projected): ~110–130ms (sub-linear growth with property indexes)
- **5,000 nodes** (projected): ~150–200ms

The 60s cache TTL means latency is only paid once per minute per unique query, regardless of how many tool calls or re-prompts occur within a session.

## Hardware Profile

```
Platform:  Apple Silicon (arm64)
Chip:      M2 Pro
RAM:       16 GB
OS:        macOS 15.3 (Darwin 24.3.0)
Node.js:   v22.22.0
lbug:      0.14.3
```

Multi-instance note: The same DB file can be queried by multiple OpenClaw instances simultaneously. LadybugDB uses reader/writer locks — concurrent reads are non-blocking.
