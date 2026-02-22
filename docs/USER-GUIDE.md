# User Guide — openclaw-graph

> How workspace stubs work, what each node type does, and how to personalize your agent.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Workspace Files](#workspace-files)
- [Node Types](#node-types)
  - [Soul](#soul)
  - [Memory](#memory)
  - [AgentConfig](#agentconfig)
  - [Tool](#tool)
  - [Skill](#skill)
  - [Reference](#reference)
- [GRAPH Directive Specification](#graph-directive-specification)
- [Workspace Loading Flow](#workspace-loading-flow)
- [Customizing Your Workspace](#customizing-your-workspace)
- [Quick Reference — Default Node IDs](#quick-reference--default-node-ids)
- [FAQ](#faq)

---

## Overview

openclaw-graph replaces OpenClaw's flat workspace files (`SOUL.md`, `MEMORY.md`, `TOOLS.md`, `AGENTS.md`) with single-line **stubs** that resolve against an embedded graph database at session start.

| | Before (flat files) | After (graph stubs) |
|--|---------------------|---------------------|
| SOUL.md | ~1,800 bytes of markdown | 144 bytes — one GRAPH directive |
| MEMORY.md | ~5,000+ bytes | 130 bytes |
| TOOLS.md | ~2,000 bytes | 112 bytes |
| AGENTS.md | ~500 bytes | 127 bytes |
| **Total** | **~9,000+ bytes** | **~513 bytes** |

Content is stored as **nodes** in LadybugDB (an embedded graph database). Stubs query the database at runtime and inject the resolved content into your agent's system prompt — exactly as if you'd written it by hand.

---

## How It Works

```
┌──────────────────────────────────────────────────────────┐
│  OpenClaw Session Start                                  │
│                                                          │
│  1. Read ~/.openclaw/workspace/SOUL.md                   │
│  2. Detect <!-- GRAPH: ... --> directive on first line   │
│  3. Execute Cypher query against LadybugDB               │
│  4. Format result as markdown                            │
│  5. Inject into system prompt (as if SOUL.md was flat)   │
│                                                          │
│  Same for MEMORY.md, AGENTS.md, TOOLS.md                 │
└──────────────────────────────────────────────────────────┘
```

From the agent's perspective, nothing changes — it sees the same markdown it always did. The difference is that the content now lives in a queryable graph database instead of hand-maintained files.

---

## Workspace Files

After deploying stubs, your workspace directory looks like this:

```
~/.openclaw/workspace/
├── SOUL.md      → resolves Soul nodes (identity, prime directive, safety)
├── MEMORY.md    → resolves Memory nodes (project facts, infrastructure)
├── AGENTS.md    → resolves AgentConfig nodes (session behavior, delegation)
└── TOOLS.md     → resolves Tool nodes (available tools and usage notes)
```

Each file is a single line:

**SOUL.md:**
```
<!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'openclaw' RETURN s.section AS section, s.content AS content ORDER BY s.priority ASC LIMIT 8 -->
```

**MEMORY.md:**
```
<!-- GRAPH: MATCH (m:Memory) WHERE m.workspace = 'openclaw' RETURN m.domain AS domain, m.content AS content ORDER BY m.domain -->
```

**AGENTS.md:**
```
<!-- GRAPH: MATCH (a:AgentConfig) WHERE a.workspace = 'openclaw' RETURN a.key AS section, a.value AS content ORDER BY a.id -->
```

**TOOLS.md:**
```
<!-- GRAPH: MATCH (t:Tool) WHERE t.available = true RETURN t.name AS name, t.notes AS notes ORDER BY t.name -->
```

---

## Node Types

### Soul

**Purpose:** Defines your agent's identity, core directives, and behavioral boundaries.

**Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | STRING | Unique identifier (e.g., `soul-openclaw-identity`) |
| `workspace` | STRING | Workspace this node belongs to (default: `openclaw`) |
| `section` | STRING | Section heading (e.g., "Prime Directive", "Identity") |
| `content` | STRING | Markdown content for this section |
| `priority` | INT64 | Sort order — lower numbers load first (default: 5) |
| `protected` | BOOLEAN | If `true`, cannot be overwritten by `--reset` (default: `false`) |

**Default nodes (4):**
| Priority | Section | Purpose |
|----------|---------|---------|
| 1 | Prime Directive | Core mission statement — what the agent exists to do |
| 2 | Identity | Agent name, role, emoji, workspace ID |
| 3 | Safety | Behavioral guardrails and constraints |
| 4 | Heartbeat Protocol | Periodic self-check and health reporting format |

**Resolved output format:** `## Section\n\nContent` (standard markdown headings)

---

### Memory

**Purpose:** Stores factual knowledge the agent needs across sessions — who it works for, what infrastructure exists, API keys (as env var references), project state.

**Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | STRING | Unique identifier (e.g., `mem-openclaw-principal`) |
| `workspace` | STRING | Workspace this node belongs to (default: `openclaw`) |
| `domain` | STRING | Category label (e.g., "Principal", "Infrastructure") |
| `content` | STRING | Factual content for this domain |
| `timestamp` | STRING | When this memory was last updated (ISO format) |

**Default nodes (2):**
| Domain | Purpose |
|--------|---------|
| Principal | Who the agent serves — name, timezone, preferred contact channel |
| Infrastructure | Environment facts — DB paths, Node.js location, workspace directory |

Both ship as **placeholders** — you fill in your own details (see [Customizing](#customizing-your-workspace)).

**Resolved output format:** `## Domain\n\nContent`

---

### AgentConfig

**Purpose:** Controls agent session behavior — how it delegates tasks, handles errors, compresses output, validates schemas, and resolves paths.

**Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | STRING | Unique identifier (e.g., `agentcfg-openclaw-delegation`) |
| `workspace` | STRING | Workspace this node belongs to (default: `openclaw`) |
| `key` | STRING | Configuration key (displayed as section heading) |
| `value` | STRING | Configuration value (displayed as content) |

**Default nodes (9):**
| Key | Purpose |
|-----|---------|
| Every Session | Bootstrap instructions — what to read on every session start |
| Delegation | Rules for spawning sub-agents (when to delegate, how many) |
| Safety | Session-level safety behaviors (confirmation thresholds, etc.) |
| Heartbeats | Periodic health check format and interval |
| Memory | How to persist and retrieve memories across sessions |
| Token Optimization — TOON | JSON compression rules for large payloads (30-60% token savings) |
| Search Resilience | Retry and fallback strategies when web_search fails |
| Schema Rules | Output validation requirements for structured data |
| Path Aliases | Compact path notation ($PY, $DB, $WS, etc.) for prompt efficiency |

**Resolved output format:** `- **Key**: Value` (markdown list items)

**Session loading:** In cron/sub-agent sessions, OpenClaw's `MINIMAL_BOOTSTRAP_ALLOWLIST` loads **only** AGENTS.md + TOOLS.md. SOUL.md and MEMORY.md are skipped to reduce prompt size.

---

### Tool

**Purpose:** Declares which tools the agent can use, with usage notes.

**Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | STRING | Unique identifier (e.g., `tool-web-search`) |
| `name` | STRING | Tool name as the agent sees it |
| `available` | BOOLEAN | Whether the tool is currently enabled (default: `true`) |
| `notes` | STRING | Usage notes, restrictions, or tips |

**Default nodes:** 26 tools covering all standard OpenClaw capabilities.

Set `available = false` to disable a tool for a specific agent (e.g., disable `sessions_spawn` for a standalone agent that shouldn't delegate).

**Resolved output format:** `- **Name**: Notes` (markdown list items)

---

### Skill

**Purpose:** The skill graph — 316 skills across 27 clusters representing capabilities an agent can be asked to perform.

**Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | STRING | Unique identifier (e.g., `skill-kubernetes-ops`) |
| `name` | STRING | Human-readable skill name |
| `cluster` | STRING | Skill cluster (e.g., `devops-sre`, `financial`, `python`) |
| `description` | STRING | What this skill does |
| `tags` | STRING[] | Searchable tags |
| `authorization_required` | BOOLEAN | Whether this skill needs explicit user approval |
| `scope` | STRING | Scope category (default: `general`) |
| `model_hint` | STRING | Suggested model for this skill |
| `embedding_hint` | STRING | Semantic search hint text |
| `skill_path` | STRING | Path to skill definition file (if installed) |
| `clawhub_install` | STRING | ClawHub install command (if available) |

Skills are queried via the CLI — they're not loaded into workspace stubs:

```bash
# Search by natural language
node ladybugdb/scripts/query.js "build a SwiftUI watchOS app"

# Filter by cluster
node ladybugdb/scripts/query.js --cluster devops-sre

# Traverse relationships
node ladybugdb/scripts/query.js --skill cloudflare --hops 2
```

---

### Reference

**Purpose:** 545,072 entries from 718 DevDocs docsets — programming language documentation, framework APIs, library references. Available in the **Full** tier only.

References are queried on-demand, not loaded into workspace stubs:

```bash
# Find Python standard library docs
node ladybugdb/scripts/query.js --cypher \
  "MATCH (r:Reference) WHERE r.source = 'python~3.12' AND r.path STARTS WITH 'library/' RETURN r.title, r.path LIMIT 20"
```

---

## GRAPH Directive Specification

### Format

```
<!-- GRAPH: <cypher-query> -->
```

### Rules

1. **Must be the first line** of the workspace file
2. **Must be a single line** — no multi-line Cypher
3. **Must start with** `<!-- GRAPH:` and end with `-->`
4. The Cypher query is extracted and executed via `execFileAsync(node, [query.js, '--workspace', '--cypher', ...])`

### Return column conventions

The output format is determined by the column names returned by your Cypher query:

| Return columns | Output format | Used by |
|---------------|---------------|---------|
| `section` + `content` | `## Section\n\nContent` | SOUL.md |
| `domain` + `content` | `## Domain\n\nContent` | MEMORY.md |
| `key` + `value` | `- **Key**: Value` | AGENTS.md |
| `name` + `notes` | `- **Name**: Notes` | TOOLS.md |
| Other columns | JSON (debug/dev use) | Custom queries |

### Caching

Resolved results are cached with a three-layer strategy:

1. **Disk stub cache** — `workspaceFileCache` keyed by file mtime (if file hasn't changed, skip re-read)
2. **Graph query cache** — `graphQueryCache` with adaptive TTL: `60s × log₁₀(hit_count + 10)`
3. **In-flight deduplication** — `graphQueryInFlight` prevents thundering herd when multiple files resolve simultaneously

In practice, the Cypher query is executed **at most once per 60 seconds** per unique query. Subsequent reads return cached markdown instantly.

---

## Workspace Loading Flow

### Interactive sessions

```
Session Start
  ├── Load SOUL.md     → GRAPH directive → Soul nodes → system prompt
  ├── Load MEMORY.md   → GRAPH directive → Memory nodes → system prompt
  ├── Load AGENTS.md   → GRAPH directive → AgentConfig nodes → system prompt
  └── Load TOOLS.md    → GRAPH directive → Tool nodes → system prompt
```

All four files are loaded. The agent receives the full context.

### Cron / sub-agent sessions

```
Session Start (minimal bootstrap)
  ├── Load AGENTS.md   → GRAPH directive → AgentConfig nodes → system prompt
  └── Load TOOLS.md    → GRAPH directive → Tool nodes → system prompt
```

Only AGENTS.md and TOOLS.md are loaded (`MINIMAL_BOOTSTRAP_ALLOWLIST`). This reduces prompt size for automated tasks that don't need identity or memory context.

---

## Customizing Your Workspace

### Option A — Edit nodes with Cypher

Best for quick changes to individual nodes.

```bash
# Update your agent's identity
node ladybugdb/scripts/query.js --cypher \
  "MATCH (s:Soul {id:'soul-openclaw-identity'}) \
   SET s.content = 'Name: Aria | Role: DevOps agent | Emoji: 🛡️'"

# Fill in the Principal memory (who you are)
node ladybugdb/scripts/query.js --cypher \
  "MATCH (m:Memory {id:'mem-openclaw-principal'}) \
   SET m.content = 'Name: Alice | Timezone: America/Chicago | Channel: signal'"

# Fill in Infrastructure memory
node ladybugdb/scripts/query.js --cypher \
  "MATCH (m:Memory {id:'mem-openclaw-infrastructure'}) \
   SET m.content = 'DB: ~/myapp/ladybugdb/db/alphaone-skills.db | Node: /usr/local/bin/node'"

# Add a new memory domain
node ladybugdb/scripts/query.js --cypher \
  "CREATE (m:Memory { \
     id: 'mem-openclaw-api-keys', \
     workspace: 'openclaw', \
     domain: 'API Keys', \
     content: 'Brave Search: \$BRAVE_API_KEY | xAI: \$XAI_API_KEY', \
     timestamp: '2026-01-01' \
   })"
```

### Option B — Fork the seed script

Best for reproducible, version-controlled workspace definitions.

```bash
cp ladybugdb/scripts/seed-default-workspace.mjs ladybugdb/scripts/seed-myagent.mjs
# Edit SOUL, MEMORY, AGENT_CONFIG, TOOLS arrays
node ladybugdb/scripts/seed-myagent.mjs --workspace myagent --reset
```

Then update your stubs to point to your workspace:

```bash
# In each stub, change workspace = 'openclaw' to workspace = 'myagent'
sed -i '' "s/workspace = 'openclaw'/workspace = 'myagent'/g" ~/.openclaw/workspace/*.md
```

### Option C — Multiple workspaces

For running several agents with different personalities or capabilities. See [Fleet Management](ADMIN-GUIDE.md#fleet-management) in the Admin Guide.

### Keeping customizations across upgrades

When the DB is replaced during an upgrade, workspace nodes are lost. Two strategies:

1. **Re-run your seed script** after every `install.sh` run (recommended)
2. **Export nodes before upgrading:**
   ```bash
   node ladybugdb/scripts/query.js --cypher \
     "MATCH (s:Soul {workspace:'openclaw'}) RETURN s.id, s.section, s.content, s.priority" \
     > workspace-backup.json
   ```

See [Upgrading](ADMIN-GUIDE.md#upgrading) in the Admin Guide for the full workflow.

---

## Quick Reference — Default Node IDs

| ID | Type | Section / Domain / Key |
|----|------|-----------------------|
| `soul-openclaw-prime-directive` | Soul | Prime Directive |
| `soul-openclaw-identity` | Soul | Identity |
| `soul-openclaw-safety` | Soul | Safety |
| `soul-openclaw-heartbeat` | Soul | Heartbeat Protocol |
| `mem-openclaw-principal` | Memory | Principal |
| `mem-openclaw-infrastructure` | Memory | Infrastructure |
| `agentcfg-openclaw-every-session` | AgentConfig | Every Session |
| `agentcfg-openclaw-delegation` | AgentConfig | Delegation |
| `agentcfg-openclaw-safety` | AgentConfig | Safety |
| `agentcfg-openclaw-heartbeats` | AgentConfig | Heartbeats |
| `agentcfg-openclaw-memory` | AgentConfig | Memory |
| `agentcfg-openclaw-toon` | AgentConfig | Token Optimization — TOON |
| `agentcfg-openclaw-search-resilience` | AgentConfig | Search Resilience |
| `agentcfg-openclaw-schema-rules` | AgentConfig | Schema Rules |
| `agentcfg-openclaw-path-aliases` | AgentConfig | Path Aliases |

Plus 26 Tool nodes (`tool-web-search`, `tool-sessions-spawn`, etc.).

---

## FAQ

### Do I need to change my prompts or workflows?

No. The agent sees the same markdown content it always did. The graph database is transparent — it's a storage and delivery mechanism, not a new interface.

### What happens if the database is missing?

The GRAPH directive returns empty content. Your agent will start with blank workspace sections. Run `install.sh` to download the database, then `seed-default-workspace.mjs` if workspace nodes are missing.

### Can I mix flat files and graph stubs?

Yes. Any workspace file without a `<!-- GRAPH: ... -->` directive on line 1 is loaded as a normal flat file. You can migrate one file at a time.

### How do I see what my agent actually receives?

Run the same query the stub uses:

```bash
# See exactly what SOUL.md resolves to
node ladybugdb/scripts/query.js --workspace --cypher \
  "MATCH (s:Soul {workspace:'openclaw'}) RETURN s.section AS section, s.content AS content ORDER BY s.priority"

# See what AGENTS.md resolves to
node ladybugdb/scripts/query.js --workspace --cypher \
  "MATCH (a:AgentConfig {workspace:'openclaw'}) RETURN a.key AS section, a.value AS content ORDER BY a.id"
```

The `--workspace` flag produces the same clean markdown output that gets injected into the system prompt.

### What's the performance impact?

Negligible. In-process queries are sub-millisecond (0.11–0.41ms). CLI subprocess calls take ~100ms but are cached for 60+ seconds. See [Performance Reference](ADMIN-GUIDE.md#performance-reference) in the Admin Guide.

### Can I query the skill graph from my agent's prompts?

Yes. Agents can run CLI queries as part of their task execution:

```bash
node ladybugdb/scripts/query.js "kubernetes monitoring"
node ladybugdb/scripts/query.js --skill cloudflare --hops 2
```

This is how cron jobs and automated workflows discover relevant skills at runtime.

### Where is the full customization guide?

See [CUSTOMIZING.md](../CUSTOMIZING.md) for step-by-step personalization, including identity setup, memory domains, tool management, fleet configuration, and seed script forking.
