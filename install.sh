#!/usr/bin/env bash
# ============================================================
# install.sh — Neo4j Skill Graph Installer
# https://github.com/alphaonedev/openclaw-graph
#
# Installs Neo4j Community Edition, seeds the skill graph,
# and verifies the database.
#
# Usage:
#   ./install.sh              # interactive (installs + seeds)
#   ./install.sh --verify     # verify existing Neo4j data
# ============================================================

set -euo pipefail

# ── Config ───────────────────────────────────────────────────
REPO="alphaonedev/openclaw-graph"
NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
PYTHON="${PYTHON:-python3}"
MIGRATION_SCRIPT="migrate_ladybugdb_to_neo4j.py"
# ─────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}ℹ${RESET}  $*"; }
success() { echo -e "${GREEN}✅${RESET} $*"; }
warn()    { echo -e "${YELLOW}⚠️ ${RESET} $*"; }
error()   { echo -e "${RED}❌${RESET} $*"; exit 1; }
header()  { echo -e "\n${BOLD}$*${RESET}"; }

# ── Parse args ───────────────────────────────────────────────
VERIFY_ONLY=false
while [ $# -gt 0 ]; do
  case "$1" in
    --verify)  VERIFY_ONLY=true ;;
    --help|-h)
      echo "Usage: $0 [--verify]"
      echo ""
      echo "  (default)   Install Neo4j, seed skill graph, verify"
      echo "  --verify    Verify existing Neo4j data only"
      exit 0 ;;
  esac
  shift
done

# ── Header ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}🔷 Neo4j Skill Graph — Installer${RESET}"
echo "   ${REPO}"
echo ""

# ── Detect platform ──────────────────────────────────────────
detect_platform() {
  case "$(uname -s 2>/dev/null)" in
    Darwin)       echo "macos" ;;
    Linux)
      if   command -v apt-get &>/dev/null; then echo "debian"
      elif command -v dnf     &>/dev/null; then echo "fedora"
      elif command -v pacman  &>/dev/null; then echo "arch"
      else echo "linux"
      fi ;;
    MINGW*|MSYS*|CYGWIN*)  echo "windows" ;;
    *)            echo "unknown" ;;
  esac
}
PLATFORM="$(detect_platform)"

install_hint() {
  case "$1" in
    neo4j)
      case "$PLATFORM" in
        macos)   echo "brew install neo4j" ;;
        debian)  echo "See https://neo4j.com/docs/operations-manual/current/installation/linux/debian/" ;;
        fedora)  echo "See https://neo4j.com/docs/operations-manual/current/installation/linux/rpm/" ;;
        arch)    echo "yay -S neo4j-community" ;;
        *)       echo "https://neo4j.com/download/" ;;
      esac ;;
    python3)
      case "$PLATFORM" in
        macos)   echo "brew install python3  OR  use Anaconda" ;;
        debian)  echo "sudo apt-get install -y python3 python3-pip" ;;
        fedora)  echo "sudo dnf install -y python3 python3-pip" ;;
        arch)    echo "sudo pacman -S python python-pip" ;;
        *)       echo "https://www.python.org/downloads/" ;;
      esac ;;
    neo4j-driver)  echo "pip install neo4j" ;;
    cypher-shell)
      case "$PLATFORM" in
        macos)   echo "Included with: brew install neo4j" ;;
        debian)  echo "sudo apt-get install -y cypher-shell" ;;
        fedora)  echo "sudo dnf install -y cypher-shell" ;;
        *)       echo "https://neo4j.com/download-center/#cypher-shell" ;;
      esac ;;
  esac
}

