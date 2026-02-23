#!/usr/bin/env node
/**
 * import-workspace.mjs — Load your OpenClaw flat markdown files into LadybugDB
 *
 * GOLDEN RETRIEVER SIMPLE — one command, done:
 *   node ladybugdb/scripts/import-workspace.mjs
 *
 * OPTIONS:
 *   --workspace-dir  <path>   Where your .md files live (default: ~/.openclaw/workspace)
 *   --workspace-name <name>   DB workspace key (default: openclaw)
 *   --dry-run                 Preview what will be imported — no DB writes
 *   --overwrite               Replace existing nodes (default: skip if exists)
 *   --write-stubs             After import, replace flat .md files with GRAPH stubs
 *
 * FILE → NODE MAPPING:
 *   SOUL.md    → Soul nodes        { section, content, priority, workspace }
 *   MEMORY.md  → Memory nodes      { domain,  content, timestamp, workspace }
 *   USER.md    → Memory nodes      { domain = "User: <section>", workspace }
 *   TOOLS.md   → Tool nodes        { name,    notes,  available }  (no workspace col)
 *   AGENTS.md  → AgentConfig nodes { key,     value,  workspace }
 *
 * Each file is parsed by ## headings — each ## section becomes one DB node.
 * Files with no ## headings are imported as a single node titled "Main".
 */

