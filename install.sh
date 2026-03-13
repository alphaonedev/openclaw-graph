#!/usr/bin/env bash
# ============================================================
# install.sh — OpenClaw Graph v1.5 Installer
# https://github.com/alphaonedev/openclaw-graph
#
# Installs Neo4j Community Edition, seeds the skill graph +
# workspace nodes, deploys workspace stubs, and verifies.
#
# Usage:
#   ./install.sh                    # full install
#   ./install.sh --verify           # verify existing data
#   ./install.sh --workspace NAME   # custom workspace ID
# ============================================================

set -euo pipefail

# ── Config ───────────────────────────────────────────────────
REPO="alphaonedev/openclaw-graph"
NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
PYTHON="${PYTHON:-python3}"
SEED_SCRIPT="seed.py"
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
WORKSPACE="openclaw"
SEED_ARGS=""
while [ $# -gt 0 ]; do
  case "$1" in
    --verify)    VERIFY_ONLY=true ;;
    --workspace) shift; WORKSPACE="$1"; SEED_ARGS="$SEED_ARGS --workspace $1" ;;
    --reset)     SEED_ARGS="$SEED_ARGS --reset" ;;
    --help|-h)
      echo "Usage: $0 [--verify] [--workspace NAME] [--reset]"
      echo ""
      echo "  (default)        Install Neo4j, seed graph, deploy stubs, verify"
      echo "  --verify         Verify existing Neo4j data only"
      echo "  --workspace NAME Custom workspace ID (default: openclaw)"
      echo "  --reset          Drop existing workspace nodes before seeding"
      exit 0 ;;
  esac
  shift
done

# ── Header ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}🔷 OpenClaw Graph v1.5 — Installer${RESET}"
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

  SCRIPT_DIR="$(cd "$(dirname "$0")" 2>/dev/null && pwd)" || SCRIPT_DIR=""
  if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/$SEED_SCRIPT" ]; then
    "$PYTHON" "$SCRIPT_DIR/$SEED_SCRIPT" --verify
  elif command -v cypher-shell &>/dev/null; then
    SKILL_COUNT=$(echo "MATCH (n:Skill) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
    CLUSTER_COUNT=$(echo "MATCH (n:SkillCluster) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
    SOUL_COUNT=$(echo "MATCH (n:Soul) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
    AC_COUNT=$(echo "MATCH (n:AgentConfig) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
    MEM_COUNT=$(echo "MATCH (n:OCMemory) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
    TOOL_COUNT=$(echo "MATCH (n:OCTool) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")
    AGENT_COUNT=$(echo "MATCH (n:OCAgent) RETURN count(n) AS n;" | cypher-shell -a "$NEO4J_URI" --format plain 2>/dev/null | tail -1 || echo "0")

    echo "  Skills:        $SKILL_COUNT"
    echo "  SkillClusters: $CLUSTER_COUNT"
    echo "  Soul:          $SOUL_COUNT"
    echo "  OCMemory:      $MEM_COUNT"
    echo "  AgentConfig:   $AC_COUNT"
    echo "  OCTool:        $TOOL_COUNT"
    echo "  OCAgent:       $AGENT_COUNT"

    if [ "$SKILL_COUNT" -gt 0 ] 2>/dev/null; then
      success "Database OK"
    else
      error "No skills found — run: ./install.sh"
    fi
  else
    error "Neither seed.py nor cypher-shell found"
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

# ── Run seed script ──────────────────────────────────────────
header "Seeding skill graph + workspace..."

SCRIPT_DIR="$(cd "$(dirname "$0")" 2>/dev/null && pwd)" || SCRIPT_DIR=""
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/$SEED_SCRIPT" ]; then
  SCRIPT_PATH="$SCRIPT_DIR/$SEED_SCRIPT"
elif [ -f "$HOME/openclaw-graph/$SEED_SCRIPT" ]; then
  SCRIPT_PATH="$HOME/openclaw-graph/$SEED_SCRIPT"
else
  error "Seed script not found: $SEED_SCRIPT\n\n  Clone the repo first:\n    git clone https://github.com/${REPO}.git ~/openclaw-graph"
fi

info "Running: $PYTHON $SCRIPT_PATH $SEED_ARGS"
"$PYTHON" "$SCRIPT_PATH" $SEED_ARGS || error "Seeding failed — check Neo4j connection"

# ── Deploy workspace stubs ───────────────────────────────────
header "Deploying workspace stubs..."

STUBS_DIR="$SCRIPT_DIR/workspace-stubs"
WORKSPACE_DIR="$HOME/.openclaw/workspace"

if [ -d "$STUBS_DIR" ]; then
  mkdir -p "$WORKSPACE_DIR"
  for stub in "$STUBS_DIR"/*.md; do
    [ -f "$stub" ] || continue
    fname="$(basename "$stub")"
    # Substitute workspace ID if not default
    if [ "$WORKSPACE" != "openclaw" ]; then
      sed "s/workspace = 'openclaw'/workspace = '${WORKSPACE}'/g" "$stub" > "$WORKSPACE_DIR/$fname"
    else
      cp "$stub" "$WORKSPACE_DIR/$fname"
    fi
    success "Deployed $fname"
  done
else
  warn "workspace-stubs/ directory not found — skipping stub deployment"
fi

# ── Optional: Rust daemon ────────────────────────────────────
header "Rust sync daemon (optional)..."

RUST_DIR="$SCRIPT_DIR/tools/neo4j-sync"
if [ -d "$RUST_DIR" ] && [ -f "$RUST_DIR/Cargo.toml" ]; then
  if command -v cargo &>/dev/null; then
    info "Rust toolchain detected — building neo4j-sync daemon..."
    (cd "$RUST_DIR" && cargo build --release 2>&1) && {
      DAEMON_BIN="$RUST_DIR/target/release/neo4j-sync"
      if [ -f "$DAEMON_BIN" ]; then
        mkdir -p "$HOME/.openclaw/bin"
        cp "$DAEMON_BIN" "$HOME/.openclaw/bin/neo4j-sync"
        success "Daemon installed to ~/.openclaw/bin/neo4j-sync"
        info "See tools/neo4j-sync/launchd.plist.template for macOS auto-start"
      fi
    } || warn "Rust build failed — daemon is optional, continuing"
  else
    info "Rust toolchain not found — skipping daemon build (optional)"
    info "Install Rust: https://rustup.rs/"
  fi
else
  info "Rust daemon source not found — skipping (optional)"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}🔷 Installation complete!${RESET}"
echo ""
echo "  Neo4j:     $NEO4J_URI"
echo "  Workspace: $WORKSPACE"
echo "  Stubs:     $WORKSPACE_DIR/"
echo ""
echo "  Next steps:"
echo "    1. Customize your identity:"
echo "       cypher-shell -a $NEO4J_URI --format plain \\"
echo "         \"MATCH (s:Soul {id:'soul-${WORKSPACE}-identity'}) SET s.content = 'Name: MyAgent | Role: Ops agent'\""
echo ""
echo "    2. Query the graph:"
echo "       cypher-shell -a $NEO4J_URI --format plain \"MATCH (s:Skill) RETURN s.name, s.cluster LIMIT 10\""
echo ""
echo "    3. Verify anytime:"
echo "       ./install.sh --verify"
echo ""
echo "    4. (Optional) Start the Rust sync daemon:"
echo "       See tools/neo4j-sync/launchd.plist.template"
echo ""
