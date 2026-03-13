# Workspace Stubs

Five files that replace your full `~/.openclaw/workspace/*.md` flat files.
Each contains one `<!-- GRAPH: ... -->` directive — OpenClaw resolves it against Neo4j at session start.

Default workspace ID: **`openclaw`** — seeded via `python3 seed.py`.

## Before → After

| File | Before (flat) | After (stub) | Node type |
|------|--------------|--------------|-----------|
| SOUL.md    | ~1,800 bytes | 144 bytes | Soul |
| MEMORY.md  | ~5,000+ bytes | 130 bytes | OCMemory |
| USER.md    | ~800+ bytes  | 142 bytes | OCMemory (prefix: `User:`) |
| TOOLS.md   | ~2,000 bytes | 112 bytes | OCTool |
| AGENTS.md  | ~500 bytes   | 127 bytes | AgentConfig |
| **Total**  | **~11,000+ bytes** | **~655 bytes** | |

Content is resolved at runtime from Neo4j → injected into the agent system prompt.

## Quick Deploy

```bash
# 1. Install Neo4j and seed data
./install.sh

# 2. Deploy stubs
cp workspace-stubs/*.md ~/.openclaw/workspace/

# 3. Apply workspace.ts patch
cd /path/to/openclaw && git apply path/to/patches/workspace-cache-fix.patch && pnpm build

# 4. Done. OpenClaw resolves all stubs from Neo4j on next session start.
```

## Customizing Your Workspace

**Option A — Edit nodes directly with Cypher:**
```bash
# Update your identity
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (s:Soul {id:'soul-openclaw-identity'}) SET s.content = 'Name: MyAgent | Role: Ops agent | Emoji: 🛡️'"

# Add a memory fact
cypher-shell -a bolt://localhost:7687 --format plain \
  "CREATE (m:OCMemory {id:'mem-openclaw-infra', workspace:'openclaw', domain:'Infrastructure', content:'DB: bolt://localhost:7687 | Python: /opt/anaconda3/bin/python3', timestamp:'2026-01-01'})"

# Disable a tool
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (t:OCTool {id:'tool-sessions-spawn'}) SET t.available = false"
```

**Option B — Re-run seed with custom workspace:**
```bash
python3 seed.py --workspace myagent

# Or use the installer (auto-deploys stubs with correct workspace)
./install.sh --workspace myagent
```

**Option C — Multiple workspaces (8-instance fleet):**
```bash
# Each agent gets its own workspace ID
# Instance A: workspace='intel-agent'
# Instance B: workspace='code-agent'
# etc.
python3 seed.py --workspace intel-agent
python3 seed.py --workspace code-agent
```

## Stub Format

```
<!-- GRAPH: <cypher query> -->
```

- Must be the **first line** of the file
- Cypher must be a single line (no multi-line literals)
- `workspace.ts` resolves it via `cypher-shell` subprocess
- Result is cached with adaptive TTL: `60s × log₁₀(hit_count + 10)`
- Three-layer cache: disk stub → graph query cache → in-flight dedup

## AGENTS.md vs SOUL.md

| File | Label | Filter | Used for |
|------|-------|--------|----------|
| AGENTS.md | AgentConfig | `workspace = 'X'` | Delegation, heartbeats, session config |
| SOUL.md   | Soul        | `workspace = 'X'` | Identity, prime directive, vibe |
| MEMORY.md | OCMemory    | `workspace = 'X'` | Project facts, infrastructure, state |
| TOOLS.md  | OCTool      | `available = true AND workspace = 'X'` | Available tools + usage notes |

Session filtering in OpenClaw: cron/subagent sessions only load AGENTS.md + TOOLS.md (`MINIMAL_BOOTSTRAP_ALLOWLIST`).
