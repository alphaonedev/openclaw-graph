# openclaw-graph

**Graph-native workspace backend for [OpenClaw](https://github.com/openclaw/openclaw) using [LadybugDB](https://www.npmjs.com/package/lbug)**

Replace flat workspace markdown files with a single embedded Cypher graph database. 312 skills across 27 clusters, queryable by text, cluster, or graph traversal. Zero daemons, zero servers, zero flat files.

[![Skills](https://img.shields.io/badge/skills-312-blue)](skills/)
[![Clusters](https://img.shields.io/badge/clusters-27-green)](skills/)
[![LadybugDB](https://img.shields.io/badge/LadybugDB-0.14.3-purple)](https://www.npmjs.com/package/lbug)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://alphaonedev.github.io/openclaw-graph)

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
│   ├── TOOLS.md   (1 line: <!-- GRAPH: MATCH (t:Tool)... -->)
│   └── AGENTS.md  (1 line: <!-- GRAPH: MATCH (s:Soul WHERE section STARTS WITH...) -->)
│       │
│       └── readFileWithCache()
│           ├── detect GRAPH directive
│           ├── execute: node query.js --workspace --cypher "<cypher>"
│           ├── cache result 60s (in-process Map)
│           └── return formatted markdown
│
└── buildAgentSystemPrompt()
    └── injects graph-resolved markdown → system prompt

Skills (312 nodes, 27 clusters)
│
├── loader.js        → parse SKILL.md files → insert into DB
├── query.js         → text search / cluster / graph traversal / Cypher
└── seed-workspace.js → populate Soul / Memory / Tool / AgentConfig tables

LadybugDB (embedded SQLite + Cypher, no daemon)
└── ladybugdb/db/skills.db
```

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/alphaonedev/openclaw-graph.git
cd openclaw-graph
npm install
```

### 2. Load the skill database

```bash
node ladybugdb/scripts/loader.js
# → 312 skills, 27 clusters, 247 edges loaded
```

### 3. Seed your workspace identity

Edit `ladybugdb/scripts/seed-workspace.js` — set `WORKSPACE_ID` and fill in your Soul, Memory, and Tool nodes. Then:

```bash
node ladybugdb/scripts/seed-workspace.js
```

### 4. Patch OpenClaw

Apply the workspace patch to your OpenClaw installation:

```bash
# Copy the patch
cp src/agents/workspace.graph.ts path/to/openclaw/src/agents/workspace.graph.ts

# Apply changes to workspace.ts (see Integration section below)
```

### 5. Deploy workspace stubs

```bash
cp workspace-stubs/SOUL.md    ~/.openclaw/workspace/SOUL.md
cp workspace-stubs/MEMORY.md  ~/.openclaw/workspace/MEMORY.md
cp workspace-stubs/TOOLS.md   ~/.openclaw/workspace/TOOLS.md
cp workspace-stubs/AGENTS.md  ~/.openclaw/workspace/AGENTS.md
```

Update the `workspace = 'myapp'` values in each stub to match your `WORKSPACE_ID`.

### 6. Build OpenClaw

```bash
cd path/to/openclaw
pnpm build
```

---

## Integrating with OpenClaw workspace.ts

Add three blocks to `src/agents/workspace.ts`:

**1. After imports — add the graph backend:**

```typescript
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

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
    const result = execSync(
      `${GRAPH_NODE_BIN} ${GRAPH_QUERY_SCRIPT} --workspace --cypher ${JSON.stringify(cypher)}`,
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

312 skills across 27 clusters, covering the full OpenClaw development surface:

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
| redteam | 7 | 🔒 Auth-required offensive security |
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

| Metric | Value |
|--------|-------|
| Workspace stub total size | ~660 bytes (4 files) |
| Flat-file workspace size | ~25,000+ bytes |
| **Size reduction** | **97%** |
| Graph query latency (cold) | ~95–105ms |
| Graph query latency (warm) | 0ms (60s cache) |
| Skill text search (312 nodes) | ~101ms |
| Token savings per session | ~2,200–6,200 tokens |
| DB file size (312 skills) | 10 MB |

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

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_GRAPH_NODE_BIN` | `node` | Path to Node.js binary |
| `OPENCLAW_GRAPH_QUERY_SCRIPT` | `~/openclaw-graph/ladybugdb/scripts/query.js` | Path to query script |

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

## License

MIT © 2025 openclaw-graph contributors

OpenClaw is © its respective authors. This project is an independent community contribution and is not affiliated with or endorsed by the OpenClaw project.
