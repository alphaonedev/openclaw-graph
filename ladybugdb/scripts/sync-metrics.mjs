/**
 * openclaw-graph — QueryMetrics reporter & manager
 *
 * query.js records a QueryMetrics row automatically every time a GRAPH
 * directive resolves in --workspace mode. This script reads those rows.
 *
 * Usage:
 *   node sync-metrics.mjs                 → dashboard (top 20 queries)
 *   node sync-metrics.mjs --top 40        → show top 40 queries
 *   node sync-metrics.mjs --json          → raw JSON output
 *   node sync-metrics.mjs --zero          → include zero-hit rows (misses only)
 *   node sync-metrics.mjs --reset         → DELETE all QueryMetrics rows
 *   node sync-metrics.mjs --help          → print this help
 */
import { Database, Connection } from 'lbug';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = resolve(__dirname, '../db/alphaone-skills.db');

// ── helpers ─────────────────────────────────────────────────────────────────

async function openDB() {
  const db = new Database(DB_PATH);
  await db.init();
  const conn = new Connection(db);
  await conn.init();
  return { db, conn };
}

async function q(conn, cypher) {
  return await (await conn.query(cypher)).getAll();
}

function pad(n, w) { return String(n).padStart(w); }

function bar(ratio, width = 12) {
  const filled = Math.round(ratio * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ── commands ─────────────────────────────────────────────────────────────────

async function showDashboard({ json = false, top = 20, includeZero = false } = {}) {
  const { db, conn } = await openDB();

  const whereClause = includeZero
    ? ''
    : 'WHERE m.hit_count > 0 OR m.miss_count > 0';

  const rows = await q(conn, `
    MATCH (m:QueryMetrics)
    ${whereClause}
    RETURN m.cypher AS cypher,
           m.hit_count   AS hits,
           m.miss_count  AS misses,
           m.avg_ms      AS avg_ms,
           m.p95_ms      AS p95_ms,
           m.last_hit    AS last_hit
    ORDER BY m.hit_count DESC
    LIMIT ${top}
  `);

  const totalTracked = (await q(conn, 'MATCH (m:QueryMetrics) RETURN count(m) AS n'))[0]?.n ?? 0;
  const totalHits    = rows.reduce((s, r) => s + Number(r.hits   ?? 0), 0);
  const totalMisses  = rows.reduce((s, r) => s + Number(r.misses ?? 0), 0);
  const globalRatio  = totalHits + totalMisses > 0
    ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1)
    : null;

  if (json) {
    const out = {
      summary: { total_tracked: totalTracked, total_hits: totalHits, total_misses: totalMisses },
      rows: rows.map(r => ({
        cypher:    r.cypher,
        hits:      Number(r.hits    ?? 0),
        misses:    Number(r.misses  ?? 0),
        avg_ms:    Number((r.avg_ms ?? 0).toFixed(2)),
        p95_ms:    Number((r.p95_ms ?? 0).toFixed(2)),
        last_hit:  r.last_hit ?? '',
      })),
    };
    console.log(JSON.stringify(out, null, 2));
    await conn.close(); await db.close();
    return;
  }

  // ── human-readable dashboard ─────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(  '║          openclaw-graph  QueryMetrics Dashboard         ║');
  console.log(  '╚══════════════════════════════════════════════════════════╝\n');

  if (totalTracked === 0) {
    console.log('  ⚠  No QueryMetrics data yet.\n');
    console.log('  query.js records a row automatically every time a GRAPH');
    console.log('  directive resolves via --workspace mode. Once OpenClaw');
    console.log('  processes one workspace query, data will appear here.\n');
    console.log('  Test with:');
    console.log("    node query.js --workspace --cypher \"MATCH (s:Soul {workspace:'openclaw'}) RETURN s.section, s.content\"");
    await conn.close(); await db.close();
    return;
  }

  console.log(`  Tracked queries : ${totalTracked}`);
  console.log(`  Total hits      : ${totalHits}`);
  console.log(`  Total misses    : ${totalMisses}`);
  if (globalRatio !== null) {
    console.log(`  Hit rate        : ${globalRatio}%  ${bar(totalHits / (totalHits + totalMisses))}`);
  }
  console.log();

  if (rows.length === 0) {
    console.log('  (All tracked queries have 0 hits and 0 misses — DB was likely just seeded.)');
    await conn.close(); await db.close();
    return;
  }

  console.log(`  Top ${rows.length} by hit count:\n`);
  console.log(
    '  ' +
    pad('#',  3) + '  ' +
    pad('hits',  5) + ' ' +
    pad('miss',  4) + '  ' +
    pad('rate', 5) + '  ' +
    pad('avg', 6) + '  ' +
    pad('p95', 6) + '  last_hit'
  );
  console.log('  ' + '─'.repeat(70));

  for (let i = 0; i < rows.length; i++) {
    const r      = rows[i];
    const hits   = Number(r.hits   ?? 0);
    const misses = Number(r.misses ?? 0);
    const total  = hits + misses;
    const rate   = total > 0 ? ((hits / total) * 100).toFixed(0) + '%' : ' — ';
    const avg    = Number(r.avg_ms ?? 0).toFixed(0) + 'ms';
    const p95    = Number(r.p95_ms ?? 0).toFixed(0) + 'ms';
    const last   = r.last_hit ? r.last_hit.slice(0, 19).replace('T', ' ') : '—';

    console.log(
      '  ' +
      pad(i + 1, 3) + '  ' +
      pad(hits,  5)  + ' ' +
      pad(misses, 4) + '  ' +
      pad(rate,   5) + '  ' +
      pad(avg,    6) + '  ' +
      pad(p95,    6) + '  ' + last
    );

    // Print truncated cypher on next line, indented
    const cx = r.cypher ?? '';
    const preview = cx.length > 80 ? cx.slice(0, 77) + '…' : cx;
    console.log('       ' + preview);
    console.log();
  }

  console.log('  Run with --zero to include misses-only rows.');
  console.log('  Run with --top N to show more rows.');
  console.log('  Run with --reset to clear all metrics.\n');

  await conn.close();
  await db.close();
}

async function resetMetrics() {
  const { db, conn } = await openDB();

  const before = (await q(conn, 'MATCH (m:QueryMetrics) RETURN count(m) AS n'))[0]?.n ?? 0;

  if (before === 0) {
    console.log('QueryMetrics is already empty — nothing to reset.');
  } else {
    await q(conn, 'MATCH (m:QueryMetrics) DETACH DELETE m');
    const after = (await q(conn, 'MATCH (m:QueryMetrics) RETURN count(m) AS n'))[0]?.n ?? 0;
    if (after === 0) {
      console.log(`✓ Cleared ${before} QueryMetrics row(s).`);
    } else {
      console.error(`Warning: ${after} row(s) remain after reset (expected 0).`);
    }
  }

  await conn.close();
  await db.close();
}

function printHelp() {
  console.log(`
openclaw-graph sync-metrics.mjs — QueryMetrics reporter

query.js records a row into QueryMetrics every time a GRAPH directive
resolves via --workspace mode. This script reads and manages those rows.

Usage:
  node sync-metrics.mjs                  Dashboard (top 20 queries)
  node sync-metrics.mjs --top N          Show top N queries
  node sync-metrics.mjs --zero           Include zero-hit (miss-only) rows
  node sync-metrics.mjs --json           Raw JSON output
  node sync-metrics.mjs --reset          Delete all QueryMetrics rows
  node sync-metrics.mjs --help           This message

Columns:
  hits     Number of times this query returned ≥1 row
  miss     Number of times this query returned 0 rows
  rate     Hit rate (hits / total)
  avg      Rolling average execution time (hits only)
  p95      High-water mark — rises instantly on slow queries, decays slowly
  last_hit UTC timestamp of last successful hit
`);
}

// ── main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
} else if (args.includes('--reset')) {
  resetMetrics().catch(e => { console.error(e.message); process.exit(1); });
} else {
  const json        = args.includes('--json');
  const includeZero = args.includes('--zero');
  const topIdx      = args.indexOf('--top');
  const top         = topIdx !== -1 ? Math.max(1, parseInt(args[topIdx + 1] ?? '20', 10)) : 20;
  showDashboard({ json, top, includeZero }).catch(e => { console.error(e.message); process.exit(1); });
}
