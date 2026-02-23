/**
 * openclaw-graph — LadybugDB Skill Query CLI
 * Usage:
 *   node query.js "build a SwiftUI watchOS app"
 *   node query.js --skill cloudflare --hops 2
 *   node query.js --stats
 */
import { Database, Connection } from 'lbug';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../db/alphaone-skills.db');

async function openDB() {
  const db = new Database(DB_PATH);
  await db.init();
  const conn = new Connection(db);
  await conn.init();
  return { db, conn };
}

async function runQuery(conn, cypher) {
  const r = await conn.query(cypher);
  return await r.getAll();
}

async function queryByText(text) {
  const { db, conn } = await openDB();
  const terms = text.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  if (terms.length === 0) {
    console.log('Please provide search terms');
    process.exit(1);
  }
  
  const whereParts = terms.map(t =>
    `(LOWER(s.embedding_hint) CONTAINS '${t}' OR LOWER(s.description) CONTAINS '${t}' OR LOWER(s.name) CONTAINS '${t}')`
  ).join(' OR ');
  
  const rows = await runQuery(conn, `
    MATCH (s:Skill)
    WHERE ${whereParts}
    RETURN s.name AS name, s.cluster AS cluster, s.description AS description,
           s.authorization_required AS auth_required, s.skill_path AS path
    ORDER BY s.cluster
    LIMIT 5
  `);
  
  console.log(`\n=== Skill Match: "${text}" ===`);
  console.log(`Found ${rows.length} matching skills:\n`);
  
  for (const row of rows) {
    const authFlag = row.auth_required ? ' 🔒 AUTH REQUIRED' : '';
    console.log(`[${row.cluster}] ${row.name}${authFlag}`);
    console.log(`  ${row.description}`);
    console.log(`  Path: ${row.path}`);
    console.log();
  }
  
  await conn.close();
  await db.close();
  process.exit(0);
}

async function queryBySkill(skillId, hops = 2) {
  const { db, conn } = await openDB();
  
  const rootRows = await runQuery(conn, `
    MATCH (s:Skill {id: '${skillId}'})
    RETURN s.name AS name, s.cluster AS cluster, s.description AS description
  `);
  
  if (!rootRows.length) {
    console.log(`Skill '${skillId}' not found`);
    process.exit(1);
  }
  
  console.log(`\n=== Skill Graph: ${skillId} (${hops} hops) ===`);
  console.log(`Root: [${rootRows[0].cluster}] ${rootRows[0].name}`);
  console.log(`  ${rootRows[0].description}\n`);
  
  for (let h = 1; h <= hops; h++) {
    const hopRows = await runQuery(conn, `
      MATCH (s:Skill {id: '${skillId}'})-[r]->(related:Skill)
      RETURN type(r) AS rel_type, related.name AS name, related.cluster AS cluster, related.description AS desc
    `);
    
    if (h === 1 && hopRows.length > 0) {
      console.log(`Direct connections:`);
      for (const row of hopRows) {
        console.log(`  -[${row.rel_type}]-> [${row.cluster}] ${row.name}`);
        console.log(`    ${row.desc}`);
      }
    }
  }
  
  await conn.close();
  await db.close();
  process.exit(0);
}

async function queryByCluster(cluster) {
  const { db, conn } = await openDB();
  
  const rows = await runQuery(conn, `
    MATCH (s:Skill {cluster: '${cluster}'})
    RETURN s.name AS name, s.description AS description, s.authorization_required AS auth
    ORDER BY s.name
  `);
  
  console.log(`\n=== Cluster: ${cluster} (${rows.length} skills) ===\n`);
  for (const row of rows) {
    const a = row.auth ? ' 🔒' : '';
    console.log(`  ${row.name}${a}: ${row.description}`);
  }
  
  await conn.close();
  await db.close();
  process.exit(0);
}

