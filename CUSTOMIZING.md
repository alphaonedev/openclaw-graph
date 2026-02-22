# Customizing Your Workspace

openclaw-graph ships with a minimal, agnostic default workspace (`workspace='openclaw'`) baked into every DB release. This guide covers how to personalize it.

## What ships in the DB

Every v1.1+ release includes these `workspace='openclaw'` nodes out of the box:

| Table | Nodes | What's there |
|-------|-------|-------------|
| Soul | 4 | Prime Directive · Identity (placeholder) · Safety · Heartbeat Protocol |
| Memory | 2 | Principal (placeholder) · Infrastructure (placeholder) |
| AgentConfig | 9 | Every Session · Delegation · Safety · Heartbeats · Memory · TOON · Search Resilience · Schema Rules · Path Aliases |
| Tool | 21 | All standard OpenClaw tools · `sessions_spawn=true` |
| QueryMetrics | 0 | Schema only — populated automatically by workspace.ts |

These work out of the box. The placeholders tell you exactly what to fill in.

---

## Step 1 — Verify the defaults loaded

```bash
node ladybugdb/scripts/query.js --cypher \
  "MATCH (s:Soul {workspace:'openclaw'}) RETURN s.section, s.priority ORDER BY s.priority"

node ladybugdb/scripts/query.js --cypher \
  "MATCH (a:AgentConfig {workspace:'openclaw'}) RETURN a.key ORDER BY a.id"
```

---

## Step 2 — Update your Identity

```bash
node ladybugdb/scripts/query.js --cypher \
  "MATCH (s:Soul {id:'soul-openclaw-identity'}) \
   SET s.content = 'Name: Aria | Role: DevOps automation agent | Emoji: 🛡️ | Workspace: openclaw'"
```

---

## Step 3 — Fill in your Principal and Infrastructure

```bash
# Principal — who you're helping
node ladybugdb/scripts/query.js --cypher \
  "MATCH (m:Memory {id:'mem-openclaw-principal'}) \
   SET m.content = 'Name: Alice | Timezone: America/Chicago | Channel: signal | UUID: uuid:...'"

# Infrastructure — your environment facts
node ladybugdb/scripts/query.js --cypher \
  "MATCH (m:Memory {id:'mem-openclaw-infrastructure'}) \
   SET m.content = 'DB: ~/myapp/ladybugdb/db/alphaone-skills.db | Node: /usr/local/bin/node | Workspace: ~/.openclaw/workspace/'"
```

---

## Step 4 — Add more Memory domains

```bash
node ladybugdb/scripts/query.js --cypher \
  "CREATE (m:Memory {
     id: 'mem-openclaw-api-keys',
     workspace: 'openclaw',
     domain: 'API Keys',
     content: 'Brave Search: $BRAVE_API_KEY | xAI: $XAI_API_KEY (env vars in shell profile)',
     timestamp: '2026-01-01'
   })"
```

---

## Step 5 — Restrict or expand tools

```bash
# Disable sub-agent delegation for a restricted agent
node ladybugdb/scripts/query.js --cypher \
  "MATCH (t:Tool {id:'tool-sessions-spawn'}) SET t.available = false, t.notes = 'BLOCKED — standalone agent'"

# Re-enable it
node ladybugdb/scripts/query.js --cypher \
  "MATCH (t:Tool {id:'tool-sessions-spawn'}) SET t.available = true"
```

---

## Running multiple workspaces (fleet setup)

For an 8-agent fleet, give each agent its own workspace ID:

```bash
# Seed separate workspaces from the default template
node ladybugdb/scripts/seed-default-workspace.mjs --workspace intel-agent
node ladybugdb/scripts/seed-default-workspace.mjs --workspace code-agent
node ladybugdb/scripts/seed-default-workspace.mjs --workspace ops-agent

# Each agent's workspace stubs point to its own workspace
# ~/.openclaw/workspace-intel/SOUL.md:
#   <!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'intel-agent' ... -->
```

---

## Forking the seed script

For full control, fork `seed-default-workspace.mjs`:

```bash
cp ladybugdb/scripts/seed-default-workspace.mjs ladybugdb/scripts/seed-myagent.mjs
```

Edit the `SOUL`, `MEMORY`, `AGENT_CONFIG`, and `TOOLS` arrays at the top of the file, then:

```bash
node ladybugdb/scripts/seed-myagent.mjs --workspace myagent --reset
```

`--reset` drops and recreates the tables before seeding — use for a clean slate.

---

## Keeping your customizations across DB upgrades

When you upgrade to a new LadybugDB release (`install.sh`), the DB is **replaced**. Your workspace nodes live in the DB, so they'll be gone.

Two options:
1. **Re-run your seed script after upgrade** — keeps everything reproducible
2. **Dump your workspace nodes to a seed script before upgrading:**

```bash
node ladybugdb/scripts/query.js --cypher \
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
| `tool-sessions-spawn` | Tool | sessions_spawn (available=true) |
| *(+ 20 other tool-* nodes)* | Tool | All standard OpenClaw tools |
