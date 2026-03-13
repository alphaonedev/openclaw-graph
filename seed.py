#!/usr/bin/env python3
"""
seed.py — Self-contained Neo4j seeder for OpenClaw Graph v1.5

Reads all data from within the repo:
  - Skills (315): YAML frontmatter from skills/*/SKILL.md
  - Relationships (221): seed-data/skill_rels.json
  - Workspace nodes: Embedded defaults (Soul, OCMemory, AgentConfig, OCTool, OCAgent, Bootstrap)

Usage:
  python3 seed.py                       # Full install (schema + skills + workspace)
  python3 seed.py --dry-run             # Preview — no writes
  python3 seed.py --reset               # Drop workspace nodes first, then seed
  python3 seed.py --workspace myagent   # Custom workspace ID (default: openclaw)
  python3 seed.py --verify              # Count nodes and verify DB state
  python3 seed.py --skills-only         # Seed skills + clusters only (skip workspace)

Requires: neo4j Python driver (pip install neo4j)
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Neo4j connection
# ---------------------------------------------------------------------------

NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_PASS = os.environ.get("NEO4J_PASSWORD", "")

REPO_ROOT = Path(__file__).resolve().parent
SKILLS_DIR = REPO_ROOT / "skills"
RELS_FILE = REPO_ROOT / "seed-data" / "skill_rels.json"

BATCH_SIZE = 50

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------

class C:
    OK   = "\033[92m"
    WARN = "\033[93m"
    ERR  = "\033[91m"
    DIM  = "\033[90m"
    BOLD = "\033[1m"
    END  = "\033[0m"

def ok(msg):   print(f"  {C.OK}✓{C.END} {msg}")
def warn(msg): print(f"  {C.WARN}⚠{C.END} {msg}")
def err(msg):  print(f"  {C.ERR}✗{C.END} {msg}")
def dim(msg):  print(f"  {C.DIM}{msg}{C.END}")

# ---------------------------------------------------------------------------
# YAML frontmatter parser (no PyYAML dependency)
# ---------------------------------------------------------------------------

def parse_frontmatter(text):
    """Parse YAML frontmatter between --- markers. Returns dict."""
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).split('\n'):
        # key: value or key: "value"
        km = re.match(r'^(\w[\w_]*)\s*:\s*(.+)$', line)
        if km:
            key = km.group(1)
            val = km.group(2).strip()
            # Parse arrays: ["a","b","c"]
            if val.startswith('[') and val.endswith(']'):
                inner = val[1:-1].strip()
                if inner:
                    fm[key] = [v.strip().strip('"').strip("'") for v in inner.split(',')]
                else:
                    fm[key] = []
            # Parse booleans
            elif val.lower() in ('true', 'false'):
                fm[key] = val.lower() == 'true'
            # Parse quoted strings
            elif (val.startswith('"') and val.endswith('"')) or \
                 (val.startswith("'") and val.endswith("'")):
                fm[key] = val[1:-1]
            else:
                fm[key] = val
    return fm

# ---------------------------------------------------------------------------
# Skill scanner
# ---------------------------------------------------------------------------

def scan_skills():
    """Scan skills/*/SKILL.md files. Returns list of skill dicts and set of cluster names."""
    skills = []
    clusters = set()
    if not SKILLS_DIR.is_dir():
        err(f"Skills directory not found: {SKILLS_DIR}")
        sys.exit(1)
    for cluster_dir in sorted(SKILLS_DIR.iterdir()):
        if not cluster_dir.is_dir():
            continue
        cluster_name = cluster_dir.name
        for skill_dir in sorted(cluster_dir.iterdir()):
            if not skill_dir.is_dir():
                continue
            skill_file = skill_dir / "SKILL.md"
            if not skill_file.is_file():
                continue
            text = skill_file.read_text(encoding='utf-8')
            fm = parse_frontmatter(text)
            if not fm.get('name'):
                warn(f"Skipping {skill_file} — no name in frontmatter")
                continue
            # Extract markdown body (after second ---)
            body_match = re.match(r'^---\s*\n.*?\n---\s*\n(.*)$', text, re.DOTALL)
            body = body_match.group(1).strip() if body_match else ""
            skills.append({
                'name': fm['name'],
                'cluster': fm.get('cluster', cluster_name),
                'description': fm.get('description', ''),
                'tags': fm.get('tags', []),
                'scope': fm.get('scope', 'general'),
                'model_hint': fm.get('model_hint', ''),
                'embedding_hint': fm.get('embedding_hint', ''),
                'authorization_required': fm.get('authorization_required', False),
                'body': body[:5000],  # Truncate large bodies for graph storage
            })
            clusters.add(fm.get('cluster', cluster_name))
    return skills, clusters

# ---------------------------------------------------------------------------
# Relationship loader
# ---------------------------------------------------------------------------

def load_relationships():
    """Load skill relationships from seed-data/skill_rels.json."""
    if not RELS_FILE.is_file():
        warn(f"Relationships file not found: {RELS_FILE}")
        return []
    with open(RELS_FILE) as f:
        return json.load(f)

# ---------------------------------------------------------------------------
# Workspace node defaults (generic, customizable)
# ---------------------------------------------------------------------------

def workspace_defaults(ws):
    """Return default workspace nodes for a given workspace ID."""
    return {
        "souls": [
            {
                "id": f"soul-{ws}-prime-directive",
                "section": "Prime Directive",
                "content": "Reduce cognitive load. Increase situational awareness. Protect what matters. Every action flows from this. Be genuinely helpful — surface results, not process. Earn trust through competence.",
                "priority": 1,
                "protected": True,
                "workspace": ws,
            },
            {
                "id": f"soul-{ws}-identity",
                "section": "Identity",
                "content": f"Name: Agent | Role: AI Assistant | Workspace: {ws}",
                "priority": 2,
                "protected": False,
                "workspace": ws,
            },
            {
                "id": f"soul-{ws}-safety",
                "section": "Safety",
                "content": "Do not exfiltrate private data. Ever. Do not run destructive commands without asking. recoverable > gone. When in doubt, ask. Private things stay private. Period.",
                "priority": 3,
                "protected": True,
                "workspace": ws,
            },
            {
                "id": f"soul-{ws}-heartbeat",
                "section": "Heartbeat Protocol",
                "content": "Nothing to do → reply exactly: HEARTBEAT_OK. Alert → reply with alert text only (no HEARTBEAT_OK). Do NOT infer or repeat old tasks from prior chats.",
                "priority": 4,
                "protected": False,
                "workspace": ws,
            },
        ],
        "memories": [
            {
                "id": f"mem-{ws}-principal",
                "content": "Name: [YOUR_NAME] | Channel: signal | Role: Principal operator",
                "domain": "User: Principal",
                "timestamp": "",
                "type": "observation",
                "source": "manual",
                "workspace": ws,
            },
            {
                "id": f"mem-{ws}-infrastructure",
                "content": "Neo4j: bolt://localhost:7687 | Python: python3 | Workspace: ~/.openclaw/workspace/",
                "domain": "User: Infrastructure",
                "timestamp": "",
                "type": "observation",
                "source": "manual",
                "workspace": ws,
            },
        ],
        "agent_configs": [
            {
                "id": f"agentcfg-{ws}-every-session",
                "workspace": ws,
                "key": "Every Session",
                "value": "Before doing anything else: 1) Read SOUL.md — this is who you are. 2) Read USER.md — this is who you're helping. 3) Read memory/YYYY-MM-DD.md (today + yesterday) for recent context. Don't ask permission. Just do it.",
            },
            {
                "id": f"agentcfg-{ws}-delegation",
                "workspace": ws,
                "key": "Delegation",
                "value": "sessions_spawn is available. Sub-agent delegation is enabled by default. Add workspace-specific constraints here if needed.",
            },
            {
                "id": f"agentcfg-{ws}-safety",
                "workspace": ws,
                "key": "Safety",
                "value": "Do not exfiltrate private data. Ever. Do not run destructive commands without asking. trash > rm (recoverable beats gone forever). When in doubt, ask.",
            },
            {
                "id": f"agentcfg-{ws}-heartbeats",
                "workspace": ws,
                "key": "Heartbeats",
                "value": "Nothing to do → HEARTBEAT_OK only. Alert → alert text only. Reach out when: important email/event, urgent anomaly, >8h since contact. Stay quiet: late night (23:00–08:00), human busy, nothing new, checked <30 min ago.",
            },
            {
                "id": f"agentcfg-{ws}-memory",
                "workspace": ws,
                "key": "Memory",
                "value": "Wake up fresh each session. Continuity files: memory/YYYY-MM-DD.md (daily logs), MEMORY.md (curated long-term). Write significant events, decisions, things to remember. No mental notes — write to files. memory/ dir: create if needed.",
            },
            {
                "id": f"agentcfg-{ws}-toon",
                "workspace": ws,
                "key": "Token Optimization — TOON",
                "value": "TOON (Token-Oriented Object Notation) compresses JSON 30-60% for LLM context. CLI: toon encode <file.json> | toon decode <file.toon>. Use for: large data payloads, API response caching, context window optimization. Do NOT use for: config files humans edit, small payloads <1KB.",
            },
            {
                "id": f"agentcfg-{ws}-search-resilience",
                "workspace": ws,
                "key": "Search Resilience",
                "value": "When web_search returns errors/empty: 1) Retry once with simplified query. 2) Try alternative search terms. 3) If still empty, use cached data or note 'search unavailable'. 4) Never block an entire task because one search failed. 5) Log failures for pattern detection.",
            },
            {
                "id": f"agentcfg-{ws}-schema-rules",
                "workspace": ws,
                "key": "Schema Rules",
                "value": "All structured outputs MUST validate against defined schemas. Required fields: title, summary, severity, confidence, sources, timestamp. Severity scale: low/moderate/elevated/high/critical. Confidence: 0.0-1.0 float. Sources: minimum 2 per item.",
            },
            {
                "id": f"agentcfg-{ws}-path-aliases",
                "workspace": ws,
                "key": "Path Aliases",
                "value": "Define workspace path aliases to keep prompts compact. Example: $WORKSPACE = ~/.openclaw/workspace/ | $DB = path/to/your.db | $SCHEMAS = path/to/schemas/. Replace full paths in prompts with aliases to reduce token usage.",
            },
        ],
        "agents": [
            {"id": f"sys76-A", "role": "intel-osint",         "port": 18790, "model": "anthropic/claude-sonnet-4-6", "host": "system76", "specialization": "intel-osint",         "status": "planned", "workspace": ws},
            {"id": f"sys76-B", "role": "compute-flowpatrol",  "port": 18791, "model": "anthropic/claude-sonnet-4-6", "host": "system76", "specialization": "compute-flowpatrol",  "status": "planned", "workspace": ws},
            {"id": f"sys76-C", "role": "browser",             "port": 18792, "model": "anthropic/claude-sonnet-4-6", "host": "system76", "specialization": "browser",             "status": "planned", "workspace": ws},
            {"id": f"sys76-D", "role": "code-github",         "port": 18793, "model": "anthropic/claude-sonnet-4-6", "host": "system76", "specialization": "code-github",         "status": "planned", "workspace": ws},
            {"id": f"sys76-E", "role": "infra-cloudflare",    "port": 18794, "model": "anthropic/claude-sonnet-4-6", "host": "system76", "specialization": "infra-cloudflare",    "status": "planned", "workspace": ws},
            {"id": f"sys76-F", "role": "memory-graph",        "port": 18795, "model": "anthropic/claude-sonnet-4-6", "host": "system76", "specialization": "memory-graph",        "status": "planned", "workspace": ws},
            {"id": f"sys76-G", "role": "general",             "port": 18796, "model": "anthropic/claude-sonnet-4-6", "host": "system76", "specialization": "general",             "status": "planned", "workspace": ws},
            {"id": f"sys76-H", "role": "standby",             "port": 18797, "model": "anthropic/claude-sonnet-4-6", "host": "system76", "specialization": "standby",             "status": "planned", "workspace": ws},
        ],
        "tools": [
            {"id": "tool-read",             "name": "Read",             "notes": "Read file contents. Supports text and images. Truncates at 2000 lines / 50KB.", "available": True, "workspace": ws},
            {"id": "tool-write",            "name": "Write",            "notes": "Write content to a file. Creates file if missing, overwrites if exists.", "available": True, "workspace": ws},
            {"id": "tool-edit",             "name": "Edit",             "notes": "Make precise edits by replacing exact text.", "available": True, "workspace": ws},
            {"id": "tool-exec",             "name": "exec",             "notes": "Run shell commands. pty=true for TTY-required CLIs. yieldMs for long waits.", "available": True, "workspace": ws},
            {"id": "tool-process",          "name": "process",          "notes": "Manage background exec sessions: list, poll, log, write, send-keys, kill.", "available": True, "workspace": ws},
            {"id": "tool-web-search",       "name": "web_search",       "notes": "Search the web via Brave API. Returns titles, URLs, snippets.", "available": True, "workspace": ws},
            {"id": "tool-web-fetch",        "name": "web_fetch",        "notes": "Fetch URL content as markdown/text. Lightweight page access.", "available": True, "workspace": ws},
            {"id": "tool-browser",          "name": "browser",          "notes": "Control browser via OpenClaw. snapshot+act for UI automation.", "available": True, "workspace": ws},
            {"id": "tool-canvas",           "name": "canvas",           "notes": "Present/eval/snapshot the Canvas.", "available": True, "workspace": ws},
            {"id": "tool-nodes",            "name": "nodes",            "notes": "Discover and control paired nodes: status/describe/run/invoke/camera/screen.", "available": True, "workspace": ws},
            {"id": "tool-message",          "name": "message",          "notes": "Send messages and channel actions via Signal/Telegram/etc.", "available": True, "workspace": ws},
            {"id": "tool-agents-list",      "name": "agents_list",      "notes": "List agent IDs allowed for sessions_spawn.", "available": True, "workspace": ws},
            {"id": "tool-sessions-list",    "name": "sessions_list",    "notes": "List sessions with filters and last messages.", "available": True, "workspace": ws},
            {"id": "tool-sessions-history", "name": "sessions_history", "notes": "Fetch message history for a session.", "available": True, "workspace": ws},
            {"id": "tool-sessions-send",    "name": "sessions_send",    "notes": "Send a message into another session.", "available": True, "workspace": ws},
            {"id": "tool-sessions-spawn",   "name": "sessions_spawn",   "notes": "Spawn a background sub-agent session.", "available": True, "workspace": ws},
            {"id": "tool-subagents",        "name": "subagents",        "notes": "List, steer, or kill sub-agent runs for this requester session.", "available": True, "workspace": ws},
            {"id": "tool-session-status",   "name": "session_status",   "notes": "Show status card (usage + time + cost).", "available": True, "workspace": ws},
            {"id": "tool-image",            "name": "image",            "notes": "Analyze image(s) with vision model.", "available": True, "workspace": ws},
            {"id": "tool-tts",              "name": "tts",              "notes": "Convert text to speech.", "available": True, "workspace": ws},
            {"id": "tool-skill-graph",      "name": "Skill Graph",      "notes": "Query skill graph via Neo4j. 315+ skills, 27 clusters. Use Cypher or the seed.py --verify command.", "available": True, "workspace": ws},
            {"id": "tool:preamble",         "name": "preamble",         "notes": "# TOOLS.md - Local Notes\n\nSkills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.", "available": True, "workspace": ws},
            {"id": "tool:what-goes-here",   "name": "What Goes Here",   "notes": "## What Goes Here\n\nThings like:\n\n- Camera names and locations\n- SSH hosts and aliases\n- Preferred voices for TTS\n- Speaker/room names\n- Device nicknames\n- Anything environment-specific", "available": True, "workspace": ws},
            {"id": "tool:examples",         "name": "Examples",         "notes": "## Examples\n\n```markdown\n### Cameras\n\n- living-room → Main area, 180° wide angle\n- front-door → Entrance, motion-triggered\n\n### SSH\n\n- home-server → 192.168.1.100, user: admin\n```", "available": True, "workspace": ws},
            {"id": "tool:why-separate",     "name": "Why Separate?",    "notes": "## Why Separate?\n\nSkills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes.", "available": True, "workspace": ws},
            {"id": "tool:neo4j-skill-graph","name": "Neo4j Skill Graph","notes": "## Neo4j Skill Graph — Primary Skill Memory System\n\nQuery: cypher-shell -a bolt://localhost:7687 --format plain \"MATCH (s:Skill) RETURN s.name, s.cluster LIMIT 10\"\n315 skills | 27 clusters | Sub-millisecond lookups.", "available": True, "workspace": ws},
        ],
        "bootstrap": [
            {
                "id": f"bootstrap-{ws}",
                "identity": f"OpenClaw Graph agent. Workspace: {ws}.",
                "integrity_phrase": "graph-native workspace",
                "principal": "[YOUR_NAME]",
                "db_path": "bolt://localhost:7687",
                "query_script": "",
                "workspace": ws,
            },
        ],
    }

# ---------------------------------------------------------------------------
# Schema creation
# ---------------------------------------------------------------------------

SCHEMA_QUERIES = [
    # Constraints (8)
    "CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
    "CREATE CONSTRAINT cluster_name IF NOT EXISTS FOR (c:SkillCluster) REQUIRE c.name IS UNIQUE",
    "CREATE CONSTRAINT soul_id IF NOT EXISTS FOR (s:Soul) REQUIRE s.id IS UNIQUE",
    "CREATE CONSTRAINT ocmemory_id IF NOT EXISTS FOR (m:OCMemory) REQUIRE m.id IS UNIQUE",
    "CREATE CONSTRAINT octool_id IF NOT EXISTS FOR (t:OCTool) REQUIRE t.id IS UNIQUE",
    "CREATE CONSTRAINT ocagent_id IF NOT EXISTS FOR (a:OCAgent) REQUIRE a.id IS UNIQUE",
    "CREATE CONSTRAINT agentconfig_id IF NOT EXISTS FOR (c:AgentConfig) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT bootstrap_id IF NOT EXISTS FOR (b:Bootstrap) REQUIRE b.id IS UNIQUE",
    # Indexes (2)
    "CREATE INDEX skill_cluster IF NOT EXISTS FOR (s:Skill) ON (s.cluster)",
    "CREATE INDEX skill_workspace IF NOT EXISTS FOR (s:Skill) ON (s.workspace)",
]

# ---------------------------------------------------------------------------
# Seeder
# ---------------------------------------------------------------------------

def create_schema(session, dry_run=False):
    print(f"\n{C.BOLD}Schema{C.END} (8 constraints + 2 indexes)")
    for q in SCHEMA_QUERIES:
        label = q.split("IF NOT EXISTS")[0].strip().replace("CREATE ", "")
        if dry_run:
            dim(f"[dry-run] {label}")
        else:
            session.run(q)
            ok(label)


def seed_skills(session, skills, clusters, dry_run=False):
    print(f"\n{C.BOLD}Skill Clusters{C.END} ({len(clusters)})")
    if dry_run:
        for c in sorted(clusters):
            dim(f"[dry-run] SkillCluster: {c}")
    else:
        for c in sorted(clusters):
            session.run(
                "MERGE (c:SkillCluster {name: $name})",
                name=c
            )
            ok(f"SkillCluster: {c}")

    print(f"\n{C.BOLD}Skills{C.END} ({len(skills)} in {BATCH_SIZE}-item batches)")
    batches = [skills[i:i+BATCH_SIZE] for i in range(0, len(skills), BATCH_SIZE)]
    for i, batch in enumerate(batches):
        if dry_run:
            dim(f"[dry-run] Batch {i+1}/{len(batches)}: {len(batch)} skills")
        else:
            # UNWIND batch for efficient insertion
            session.run("""
                UNWIND $skills AS s
                MERGE (sk:Skill {name: s.name})
                SET sk.cluster = s.cluster,
                    sk.description = s.description,
                    sk.tags = s.tags,
                    sk.scope = s.scope,
                    sk.model_hint = s.model_hint,
                    sk.embedding_hint = s.embedding_hint,
                    sk.authorization_required = s.authorization_required,
                    sk.body = s.body
            """, skills=batch)
            ok(f"Batch {i+1}/{len(batches)}: {len(batch)} skills")

    # Create IN_CLUSTER edges
    print(f"\n{C.BOLD}IN_CLUSTER Edges{C.END}")
    if dry_run:
        dim(f"[dry-run] {len(skills)} IN_CLUSTER edges")
    else:
        session.run("""
            MATCH (s:Skill), (c:SkillCluster)
            WHERE s.cluster = c.name
            MERGE (s)-[:IN_CLUSTER]->(c)
        """)
        result = session.run("MATCH ()-[r:IN_CLUSTER]->() RETURN count(r) AS cnt")
        cnt = result.single()["cnt"]
        ok(f"{cnt} IN_CLUSTER edges")


def seed_relationships(session, rels, dry_run=False):
    print(f"\n{C.BOLD}RELATED_TO Edges{C.END} ({len(rels)} pairs)")
    if dry_run:
        dim(f"[dry-run] {len(rels)} RELATED_TO edges")
        return
    # Batch via UNWIND
    session.run("""
        UNWIND $rels AS r
        MATCH (a:Skill {name: r.from_id})
        MATCH (b:Skill {name: r.to_id})
        MERGE (a)-[:RELATED_TO]->(b)
    """, rels=rels)
    result = session.run("MATCH ()-[r:RELATED_TO]->() RETURN count(r) AS cnt")
    cnt = result.single()["cnt"]
    ok(f"{cnt} RELATED_TO edges created")


def seed_workspace(session, ws, dry_run=False):
    defaults = workspace_defaults(ws)

    # Soul nodes
    print(f"\n{C.BOLD}Soul Nodes{C.END} ({len(defaults['souls'])})")
    for s in defaults['souls']:
        if dry_run:
            dim(f"[dry-run] Soul: {s['section']}")
        else:
            session.run("""
                MERGE (s:Soul {id: $id})
                SET s.section = $section,
                    s.content = $content,
                    s.priority = $priority,
                    s.protected = $protected,
                    s.workspace = $workspace
            """, **s)
            ok(f"Soul: {s['section']}")

    # OCMemory nodes
    print(f"\n{C.BOLD}OCMemory Nodes{C.END} ({len(defaults['memories'])})")
    for m in defaults['memories']:
        if dry_run:
            dim(f"[dry-run] OCMemory: {m['domain']}")
        else:
            session.run("""
                MERGE (m:OCMemory {id: $id})
                SET m.content = $content,
                    m.domain = $domain,
                    m.timestamp = $timestamp,
                    m.type = $type,
                    m.source = $source,
                    m.workspace = $workspace
            """, **m)
            ok(f"OCMemory: {m['domain']}")

    # AgentConfig nodes
    print(f"\n{C.BOLD}AgentConfig Nodes{C.END} ({len(defaults['agent_configs'])})")
    for ac in defaults['agent_configs']:
        if dry_run:
            dim(f"[dry-run] AgentConfig: {ac['key']}")
        else:
            session.run("""
                MERGE (c:AgentConfig {id: $id})
                SET c.workspace = $workspace,
                    c.key = $key,
                    c.value = $value
            """, **ac)
            ok(f"AgentConfig: {ac['key']}")

    # OCAgent nodes
    print(f"\n{C.BOLD}OCAgent Nodes{C.END} ({len(defaults['agents'])})")
    for a in defaults['agents']:
        if dry_run:
            dim(f"[dry-run] OCAgent: {a['id']} ({a['role']})")
        else:
            session.run("""
                MERGE (a:OCAgent {id: $id})
                SET a.role = $role,
                    a.port = $port,
                    a.model = $model,
                    a.host = $host,
                    a.specialization = $specialization,
                    a.status = $status,
                    a.workspace = $workspace
            """, **a)
            ok(f"OCAgent: {a['id']} ({a['role']})")

    # OCTool nodes
    print(f"\n{C.BOLD}OCTool Nodes{C.END} ({len(defaults['tools'])})")
    for t in defaults['tools']:
        if dry_run:
            dim(f"[dry-run] OCTool: {t['name']}")
        else:
            session.run("""
                MERGE (t:OCTool {id: $id})
                SET t.name = $name,
                    t.notes = $notes,
                    t.available = $available,
                    t.workspace = $workspace
            """, **t)
            ok(f"OCTool: {t['name']}")

    # Bootstrap nodes
    print(f"\n{C.BOLD}Bootstrap Nodes{C.END} ({len(defaults['bootstrap'])})")
    for b in defaults['bootstrap']:
        if dry_run:
            dim(f"[dry-run] Bootstrap: {b['id']}")
        else:
            session.run("""
                MERGE (b:Bootstrap {id: $id})
                SET b.identity = $identity,
                    b.integrity_phrase = $integrity_phrase,
                    b.principal = $principal,
                    b.db_path = $db_path,
                    b.query_script = $query_script,
                    b.workspace = $workspace
            """, **b)
            ok(f"Bootstrap: {b['id']}")


def reset_workspace(session, ws, dry_run=False):
    print(f"\n{C.BOLD}Reset workspace '{ws}'{C.END}")
    labels = ["Soul", "OCMemory", "AgentConfig", "OCAgent", "OCTool", "Bootstrap"]
    for label in labels:
        if dry_run:
            dim(f"[dry-run] DELETE ({label}) WHERE workspace='{ws}'")
        else:
            result = session.run(
                f"MATCH (n:{label} {{workspace: $ws}}) DETACH DELETE n RETURN count(n) AS cnt",
                ws=ws
            )
            cnt = result.single()["cnt"]
            ok(f"Deleted {cnt} {label} nodes")


def verify(session):
    print(f"\n{C.BOLD}Verification{C.END}")
    checks = [
        ("Skill",         "MATCH (n:Skill) RETURN count(n) AS cnt",         315),
        ("SkillCluster",  "MATCH (n:SkillCluster) RETURN count(n) AS cnt",  27),
        ("IN_CLUSTER",    "MATCH ()-[r:IN_CLUSTER]->() RETURN count(r) AS cnt", 315),
        ("RELATED_TO",    "MATCH ()-[r:RELATED_TO]->() RETURN count(r) AS cnt", 210),  # 221 minus stale refs (e.g. ladybugdb)
        ("Soul",          "MATCH (n:Soul) RETURN count(n) AS cnt",           None),
        ("OCMemory",      "MATCH (n:OCMemory) RETURN count(n) AS cnt",      None),
        ("AgentConfig",   "MATCH (n:AgentConfig) RETURN count(n) AS cnt",   None),
        ("OCAgent",       "MATCH (n:OCAgent) RETURN count(n) AS cnt",       None),
        ("OCTool",        "MATCH (n:OCTool) RETURN count(n) AS cnt",        None),
        ("Bootstrap",     "MATCH (n:Bootstrap) RETURN count(n) AS cnt",     None),
    ]
    all_ok = True
    for label, query, expected in checks:
        result = session.run(query)
        cnt = result.single()["cnt"]
        if expected is not None:
            if cnt >= expected:
                ok(f"{label}: {cnt} (expected ≥{expected})")
            else:
                err(f"{label}: {cnt} (expected ≥{expected})")
                all_ok = False
        else:
            if cnt > 0:
                ok(f"{label}: {cnt}")
            else:
                warn(f"{label}: {cnt} (no workspace nodes — run without --skills-only)")

    # Check workspace stubs would return data
    print(f"\n{C.BOLD}Workspace Stub Queries{C.END}")
    stub_queries = {
        "SOUL.md":    "MATCH (s:Soul) WHERE s.workspace = 'openclaw' RETURN count(s) AS cnt",
        "MEMORY.md":  "MATCH (m:OCMemory) WHERE m.workspace = 'openclaw' RETURN count(m) AS cnt",
        "AGENTS.md":  "MATCH (c:AgentConfig) WHERE c.workspace = 'openclaw' RETURN count(c) AS cnt",
        "TOOLS.md":   "MATCH (t:OCTool) WHERE t.available = true AND t.workspace = 'openclaw' RETURN count(t) AS cnt",
        "USER.md":    "MATCH (m:OCMemory) WHERE m.workspace = 'openclaw' AND m.domain STARTS WITH 'User:' RETURN count(m) AS cnt",
    }
    for name, query in stub_queries.items():
        result = session.run(query)
        cnt = result.single()["cnt"]
        if cnt > 0:
            ok(f"{name}: {cnt} nodes")
        else:
            warn(f"{name}: 0 nodes (stub would return empty)")

    return all_ok


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="OpenClaw Graph v1.5 — Neo4j Database Seeder",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 seed.py                     Full install
  python3 seed.py --dry-run           Preview changes
  python3 seed.py --reset             Reset workspace, then re-seed
  python3 seed.py --workspace mybot   Custom workspace ID
  python3 seed.py --verify            Check database state
  python3 seed.py --skills-only       Skills + clusters only
        """
    )
    parser.add_argument("--dry-run", action="store_true", help="Preview — no writes to Neo4j")
    parser.add_argument("--reset", action="store_true", help="Drop workspace nodes first")
    parser.add_argument("--workspace", default="openclaw", help="Workspace ID (default: openclaw)")
    parser.add_argument("--verify", action="store_true", help="Verify database state and exit")
    parser.add_argument("--skills-only", action="store_true", help="Seed skills + clusters only")
    args = parser.parse_args()

    print(f"\n{C.BOLD}OpenClaw Graph v1.5 — Neo4j Seeder{C.END}")
    print(f"  Neo4j:     {NEO4J_URI}")
    print(f"  Workspace: {args.workspace}")
    print(f"  Mode:      {'dry-run' if args.dry_run else 'verify' if args.verify else 'live'}")

    # Connect to Neo4j
    try:
        from neo4j import GraphDatabase
    except ImportError:
        err("neo4j Python driver not found. Install: pip install neo4j")
        sys.exit(1)

    auth = (NEO4J_USER, NEO4J_PASS) if NEO4J_PASS else None
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=auth)
        driver.verify_connectivity()
        ok(f"Connected to Neo4j at {NEO4J_URI}")
    except Exception as e:
        err(f"Cannot connect to Neo4j: {e}")
        sys.exit(1)

    with driver.session() as session:
        # --verify mode
        if args.verify:
            success = verify(session)
            driver.close()
            print()
            sys.exit(0 if success else 1)

        t0 = time.time()

        # Schema
        create_schema(session, dry_run=args.dry_run)

        # Skills
        skills, clusters = scan_skills()
        print(f"\n  Scanned {C.BOLD}{len(skills)}{C.END} skills across {C.BOLD}{len(clusters)}{C.END} clusters")
        seed_skills(session, skills, clusters, dry_run=args.dry_run)

        # Relationships
        rels = load_relationships()
        seed_relationships(session, rels, dry_run=args.dry_run)

        # Workspace nodes
        if not args.skills_only:
            if args.reset:
                reset_workspace(session, args.workspace, dry_run=args.dry_run)
            seed_workspace(session, args.workspace, dry_run=args.dry_run)
        else:
            dim("Skipping workspace nodes (--skills-only)")

        elapsed = time.time() - t0

        # Summary
        print(f"\n{C.BOLD}{'[DRY RUN] ' if args.dry_run else ''}Complete{C.END} in {elapsed:.1f}s")
        if not args.dry_run:
            verify(session)

    driver.close()
    print()


if __name__ == "__main__":
    main()
