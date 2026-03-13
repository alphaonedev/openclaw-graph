# Customizing Your Workspace

openclaw-graph ships with a minimal, agnostic default workspace (`workspace='openclaw'`) seeded by `seed.py`. This guide covers how to personalize it.

## What ships in the DB

Every v1.5+ release seeds these `workspace='openclaw'` nodes via `python3 seed.py`:

| Label | Nodes | What's there |
|-------|-------|-------------|
| Soul | 4 | Prime Directive · Identity (placeholder) · Safety · Heartbeat Protocol |
| OCMemory | 2 | Principal (placeholder) · Infrastructure (placeholder) |
| AgentConfig | 9 | Every Session · Delegation · Safety · Heartbeats · Memory · TOON · Search Resilience · Schema Rules · Path Aliases |
| OCTool | 26 | All standard OpenClaw tools · `sessions_spawn=true` |
| SkillCluster | 27 | Skill groupings with IN_CLUSTER edges |

These work out of the box. The placeholders tell you exactly what to fill in.

---

## Step 1 — Verify the defaults loaded

```bash
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (s:Soul {workspace:'openclaw'}) RETURN s.section, s.priority ORDER BY s.priority"

cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (a:AgentConfig {workspace:'openclaw'}) RETURN a.key ORDER BY a.id"
```

---

## Step 2 — Update your Identity

```bash
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (s:Soul {id:'soul-openclaw-identity'}) \
   SET s.content = 'Name: Aria | Role: DevOps automation agent | Emoji: 🛡️ | Workspace: openclaw'"
```

---

## Step 3 — Fill in your Principal and Infrastructure

```bash
# Principal — who you're helping
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (m:OCMemory {id:'mem-openclaw-principal'}) \
   SET m.content = 'Name: Alice | Timezone: America/Chicago | Channel: signal | UUID: uuid:...'"

# Infrastructure — your environment facts
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (m:OCMemory {id:'mem-openclaw-infrastructure'}) \
   SET m.content = 'DB: bolt://localhost:7687 (Neo4j) | Python: /opt/anaconda3/bin/python3 | Workspace: ~/.openclaw/workspace/'"
```

---

## Step 4 — Add more Memory domains

```bash
cypher-shell -a bolt://localhost:7687 --format plain \
  "CREATE (m:OCMemory {
     id: 'mem-openclaw-api-keys',
     workspace: 'openclaw',
     domain: 'API Keys',
     content: 'Brave Search: \$BRAVE_API_KEY | xAI: \$XAI_API_KEY (env vars in shell profile)',
     timestamp: '2026-01-01'
   })"
```

---

## Step 5 — Restrict or expand tools

```bash
# Disable sub-agent delegation for a restricted agent
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (t:OCTool {id:'tool-sessions-spawn'}) SET t.available = false, t.notes = 'BLOCKED — standalone agent'"

# Re-enable it
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (t:OCTool {id:'tool-sessions-spawn'}) SET t.available = true"
```

---

## Running multiple workspaces (fleet setup)

For an 8-agent fleet, give each agent its own workspace ID:

```bash
# Seed separate workspaces from the default template
python3 seed.py --workspace intel-agent
python3 seed.py --workspace code-agent
python3 seed.py --workspace ops-agent

# Each agent's workspace stubs point to its own workspace
# ~/.openclaw/workspace-intel/SOUL.md:
#   <!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'intel-agent' ... -->
```

---

## Customizing the seed script

For full control, modify the workspace defaults in `seed.py`:

Edit the `workspace_defaults()` function's data structures, then:

```bash
python3 seed.py --workspace myagent --reset
```

`--reset` deletes existing workspace nodes before seeding — use for a clean slate.

---

## Keeping your customizations across upgrades

The migration script uses `MERGE` (upsert), so re-running it is safe and idempotent — existing nodes are updated, not duplicated.

Two options:
1. **Re-run `python3 seed.py`** — keeps everything reproducible (uses MERGE, idempotent)
2. **Dump your workspace nodes before upgrading:**

```bash
cypher-shell -a bolt://localhost:7687 --format plain \
  "MATCH (s:Soul {workspace:'openclaw'}) RETURN s.id, s.section, s.content, s.priority" \
  > my-workspace-backup.json
```

---

## Quick reference — node IDs shipped in default workspace

| ID | Type | Section/Domain/Key |
|----|------|--------------------|
| `soul-openclaw-prime-directive` | Soul | Prime Directive |
| `soul-openclaw-identity` | Soul | Identity |
| `soul-openclaw-safety` | Soul | Safety |
| `soul-openclaw-heartbeat` | Soul | Heartbeat Protocol |
| `mem-openclaw-principal` | OCMemory | Principal |
| `mem-openclaw-infrastructure` | OCMemory | Infrastructure |
| `agentcfg-openclaw-every-session` | AgentConfig | Every Session |
| `agentcfg-openclaw-delegation` | AgentConfig | Delegation |
| `agentcfg-openclaw-safety` | AgentConfig | Safety |
| `agentcfg-openclaw-heartbeats` | AgentConfig | Heartbeats |
| `agentcfg-openclaw-memory` | AgentConfig | Memory |
| `agentcfg-openclaw-toon` | AgentConfig | Token Optimization — TOON |
| `agentcfg-openclaw-search-resilience` | AgentConfig | Search Resilience |
| `agentcfg-openclaw-schema-rules` | AgentConfig | Schema Rules |
| `agentcfg-openclaw-path-aliases` | AgentConfig | Path Aliases |
| `tool-sessions-spawn` | OCTool | sessions_spawn (available=true) |
| *(+ 25 other tool-* nodes)* | OCTool | All standard OpenClaw tools |
