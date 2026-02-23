# Workspace Stubs

Five files that replace your full `~/.openclaw/workspace/*.md` flat files.
Each contains one `<!-- GRAPH: ... -->` directive — OpenClaw resolves it against LadybugDB at session start.

Default workspace ID: **`openclaw`** — seeded into every DB release via `seed-default-workspace.mjs`.

## Before → After

| File | Before (flat) | After (stub) | Node type |
|------|--------------|--------------|-----------|
| SOUL.md    | ~1,800 bytes | 144 bytes | Soul |
| MEMORY.md  | ~5,000+ bytes | 130 bytes | Memory |
| USER.md    | ~800+ bytes  | 142 bytes | Memory (prefix: `User:`) |
| TOOLS.md   | ~2,000 bytes | 112 bytes | Tool |
| AGENTS.md  | ~500 bytes   | 127 bytes | AgentConfig |
| **Total**  | **~11,000+ bytes** | **~655 bytes** | |

Content is resolved at runtime from LadybugDB → injected into the agent system prompt.

## Quick Deploy

```bash
# 1. Install DB (already has workspace='openclaw' nodes)
curl -fsSL https://raw.githubusercontent.com/alphaonedev/openclaw-graph/main/install.sh | bash

# 2. Deploy stubs
cp workspace-stubs/*.md ~/.openclaw/workspace/

# 3. Apply workspace.ts patch
cd /path/to/openclaw && git apply path/to/patches/workspace-cache-fix.patch && pnpm build

# 4. Done. OpenClaw resolves all stubs from LadybugDB on next session start.
```

## Customizing Your Workspace

**Option A — Edit nodes directly with Cypher:**
```bash
# Update your identity
node ladybugdb/scripts/query.js --cypher \
  "MATCH (s:Soul {id:'soul-openclaw-identity'}) SET s.content = 'Name: MyAgent | Role: Ops agent | Emoji: 🛡️'"

# Add a memory fact
node ladybugdb/scripts/query.js --cypher \
  "CREATE (m:Memory {id:'mem-openclaw-infra', workspace:'openclaw', domain:'Infrastructure', content:'DB: ~/myapp/db.db | Node: /usr/local/bin/node', timestamp:'2026-01-01'})"

# Disable a tool
node ladybugdb/scripts/query.js --cypher \
  "MATCH (t:Tool {id:'tool-sessions-spawn'}) SET t.available = false"
```

**Option B — Fork the seed script:**
```bash
cp ladybugdb/scripts/seed-default-workspace.mjs ladybugdb/scripts/seed-myagent.mjs
# Edit WORKSPACE constant, SOUL/MEMORY/AGENT_CONFIG arrays
node ladybugdb/scripts/seed-myagent.mjs

# Update stubs to point to your workspace
sed -i "s/workspace = 'openclaw'/workspace = 'myagent'/g" workspace-stubs/*.md
```

**Option C — Multiple workspaces (8-instance fleet):**
```bash
# Each agent gets its own workspace ID
# Instance A: workspace='intel-agent'
# Instance B: workspace='code-agent'
# etc.
node ladybugdb/scripts/seed-default-workspace.mjs --workspace intel-agent
node ladybugdb/scripts/seed-default-workspace.mjs --workspace code-agent
```

## Stub Format

```
<!-- GRAPH: <cypher query> -->
```

- Must be the **first line** of the file
- Cypher must be a single line (no multi-line literals)
- `workspace.ts` resolves it via `execFileAsync(node, [query.js, '--cypher', '...'])`
- Result is cached with adaptive TTL: `60s × log₁₀(hit_count + 10)`
- Three-layer cache: disk stub → graph query cache → in-flight dedup

## AGENTS.md vs SOUL.md

| File | Table | Filter | Used for |
|------|-------|--------|----------|
| AGENTS.md | AgentConfig | `workspace = 'X'` | Delegation, heartbeats, session config |
| SOUL.md   | Soul        | `workspace = 'X'` | Identity, prime directive, vibe |
| MEMORY.md | Memory      | `workspace = 'X'` | Project facts, infrastructure, state |
| TOOLS.md  | Tool        | `available = true` | Available tools + usage notes |

Session filtering in OpenClaw: cron/subagent sessions only load AGENTS.md + TOOLS.md (`MINIMAL_BOOTSTRAP_ALLOWLIST`).