# ── Verify-only mode ─────────────────────────────────────────
if $VERIFY_ONLY; then
  header "Verifying Neo4j data..."
  if ! command -v cypher-shell &>/dev/null; then
    error "cypher-shell not found  →  $(install_hint cypher-shell)"
  fi

  SKILL_COUNT=$(echo "MATCH (n:Skill) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
  CLUSTER_COUNT=$(echo "MATCH (n:SkillCluster) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
  SOUL_COUNT=$(echo "MATCH (n:Soul) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
  AC_COUNT=$(echo "MATCH (n:AgentConfig) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")

  echo "  Skills:        $SKILL_COUNT"
  echo "  SkillClusters: $CLUSTER_COUNT"
  echo "  Soul:          $SOUL_COUNT"
  echo "  AgentConfig:   $AC_COUNT"

  if [ "$SKILL_COUNT" -gt 0 ] 2>/dev/null; then
    success "Database OK"
  else
    error "No skills found — run the migration script first"
  fi
  exit 0
fi

# ── Check dependencies ───────────────────────────────────────
header "Checking dependencies..."

MISSING=()

check_dep() {
  local cmd="$1" label="${2:-$1}"
  if command -v "$cmd" &>/dev/null; then
    success "$label found ($(command -v "$cmd"))"
    return 0
  else
    warn "$label not found  →  $(install_hint "$label")"
    MISSING+=("$label")
    return 1
  fi
}

# Check Neo4j
if command -v neo4j &>/dev/null; then
  success "Neo4j found ($(command -v neo4j))"
else
  warn "Neo4j not found  →  $(install_hint neo4j)"
  MISSING+=("neo4j")
fi

# Check cypher-shell
check_dep cypher-shell

# Check Python
if command -v "$PYTHON" &>/dev/null; then
  PY_VER=$("$PYTHON" --version 2>&1)
  success "Python found: $PY_VER"
else
  warn "Python not found  →  $(install_hint python3)"
  MISSING+=("python3")
fi

# Check neo4j Python driver
if "$PYTHON" -c "import neo4j" 2>/dev/null; then
  success "neo4j Python driver found"
else
  warn "neo4j Python driver not found  →  $(install_hint neo4j-driver)"
  MISSING+=("neo4j-driver")
fi

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}❌  Missing: ${MISSING[*]}${RESET}"
  echo ""
  echo "  Install the above, then re-run this script."
  echo ""
  exit 1
fi

# ── Check Neo4j is running ───────────────────────────────────
header "Checking Neo4j status..."
if echo "RETURN 1;" | cypher-shell -a "$NEO4J_URI" --format plain &>/dev/null; then
  success "Neo4j is running at $NEO4J_URI"
else
  error "Neo4j is not running at $NEO4J_URI\n\n  Start it with:\n    macOS:  brew services start neo4j\n    Linux:  sudo systemctl start neo4j"
fi

# ── Run migration script ─────────────────────────────────────
header "Seeding skill graph..."

# Find migration script
SCRIPT_DIR="$(cd "$(dirname "$0")" 2>/dev/null && pwd)" || SCRIPT_DIR=""
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/$MIGRATION_SCRIPT" ]; then
  SCRIPT_PATH="$SCRIPT_DIR/$MIGRATION_SCRIPT"
elif [ -f "$HOME/openclaw-graph/$MIGRATION_SCRIPT" ]; then
  SCRIPT_PATH="$HOME/openclaw-graph/$MIGRATION_SCRIPT"
else
  error "Migration script not found: $MIGRATION_SCRIPT\n\n  Clone the repo first:\n    git clone https://github.com/${REPO}.git ~/openclaw-graph"
fi

info "Running: $PYTHON $SCRIPT_PATH"
"$PYTHON" "$SCRIPT_PATH" || error "Migration failed — check Neo4j connection"

# ── Verify ───────────────────────────────────────────────────
header "Verifying database..."
SKILL_COUNT=$(echo "MATCH (n:Skill) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
CLUSTER_COUNT=$(echo "MATCH (n:SkillCluster) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
SOUL_COUNT=$(echo "MATCH (n:Soul) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
AC_COUNT=$(echo "MATCH (n:AgentConfig) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")

echo "  Skills:        $SKILL_COUNT"
echo "  SkillClusters: $CLUSTER_COUNT"
echo "  Soul:          $SOUL_COUNT"
echo "  AgentConfig:   $AC_COUNT"

if [ "$SKILL_COUNT" -gt 0 ] 2>/dev/null; then
  success "Database verified"
else
  error "Verification failed — no skills found"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}🔷 Installation complete!${RESET}"
echo ""
echo "  Neo4j: $NEO4J_URI"
echo ""
echo "  Query the graph:"
echo "    cypher-shell -a $NEO4J_URI --format plain \"MATCH (s:Skill) RETURN s.name, s.cluster LIMIT 10\""
echo "    cypher-shell -a $NEO4J_URI --format plain \"MATCH (s:Skill {cluster:'devops-sre'}) RETURN s.name\""
echo ""
