# Admin Guide — openclaw-graph

> Setup, configuration, CLI reference, cron integration, and fleet management.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Layout](#database-layout)
- [CLI Reference](#cli-reference)
- [Workspace Setup](#workspace-setup)
- [Cron Job Integration](#cron-job-integration)
- [Fleet Management (Multi-Instance)](#fleet-management)
- [Upgrading](#upgrading)
- [Backup & Restore](#backup--restore)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Dependency | Version | Install |
|-----------|---------|---------|
| Node.js | 22+ | `brew install node@22` |
| lbug | 0.14.3+ | `npm install lbug` |
| zstd | 1.5+ | `brew install zstd` (for install.sh) |
| OpenClaw | latest | [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw) |

---

## Installation

### One-command install

```bash
# Interactive — choose Lite or Full
curl -fsSL https://raw.githubusercontent.com/alphaonedev/openclaw-graph/main/install.sh | bash

# Non-interactive
bash install.sh --full          # skills + 545k DevDocs references
bash install.sh --lite          # skills only
bash install.sh --version v1.2  # pin a specific release
bash install.sh --verify        # check an existing DB
```

### Manual install

```bash
git clone https://github.com/alphaonedev/openclaw-graph.git
cd openclaw-graph
npm install

# Download and decompress the DB
curl -L https://github.com/alphaonedev/openclaw-graph/releases/download/v1.2/alphaone-skills-full.db.zst \
  | zstd -d > ladybugdb/db/alphaone-skills.db

# Verify
node ladybugdb/scripts/query.js --stats
```

### What the DB contains (v1.2)

| Table | Nodes | Description |
|-------|-------|-------------|
| Skill | 316 | Skills across 27 clusters |
| Reference | 545,072 | DevDocs entries (718 docsets) — full tier only |
| Soul | 4 | Prime Directive, Identity, Safety, Heartbeat Protocol |
| Memory | 2 | Principal (placeholder), Infrastructure (placeholder) |
| AgentConfig | 9 | Every Session, Delegation, Safety, Heartbeats, Memory, TOON, Search Resilience, Schema Rules, Path Aliases |
| Tool | 26 | All standard OpenClaw tools |
| QueryMetrics | 0 | Schema only — populated automatically |

---

## Database Layout

```
ladybugdb/
├── db/
│   └── alphaone-skills.db       # Single-file embedded DB (no daemon)
├── schema/
│   ├── nodes.cypher             # Skill + Reference DDL
│   ├── edges.cypher             # Relationship DDL
│   └── workspace-nodes.cypher   # Soul, Memory, AgentConfig, Tool DDL
└── scripts/
    ├── query.js                 # CLI query tool
    ├── loader.js                # Load SKILL.md files into DB
    ├── seed-default-workspace.mjs  # Seed default workspace nodes
    └── seed-workspace.js        # Custom workspace seeder
```

LadybugDB is an embedded graph database (KuzuDB). The entire DB is a single file — no daemon, no port, no configuration. Queries execute in-process via the `lbug` Node.js bindings.

---

## CLI Reference

All commands use `node ladybugdb/scripts/query.js`:

### Skill queries

```bash
# Text search — matches against name, description, embedding hints
node ladybugdb/scripts/query.js "build a SwiftUI watchOS app"

# Cluster filter — list all skills in a cluster
node ladybugdb/scripts/query.js --cluster devops-sre
node ladybugdb/scripts/query.js --cluster financial

# Skill graph traversal — show a skill and its relationships
node ladybugdb/scripts/query.js --skill cloudflare --hops 2

# Stats — total skills, clusters, auth-required flags
node ladybugdb/scripts/query.js --stats
```

### Raw Cypher queries

```bash
# Standard mode — labeled output for debugging
node ladybugdb/scripts/query.js --cypher "MATCH (s:Skill) RETURN count(s) AS total"

# Workspace mode — clean markdown output (used by workspace.ts)
node ladybugdb/scripts/query.js --workspace --cypher \
  "MATCH (a:AgentConfig {workspace:'openclaw'}) RETURN a.key, a.value ORDER BY a.id"
```

### Workspace node queries

```bash
# List all Soul nodes
node ladybugdb/scripts/query.js --cypher \
  "MATCH (s:Soul {workspace:'openclaw'}) RETURN s.section, s.priority ORDER BY s.priority"

# List all AgentConfig nodes
node ladybugdb/scripts/query.js --cypher \
  "MATCH (a:AgentConfig {workspace:'openclaw'}) RETURN a.key ORDER BY a.id"

# List available tools
node ladybugdb/scripts/query.js --cypher \
  "MATCH (t:Tool) WHERE t.available = true RETURN t.name, t.notes ORDER BY t.name"

# Query DevDocs references
node ladybugdb/scripts/query.js --cypher \
  "MATCH (r:Reference) WHERE r.source = 'python~3.12' AND r.path STARTS WITH 'library/' RETURN r.title, r.path LIMIT 20"
```

### Output formats

The `--workspace` flag activates clean markdown output (no labels), which is what `workspace.ts` uses when resolving GRAPH directives. Without it, output is labeled for human reading.

| Data shape | Format |
|-----------|--------|
| `section + content` | Soul markdown (`## Section\n\nContent`) |
| `domain + content` | Memory markdown (`## Domain\n\nContent`) |
| `key + value` | AgentConfig markdown (`- **Key**: Value`) |
| `name + notes` | Tool list (`- **Name**: Notes`) |
| Other | JSON (debug/dev use) |

---

## Workspace Setup

### 1. Apply the workspace.ts patch

The patch modifies OpenClaw's `workspace.ts` to resolve GRAPH directives:

```bash
cd ~/Downloads/openclaw
git apply path/to/openclaw-graph/patches/workspace-cache-fix.patch
pnpm build
```

**What the patch does:**
- Intercepts `readFileWithCache()` to detect `<!-- GRAPH: ... -->` directives
- Executes Cypher queries via `execFileAsync` (non-blocking)
- Caches results with adaptive TTL: `60s × log₁₀(hit_count + 10)`
- In-flight deduplication prevents thundering herd on cache expiry

### 2. Deploy workspace stubs

```bash
cp workspace-stubs/*.md ~/.openclaw/workspace/
```

Each stub is a single-line file like:
```
<!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'openclaw' RETURN s.section AS section, s.content AS content ORDER BY s.priority ASC -->
```

### 3. Verify resolution

```bash
# Test that the directive resolves correctly
node ladybugdb/scripts/query.js --workspace --cypher \
  "MATCH (s:Soul {workspace:'openclaw'}) RETURN s.section, s.content ORDER BY s.priority"

# Expected: formatted markdown with Prime Directive, Identity, Safety, Heartbeat Protocol
```

### 4. Customize your workspace

See [CUSTOMIZING.md](../CUSTOMIZING.md) for step-by-step personalization.

---

## Cron Job Integration

openclaw-graph supports scheduled tasks (cron jobs) that query the graph database. Cron jobs typically run as lightweight OpenClaw sessions that:

1. Load workspace context via GRAPH directives (same as interactive sessions)
2. Execute domain-specific prompts (intel, monitoring, alerts)
3. Write output to files or send notifications

### Cron architecture

```
┌─────────────────────────────────────────────┐
│  Cron Scheduler (crontab / launchd / systemd) │
│  └── Every N minutes: run openclaw session    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  OpenClaw Session (cron mode)               │
│  ├── Load AGENTS.md → GRAPH: AgentConfig    │
│  ├── Load TOOLS.md  → GRAPH: Tool           │
│  ├── Execute prompt (task-specific)         │
│  └── Write output / send alerts             │
└─────────────────┬───────────────────────────┘
                  │ --workspace --cypher
                  ▼
┌─────────────────────────────────────────────┐
│  LadybugDB (alphaone-skills.db)             │
│  ├── AgentConfig → session behavior         │
│  ├── Skill → task-relevant skills           │
│  └── Reference → documentation context      │
└─────────────────────────────────────────────┘
```

### Cron session bootstrap

Cron/sub-agent sessions use a minimal bootstrap. OpenClaw's `MINIMAL_BOOTSTRAP_ALLOWLIST` loads only:
- **AGENTS.md** (AgentConfig nodes — session behavior, delegation rules)
- **TOOLS.md** (available tools and usage notes)

SOUL.md and MEMORY.md are skipped for cron sessions to reduce prompt size.

### AgentConfig nodes relevant to cron

| Node | Purpose |
|------|---------|
| `agentcfg-*-every-session` | Bootstrap instructions (read SOUL, USER, memory) |
| `agentcfg-*-delegation` | Sub-agent spawning rules |
| `agentcfg-*-search-resilience` | Retry/fallback when web_search fails |
| `agentcfg-*-schema-rules` | Output validation requirements |
| `agentcfg-*-path-aliases` | Compact path notation ($PY, $DB, etc.) |
| `agentcfg-*-toon` | JSON compression for large payloads |

### Example: cron job definition

```json
{
  "name": "daily-report",
  "schedule": "0 8 * * *",
  "workspace": "openclaw",
  "prompt": "Generate today's daily report. Query relevant skills with: node ladybugdb/scripts/query.js --cluster financial",
  "output": "~/.openclaw/workspace/reports/daily-$(date +%Y-%m-%d).md"
}
```

### Querying skills from cron prompts

Cron prompts can reference the graph database directly:

```bash
# Find relevant skills for a domain
node ladybugdb/scripts/query.js "kubernetes monitoring alerts"

# Get specific skill content
node ladybugdb/scripts/query.js --skill kubernetes-ops --hops 1

# Query reference docs
node ladybugdb/scripts/query.js --cypher \
  "MATCH (r:Reference {source:'kubernetes'}) WHERE r.path STARTS WITH 'api/' RETURN r.title, r.content LIMIT 5"
```

---

## Fleet Management

For multi-instance deployments, each OpenClaw instance gets its own workspace ID. All instances share the same DB file (no lock contention — LadybugDB is read-heavy).

### Seed separate workspaces

```bash
node ladybugdb/scripts/seed-default-workspace.mjs --workspace intel-agent
node ladybugdb/scripts/seed-default-workspace.mjs --workspace code-agent
node ladybugdb/scripts/seed-default-workspace.mjs --workspace ops-agent
```

### Point stubs to the correct workspace

```bash
# Instance A stubs (~/.openclaw/workspace-intel/)
# SOUL.md:
#   <!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'intel-agent' RETURN s.section AS section, s.content AS content ORDER BY s.priority ASC -->
```

### Fleet topology example

| Port | Instance | Workspace ID |
|------|----------|-------------|
| 18790 | A — Intel/OSINT | `intel-agent` |
| 18791 | B — Compute | `compute-agent` |
| 18792 | C — Browser | `browser-agent` |
| 18793 | D — Code/GitHub | `code-agent` |
| 18794 | E — Infra | `infra-agent` |
| 18795 | F — Memory/Graph | `graph-agent` |
| 18796 | G — General | `general-agent` |
| 18797 | H — Standby | `standby-agent` |

Each instance runs its own DB copy (`install.sh --full`). No shared DB, no lock contention.

### Per-workspace tool overrides

```bash
# Disable delegation for the browser-only instance
node ladybugdb/scripts/query.js --cypher \
  "MATCH (t:Tool {id:'tool-sessions-spawn'}) \
   WHERE EXISTS { MATCH (a:AgentConfig {workspace:'browser-agent'}) } \
   SET t.available = false"
```

---

## Upgrading

When you upgrade to a new release, the DB is **replaced**. Workspace nodes live in the DB.

### Upgrade workflow

```bash
# 1. Backup current workspace nodes
node ladybugdb/scripts/query.js --cypher \
  "MATCH (s:Soul {workspace:'myworkspace'}) RETURN s.id, s.section, s.content, s.priority" \
  > workspace-backup.json

# 2. Run install.sh (downloads new DB, overwrites old)
bash install.sh --full

# 3. Re-seed your workspace
node ladybugdb/scripts/seed-default-workspace.mjs --workspace myworkspace
# or: node ladybugdb/scripts/seed-myagent.mjs

# 4. Verify
node ladybugdb/scripts/query.js --cypher \
  "MATCH (a:AgentConfig {workspace:'myworkspace'}) RETURN count(a) AS n"
```

### Recommended: reproducible seed scripts

Keep your workspace customizations in a seed script (forked from `seed-default-workspace.mjs`). After any DB upgrade, re-run the script. This is more reliable than manual backup/restore.

---

## Backup & Restore

### Full DB backup

```bash
# The DB is a single file — just copy it
cp ladybugdb/db/alphaone-skills.db ladybugdb/db/alphaone-skills.db.bak
```

### Export workspace nodes to JSON

```bash
# Export each table
for table in Soul Memory AgentConfig Tool; do
  node ladybugdb/scripts/query.js --cypher \
    "MATCH (n:${table}) RETURN n.*" > backup-${table}.json
done
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_GRAPH_NODE_BIN` | `node` | Path to Node.js binary for query.js |
| `OPENCLAW_GRAPH_QUERY_SCRIPT` | `~/openclaw-graph/ladybugdb/scripts/query.js` | Path to CLI query script |
| `NODE_BIN` | `node` | Used by install.sh |
| `RELEASE_VERSION` | `latest` | Pin install.sh to a specific release |

---

## Troubleshooting

### GRAPH directive returns empty

**Symptom:** Workspace file loads but content is empty.

**Check:**
```bash
# 1. Is the DB present?
ls -lh ladybugdb/db/alphaone-skills.db

# 2. Can query.js connect?
node ladybugdb/scripts/query.js --stats

# 3. Does the workspace have nodes?
node ladybugdb/scripts/query.js --cypher \
  "MATCH (a:AgentConfig {workspace:'openclaw'}) RETURN count(a) AS n"

# 4. Is the directive syntax correct?
# Must be: <!-- GRAPH: <cypher> -->
# Must be the FIRST LINE of the file
# Cypher must be a single line
```

### "Table X does not exist"

**Cause:** The workspace tables haven't been created. This happens if you installed a pre-v1.2 DB.

**Fix:**
```bash
node ladybugdb/scripts/seed-default-workspace.mjs
```

### Stale workspace content

**Cause:** Graph query cache hasn't expired (60s TTL).

**Fix:** Wait 60 seconds, or restart the OpenClaw process. The cache is in-memory only.

### CLI subprocess slow (~100ms+)

**This is expected.** The ~100ms cost is Node.js process startup + lbug init — not the query itself (which takes <1ms). The cache ensures this cost is paid at most once per 60 seconds per unique query.

### DB file locked / corrupted

```bash
# Check for WAL files
ls ladybugdb/db/alphaone-skills.db*

# If .wal files exist, the DB may have been interrupted during a write
# Backup and re-install
mv ladybugdb/db/alphaone-skills.db ladybugdb/db/alphaone-skills.db.corrupted
bash install.sh --full
node ladybugdb/scripts/seed-default-workspace.mjs
```

---

## Performance Reference

| Query | In-process | CLI subprocess |
|-------|-----------|---------------|
| Skill PK lookup | 0.18ms | ~111ms |
| AgentConfig (9 nodes) | 0.33ms | ~127ms |
| Tool query (26 nodes) | 0.41ms | ~106ms |
| Reference PK (545k table) | 0.11ms | — |
| Full skill scan (316) | 2.02ms | — |

All in-process queries are sub-millisecond. CLI subprocess cost is amortized by the 60s adaptive TTL cache.

Full benchmark data: [benchmarks/results.md](../benchmarks/results.md)
