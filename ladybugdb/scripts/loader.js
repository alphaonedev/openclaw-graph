/**
 * AlphaOne OpenClaw — LadybugDB Skill Loader
 * Reads all SKILL.md files, creates nodes + relationships in LadybugDB
 * Run: node ladybugdb/scripts/loader.js
 */
import { Database, Connection } from 'lbug';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../');
const DB_DIR = resolve(__dirname, '../db');
const DB_PATH = resolve(DB_DIR, 'skills.db');

// Ensure DB dir exists
if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

function esc(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');
}

async function main() {
  console.log('=== AlphaOne LadybugDB Skill Loader ===');
  console.log(`DB Path: ${DB_PATH}`);
  
  const db = new Database(DB_PATH);
  await db.init();
  const conn = new Connection(db);
  await conn.init();
  
  // Create schema
  console.log('\n[1/5] Creating schema...');
  const schemaStatements = [
    `CREATE NODE TABLE IF NOT EXISTS Skill(
      id STRING,
      name STRING,
      cluster STRING,
      description STRING,
      tags STRING[],
      authorization_required BOOLEAN DEFAULT false,
      scope STRING DEFAULT 'general',
      model_hint STRING DEFAULT 'claude-sonnet',
      embedding_hint STRING DEFAULT '',
      skill_path STRING DEFAULT '',
      clawhub_install STRING DEFAULT '',
      PRIMARY KEY(id)
    )`,
    `CREATE REL TABLE IF NOT EXISTS DEPENDS_ON(FROM Skill TO Skill, weight DOUBLE DEFAULT 1.0)`,
    `CREATE REL TABLE IF NOT EXISTS COMPOSES(FROM Skill TO Skill, weight DOUBLE DEFAULT 1.0)`,
    `CREATE REL TABLE IF NOT EXISTS CALLS(FROM Skill TO Skill, weight DOUBLE DEFAULT 1.0)`,
    `CREATE REL TABLE IF NOT EXISTS SIMILAR_TO(FROM Skill TO Skill, similarity DOUBLE DEFAULT 0.8)`,
    `CREATE REL TABLE IF NOT EXISTS PRODUCES(FROM Skill TO Skill)`,
    `CREATE REL TABLE IF NOT EXISTS MANAGES(FROM Skill TO Skill)`,
    `CREATE REL TABLE IF NOT EXISTS MONITORS(FROM Skill TO Skill)`,
    `CREATE REL TABLE IF NOT EXISTS CALLED_BY(FROM Skill TO Skill, weight DOUBLE DEFAULT 1.0)`,
  ];
  
  for (const stmt of schemaStatements) {
    try {
      await conn.query(stmt);
    } catch (e) {
      // Table already exists is OK
      if (!e.message.includes('already exists') && !e.message.includes('IF NOT EXISTS')) {
        console.warn(`  Schema warning: ${e.message}`);
      }
    }
  }
  console.log('  Schema ready');
  
  // Find all SKILL.md files
  console.log('\n[2/5] Scanning skill files...');
  const skillFiles = globSync('skills/**/**/SKILL.md', { cwd: REPO_ROOT });
  console.log(`  Found ${skillFiles.length} SKILL.md files`);
  
  // Parse frontmatter
  const skills = [];
  for (const file of skillFiles) {
    const fullPath = resolve(REPO_ROOT, file);
    try {
      const content = readFileSync(fullPath, 'utf8');
      const { data } = matter(content);
      if (data.name) {
        skills.push({ 
          ...data, 
          skill_path: fullPath,
          tags: data.tags || [],
          dependencies: data.dependencies || [],
          composes: data.composes || [],
          similar_to: data.similar_to || [],
          called_by: data.called_by || [],
          manages: data.manages || [],
          monitors: data.monitors || [],
        });
      }
    } catch (e) {
      console.warn(`  Parse error: ${file}: ${e.message}`);
    }
  }
  console.log(`  Parsed ${skills.length} valid skills`);
  
  // Insert nodes
  console.log('\n[3/5] Inserting Skill nodes...');
  let nodeCount = 0;
  let nodeErrors = 0;
  for (const s of skills) {
    try {
      const tagsStr = JSON.stringify(s.tags || []);
      await conn.query(`
        MERGE (sk:Skill {id: '${esc(s.name)}'})
        SET sk.name = '${esc(s.name)}',
            sk.cluster = '${esc(s.cluster || 'unknown')}',
            sk.description = '${esc(s.description || '')}',
            sk.tags = ${tagsStr},
            sk.authorization_required = ${s.authorization_required ? 'true' : 'false'},
            sk.scope = '${esc(s.scope || 'general')}',
            sk.model_hint = '${esc(s.model_hint || 'claude-sonnet')}',
            sk.embedding_hint = '${esc(s.embedding_hint || '')}',
            sk.skill_path = '${esc(s.skill_path)}',
            sk.clawhub_install = '${esc(s.clawhub_install || '')}'
      `);
      nodeCount++;
    } catch (e) {
      nodeErrors++;
      console.warn(`  Node error [${s.name}]: ${e.message}`);
    }
  }
  console.log(`  Inserted: ${nodeCount} nodes (${nodeErrors} errors)`);
  
  // Insert edges
  console.log('\n[4/5] Creating relationship edges...');
  let edgeCount = 0;
  let edgeErrors = 0;
  
  const createEdges = async (fromId, targets, relType) => {
    if (!targets || !targets.length) return;
    const list = Array.isArray(targets) ? targets : [targets];
    for (const target of list) {
      if (!target || typeof target !== 'string') continue;
      try {
        await conn.query(`
          MATCH (a:Skill {id: '${esc(fromId)}'}), (b:Skill {id: '${esc(target)}'})
          MERGE (a)-[:${relType}]->(b)
        `);
        edgeCount++;
      } catch (e) {
        edgeErrors++;
        // Only warn on non-trivial errors
        if (!e.message.includes('no node found')) {
          console.warn(`  Edge [${fromId}]-[${relType}]->[${target}]: ${e.message}`);
        }
      }
    }
  };
  
  for (const s of skills) {
    await createEdges(s.name, s.dependencies, 'DEPENDS_ON');
    await createEdges(s.name, s.composes, 'COMPOSES');
    await createEdges(s.name, s.similar_to, 'SIMILAR_TO');
    await createEdges(s.name, s.calls, 'CALLS');
    await createEdges(s.name, s.manages, 'MANAGES');
    await createEdges(s.name, s.monitors, 'MONITORS');
    await createEdges(s.name, s.called_by, 'CALLED_BY');
  }
  console.log(`  Created: ${edgeCount} edges (${edgeErrors} errors)`);
  
  // Verification
  console.log('\n[5/5] Verifying...');
  const countResult = await conn.query('MATCH (s:Skill) RETURN count(s) AS total');
  const rows = await countResult.getAll();
  console.log(`  Total Skill nodes in DB: ${rows[0]?.total || 0}`);
  
  const clusterResult = await conn.query(
    'MATCH (s:Skill) RETURN s.cluster AS cluster, count(*) AS cnt ORDER BY cnt DESC'
  );
  const clusterRows = await clusterResult.getAll();
  console.log('\n  Cluster breakdown:');
  for (const row of clusterRows) {
    console.log(`    ${row.cluster}: ${row.cnt}`);
  }
  
  console.log('\n=== LadybugDB Load Complete ===');
  console.log(`Nodes: ${nodeCount} | Edges: ${edgeCount}`);
  console.log(`DB: ${DB_PATH}`);
  
  await conn.close();
  await db.close();
  process.exit(0);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
