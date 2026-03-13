/**
 * openclaw-graph — Graph-Native Workspace Backend
 *
 * Drop-in patch for OpenClaw's src/agents/workspace.ts
 * Adds Neo4j graph query resolution for workspace files
 * that contain a <!-- GRAPH: <cypher> --> directive.
 *
 * HOW IT WORKS:
 *   Instead of storing content in SOUL.md / MEMORY.md / TOOLS.md,
 *   each file contains a single-line Cypher directive, e.g.:
 *
 *     <!-- GRAPH: MATCH (s:Soul) WHERE s.workspace = 'myapp' RETURN ... -->
 *
 *   When OpenClaw loads the workspace, this module intercepts the read,
 *   executes the Cypher query against Neo4j, and returns formatted
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
 *   1. Install Neo4j Community Edition (brew install neo4j / apt install neo4j)
 *   2. Run: python3 migrate_ladybugdb_to_neo4j.py
 *   3. Copy the GRAPH_DIRECTIVE block into your workspace.ts
 *      (see the marked section below)
 *   4. Update GRAPH_QUERY_CMD and NEO4J_URI env vars if needed
 *   5. Update your SOUL.md / MEMORY.md / TOOLS.md with GRAPH directives
 *
 * APPLY AS PATCH:
 *   See patches/workspace-cache-fix.patch in this repo for the exact diff.
 */

import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

// ─── openclaw-graph Neo4j Backend ───────────────────────────────────────────
// Copy this entire block into your workspace.ts, after the imports.
// Adjust GRAPH_QUERY_CMD and NEO4J_URI to your environment.

const GRAPH_DIRECTIVE_PREFIX = "<!-- GRAPH:";

/**
 * Path to the cypher-shell binary used to execute Cypher queries.
 * Adjust to match your system's Neo4j installation.
 * Examples:
 *   cypher-shell                          (if on PATH)
 *   /opt/homebrew/bin/cypher-shell        (macOS Homebrew)
 *   /usr/bin/cypher-shell                 (Linux apt)
 */
const GRAPH_QUERY_CMD =
  process.env.OPENCLAW_GRAPH_QUERY_CMD ?? "cypher-shell";

/**
 * Neo4j connection URI.
 * Default: bolt://localhost:7687 (local Neo4j Community Edition, no auth)
 */
const GRAPH_NEO4J_URI =
  process.env.NEO4J_URI ?? "bolt://localhost:7687";

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
      `${GRAPH_QUERY_CMD} -a ${GRAPH_NEO4J_URI} --format plain "${cypher.replace(/"/g, '\\"')}"`,
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
