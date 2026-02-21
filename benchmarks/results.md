# Benchmark Results — 2026-02-21 19:09:26 UTC

## Graph Database Stats
| Metric | Value |
|--------|-------|
| Total skills | 312 |
| Clusters | 27 |
| Skills with enriched content | 312 (100%) |
| Skills with vector embeddings | 312 (100%) |
| Embedding model | text-embedding-3-small (1536d) |
| DB size on disk | 20.99 MB |

## Query Latency
| Query | Cold (ms) | Median (ms) |
|-------|-----------|-------------|
| Soul query (workspace) | 0.6 | 1.8 |
| Memory query | 0.6 | 1.5 |
| Tool query | 0.5 | 1.6 |
| Skill text search | 0.4 | 1.1 |
| Skill content (gh-issues) | 0.8 | 1.1 |
| Full skill scan (312) | 2.2 | 2.3 |

## Workspace Stub Compression
| File | Before | After | Reduction |
|------|--------|-------|-----------|
| SOUL.md | ~1,800 bytes | ~164 bytes | 91% |
| MEMORY.md | ~3,500 bytes | ~138 bytes | 96% |
| TOOLS.md | ~8,000 bytes | ~112 bytes | 99% |
| AGENTS.md | ~500 bytes | ~143 bytes | 71% |
| **Total** | **~13,800 bytes** | **604 bytes** | **96%** |

## Skill File Compression
| Skill | Before | After | Reduction |
|-------|--------|-------|-----------|
| gh-issues | 866 lines / ~28,000 bytes | 18 lines / 1031 bytes | 96% |
| skill-creator | 373 lines | 15 lines | 96% |
| coding-agent | 285 lines | 19 lines | 93% |
| healthcheck | 246 lines | 15 lines | 94% |

## Token Savings Per Session
| Scenario | Tokens Saved |
|----------|-------------|
| Workspace context (4 stubs) | ~3,400 |
| Skill bodies (on-demand only) | ~4,800 |
| **Total per session** | **~8,200** |
