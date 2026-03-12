# openclaw-graph

**Graph-native workspace backend for [OpenClaw](https://github.com/openclaw/openclaw) — powered by Neo4j**

Replace flat workspace markdown files with Cypher graph directives. 316 skills across 27 clusters · 217 skill relationships · proper graph modeling with SkillCluster nodes · namespaced labels for multi-graph coexistence.

[![v1.4](https://img.shields.io/badge/release-v1.4-brightgreen)](https://github.com/alphaonedev/openclaw-graph/releases)
[![Skills](https://img.shields.io/badge/skills-316-blue)](skills/)
[![Clusters](https://img.shields.io/badge/clusters-27-green)](skills/)
[![Neo4j](https://img.shields.io/badge/Neo4j-2026.01-blue)](https://neo4j.com)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://alphaonedev.github.io/openclaw-graph)

---

## What's new in v1.4

**Neo4j-native.** OpenClaw Graph now runs on Neo4j with proper graph modeling — SkillCluster nodes, typed relationships, namespaced labels, and workspace-scoped isolation.

| | v1.3 | v1.4 |
|--|------|------|
| Graph backend | embedded SQLite | ✅ Neo4j (native Cypher) |
| SkillCluster nodes | clusters as property | ✅ first-class nodes + `IN_CLUSTER` edges |
| Multi-graph coexistence | N/A | ✅ namespaced labels, workspace isolation |
| Storage footprint | 3.2 GB | ✅ ~10 MB |
| Installation | `curl \| bash` + Node.js | ✅ Neo4j + Python migration script |

**Why Neo4j?** Native graph storage with index-free adjacency. Sub-millisecond traversals, Cypher queries, proper relationship modeling. The 316 skills + 27 clusters + workspace nodes add only ~10 MB to a Neo4j instance.

---

## What is this?

OpenClaw agents load workspace context from flat markdown files (`SOUL.md`, `MEMORY.md`, `TOOLS.md`, `AGENTS.md`). As your workspace grows, these files balloon — injecting tens of thousands of tokens into every system prompt.

**openclaw-graph** replaces those files with single-line Cypher directives:

```markdown
<!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'myapp' RETURN s.section AS section, s.content AS content ORDER BY s.priority ASC -->
```

When OpenClaw loads the workspace, the directive is resolved by querying Neo4j, formatted as structured markdown, and injected into the system prompt — exactly as if it were a flat file.

**Result:** Workspace stubs shrink from ~25,000 bytes to ~660 bytes. Sub-millisecond query times. Skill lookup across 316 nodes in ~2ms.

---

## Architecture

```
OpenClaw Session
│
├── loadWorkspaceBootstrapFiles()
│   ├── SOUL.md    (1 line: <!-- GRAPH: MATCH (s:Soul)... -->)
│   ├── MEMORY.md  (1 line: <!-- GRAPH: MATCH (m:OCMemory)... -->)
│   ├── USER.md    (1 line: <!-- GRAPH: MATCH (m:OCMemory) WHERE m.domain STARTS WITH 'User:'... -->)
│   ├── TOOLS.md   (1 line: <!-- GRAPH: MATCH (t:OCTool)... -->)
│   └── AGENTS.md  (1 line: <!-- GRAPH: MATCH (a:AgentConfig)... -->)
│       │
│       └── readFileWithCache()
│           ├── detect GRAPH directive
│           ├── execute Cypher query against Neo4j
│           ├── cache result 60s (in-process Map)
│           └── return formatted markdown
│
└── buildAgentSystemPrompt()
    └── injects graph-resolved markdown → system prompt

Neo4j (bolt://localhost:7687)
├── Skill          316 nodes · 27 SkillCluster nodes · 217 RELATED_TO edges
├── SkillCluster   proper graph nodes with IN_CLUSTER relationships
├── Soul           identity, persona, capabilities per workspace
├── OCMemory       project context, infrastructure facts (namespaced)
├── OCTool         available tools + usage notes (namespaced)
├── OCAgent        agent definitions (namespaced)
├── AgentConfig    per-workspace agent behavior overrides
└── Bootstrap      boot identity
```

---

## Prerequisites

Install these **before** running the migration:

| Dependency | Version | macOS | Ubuntu / Debian | Fedora |
|------------|---------|-------|-----------------|--------|
| **Neo4j** | 2026.01+ | `brew install neo4j` | See below | See below |
| **Python** | 3.10+ | pre-installed or `brew install python` | `sudo apt install python3` | `sudo dnf install python3` |
| **neo4j driver** | 5.x | `pip install neo4j` | `pip install neo4j` | `pip install neo4j` |

<details>
<summary><strong>macOS — step by step</strong></summary>

```bash
# 1. Install Homebrew (skip if already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Neo4j
brew install neo4j
brew services start neo4j

# 3. Install Python neo4j driver
pip install neo4j
```

</details>

<details>
<summary><strong>Ubuntu / Debian — step by step</strong></summary>

```bash
# 1. Add Neo4j repository and install
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/neo4j.gpg
echo "deb [signed-by=/usr/share/keyrings/neo4j.gpg] https://debian.neo4j.com stable latest" | sudo tee /etc/apt/sources.list.d/neo4j.list
sudo apt-get update && sudo apt-get install -y neo4j

# 2. Start Neo4j
sudo systemctl start neo4j

# 3. Install Python neo4j driver
pip install neo4j
```

</details>

<details>
<summary><strong>Fedora — step by step</strong></summary>

```bash
# 1. Add Neo4j repository and install
sudo rpm --import https://debian.neo4j.com/neotechnology.gpg.key
cat << EOF | sudo tee /etc/yum.repos.d/neo4j.repo
[neo4j]
name=Neo4j RPM Repository
baseurl=https://yum.neo4j.com/stable/5
gpgcheck=1
gpgkey=https://debian.neo4j.com/neotechnology.gpg.key
EOF
sudo dnf install -y neo4j

# 2. Start Neo4j
sudo systemctl start neo4j

# 3. Install Python neo4j driver
pip install neo4j
```

</details>

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/alphaonedev/openclaw-graph.git
cd openclaw-graph
```

### 2. Run the migration

```bash
# Preview first (no writes)
python3 migrate_ladybugdb_to_neo4j.py --dry-run

# Migrate — creates all nodes, relationships, constraints
python3 migrate_ladybugdb_to_neo4j.py
# → 316 Skills, 27 SkillClusters, 217 RELATED_TO, 316 IN_CLUSTER — 0.9s
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
# Edit each stub: change workspace name to match your deployment
```

### 5. Personalize

```bash
# Update your identity via Cypher
python3 -c "
from neo4j import GraphDatabase
d = GraphDatabase.driver('bolt://localhost:7687')
with d.session() as s:
    s.run('''MATCH (s:Soul {id: \"soul-openclaw-identity\"})
             SET s.content = \"Name: MyAgent | Role: Expert Engineer | Workspace: my_workspace\"''')
d.close()
"

# See CUSTOMIZING.md for the full guide
```

---

## What gets created in Neo4j

| Label | Count | Description |
|-------|-------|-------------|
| `Skill` | 316 | Skills with full SKILL.md content |
| `SkillCluster` | 27 | Clusters as proper graph nodes |
| `Soul` | 4 | Agent personality/behavior |
| `OCMemory` | 2 | Workspace memory (prefixed to avoid collisions) |
| `AgentConfig` | 9 | Runtime config directives |
| `OCAgent` | 8 | Agent fleet definitions (prefixed — `Agent` may exist) |
| `OCTool` | 26 | Tool definitions (prefixed for namespacing) |
| `Bootstrap` | 1 | Boot identity |

**Relationships:** `(:Skill)-[:IN_CLUSTER]->(:SkillCluster)` (316) and `(:Skill)-[:RELATED_TO]->(:Skill)` (217).

All nodes get a `workspace` property for multi-tenant isolation.

### Multi-graph coexistence

Namespaced labels (`OCAgent`, `OCMemory`, `OCTool`) let OpenClaw Graph nodes coexist safely with other graph domains in the same Neo4j instance. If your Neo4j already hosts other workloads (knowledge graphs, analytics, etc.), OpenClaw Graph's namespaced labels and workspace-scoped queries ensure zero interference — no label collisions, no cross-domain leakage.

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
  path.join(os.homedir(), "openclaw-graph", "scripts", "query.js");

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
export OPENCLAW_GRAPH_QUERY_SCRIPT=/path/to/openclaw-graph/scripts/query.js
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
# Cypher queries against Neo4j
python3 -c "
from neo4j import GraphDatabase
d = GraphDatabase.driver('bolt://localhost:7687')
with d.session() as s:
    # Find skills by cluster
    for r in s.run('MATCH (s:Skill)-[:IN_CLUSTER]->(c:SkillCluster {name: \"devops-sre\"}) RETURN s.name, s.description'):
        print(f'{r[\"s.name\"]:30s} {r[\"s.description\"]}')

    # Multi-hop skill discovery (2 hops)
    for r in s.run('MATCH (s:Skill {name: \"terraform\"})-[:RELATED_TO*1..2]->(t:Skill) RETURN DISTINCT t.name, t.cluster'):
        print(f'{r[\"t.name\"]:30s} {r[\"t.cluster\"]}')
d.close()
"
```

---

## Performance

Measured on production Neo4j 2026.01 — 316 skills, 27 clusters, 393 total nodes, Mac mini M-series.

| Query | avg |
|-------|-----|
| Skill lookup by ID | **<1ms** |
| Full skill scan (316 nodes) | **~2ms** |
| Cluster traversal (IN_CLUSTER) | **<1ms** |
| Multi-hop skill reasoning (2 hops) | **~3ms** |
| Workspace stubs (Soul/Memory/Config) | **<1ms** |
| Migration (full import) | **0.9s** |
| Neo4j storage overhead | **~10 MB** |

### Context efficiency

| Metric | Value |
|--------|-------|
| Workspace stub total size | ~655 bytes (5 files) |
| Flat-file workspace size | ~11,000–25,000+ bytes |
| **Size reduction** | **94–97%** |
| Token savings per session | ~2,700–6,200 tokens |

See [benchmarks/results.md](benchmarks/results.md) for full measurements.

---

## Multi-Instance Deployment

For teams running multiple OpenClaw instances (e.g., a fleet of AI agents), all instances share the same Neo4j. Differentiate instances by `workspace` identifier:

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

## Service Management

### Neo4j

```bash
# macOS (Homebrew)
brew services start neo4j
brew services stop neo4j
brew services restart neo4j

# Ubuntu / Debian / Fedora (systemd)
sudo systemctl start neo4j
sudo systemctl stop neo4j
sudo systemctl restart neo4j
sudo systemctl status neo4j
```

### OpenClaw Gateway

```bash
# macOS (launchd — ai.openclaw.gateway)
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.openclaw.gateway.plist
launchctl bootout gui/$UID/ai.openclaw.gateway
launchctl kickstart -k gui/$UID/ai.openclaw.gateway

# Ubuntu & Fedora (systemd)
systemctl --user start openclaw-gateway.service
systemctl --user stop openclaw-gateway.service
systemctl --user restart openclaw-gateway.service
```

### Health check

```bash
python3 -c "
from neo4j import GraphDatabase
d = GraphDatabase.driver('bolt://localhost:7687')
with d.session() as s:
    for r in s.run('MATCH (n) WHERE n.workspace = \$ws RETURN labels(n)[0] AS type, count(n) AS cnt ORDER BY type', ws='openclaw_master_conductor'):
        print(f'{r[\"type\"]:20s} {r[\"cnt\"]}')
d.close()
"
```

---

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

To add skills: create a `SKILL.md` file in the appropriate cluster directory and run the migration script to load into Neo4j.

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
| **[Admin Guide](https://alphaonedev.github.io/openclaw-graph/admin-guide.html)** | Installation, database layout, CLI reference, fleet management, upgrading, troubleshooting |
| **[User Guide](https://alphaonedev.github.io/openclaw-graph/user-guide.html)** | Workspace stubs, GRAPH directives, node schemas (Soul/Memory/AgentConfig/Tool/Skill), loading flow |
| **[Customizing](CUSTOMIZING.md)** | Step-by-step workspace personalization — identity, memory, tools, multi-workspace setup |
| **[Benchmarks](benchmarks/results.md)** | Full performance measurements with methodology |
| **[GitHub Pages](https://alphaonedev.github.io/openclaw-graph/)** | Interactive documentation site |

---

## License

MIT © 2025 openclaw-graph contributors

OpenClaw is © its respective authors. This project is an independent community contribution and is not affiliated with or endorsed by the OpenClaw project.
