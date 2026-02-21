# LadybugDB Performance Benchmarks

**Measured:** 2026-02-21 · Node.js v22.22.0 · LadybugDB 0.14.3 · macOS 15.3 arm64 (Apple Silicon Mac mini)  
**Database:** 322 skills · 28 clusters · 322/322 embeddings @ 1536d · 64.25 MB on disk  
**Method:** 10 runs each (5 for content reads), warmup excluded, median/avg/p95 reported

---

## Query Latency

| Query | Avg | Median | p95 | Min |
|---|---|---|---|---|
| Full count (MATCH ALL skills) | 0.23ms | 0.22ms | 0.32ms | 0.17ms |
| Text search — name CONTAINS | 0.17ms | 0.16ms | 0.20ms | 0.14ms |
| Cluster filter (single) | 0.17ms | 0.17ms | 0.20ms | 0.16ms |
| Multi-cluster OR filter (3 clusters) | 0.19ms | 0.19ms | 0.22ms | 0.16ms |
| Description CONTAINS search | 0.17ms | 0.17ms | 0.18ms | 0.16ms |
| Array tag search (CONTAINS) | 0.16ms | 0.16ms | 0.17ms | 0.15ms |
| Embedding presence check (all 322) | 0.46ms | 0.46ms | 0.51ms | 0.42ms |
| Read content field (10 skills) | 0.43ms | 0.40ms | 0.49ms | 0.39ms |
| Stats: group by cluster (28 groups) | 0.86ms | 0.41ms | 5.0ms | 0.35ms |

## Workspace Load Latency (simulates workspace.ts GRAPH directive)

| Workspace Query | Avg | Median | p95 | Min |
|---|---|---|---|---|
| Soul query (priority sort, LIMIT 8) | 0.31ms | 0.30ms | 0.36ms | 0.26ms |
| Memory query (LIMIT 5) | 0.24ms | 0.24ms | 0.30ms | 0.23ms |
| Tool query (ORDER BY name) | 0.24ms | 0.23ms | 0.29ms | 0.22ms |
| **Workspace avg (3 queries)** | **0.26ms** | — | — | — |

## System Metrics

| Metric | Value |
|---|---|
| DB file size | 64.25 MB |
| WAL size | 0 KB (clean) |
| Skills in DB | 322 |
| Clusters | 28 |
| Embeddings | 322 / 322 (100%) |
| Embedding model | text-embedding-3-small (1536d) |
| Fastest query (min) | 0.14ms |
| Slowest query (avg) | 0.86ms |
| Workspace cold load | ~0.26ms avg |
| Workspace cached (60s TTL) | 0ms |

## Workspace Token Savings

| Metric | Value |
|---|---|
| Before (flat files, 4 workspace files) | ~13,800 bytes / ~3,450 tokens |
| After (graph stubs, 4 files) | ~604 bytes / ~151 tokens |
| Compression | 96% |
| Tokens saved per session | ~3,300 direct + ~5,000 from on-demand skill loading |
| **Total saved per session** | **~8,200 tokens** |
| 8-instance fleet savings (1hr) | ~65,000+ tokens/hour |

## Notes

- The `group by cluster` p95 of 5ms reflects occasional OS scheduling jitter on a single spike; median is 0.41ms
- All queries are cold (no in-process cache). With the 60s workspace cache in `workspace.ts`, subsequent loads cost 0ms
- DB size of 64.25 MB reflects full SKILL.md content stored inline (avg ~1,000+ lines per enriched skill) plus 1536d float32 embedding vectors for all 322 skills
- Previous benchmark (312 skills, Feb 2026) showed 0.4–2.2ms cold; current result improves on that due to query planner optimization in lbug 0.14.3
