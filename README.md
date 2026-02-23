# openclaw-graph

**Graph-native workspace backend for [OpenClaw](https://github.com/openclaw/openclaw) using [LadybugDB](https://www.npmjs.com/package/lbug)**

Replace flat workspace markdown files with an embedded Cypher graph database. 316 skills across 27 clusters · 545,072 DevDocs reference nodes · 718 docsets · 1536d vector embeddings. Zero daemons, zero servers, zero flat files. **100% graph-native from install.**

[![v1.2](https://img.shields.io/badge/release-v1.2-brightgreen)](https://github.com/alphaonedev/openclaw-graph/releases)
[![Skills](https://img.shields.io/badge/skills-316-blue)](skills/)
[![Clusters](https://img.shields.io/badge/clusters-27-green)](skills/)
[![LadybugDB](https://img.shields.io/badge/LadybugDB-0.14.3-purple)](https://www.npmjs.com/package/lbug)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://alphaonedev.github.io/openclaw-graph)

---

## What's new in v1.2

**9 AgentConfig nodes out of the box.** Every DB release now ships with a default `workspace='openclaw'` pre-seeded — Soul, Memory, AgentConfig (9 nodes incl. TOON, Search Resilience, Schema Rules, Path Aliases), and Tool nodes ready to use. Install, deploy stubs, done.

| | v1.0 | v1.2 |
|--|------|------|
| Skills | 316 | 316 |
| Reference nodes | 545,072 | 545,072 |
| Default workspace | ❌ | ✅ `workspace='openclaw'` |
| Soul / Memory / AgentConfig / Tool | manual seed | ✅ pre-seeded (4 + 2 + 9 + 21) |
| QueryMetrics (auto-recorded per GRAPH query) | ❌ | ✅ auto-fills on every workspace load |
| Prompt optimization (Path Aliases, TOON) | ❌ | ✅ 70% token reduction |
| `seed-default-workspace.mjs` | ❌ | ✅ |
| `import-workspace.mjs` (load flat files into DB) | ❌ | ✅ |
| `sync-metrics.mjs` (view query metrics dashboard) | ❌ | ✅ |
| `USER.md` stub | ❌ | ✅ |
| Parallel workspace loading (5× faster cold load) | ❌ | ✅ |
| Secondary indexes on `workspace` field | ❌ | ✅ |

See [CUSTOMIZING.md](CUSTOMIZING.md) for how to personalize or fork the default workspace.

---

## What is this?

OpenClaw agents load workspace context from flat markdown files (`SOUL.md`, `MEMORY.md`, `TOOLS.md`, `AGENTS.md`). As your workspace grows, these files balloon — injecting tens of thousands of tokens into every system prompt.

**openclaw-graph** replaces those files with single-line Cypher directives:

```markdown
<!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'myapp' RETURN s.section AS section, s.content AS content ORDER BY s.priority ASC -->
```

When OpenClaw loads the workspace, the patched `workspace.ts` resolves the directive by querying LadybugDB (an embedded Cypher graph DB), formats the result as structured markdown, and injects it into the system prompt — exactly as if it were a flat file.

**Result:** Workspace stubs shrink from ~25,000 bytes to ~660 bytes. Graph-resolved content is cached in-process for 60 seconds. Skill lookup by natural language text takes ~101ms.

---

## Architecture

```
OpenClaw Session
│
├── loadWorkspaceBootstrapFiles()
│   ├── SOUL.md    (1 line: <!-- GRAPH: MATCH (s:Soul)... -->)
│   ├── MEMORY.md  (1 line: <!-- GRAPH: MATCH (m:Memory)... -->)
│   ├── USER.md    (1 line: <!-- GRAPH: MATCH (m:Memory) WHERE m.domain STARTS WITH 'User:'... -->)
│   ├── TOOLS.md   (1 line: <!-- GRAPH: MATCH (t:Tool)... -->)
│   └── AGENTS.md  (1 line: <!-- GRAPH: MATCH (a:AgentConfig)... -->)
│       │
│       └── readFileWithCache()
│           ├── detect GRAPH directive
│           ├── execute: node query.js --workspace --cypher "<cypher>"
│           ├── cache result 60s (in-process Map)
│           └── return formatted markdown
│
└── buildAgentSystemPrompt()
    └── injects graph-resolved markdown → system prompt

Skills (316 nodes, 27 clusters)
│
├── loader.js               → parse SKILL.md files → insert into DB
├── query.js                → text search / cluster / graph traversal / Cypher
│                              (auto-records QueryMetrics on every --workspace call)
├── import-workspace.mjs    → load flat SOUL/MEMORY/USER/TOOLS/AGENTS.md into DB
├── seed-default-workspace.mjs → populate Soul / Memory / Tool / AgentConfig tables
└── sync-metrics.mjs        → view / reset QueryMetrics dashboard

LadybugDB (embedded SQLite + Cypher, no daemon)
└── ladybugdb/db/alphaone-skills.db
```

---

## Prerequisites

Install these **before** running the installer:

| Dependency | Version | macOS | Ubuntu / Debian | Fedora |
|------------|---------|-------|-----------------|--------|
| **Node.js** | 18+ | `brew install node@22` | NodeSource (see below) | `sudo dnf install -y nodejs npm` |
| **lbug** | 0.14.3+ | `npm install -g lbug` | `npm install -g lbug` | `npm install -g lbug` |
| **zstd** | 1.5+ | `brew install zstd` | `sudo apt-get install -y zstd` | `sudo dnf install -y zstd` |
| **curl** | any | pre-installed | `sudo apt-get install -y curl` | pre-installed |

> **Quick check:** `node --version && npm --version && zstd --version && node --input-type=module -e "import 'lbug'" && echo "✅ all good"`

<details>
<summary><strong>macOS — step by step</strong></summary>

```bash
# 1. Install Homebrew (skip if already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js 22 LTS (includes npm)
brew install node@22
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 3. Install lbug globally
npm install -g lbug

# 4. Install zstd
brew install zstd

# curl is pre-installed on macOS — no action needed
```

</details>

<details>
<summary><strong>Ubuntu / Debian — step by step</strong></summary>

```bash
# 1. Install curl
sudo apt-get update && sudo apt-get install -y curl

# 2. Add NodeSource repo and install Node.js 22 LTS (includes npm)
#    (apt's default nodejs is often too old — use NodeSource for v22)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install lbug globally
npm install -g lbug

# 4. Install zstd
sudo apt-get install -y zstd
```

</details>

<details>
<summary><strong>Fedora — step by step</strong></summary>

```bash
# 1. Install Node.js 22 and npm
sudo dnf install -y nodejs npm

# 2. Install lbug globally
npm install -g lbug

# 3. Install zstd
sudo dnf install -y zstd

# curl is pre-installed on Fedora — no action needed
```

</details>

---

## Importing Your Existing Workspace

Already running OpenClaw with flat `SOUL.md`, `MEMORY.md`, `USER.md`, `TOOLS.md`, `AGENTS.md` files? One command loads them into LadybugDB:

```bash
# From your openclaw-graph directory:
node ladybugdb/scripts/import-workspace.mjs
```

The importer reads `~/.openclaw/workspace/` by default, parses each file by `##` headings, and creates the appropriate graph nodes. Then optionally replaces the flat files with single-line GRAPH stubs:

```bash
# Preview what will be imported (no writes)
node ladybugdb/scripts/import-workspace.mjs --dry-run

# Import + automatically replace flat files with GRAPH stubs (backs up originals to *.bak)
node ladybugdb/scripts/import-workspace.mjs --write-stubs

# Custom workspace directory or name
node ladybugdb/scripts/import-workspace.mjs --workspace-dir ~/my/workspace --workspace-name myagent
```

**File → Node mapping:**

| File | Node type | Section format |
|------|-----------|----------------|
| `SOUL.md` | `Soul` | Each `##` heading → one node |
| `MEMORY.md` | `Memory` | Each `##` heading → one domain |
| `USER.md` | `Memory` | Each `##` heading → `User: <section>` domain |
| `TOOLS.md` | `Tool` | Each `##` heading → one tool entry |
| `AGENTS.md` | `AgentConfig` | Each `##` heading → one config key |

> **Format your files with `##` headings** — each `##` section becomes one graph node. Files with no `##` headings are imported as a single node.

---

## Quick Start

### Option A — One-line install (recommended)

```bash
# Lite install — skills + embeddings (~300 MB compressed)
curl -fsSL https://raw.githubusercontent.com/alphaonedev/openclaw-graph/main/install.sh | bash -s -- --lite

# Full install — skills + 545k DevDocs reference nodes (~500 MB compressed)
curl -fsSL https://raw.githubusercontent.com/alphaonedev/openclaw-graph/main/install.sh | bash -s -- --full
```

The DB ships with `workspace='openclaw'` pre-seeded. Skip to step 3.

### Option B — From source

```bash
git clone https://github.com/alphaonedev/openclaw-graph.git
cd openclaw-graph && npm install

# Load skill database
node ladybugdb/scripts/loader.js
# → 316 skills | 27 clusters | 247 edges

# Seed default workspace (Soul, Memory, AgentConfig, Tool nodes)
node ladybugdb/scripts/seed-default-workspace.mjs
# → workspace='openclaw' seeded with agnostic defaults
```

### 3. Patch OpenClaw

```bash
cd path/to/openclaw
git apply path/to/openclaw-graph/patches/workspace-cache-fix.patch
pnpm build
```

### 4. Deploy workspace stubs

```bash
cp workspace-stubs/*.md ~/.openclaw/workspace/
# Stubs reference workspace='openclaw' by default — works immediately
```

### 5. Personalize

```bash
# Update your identity
node ladybugdb/scripts/query.js --cypher \
  "MATCH (s:Soul {id:'soul-openclaw-identity'}) SET s.content = 'Name: MyAgent | Role: ...'"

# Add memory facts, restrict tools, create a custom workspace
# See CUSTOMIZING.md for the full guide
```

---

## Integrating with OpenClaw workspace.ts

Add three blocks to `src/agents/workspace.ts`:

**1. After imports — add the graph backend:**

```typescript
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const GRAPH_DIRECTIVE_PREFIX = "<!-- GRAPH:";
const GRAPH_NODE_BIN = process.env.OPENCLAW_GRAPH_NODE_BIN ?? "node";
const GRAPH_QUERY_SCRIPT =
  process.env.OPENCLAW_GRAPH_QUERY_SCRIPT ??
  path.join(os.homedir(), "openclaw-graph", "ladybugdb", "scripts", "query.js");

function extractGraphDirective(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith(GRAPH_DIRECTIVE_PREFIX)) return null;
  const end = trimmed.indexOf("-->");
  if (end === -1) return null;
  return trimmed.slice(GRAPH_DIRECTIVE_PREFIX.length, end).trim();
}

function executeGraphQuery(cypher: string): string {
  try {
    const result = execFileSync(
      GRAPH_NODE_BIN,
      [GRAPH_QUERY_SCRIPT, "--workspace", "--cypher", cypher],
      { encoding: "utf-8", timeout: 8000 },
    );
    return result.trim();
  } catch { return ""; }
}

const graphQueryCache = new Map<string, { content: string; fetchedAt: number }>();

function resolveGraphContent(cypher: string): string {
  const now = Date.now();
  const cached = graphQueryCache.get(cypher);
  if (cached && now - cached.fetchedAt < 60_000) return cached.content;
  const content = executeGraphQuery(cypher);
  graphQueryCache.set(cypher, { content, fetchedAt: now });
  return content;
}
```

**2. Inside `readFileWithCache()` — add directive resolution after reading raw file:**

```typescript
const raw = await fs.readFile(filePath, "utf-8");

// ── Graph directive resolution ──────────────────────────────────
const cypher = extractGraphDirective(raw);
const content = cypher ? resolveGraphContent(cypher) : raw;
// ───────────────────────────────────────────────────────────────

workspaceFileCache.set(filePath, { content, mtimeMs });
return content;
```

**3. Set environment variables (optional, for custom paths):**

```bash
export OPENCLAW_GRAPH_NODE_BIN=/usr/local/bin/node
export OPENCLAW_GRAPH_QUERY_SCRIPT=/path/to/openclaw-graph/ladybugdb/scripts/query.js
```

---

## Skill Database

316 skills across 27 clusters, covering the full OpenClaw development surface:

| Cluster | Skills | Description |
|---------|--------|-------------|
| community | 62 | ClaWHub community skills |
| coding | 18 | Languages, code review, refactoring |
| mobile | 14 | iOS, Android, React Native, Flutter |
| web-dev | 13 | HTML/CSS/JS, frameworks, APIs |
| se-architecture | 12 | System design, microservices, DDD |
| computer-science | 11 | Algorithms, data structures, theory |
| cloud-gcp | 10 | Google Cloud Platform |
| devops-sre | 10 | CI/CD, Kubernetes, monitoring |
| aimlops | 10 | ML pipelines, model serving, MLflow |
| game-dev | 10 | Unity, Unreal, game architecture |
| financial | 10 | Trading, options, quant analysis |
| data-engineering | 10 | Pipelines, Spark, dbt, warehouses |
| blue-team | 10 | Threat detection, SIEM, incident response |
| ar-vr | 10 | ARKit, WebXR, spatial computing |
| twilio | 10 | SMS, Voice, Verify, Conversations |
| macos | 10 | macOS automation, Shortcuts, Swift |
| blockchain | 10 | Smart contracts, DeFi, Web3 |
| iot | 10 | Edge computing, MQTT, embedded |
| cloud-aws | 10 | AWS services, CDK, Lambda |
| core-openclaw | 8 | OpenClaw skills, memory, compaction |
| testing | 8 | Unit, integration, E2E, TDD |
| ai-apis | 8 | OpenAI, Anthropic, xAI, Google AI |
| existing | 6 | Existing OpenClaw built-in skills |
| abtesting | 6 | Experimentation, feature flags |
| linux | 5 | Shell, systemd, package management |
| distributed-comms | 4 | Kafka, RabbitMQ, event-driven |

### Querying skills

```bash
# Natural language text search
node ladybugdb/scripts/query.js "deploy a React app to Cloudflare Pages"

# Browse a cluster
node ladybugdb/scripts/query.js --cluster devops-sre

# Graph traversal (skill + related skills, 2 hops)
node ladybugdb/scripts/query.js --skill terraform --hops 2

# Raw Cypher
node ladybugdb/scripts/query.js --cypher "MATCH (s:Skill {cluster: 'ai-apis'}) RETURN s.name, s.description"

# Database stats
node ladybugdb/scripts/query.js --stats
```

---

## Performance

Measured on production data — 316 skills · 545,072 Reference nodes · Mac mini M-series 32 GB RAM.

| Query | avg |
|-------|-----|
| Reference PK lookup (1 row, 545k table) | **0.11ms** |
| Skill PK lookup (warm, in-process) | **0.18ms** |
| AGENTS.md hot path (9 AgentConfig nodes) | **0.33ms** |
| TOOLS.md hot path (21 Tool nodes) | **0.41ms** |
| Full skill scan (316 nodes) | **2.02ms** |
| GRAPH directive — first load (CLI subprocess) | **~104ms** |
| GRAPH directive — cached hit | **0ms** |
| 5 workspace files, cold load (parallel) | **~104ms total** |

The ~104ms first-load cost is Node.js process spawn + lbug init — not the query itself. All 5 workspace GRAPH directives (SOUL/MEMORY/USER/TOOLS/AGENTS) resolve in parallel via `Promise.allSettled()` — cold workspace load is bound by the slowest single query, not the sum. The three-layer cache (workspaceFileCache → graphQueryCache → graphQueryInFlight) amortizes this over a 60–180s adaptive TTL window. Secondary indexes on `workspace` field across Soul, Memory, and AgentConfig tables keep workspace-filtered queries O(log n) as node counts grow.

| Metric | Value |
|--------|-------|
| Workspace stub total size | ~655 bytes (5 files) |
| Flat-file workspace size | ~11,000–25,000+ bytes |
| **Size reduction** | **94–97%** |
| Token savings per session | ~2,700–6,200 tokens |
| DB compressed (full) | 295 MB (zstd) |
| DB raw (full) | 3.2 GB |

See [benchmarks/results.md](benchmarks/results.md) for full measurements.

---

## Multi-Instance Deployment

For teams running multiple OpenClaw instances (e.g., a fleet of AI agents), all instances can share one LadybugDB file. Differentiate instances by `workspace` identifier:

```sql
-- Instance A (intelligence agent)
MATCH (s:Soul) WHERE s.workspace = 'intel' RETURN ...

-- Instance B (code agent)
MATCH (s:Soul) WHERE s.workspace = 'code' RETURN ...

-- Instance C (infrastructure agent)
MATCH (s:Soul) WHERE s.workspace = 'infra' RETURN ...
```

Each instance gets its own identity, memory, and tool configuration from the shared graph.

---

## Query Metrics

Every time OpenClaw resolves a GRAPH directive from a workspace stub, `query.js` automatically records the event into the `QueryMetrics` table — no configuration needed.

```bash
# Show the metrics dashboard (top 20 queries by hit count)
node ladybugdb/scripts/sync-metrics.mjs

# Show top 40
node ladybugdb/scripts/sync-metrics.mjs --top 40

# Include queries that returned 0 results
node ladybugdb/scripts/sync-metrics.mjs --zero

# Raw JSON (for scripting)
node ladybugdb/scripts/sync-metrics.mjs --json

# Clear all metrics
node ladybugdb/scripts/sync-metrics.mjs --reset
```

The dashboard shows: **hits · misses · hit-rate % · avg_ms · p95_ms · last_hit** per query.

> **New install?** `QueryMetrics` starts empty and fills automatically — no setup required. The first entry appears after OpenClaw loads any workspace stub.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_GRAPH_NODE_BIN` | `node` | Path to Node.js binary |
| `OPENCLAW_GRAPH_QUERY_SCRIPT` | `~/openclaw-graph/ladybugdb/scripts/query.js` | Path to query script |

---

## Service Management

> **openclaw-graph has no daemon.** It is embedded in the OpenClaw gateway process. Managing openclaw-graph = managing the OpenClaw gateway. The DB file is always directly queryable via `query.js --stats` regardless of gateway state.

### macOS (launchd — `ai.openclaw.gateway`)

```bash
# Start
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.openclaw.gateway.plist

# Stop
launchctl bootout gui/$UID/ai.openclaw.gateway

# Restart
launchctl kickstart -k gui/$UID/ai.openclaw.gateway

# Status  (look for "state = running" and "pid =")
launchctl print gui/$UID/ai.openclaw.gateway | grep -E "state|pid"

# Logs
tail -f ~/.openclaw/logs/gateway.log          # stdout
tail -f ~/.openclaw/logs/gateway.err.log       # stderr
log stream --predicate 'subsystem == "ai.openclaw"' --level info   # unified log
```

### Ubuntu & Fedora (systemd — `openclaw-gateway.service`)

```bash
# Start
systemctl --user start openclaw-gateway.service

# Stop
systemctl --user stop openclaw-gateway.service

# Restart
systemctl --user restart openclaw-gateway.service

# Status
systemctl --user status openclaw-gateway.service

# Logs
journalctl --user -u openclaw-gateway.service -f
tail -f ~/.openclaw/logs/gateway.log          # or read flat file directly
```

### DB health check (all platforms — no gateway needed)

```bash
# Full stats
node ~/openclaw-graph/ladybugdb/scripts/query.js --stats

# Workspace sanity check
node ~/openclaw-graph/ladybugdb/scripts/query.js \
  --cypher "MATCH (n) WHERE n.workspace = 'openclaw' RETURN labels(n)[0] AS type, count(n) AS n ORDER BY type"
```

---

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

To add skills: create a `SKILL.md` file in the appropriate cluster directory and run `node ladybugdb/scripts/loader.js`.

Skill format:

```yaml
---
name: my-skill
cluster: my-cluster
description: "What this skill does"
tags: ["tag1", "tag2"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "keywords for text search"
---

# My Skill

## Purpose
What the agent can do with this skill.

## When to Use
- When the task involves X
- Match query: keywords

## Key Capabilities
- Capability 1
- Capability 2
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| **[Admin Guide](https://alphaonedev.github.io/openclaw-graph/admin-guide.html)** | Installation, database layout, CLI reference, cron jobs, fleet management, upgrading, troubleshooting |
| **[User Guide](https://alphaonedev.github.io/openclaw-graph/user-guide.html)** | Workspace stubs, GRAPH directives, node schemas (Soul/Memory/AgentConfig/Tool/Skill/Reference), loading flow |
| **[Customizing](CUSTOMIZING.md)** | Step-by-step workspace personalization — identity, memory, tools, multi-workspace setup |
| **[Benchmarks](benchmarks/results.md)** | Full performance measurements with methodology |
| **[GitHub Pages](https://alphaonedev.github.io/openclaw-graph/)** | Interactive documentation site |

---

## License

MIT © 2025 openclaw-graph contributors

OpenClaw is © its respective authors. This project is an independent community contribution and is not affiliated with or endorsed by the OpenClaw project.