import { Database, Connection } from 'lbug';
import { readFileSync, existsSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = resolve(__dirname, '../db/alphaone-skills.db');

// ── CLI ───────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flag = (f)      => argv.includes(f);
const opt  = (f, def) => { const i = argv.indexOf(f); return i !== -1 && argv[i + 1] ? argv[i + 1] : def; };

const WORKSPACE_DIR  = resolve(opt('--workspace-dir',  join(homedir(), '.openclaw', 'workspace')));
const WORKSPACE_NAME = opt('--workspace-name', 'openclaw');
const DRY_RUN        = flag('--dry-run');
const OVERWRITE      = flag('--overwrite');
const WRITE_STUBS    = flag('--write-stubs');

// ── Colors ────────────────────────────────────────────────────────────────────

const B = '\x1b[1m', R = '\x1b[0m', CY = '\x1b[36m', GR = '\x1b[32m',
      YE = '\x1b[33m', DI = '\x1b[2m';

const log  = (m) => console.log(m);
const info = (m) => console.log(`${CY}ℹ${R}  ${m}`);
const ok   = (m) => console.log(`${GR}✅${R} ${m}`);
const warn = (m) => console.log(`${YE}⚠️ ${R} ${m}`);
const hdr  = (m) => console.log(`\n${B}${m}${R}`);
const row  = (sym, label, detail = '') => console.log(`  ${sym}  ${label}${detail ? `  ${DI}${detail}${R}` : ''}`);

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Escape value for safe interpolation in Cypher single-quoted strings. */
function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')   // backslashes first
    .replace(/'/g,  "\\'")    // single quotes
    .replace(/\r\n/g, '\\n')  // Windows line endings
    .replace(/\n/g,  '\\n');  // Unix line endings
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Parse markdown into sections by ## headings.
 * Returns [{title, body}].
 * Files with no ## headings become [{title: fallback, body: wholeFile}].
 */
function parseSections(content, fallback = 'Main') {
  // Skip GRAPH stubs — the file is already migrated
  if (content.trimStart().startsWith('<!-- GRAPH:')) {
    return [];
  }

  const chunks = content.split(/^##[ \t]+/m);
  if (chunks.length <= 1) {
    const body = content.trim();
    return body ? [{ title: fallback, body }] : [];
  }

  const sections = [];
  for (const chunk of chunks.slice(1)) {
    const nl    = chunk.indexOf('\n');
    if (nl === -1) continue;
    const title = chunk.slice(0, nl).trim();
    const body  = chunk.slice(nl + 1).trim();
    if (title && body) sections.push({ title, body });
  }
  return sections;
}

// ── DB ────────────────────────────────────────────────────────────────────────

async function openDB() {
  const db   = new Database(DB_PATH);
  await db.init();
  const conn = new Connection(db);
  await conn.init();
  return { db, conn };
}

async function q(conn, cypher) {
  try { return await (await conn.query(cypher)).getAll(); } catch { return null; }
}

async function run(conn, cypher) {
  try { await conn.query(cypher); return true; } catch (e) { return false; }
}

/** Ensure all workspace tables exist (safe to call multiple times). */
async function ensureTables(conn) {
  const tables = [
    `CREATE NODE TABLE IF NOT EXISTS Soul(id STRING, workspace STRING DEFAULT 'openclaw', section STRING, content STRING, priority INT64 DEFAULT 5, protected BOOLEAN DEFAULT false, PRIMARY KEY(id))`,
    `CREATE NODE TABLE IF NOT EXISTS Memory(id STRING, workspace STRING DEFAULT 'openclaw', domain STRING, content STRING, timestamp STRING DEFAULT '', PRIMARY KEY(id))`,
    `CREATE NODE TABLE IF NOT EXISTS Tool(id STRING, name STRING, available BOOLEAN DEFAULT true, notes STRING DEFAULT '', PRIMARY KEY(id))`,
    `CREATE NODE TABLE IF NOT EXISTS AgentConfig(id STRING, workspace STRING DEFAULT 'openclaw', key STRING, value STRING, PRIMARY KEY(id))`,
  ];
  for (const t of tables) await run(conn, t);
}

// ── Node upsert helpers ───────────────────────────────────────────────────────

async function upsertSoul(conn, { id, section, content, workspace, priority }, dry) {
  if (dry) return;
  const exists = await q(conn, `MATCH (n:Soul {id:'${esc(id)}'}) RETURN n.id LIMIT 1`);
  if (exists?.length) {
    await run(conn, `MATCH (n:Soul {id:'${esc(id)}'}) SET n.section='${esc(section)}', n.content='${esc(content)}', n.priority=${priority}`);
  } else {
    await run(conn, `CREATE (n:Soul {id:'${esc(id)}', workspace:'${esc(workspace)}', section:'${esc(section)}', content:'${esc(content)}', priority:${priority}, protected:false})`);
  }
}

async function upsertMemory(conn, { id, domain, content, workspace, timestamp }, dry) {
  if (dry) return;
  const exists = await q(conn, `MATCH (n:Memory {id:'${esc(id)}'}) RETURN n.id LIMIT 1`);
  if (exists?.length) {
    await run(conn, `MATCH (n:Memory {id:'${esc(id)}'}) SET n.domain='${esc(domain)}', n.content='${esc(content)}', n.timestamp='${esc(timestamp)}'`);
  } else {
    await run(conn, `CREATE (n:Memory {id:'${esc(id)}', workspace:'${esc(workspace)}', domain:'${esc(domain)}', content:'${esc(content)}', timestamp:'${esc(timestamp)}'})`);
  }
}

async function upsertTool(conn, { id, name, notes }, dry) {
  if (dry) return;
  const exists = await q(conn, `MATCH (n:Tool {id:'${esc(id)}'}) RETURN n.id LIMIT 1`);
  if (exists?.length) {
    await run(conn, `MATCH (n:Tool {id:'${esc(id)}'}) SET n.name='${esc(name)}', n.notes='${esc(notes)}'`);
  } else {
    await run(conn, `CREATE (n:Tool {id:'${esc(id)}', name:'${esc(name)}', available:true, notes:'${esc(notes)}'})`);
  }
}

async function upsertAgentConfig(conn, { id, key, value, workspace }, dry) {
  if (dry) return;
  const exists = await q(conn, `MATCH (n:AgentConfig {id:'${esc(id)}'}) RETURN n.id LIMIT 1`);
  if (exists?.length) {
    await run(conn, `MATCH (n:AgentConfig {id:'${esc(id)}'}) SET n.key='${esc(key)}', n.value='${esc(value)}'`);
  } else {
    await run(conn, `CREATE (n:AgentConfig {id:'${esc(id)}', workspace:'${esc(workspace)}', key:'${esc(key)}', value:'${esc(value)}'})`);
  }
}

// ── File importers ────────────────────────────────────────────────────────────

async function importFile(conn, filePath, sections, importFn, label, dry, overwrite) {
  let imported = 0, skipped = 0, stubbed = 0;

  if (sections.length === 0) {
    // parseSections returns [] for GRAPH stub files
    const raw = readFileSync(filePath, 'utf-8');
    if (raw.trimStart().startsWith('<!-- GRAPH:')) {
      warn(`${label}: already a GRAPH stub — skipping`);
      stubbed = 1;
    } else {
      warn(`${label}: no ## sections found — skipping`);
    }
    return { imported, skipped, stubbed };
  }

  for (let i = 0; i < sections.length; i++) {
    const { title, body } = sections[i];
    const nodeId = await importFn(conn, title, body, i, dry, overwrite);
    if (nodeId === null) {
      row(`${DI}↷${R}`, title, '(exists — use --overwrite to replace)');
      skipped++;
    } else {
      row(`${GR}+${R}`, title, dry ? '[dry-run]' : '');
      imported++;
    }
  }
  return { imported, skipped, stubbed };
}

// Returns nodeId on success, null if skipped
async function soulFn(conn, title, body, i, dry, overwrite) {
  const workspace = WORKSPACE_NAME;
  const id        = `soul-${slugify(workspace)}-${slugify(title)}`;
  const exists    = !dry && (await q(conn, `MATCH (n:Soul {id:'${esc(id)}'}) RETURN n.id LIMIT 1`))?.length > 0;
  if (exists && !overwrite) return null;
  await upsertSoul(conn, { id, section: title, content: body, workspace, priority: i + 1 }, dry);
  return id;
}

async function memoryFn(conn, title, body, i, dry, overwrite, prefix = '') {
  const workspace = WORKSPACE_NAME;
  const domain    = prefix ? `${prefix}: ${title}` : title;
  const id        = `mem-${slugify(workspace)}-${slugify(domain)}`;
  const timestamp = new Date().toISOString().slice(0, 10);
  const exists    = !dry && (await q(conn, `MATCH (n:Memory {id:'${esc(id)}'}) RETURN n.id LIMIT 1`))?.length > 0;
  if (exists && !overwrite) return null;
  await upsertMemory(conn, { id, domain, content: body, workspace, timestamp }, dry);
  return id;
}

async function toolFn(conn, title, body, i, dry, overwrite) {
  const id     = `tool-${slugify(WORKSPACE_NAME)}-${slugify(title)}`;
  const exists = !dry && (await q(conn, `MATCH (n:Tool {id:'${esc(id)}'}) RETURN n.id LIMIT 1`))?.length > 0;
  if (exists && !overwrite) return null;
  await upsertTool(conn, { id, name: title, notes: body }, dry);
  return id;
}

async function agentFn(conn, title, body, i, dry, overwrite) {
  const workspace = WORKSPACE_NAME;
  const id        = `agentcfg-${slugify(workspace)}-${slugify(title)}`;
  const exists    = !dry && (await q(conn, `MATCH (n:AgentConfig {id:'${esc(id)}'}) RETURN n.id LIMIT 1`))?.length > 0;
  if (exists && !overwrite) return null;
  await upsertAgentConfig(conn, { id, key: title, value: body, workspace }, dry);
  return id;
}

// ── Workspace stubs ───────────────────────────────────────────────────────────

const STUBS = {
  'SOUL.md':   (w) => `<!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = '${w}' RETURN s.section AS section, s.content AS content ORDER BY s.priority ASC LIMIT 8 -->`,
  'MEMORY.md': (w) => `<!-- GRAPH: MATCH (m:Memory) WHERE m.workspace = '${w}' RETURN m.domain AS domain, m.content AS content ORDER BY m.domain -->`,
  'USER.md':   (w) => `<!-- GRAPH: MATCH (m:Memory) WHERE m.workspace = '${w}' AND m.domain STARTS WITH 'User:' RETURN m.domain AS domain, m.content AS content ORDER BY m.domain -->`,
  'TOOLS.md':  ()  => `<!-- GRAPH: MATCH (t:Tool) WHERE t.available = true RETURN t.name AS name, t.notes AS notes ORDER BY t.name -->`,
  'AGENTS.md': (w) => `<!-- GRAPH: MATCH (a:AgentConfig) WHERE a.workspace = '${w}' RETURN a.key AS section, a.value AS content ORDER BY a.id -->`,
};

function writeStub(filename, workspaceName) {
  const filePath = join(WORKSPACE_DIR, filename);
  const bakPath  = `${filePath}.bak`;
  if (existsSync(filePath)) {
    copyFileSync(filePath, bakPath);
    info(`  Backed up ${filename} → ${filename}.bak`);
  }
  const stubFn = STUBS[filename];
  writeFileSync(filePath, (stubFn ? stubFn(workspaceName) : '') + '\n', 'utf-8');
  ok(`  ${filename} → GRAPH stub written`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${B}🐞 openclaw-graph — Workspace Importer${R}`);
  console.log(`   workspace: ${B}${WORKSPACE_NAME}${R}  |  source: ${WORKSPACE_DIR}`);
  if (DRY_RUN)   warn('Dry-run mode — no changes will be written to the DB');
  if (OVERWRITE) info('Overwrite mode — existing nodes will be replaced');
  console.log('');

  // ── File manifest ─────────────────────────────────────────
  const MANIFEST = [
    { file: 'SOUL.md',   label: 'Soul nodes',        fn: soulFn,                    fallback: 'Soul'    },
    { file: 'MEMORY.md', label: 'Memory nodes',      fn: memoryFn,                  fallback: 'Memory'  },
    { file: 'USER.md',   label: 'Memory nodes (User)',fn: (c,t,b,i,d,o) => memoryFn(c,t,b,i,d,o,'User'), fallback: 'User Profile' },
    { file: 'TOOLS.md',  label: 'Tool nodes',        fn: toolFn,                    fallback: 'Tool'    },
    { file: 'AGENTS.md', label: 'AgentConfig nodes', fn: agentFn,                   fallback: 'Config'  },
  ];

  const found   = MANIFEST.filter(m => existsSync(join(WORKSPACE_DIR, m.file)));
  const missing = MANIFEST.filter(m => !existsSync(join(WORKSPACE_DIR, m.file)));

  hdr('Files found:');
  for (const m of found)   row(`${GR}✓${R}`, m.file, `→ ${m.label}`);
  for (const m of missing) row(`${DI}–${R}`,  m.file, '(not found, skipping)');

  if (found.length === 0) {
    console.log(`\n  No workspace files found in: ${WORKSPACE_DIR}`);
    console.log(`  Run with --workspace-dir <path> to specify a different location.\n`);
    process.exit(1);
  }

  // ── Open DB ───────────────────────────────────────────────
  const { db, conn } = await openDB();
  if (!DRY_RUN) await ensureTables(conn);

  // ── Import each file ──────────────────────────────────────
  let totalImported = 0, totalSkipped = 0;
  const importedFiles = [];

  for (const { file, label, fn, fallback } of found) {
    hdr(`${file}  →  ${label}`);
    const filePath = join(WORKSPACE_DIR, file);
    const raw      = readFileSync(filePath, 'utf-8');
    const sections = parseSections(raw, fallback);

    try {
      const { imported, skipped, stubbed } = await importFile(conn, filePath, sections, fn, label, DRY_RUN, OVERWRITE);
      totalImported += imported;
      totalSkipped  += skipped;
      if (imported > 0) importedFiles.push(file);
    } catch (e) {
      warn(`Import failed for ${file}: ${e.message}`);
    }
  }

  await conn.close();
  await db.close();

  // ── Summary ───────────────────────────────────────────────
  hdr('Summary');
  if (totalImported > 0) ok(`${totalImported} node${totalImported !== 1 ? 's' : ''} imported`);
  if (totalSkipped  > 0) info(`${totalSkipped} node${totalSkipped !== 1 ? 's' : ''} skipped (already exist — run with --overwrite to replace)`);
  if (totalImported === 0 && totalSkipped === 0) info('Nothing to import.');

  // ── Write stubs ───────────────────────────────────────────
  if (WRITE_STUBS && importedFiles.length > 0) {
    hdr('Writing GRAPH stubs...');
    for (const file of importedFiles) writeStub(file, WORKSPACE_NAME);
    console.log('');
    ok('Done. Flat files replaced with GRAPH stubs.');
    info(`Originals backed up as *.bak in ${WORKSPACE_DIR}`);
  } else if (importedFiles.length > 0 && !DRY_RUN) {
    hdr('Next: replace flat files with GRAPH stubs');
    console.log(`\n  Option A — automatic (backs up originals to *.bak):`);
    console.log(`    node ladybugdb/scripts/import-workspace.mjs --write-stubs\n`);
    console.log(`  Option B — manual copy from this repo:`);
    console.log(`    cp workspace-stubs/*.md ${WORKSPACE_DIR}/\n`);
    console.log(`  Stubs for imported files:`);
    for (const file of importedFiles) {
      const stubFn = STUBS[file];
      if (stubFn) console.log(`    ${DI}${file}:${R} ${stubFn(WORKSPACE_NAME)}`);
    }
  }

  console.log('');
  if (!DRY_RUN && totalImported > 0) {
    ok(`Verify: node ladybugdb/scripts/query.js --cypher "MATCH (s:Soul {workspace:'${WORKSPACE_NAME}'}) RETURN s.section, s.priority ORDER BY s.priority"`);
  }
}

main().catch(e => {
  console.error(`\n\x1b[31mError:\x1b[0m ${e.message}`);
  process.exit(1);
});
