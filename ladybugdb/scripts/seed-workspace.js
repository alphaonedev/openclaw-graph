/**
 * openclaw-graph — Workspace Seed Script (full customization template)
 *
 * ── Quick start ──────────────────────────────────────────────────────────────
 * The default workspace ('openclaw') is already seeded in every DB release.
 * For quick customization of the defaults, use seed-default-workspace.mjs:
 *
 *   node ladybugdb/scripts/seed-default-workspace.mjs
 *   node ladybugdb/scripts/seed-default-workspace.mjs --workspace myagent
 *
 * ── This script ──────────────────────────────────────────────────────────────
 * Use this for a fully custom workspace with your own Soul/Memory/Tool nodes.
 * Edit WORKSPACE_ID and the node arrays below, then run:
 *
 *   node seed-workspace.js           # Seed (skips existing nodes)
 *   node seed-workspace.js --reset   # Drop tables + re-seed from scratch
 *
 * After seeding, deploy workspace stubs:
 *   cp workspace-stubs/*.md ~/.openclaw/workspace/
 *   # Edit each stub's GRAPH directive: change 'openclaw' → your WORKSPACE_ID
 *
 * See CUSTOMIZING.md for the full guide.
 */
import { Database, Connection } from 'lbug';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../db/alphaone-skills.db');
const RESET = process.argv.includes('--reset');

// ── CONFIGURE YOUR WORKSPACE IDENTITY ────────────────────────────────────────
// Replace these with your actual workspace content.
// workspace: a short identifier for this deployment (e.g., 'myapp', 'dev', 'prod')
// Keep sensitive data (API keys, emails, UUIDs) ONLY in your private deployment.

const WORKSPACE_ID = 'myapp'; // Change this to identify your deployment

// ── Soul nodes — your agent's identity and behavior ───────────────────────────
// Add/remove/edit sections. priority controls display order (lower = shown first).
const SOUL_NODES = [
  {
    id: `soul-${WORKSPACE_ID}-core-truths`,
    workspace: WORKSPACE_ID,
    section: 'Core Truths',
    priority: 1,
    protected: true,
    content: `Be genuinely helpful, not performatively helpful. Have opinions. Be resourceful before asking. Earn trust through competence.`
  },
  {
    id: `soul-${WORKSPACE_ID}-boundaries`,
    workspace: WORKSPACE_ID,
    section: 'Boundaries',
    priority: 2,
    protected: true,
    content: `Private things stay private. Ask before acting externally. Never send half-baked replies to messaging surfaces.`
  },
  {
    id: `soul-${WORKSPACE_ID}-vibe`,
    workspace: WORKSPACE_ID,
    section: 'Vibe',
    priority: 3,
    protected: false,
    content: `Be the assistant you would actually want to talk to. Concise when needed, thorough when it matters.`
  },
  {
    id: `soul-${WORKSPACE_ID}-capabilities`,
    workspace: WORKSPACE_ID,
    section: 'Capabilities',
    priority: 4,
    protected: false,
    content: `1. [Add your primary capability here]. 2. [Add secondary capability]. 3. LadybugDB graph backend: query skill graph for task routing.`
  },
  // Add more Soul nodes as needed...
];

// ── Memory nodes — facts, state, and context ──────────────────────────────────
// Add entries for infrastructure state, project context, user preferences, etc.
// Do NOT include raw API keys here — store those in env vars or a secrets manager.
const MEMORY_NODES = [
  {
    id: `mem-${WORKSPACE_ID}-project`,
    workspace: WORKSPACE_ID,
    domain: 'Project Context',
    timestamp: new Date().toISOString().slice(0, 10),
    content: `[Describe your project here. What is it? Who uses it? What are the key goals?]`
  },
  {
    id: `mem-${WORKSPACE_ID}-infrastructure`,
    workspace: WORKSPACE_ID,
    domain: 'Infrastructure',
    timestamp: new Date().toISOString().slice(0, 10),
    content: `[Document your infrastructure: servers, services, ports, paths. E.g.: OpenClaw install: ~/Downloads/openclaw/. Skills: ~/Downloads/openclaw/skills/.]`
  },
  {
    id: `mem-${WORKSPACE_ID}-graph`,
    workspace: WORKSPACE_ID,
    domain: 'LadybugDB Graph Backend',
    timestamp: new Date().toISOString().slice(0, 10),
    content: `DB: ~/openclaw-graph/ladybugdb/db/skills.db. 312 skills, 27 clusters, 247 edges. lbug 0.14.3. Query: node ladybugdb/scripts/query.js "<task>" | --cluster <name> | --stats.`
  },
  // Add more Memory nodes as needed...
];

