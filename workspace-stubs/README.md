# Workspace Stubs

These 4 files replace your full `~/.openclaw/workspace/*.md` files.

Each file contains a single `<!-- GRAPH: ... -->` directive. OpenClaw's patched `workspace.ts` resolves these directives by querying LadybugDB and returning formatted markdown — which gets injected into the agent's system prompt.

## Before (flat files)

```
SOUL.md    → 1,800 bytes of markdown
MEMORY.md  → 5,000–20,000 bytes of markdown
TOOLS.md   → 2,000 bytes of markdown
AGENTS.md  → 500 bytes of markdown
```

## After (graph stubs)

```
SOUL.md    → 175 bytes (1 line)
MEMORY.md  → 185 bytes (1 line)
TOOLS.md   → 155 bytes (1 line)
AGENTS.md  → 145 bytes (1 line)
```

**Total stub footprint: ~660 bytes** vs **~25,000+ bytes** for flat files.

## How to deploy

1. Run `node ladybugdb/scripts/seed-workspace.js` (edit workspace ID first)
2. Copy these 4 files to `~/.openclaw/workspace/`
3. Ensure `workspace.ts` is patched (see `src/agents/workspace.graph.ts`)
4. Start OpenClaw — it will resolve graph content on first workspace load

## Customizing queries

Edit the Cypher in each stub to filter/sort differently:

```sql
-- Load only high-priority soul sections
MATCH (s:Soul) WHERE s.workspace = 'myapp' AND s.priority <= 3
RETURN s.section AS section, s.content AS content
ORDER BY s.priority ASC

-- Load memory for a specific domain
MATCH (m:Memory) WHERE m.workspace = 'myapp' AND m.domain = 'Infrastructure'
RETURN m.domain AS domain, m.content AS content

-- Load only available tools
MATCH (t:Tool) WHERE t.available = true
RETURN t.name AS name, t.notes AS notes ORDER BY t.name
```
