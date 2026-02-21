/**
 * openclaw-graph — Graph-Native Workspace Backend
 *
 * Drop-in patch for OpenClaw's src/agents/workspace.ts
 * Adds LadybugDB graph query resolution for workspace files
 * that contain a <!-- GRAPH: <cypher> --> directive.
 *
 * HOW IT WORKS:
 *   Instead of storing content in SOUL.md / MEMORY.md / TOOLS.md,
 *   each file contains a single-line Cypher directive, e.g.:
 *
 *     <!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'myapp' RETURN ... -->
 *
 *   When OpenClaw loads the workspace, this module intercepts the read,
 *   executes the Cypher query against LadybugDB, and returns formatted
 *   markdown — injected into the agent's system prompt as if it were
 *   a normal flat file.
 *
 * BENEFITS:
 *   - Workspace stubs: ~175 bytes vs ~20,000+ bytes (flat file)
 *   - Structured, queryable data — filter by priority, domain, tag
 *   - Single source of truth for multi-instance deployments
 *   - Automatic 60s cache — no repeated DB hits per session
 *   - Graceful degradation: if DB unavailable, empty string returned
 *
 * INTEGRATION:
 *   1. npm install lbug
 *   2. Run: node ladybugdb/scripts/seed-workspace.js
 *   3. Copy the GRAPH_DIRECTIVE block into your workspace.ts
 *      (see the marked section below)
 *   4. Update GRAPH_NODE_BIN and GRAPH_QUERY_SCRIPT paths
 *   5. Update your SOUL.md / MEMORY.md / TOOLS.md with GRAPH directives
 *
 * APPLY AS PATCH:
 *   See patches/workspace.graph.patch in this repo for the exact diff.
 */

import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

// ─── AlphaOne LadybugDB Graph Backend ────────────────────────────────────────
// Copy this entire block into your workspace.ts, after the imports.
// Adjust GRAPH_NODE_BIN and GRAPH_QUERY_SCRIPT to your environment.

const GRAPH_DIRECTIVE_PREFIX = "<!-- GRAPH:";

/**
 * Path to the Node.js binary used to run query.js.
 * Adjust to match your system's Node installation.
 * Examples:
 *   /usr/bin/node
 *   /opt/homebrew/bin/node
 *   /opt/homebrew/Cellar/node@22/22.22.0/bin/node
 */
const GRAPH_NODE_BIN = process.env.OPENCLAW_GRAPH_NODE_BIN ?? "node";

/**
 * Path to the LadybugDB query script.
 * Default: <home>/openclaw-graph/ladybugdb/scripts/query.js
 */
const GRAPH_QUERY_SCRIPT =
  process.env.OPENCLAW_GRAPH_QUERY_SCRIPT ??
  path.join(os.homedir(), "openclaw-graph", "ladybugdb", "scripts", "query.js");

function extractGraphDirective(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith(GRAPH_DIRECTIVE_PREFIX)) return null;
  const end = trimmed.indexOf("-->");
  if (end === -1) return null;
  return trimmed.slice(GRAPH_DIRECTIVE_PREFIX.length, end).trim();
}

function executeGraphQuery(cypher: string): string {
  try {
    const result = execSync(
      `${GRAPH_NODE_BIN} ${GRAPH_QUERY_SCRIPT} --workspace --cypher ${JSON.stringify(cypher)}`,
      { encoding: "utf-8", timeout: 8000 },
    );
    return result.trim();
  } catch (_err) {
    // Graceful degradation: return empty string if graph is unavailable
    return "";
  }
}

// Cache for graph query results — keyed by cypher query, invalidated every 60s
const graphQueryCache = new Map<string, { content: string; fetchedAt: number }>();
const GRAPH_CACHE_TTL_MS = 60_000;

function resolveGraphContent(cypher: string): string {
  const now = Date.now();
  const cached = graphQueryCache.get(cypher);
  if (cached && now - cached.fetchedAt < GRAPH_CACHE_TTL_MS) {
    return cached.content;
  }
  const content = executeGraphQuery(cypher);
  graphQueryCache.set(cypher, { content, fetchedAt: now });
  return content;
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replacement for the readFileWithCache function in workspace.ts.
 * Add this block inside readFileWithCache, after reading the raw file content:
 *
 *   const cypher = extractGraphDirective(raw);
 *   const content = cypher ? resolveGraphContent(cypher) : raw;
 *
 * Full example:
 */
async function readFileWithCacheGraphEnabled(
  filePath: string,
  // biome-ignore lint: example only — replace your actual file cache impl
  _fileCache: Map<string, { content: string; mtimeMs: number }>,
  fs: typeof import("node:fs/promises"),
): Promise<string> {
  const stats = await fs.stat(filePath);
  const mtimeMs = stats.mtimeMs;
  const cached = _fileCache.get(filePath);

  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.content;
  }

  const raw = await fs.readFile(filePath, "utf-8");

  // ── Graph directive resolution ────────────────────────────────────────────
  const cypher = extractGraphDirective(raw);
  const content = cypher ? resolveGraphContent(cypher) : raw;
  // ─────────────────────────────────────────────────────────────────────────

  _fileCache.set(filePath, { content, mtimeMs });
  return content;
}

export {
  extractGraphDirective,
  executeGraphQuery,
  resolveGraphContent,
  readFileWithCacheGraphEnabled,
  GRAPH_DIRECTIVE_PREFIX,
  GRAPH_CACHE_TTL_MS,
};