// ── Tool nodes — available tools and their usage notes ────────────────────────
// Customize to match the tools available in your OpenClaw deployment.
const TOOL_NODES = [
  { id: 'tool-read',        name: 'Read',        available: true, notes: 'Read file contents. Supports text and images.' },
  { id: 'tool-write',       name: 'Write',        available: true, notes: 'Write content to a file.' },
  { id: 'tool-edit',        name: 'Edit',         available: true, notes: 'Precise text replacement edits.' },
  { id: 'tool-exec',        name: 'exec',         available: true, notes: 'Run shell commands. pty=true for interactive CLIs.' },
  { id: 'tool-web-search',  name: 'web_search',   available: true, notes: 'Search the web via Brave API.' },
  { id: 'tool-web-fetch',   name: 'web_fetch',    available: true, notes: 'Fetch URL content as markdown.' },
  { id: 'tool-browser',     name: 'browser',      available: true, notes: 'Control browser via OpenClaw.' },
  { id: 'tool-ladybugdb',   name: 'LadybugDB',    available: true, notes: 'Query skill graph: node ladybugdb/scripts/query.js "<task>" | --cluster | --skill | --stats' },
  // Add / remove tools to match your deployment...
];

// ─────────────────────────────────────────────────────────────────────────────
// Implementation below — no edits needed past this line.

async function openDB() {
  const db = new Database(DB_PATH);
  await db.init();
  const conn = new Connection(db);
  await conn.init();
  return { db, conn };
}

async function runQuery(conn, cypher) {
  try { const r = await conn.query(cypher); return await r.getAll(); } catch { return null; }
}
async function exec(conn, cypher) {
  try { await conn.query(cypher); return true; } catch { return false; }
}
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function createTables(conn) {
  console.log('Creating workspace tables...');
  if (RESET) {
    for (const t of ['AgentConfig', 'Tool', 'Memory', 'Soul']) {
      await exec(conn, `DROP TABLE IF EXISTS ${t}`);
    }
    console.log('  Dropped existing workspace tables.');
  }
  const ddl = [
    `CREATE NODE TABLE IF NOT EXISTS Soul(id STRING, workspace STRING DEFAULT 'myapp', section STRING, content STRING, priority INT64 DEFAULT 5, protected BOOLEAN DEFAULT false, PRIMARY KEY(id))`,
    `CREATE NODE TABLE IF NOT EXISTS Memory(id STRING, workspace STRING DEFAULT 'myapp', domain STRING, content STRING, timestamp STRING DEFAULT '', PRIMARY KEY(id))`,
    `CREATE NODE TABLE IF NOT EXISTS Tool(id STRING, name STRING, available BOOLEAN DEFAULT true, notes STRING DEFAULT '', PRIMARY KEY(id))`,
    `CREATE NODE TABLE IF NOT EXISTS AgentConfig(id STRING, workspace STRING DEFAULT 'myapp', key STRING, value STRING, PRIMARY KEY(id))`,
  ];
  for (const q of ddl) {
    const ok = await exec(conn, q);
    const tableName = q.match(/TABLE IF NOT EXISTS (\w+)/)?.[1] ?? '?';
    console.log(`  ${ok ? '✓' : '✗'} ${tableName}`);
  }
}

async function seedTable(conn, label, nodes, buildQuery) {
  console.log(`\nSeeding ${label} nodes...`);
  let inserted = 0, skipped = 0;
  for (const n of nodes) {
    const existing = await runQuery(conn, `MATCH (x:${label} {id: '${esc(n.id)}'}) RETURN x.id`);
    if (existing?.length > 0) { skipped++; continue; }
    const ok = await exec(conn, buildQuery(n));
    ok ? inserted++ : console.warn(`  ✗ Failed to insert: ${n.id}`);
    if (ok) inserted++;
  }
  console.log(`  ${inserted} inserted, ${skipped} skipped`);
}

async function main() {
  console.log('openclaw-graph — Workspace Seed');
  console.log(`Workspace: ${WORKSPACE_ID} | DB: ${DB_PATH}`);
  if (RESET) console.log('Mode: RESET');

  const { db, conn } = await openDB();
  try {
    await createTables(conn);

    await seedTable(conn, 'Soul', SOUL_NODES, n =>
      `CREATE (s:Soul {id: '${esc(n.id)}', workspace: '${esc(n.workspace)}', section: '${esc(n.section)}', content: '${esc(n.content)}', priority: ${n.priority}, protected: ${n.protected}})`
    );

    await seedTable(conn, 'Memory', MEMORY_NODES, n =>
      `CREATE (m:Memory {id: '${esc(n.id)}', workspace: '${esc(n.workspace)}', domain: '${esc(n.domain)}', content: '${esc(n.content)}', timestamp: '${esc(n.timestamp)}'})`
    );

    await seedTable(conn, 'Tool', TOOL_NODES, n =>
      `CREATE (t:Tool {id: '${esc(n.id)}', name: '${esc(n.name)}', available: ${n.available}, notes: '${esc(n.notes)}'})`
    );

    console.log('\n=== Verification ===');
    for (const [label, q] of [['Soul', 'MATCH (s:Soul)'], ['Memory', 'MATCH (m:Memory)'], ['Tool', 'MATCH (t:Tool)'], ['Skill', 'MATCH (s:Skill)']]) {
      const r = await runQuery(conn, `${q} RETURN count(*) AS cnt`);
      console.log(`  ${label.padEnd(8)} ${r?.[0]?.cnt ?? 0}`);
    }

    console.log('\n✅ Done. Update your workspace stubs with GRAPH directives.');
    console.log(`   Example SOUL.md content:`);
    console.log(`   <!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = '${WORKSPACE_ID}' RETURN s.section AS section, s.content AS content ORDER BY s.priority ASC -->`);
  } finally {
    await conn.close();
    await db.close();
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