async function queryStats() {
  const { db, conn } = await openDB();
  
  const totalNodes = await runQuery(conn, 'MATCH (s:Skill) RETURN count(s) AS total');
  const clusters = await runQuery(conn, 'MATCH (s:Skill) RETURN s.cluster AS cluster, count(*) AS cnt ORDER BY cnt DESC');
  const authSkills = await runQuery(conn, "MATCH (s:Skill) WHERE s.authorization_required = true RETURN s.name AS name, s.cluster AS cluster");
  
  console.log('\n=== Skill Graph Stats ===');
  console.log(`Total nodes: ${totalNodes[0]?.total}`);
  console.log(`Auth-required skills: ${authSkills.length}`);
  console.log('\nCluster breakdown:');
  for (const c of clusters) {
    console.log(`  ${c.cluster.padEnd(25)} ${c.cnt}`);
  }
  console.log('\nAuth-required skills:');
  for (const s of authSkills) {
    console.log(`  🔒 [${s.cluster}] ${s.name}`);
  }
  
  await conn.close();
  await db.close();
  process.exit(0);
}

/**
 * Format rows as workspace markdown.
 * Detection: if rows have 'section'+'content' → Soul format
 *            if rows have 'domain'+'content'  → Memory format
 *            if rows have 'name'+'notes'       → Tool format
 *            if rows have 'key'+'value'        → AgentConfig format
 *            otherwise → JSON (for debug/dev use)
 */
function formatWorkspaceOutput(rows, cypher) {
  if (!rows || rows.length === 0) return '';

  const keys = Object.keys(rows[0]);

  // Soul nodes: section + content (+ optional priority)
  if (keys.includes('section') && keys.includes('content')) {
    const parts = [];
    for (const row of rows) {
      parts.push(`## ${row.section}\n\n${row.content}`);
    }
    return parts.join('\n\n');
  }

  // Memory nodes: domain + content (+ optional timestamp)
  if (keys.includes('domain') && keys.includes('content')) {
    const parts = [];
    for (const row of rows) {
      const ts = row.timestamp ? ` _(${row.timestamp})_` : '';
      parts.push(`## ${row.domain}${ts}\n\n${row.content}`);
    }
    return parts.join('\n\n');
  }

  // Tool nodes: name + notes (+ optional available)
  if (keys.includes('name') && keys.includes('notes')) {
    const lines = ['## Available Tools\n'];
    for (const row of rows) {
      const avail = row.available === false ? ' _(unavailable)_' : '';
      lines.push(`- **${row.name}**${avail}: ${row.notes}`);
    }
    return lines.join('\n');
  }

  // AgentConfig: key + value
  if (keys.includes('key') && keys.includes('value')) {
    const lines = ['## Agent Configuration\n'];
    for (const row of rows) {
      lines.push(`- **${row.key}**: ${row.value}`);
    }
    return lines.join('\n');
  }

  // Fallback: JSON (for --cypher debug usage from CLI)
  return JSON.stringify(rows, null, 2);
}

async function queryCypher(cypher, { workspace = false } = {}) {
  const { db, conn } = await openDB();
  const rows = await runQuery(conn, cypher);
  
  if (workspace) {
    // Workspace mode: output clean markdown for injection into system prompt
    console.log(formatWorkspaceOutput(rows, cypher));
  } else {
    // CLI debug mode: labeled output
    console.log('\n=== Cypher Query Result ===');
    const formatted = formatWorkspaceOutput(rows, cypher);
    console.log(formatted || '(no results)');
  }
  
  await conn.close();
  await db.close();
  process.exit(0);
}

// Main
// --workspace flag: activates clean markdown output (used by workspace.ts GRAPH directives)
const args = process.argv.slice(2);
const workspaceMode = args.includes('--workspace');
const filteredArgs = args.filter(a => a !== '--workspace');

if (filteredArgs[0] === '--cypher') {
  const cypher = filteredArgs.slice(1).join(' ');
  queryCypher(cypher, { workspace: workspaceMode }).catch(e => { console.error(e.message); process.exit(1); });
} else if (args[0] === '--skill') {
  queryBySkill(args[1], parseInt(args[3] || '2')).catch(e => { console.error(e.message); process.exit(1); });
} else if (args[0] === '--cluster') {
  queryByCluster(args[1]).catch(e => { console.error(e.message); process.exit(1); });
} else if (args[0] === '--stats') {
  queryStats().catch(e => { console.error(e.message); process.exit(1); });
} else if (args.length > 0) {
  queryByText(args.join(' ')).catch(e => { console.error(e.message); process.exit(1); });
} else {
  console.log('Usage: node query.js "<text>" | --skill <id> [--hops N] | --cluster <name> | --cypher "<cypher>" | --stats');
  process.exit(0);
}
