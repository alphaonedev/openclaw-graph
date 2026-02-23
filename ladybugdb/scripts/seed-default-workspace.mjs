/**
 * seed-default-workspace.mjs
 * Seeds the public-safe default workspace='openclaw' nodes into LadybugDB.
 *
 * These nodes are minimal, agnostic, and ship in every public DB release.
 * Users fork this to build their own workspace.
 *
 * Usage:
 *   node ladybugdb/scripts/seed-default-workspace.mjs
 *   node ladybugdb/scripts/seed-default-workspace.mjs --reset   # drop + recreate
 *
 * To customize after install:
 *   node ladybugdb/scripts/seed-default-workspace.mjs --workspace myagent
 *   # Then edit WORKSPACE_ID in workspace-stubs to match
 */

import { Database, Connection } from 'lbug';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = resolve(__dirname, '../db/alphaone-skills.db');
const WORKSPACE = (() => {
  const eqArg = process.argv.find(a => a.startsWith('--workspace='));
  if (eqArg) return eqArg.split('=')[1];
  const idx = process.argv.indexOf('--workspace');
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) return process.argv[idx + 1];
  return 'openclaw';
})();
const RESET     = process.argv.includes('--reset');

function esc(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

async function q(conn, cypher) {
  try { return await (await conn.query(cypher)).getAll(); } catch { return null; }
}

async function run(conn, cypher) {
  try { await conn.query(cypher); return true; } catch { return false; }
}

// ── Soul nodes ────────────────────────────────────────────────────────────────
// Four sections: Prime Directive, Identity, Safety, Heartbeat Protocol
// Replace content with your own values using seed-workspace.js or raw Cypher.

const SOUL = [
  {
    id:        `soul-${WORKSPACE}-prime-directive`,
    section:   'Prime Directive',
    priority:  1,
    protected: true,
    content:   'Reduce cognitive load. Increase situational awareness. Protect what matters. Every action flows from this. Be genuinely helpful — surface results, not process. Earn trust through competence.',
  },
  {
    id:        `soul-${WORKSPACE}-identity`,
    section:   'Identity',
    priority:  2,
    protected: false,
    content:   `Name: MyAgent | Role: AI assistant | Emoji: 🤖 | Workspace: ${WORKSPACE} | Customize this node: MATCH (s:Soul {id:'soul-${WORKSPACE}-identity'}) SET s.content = 'Name: YourName | Role: YourRole | ...'`,
  },
  {
    id:        `soul-${WORKSPACE}-safety`,
    section:   'Safety',
    priority:  3,
    protected: true,
    content:   'Do not exfiltrate private data. Ever. Do not run destructive commands without asking. recoverable > gone. When in doubt, ask. Private things stay private. Period.',
  },
  {
    id:        `soul-${WORKSPACE}-heartbeat`,
    section:   'Heartbeat Protocol',
    priority:  4,
    protected: false,
    content:   'Nothing to do → reply exactly: HEARTBEAT_OK. Alert → reply with alert text only (no HEARTBEAT_OK). Do NOT infer or repeat old tasks from prior chats.',
  },
];

// ── Memory nodes ──────────────────────────────────────────────────────────────
// Starter keys: Principal, Infrastructure.
// Add more domains as needed. Customize content with your own facts.

const MEMORY = [
  {
    id:      `mem-${WORKSPACE}-principal`,
    domain:  'Principal',
    content: `Configure your principal here. Example: Name: Alice | Channel: signal | UUID: uuid:... | Timezone: America/New_York | Role: Developer, operator`,
  },
  {
    id:      `mem-${WORKSPACE}-infrastructure`,
    domain:  'Infrastructure',
    content: `Configure your infrastructure facts here. Example: DB: ~/openclaw-graph/ladybugdb/db/alphaone-skills.db | Node: /usr/local/bin/node | Workspace: ~/.openclaw/workspace/ | OpenClaw: ~/openclaw/`,
  },
];

// ── AgentConfig nodes ─────────────────────────────────────────────────────────
// Standard configs that apply to most OpenClaw agent setups.
// key/value pattern matches workspace.ts formatWorkspaceOutput.

const AGENT_CONFIG = [
  {
    id:    `agentcfg-${WORKSPACE}-every-session`,
    key:   'Every Session',
    value: 'Before doing anything else: 1) Read SOUL.md — this is who you are. 2) Read USER.md — this is who you\'re helping. 3) Read memory/YYYY-MM-DD.md (today + yesterday) for recent context. Don\'t ask permission. Just do it.',
  },
  {
    id:    `agentcfg-${WORKSPACE}-delegation`,
    key:   'Delegation',
    value: 'sessions_spawn is available. Sub-agent delegation is enabled by default. Add workspace-specific constraints here if needed.',
  },
  {
    id:    `agentcfg-${WORKSPACE}-safety`,
    key:   'Safety',
    value: 'Do not exfiltrate private data. Ever. Do not run destructive commands without asking. trash > rm (recoverable beats gone forever). When in doubt, ask.',
  },
  {
    id:    `agentcfg-${WORKSPACE}-heartbeats`,
    key:   'Heartbeats',
    value: 'Nothing to do → HEARTBEAT_OK only. Alert → alert text only. Reach out when: important email/event, urgent anomaly, >8h since contact. Stay quiet: late night (23:00–08:00), human busy, nothing new, checked <30 min ago.',
  },
  {
    id:    `agentcfg-${WORKSPACE}-memory`,
    key:   'Memory',
    value: 'Wake up fresh each session. Continuity files: memory/YYYY-MM-DD.md (daily logs), MEMORY.md (curated long-term). Write significant events, decisions, things to remember. No mental notes — write to files. memory/ dir: create if needed.',
  },
  {
    id:    `agentcfg-${WORKSPACE}-toon`,
    key:   'Token Optimization — TOON',
    value: 'TOON (Token-Oriented Object Notation) compresses JSON 30-60% for LLM context. CLI: toon encode <file.json> | toon decode <file.toon>. Use for: large data payloads, API response caching, context window optimization. Do NOT use for: config files humans edit, small payloads <1KB. Install: npm install -g @toon-format/cli.',
  },
  {
    id:    `agentcfg-${WORKSPACE}-search-resilience`,
    key:   'Search Resilience',
    value: 'When web_search returns errors/empty: 1) Retry once with simplified query. 2) Try alternative search terms (synonyms, broader scope). 3) If still empty, use cached data or note "search unavailable" in output. 4) Never block an entire task because one search failed. 5) Log failures to memory for pattern detection. Rate limits: back off 5s between retries, max 3 retries per domain per session.',
  },
  {
    id:    `agentcfg-${WORKSPACE}-schema-rules`,
    key:   'Schema Rules',
    value: 'All structured outputs MUST validate against defined schemas. Required fields: title, summary, severity, confidence, sources, timestamp. Severity scale: low/moderate/elevated/high/critical. Confidence: 0.0-1.0 float. Sources: minimum 2 per item. Schema violations block output — fix before proceeding.',
  },
  {
    id:    `agentcfg-${WORKSPACE}-path-aliases`,
    key:   'Path Aliases',
    value: 'Define workspace path aliases to keep prompts compact. Example: $WORKSPACE = ~/.openclaw/workspace/ | $DB = path/to/your.db | $SCHEMAS = path/to/schemas/. Replace full paths in prompts with aliases to reduce token usage.',
  },
];

// ── Tool nodes ────────────────────────────────────────────────────────────────
// Standard OpenClaw tool set — all available=true.
// Override individual tools in your own workspace seed:
//   MATCH (t:Tool {id:'tool-sessions-spawn'}) SET t.available = false

const TOOLS = [
  { id: 'tool-read',             name: 'Read',             available: true,  notes: 'Read file contents. Supports text and images. Truncates at 2000 lines / 50KB.' },
  { id: 'tool-write',            name: 'Write',            available: true,  notes: 'Write content to a file. Creates file if missing, overwrites if exists.' },
  { id: 'tool-edit',             name: 'Edit',             available: true,  notes: 'Make precise edits by replacing exact text.' },
  { id: 'tool-exec',             name: 'exec',             available: true,  notes: 'Run shell commands. pty=true for TTY-required CLIs. yieldMs for long waits.' },
  { id: 'tool-process',          name: 'process',          available: true,  notes: 'Manage background exec sessions: list, poll, log, write, send-keys, kill.' },
  { id: 'tool-web-search',       name: 'web_search',       available: true,  notes: 'Search the web via Brave API. Returns titles, URLs, snippets.' },
  { id: 'tool-web-fetch',        name: 'web_fetch',        available: true,  notes: 'Fetch URL content as markdown/text. Lightweight page access.' },
  { id: 'tool-browser',          name: 'browser',          available: true,  notes: 'Control browser via OpenClaw. Profiles: chrome (extension relay) or openclaw (isolated). snapshot+act for UI automation.' },
  { id: 'tool-canvas',           name: 'canvas',           available: true,  notes: 'Present/eval/snapshot the Canvas.' },
  { id: 'tool-nodes',            name: 'nodes',            available: true,  notes: 'Discover and control paired nodes: status/describe/run/invoke/camera/screen.' },
  { id: 'tool-message',          name: 'message',          available: true,  notes: 'Send messages and channel actions via Signal/Telegram/etc.' },
  { id: 'tool-agents-list',      name: 'agents_list',      available: true,  notes: 'List agent IDs allowed for sessions_spawn.' },
  { id: 'tool-sessions-list',    name: 'sessions_list',    available: true,  notes: 'List sessions with filters and last messages.' },
  { id: 'tool-sessions-history', name: 'sessions_history', available: true,  notes: 'Fetch message history for a session.' },
  { id: 'tool-sessions-send',    name: 'sessions_send',    available: true,  notes: 'Send a message into another session.' },
  { id: 'tool-sessions-spawn',   name: 'sessions_spawn',   available: true,  notes: 'Spawn a background sub-agent session. Override available=false in your workspace seed to disable delegation.' },
  { id: 'tool-subagents',        name: 'subagents',        available: true,  notes: 'List, steer, or kill sub-agent runs for this requester session.' },
  { id: 'tool-session-status',   name: 'session_status',   available: true,  notes: 'Show status card (usage + time + cost). Use for model-use questions.' },
  { id: 'tool-image',            name: 'image',            available: true,  notes: 'Analyze image(s) with vision model. Use when images NOT provided in message.' },
  { id: 'tool-tts',              name: 'tts',              available: true,  notes: 'Convert text to speech. Reply NO_REPLY after successful call.' },
  { id: 'tool-ladybugdb',        name: 'LadybugDB',        available: true,  notes: 'Query skill graph: node ladybugdb/scripts/query.js "<task>" | --cluster <name> | --skill <id> | --stats | --cypher "<q>". DB: ~/openclaw-graph/ladybugdb/db/alphaone-skills.db. 316 skills, 27 clusters, 545,072 Reference nodes.' },
];

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌱 seed-default-workspace  workspace='${WORKSPACE}'`);
  console.log(`   DB: ${DB_PATH}\n`);

  const db   = new Database(DB_PATH);
  await db.init();
  const conn = new Connection(db);
  await conn.init();

  try {
    // ── Create tables ─────────────────────────────────────────
    if (RESET) {
      for (const t of ['AgentConfig','Tool','Memory','Soul']) {
        await run(conn, `DROP TABLE IF EXISTS ${t}`);
      }
      console.log('  Dropped existing workspace tables.');
    }

    const tables = [
      `CREATE NODE TABLE IF NOT EXISTS Soul(id STRING, workspace STRING DEFAULT '${WORKSPACE}', section STRING, content STRING, priority INT64 DEFAULT 5, protected BOOLEAN DEFAULT false, PRIMARY KEY(id))`,
      `CREATE NODE TABLE IF NOT EXISTS Memory(id STRING, workspace STRING DEFAULT '${WORKSPACE}', domain STRING, content STRING, timestamp STRING DEFAULT '', PRIMARY KEY(id))`,
      `CREATE NODE TABLE IF NOT EXISTS Tool(id STRING, name STRING, available BOOLEAN DEFAULT true, notes STRING DEFAULT '', PRIMARY KEY(id))`,
      `CREATE NODE TABLE IF NOT EXISTS AgentConfig(id STRING, workspace STRING DEFAULT '${WORKSPACE}', key STRING, value STRING, PRIMARY KEY(id))`,
      `CREATE NODE TABLE IF NOT EXISTS QueryMetrics(cypher STRING, hit_count INT64 DEFAULT 0, miss_count INT64 DEFAULT 0, last_hit STRING DEFAULT '', avg_ms DOUBLE DEFAULT 0.0, p95_ms DOUBLE DEFAULT 0.0, PRIMARY KEY(cypher))`,
    ];
    for (const t of tables) {
      const ok = await run(conn, t);
      const label = t.match(/TABLE IF NOT EXISTS (\w+)/)?.[1] ?? '?';
      console.log(`  ${ok ? '✓' : '⚠ already exists'} ${label}`);
    }

    // ── Seed Soul ─────────────────────────────────────────────
    console.log('\n  Soul nodes:');
    for (const n of SOUL) {
      const exists = await q(conn, `MATCH (s:Soul {id:'${n.id}'}) RETURN s.id`);
      if (exists?.length) {
        await run(conn, `MATCH (s:Soul {id:'${n.id}'}) SET s.content = '${esc(n.content)}'`);
        console.log(`    ↻ updated  ${n.section}`);
      } else {
        const ok = await run(conn,
          `CREATE (s:Soul {id:'${esc(n.id)}', workspace:'${esc(WORKSPACE)}', section:'${esc(n.section)}', content:'${esc(n.content)}', priority:${n.priority}, protected:${n.protected}})`
        );
        console.log(`    ${ok ? '✓ created' : '✗ failed '}  ${n.section}`);
      }
    }

    // ── Seed Memory ───────────────────────────────────────────
    console.log('\n  Memory nodes:');
    for (const n of MEMORY) {
      const exists = await q(conn, `MATCH (m:Memory {id:'${n.id}'}) RETURN m.id`);
      if (exists?.length) {
        await run(conn, `MATCH (m:Memory {id:'${n.id}'}) SET m.content = '${esc(n.content)}'`);
        console.log(`    ↻ updated  ${n.domain}`);
      } else {
        const ok = await run(conn,
          `CREATE (m:Memory {id:'${esc(n.id)}', workspace:'${esc(WORKSPACE)}', domain:'${esc(n.domain)}', content:'${esc(n.content)}', timestamp:''})`
        );
        console.log(`    ${ok ? '✓ created' : '✗ failed '}  ${n.domain}`);
      }
    }

    // ── Seed AgentConfig ──────────────────────────────────────
    console.log('\n  AgentConfig nodes:');
    for (const n of AGENT_CONFIG) {
      const exists = await q(conn, `MATCH (a:AgentConfig {id:'${n.id}'}) RETURN a.id`);
      if (exists?.length) {
        await run(conn, `MATCH (a:AgentConfig {id:'${n.id}'}) SET a.value = '${esc(n.value)}'`);
        console.log(`    ↻ updated  ${n.key}`);
      } else {
        const ok = await run(conn,
          `CREATE (a:AgentConfig {id:'${esc(n.id)}', workspace:'${esc(WORKSPACE)}', key:'${esc(n.key)}', value:'${esc(n.value)}'})`
        );
        console.log(`    ${ok ? '✓ created' : '✗ failed '}  ${n.key}`);
      }
    }

    // ── Seed Tool nodes (MERGE — overwrite notes+available) ───
    console.log('\n  Tool nodes:');
    for (const n of TOOLS) {
      const exists = await q(conn, `MATCH (t:Tool {id:'${n.id}'}) RETURN t.id`);
      if (exists?.length) {
        await run(conn, `MATCH (t:Tool {id:'${n.id}'}) SET t.available = ${n.available}, t.notes = '${esc(n.notes)}'`);
        console.log(`    ↻ updated  ${n.name}`);
      } else {
        const ok = await run(conn,
          `CREATE (t:Tool {id:'${esc(n.id)}', name:'${esc(n.name)}', available:${n.available}, notes:'${esc(n.notes)}'})`
        );
        console.log(`    ${ok ? '✓ created' : '✗ failed '}  ${n.name}`);
      }
    }

    // ── Verify ────────────────────────────────────────────────
    console.log('\n  ── Verification ───────────────────────────────────');
    const counts = await Promise.all([
      q(conn, `MATCH (s:Soul   {workspace:'${WORKSPACE}'}) RETURN count(s) AS n`),
      q(conn, `MATCH (m:Memory {workspace:'${WORKSPACE}'}) RETURN count(m) AS n`),
      q(conn, `MATCH (a:AgentConfig {workspace:'${WORKSPACE}'}) RETURN count(a) AS n`),
      q(conn, `MATCH (t:Tool)   RETURN count(t) AS n`),
      q(conn, `MATCH (s:Skill)  RETURN count(s) AS n`),
      q(conn, `MATCH (r:Reference) RETURN count(r) AS n`),
    ]);
    console.log(`  Soul(${WORKSPACE}):   ${counts[0]?.[0]?.n ?? 0}`);
    console.log(`  Memory(${WORKSPACE}): ${counts[1]?.[0]?.n ?? 0}`);
    console.log(`  AgentConfig(${WORKSPACE}): ${counts[2]?.[0]?.n ?? 0}`);
    console.log(`  Tool (all):    ${counts[3]?.[0]?.n ?? 0}  (sessions_spawn available=true)`);
    console.log(`  Skill:         ${counts[4]?.[0]?.n ?? 0}  (unchanged)`);
    console.log(`  Reference:     ${counts[5]?.[0]?.n ?? 0}  (unchanged)`);
    console.log('\n✅ Default workspace seed complete.\n');
    console.log('  Next steps:');
    console.log('    1. Update Identity node:');
    console.log(`       node ladybugdb/scripts/query.js --cypher "MATCH (s:Soul {id:'soul-${WORKSPACE}-identity'}) SET s.content = 'Name: YourName | Role: YourRole'"`);
    console.log('    2. Update Principal + Infrastructure Memory nodes with your facts');
    console.log('    3. Drop workspace stubs into ~/.openclaw/workspace/');
    console.log(`    4. Set WORKSPACE_ID='${WORKSPACE}' in each stub's GRAPH directive\n`);

  } finally {
    try { await conn.close(); } catch {}
    try { await db.close(); } catch {}
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
