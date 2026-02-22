#!/usr/bin/env bash
# ============================================================
# install.sh — LadybugDB Skill Graph Installer
# https://github.com/alphaonedev/openclaw-graph
#
# Downloads a pre-built LadybugDB database from GitHub Releases
# and places it at the configured path.
#
# Usage:
#   ./install.sh              # interactive (prompts lite vs full)
#   ./install.sh --lite       # skills only (~10 MB download)
#   ./install.sh --full       # skills + all DevDocs (~500 MB download)
#   ./install.sh --verify     # verify existing DB without reinstalling
#   ./install.sh --version v1.1  # install a specific release version
# ============================================================

set -euo pipefail

# ── Config ───────────────────────────────────────────────────
REPO="alphaonedev/openclaw-graph"
RELEASE_VERSION="${RELEASE_VERSION:-latest}"
DB_DIR="$(cd "$(dirname "$0")/ladybugdb/db" && pwd)"
DB_FILE="$DB_DIR/alphaone-skills.db"
TMP_DIR="$(mktemp -d)"
NODE_BIN="${NODE_BIN:-node}"

GITHUB_BASE="https://github.com/${REPO}/releases/download"

# SHA256 checksums — updated each release
LITE_SHA256="92b25e27d3c365e903fb0f4c3a7d4020d6b42f1bf1f9c3489865a32a6ece5a76"
FULL_SHA256="00550e0cc9ba603f686b3b96f500bb0f42791b579ca339f179bcec58ce22f896"
# ─────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}ℹ${RESET}  $*"; }
success() { echo -e "${GREEN}✅${RESET} $*"; }
warn()    { echo -e "${YELLOW}⚠️ ${RESET} $*"; }
error()   { echo -e "${RED}❌${RESET} $*"; exit 1; }
header()  { echo -e "\n${BOLD}$*${RESET}"; }

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

# ── Parse args ───────────────────────────────────────────────
MODE=""
VERIFY_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --lite)        MODE="lite" ;;
    --full)        MODE="full" ;;
    --verify)      VERIFY_ONLY=true ;;
    --version)     shift; RELEASE_VERSION="$1" ;;
    --help|-h)
      echo "Usage: $0 [--lite|--full|--verify|--version <tag>]"
      echo ""
      echo "  --lite          Skills only (~10 MB)"
      echo "  --full          Skills + all DevDocs (~500 MB)"
      echo "  --verify        Verify existing DB"
      echo "  --version <tag> Pin to a specific release (e.g. v1.0)"
      exit 0 ;;
  esac
done

# ── Resolve version ──────────────────────────────────────────
if [ "$RELEASE_VERSION" = "latest" ]; then
  info "Resolving latest release tag..."
  RELEASE_VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['tag_name'])" 2>/dev/null \
    || echo "v1.0")
  info "Latest: $RELEASE_VERSION"
fi

# ── Header ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}🐞 LadybugDB Skill Graph — Installer${RESET}"
echo "   ${REPO} @ ${RELEASE_VERSION}"
echo ""

# ── Verify-only mode ─────────────────────────────────────────
if $VERIFY_ONLY; then
  [ -f "$DB_FILE" ] || error "No database found at $DB_FILE"
  info "Verifying $DB_FILE ..."
  SIZE=$(du -sh "$DB_FILE" | cut -f1)
  "$NODE_BIN" --input-type=module << EOF
import { Database, Connection } from 'lbug';
const db = new Database('$DB_FILE');
await db.init(); const c = new Connection(db); await c.init();
const s = await (await c.query('MATCH (n:Skill) RETURN count(n) AS n')).getAll();
const r = await (await c.query('MATCH (n:Reference) RETURN count(n) AS n')).getAll();
console.log('  Skills:     ' + (s[0]?.n ?? 0));
console.log('  References: ' + (r[0]?.n ?? 0));
console.log('  DB size:    $SIZE');
EOF
  success "Database OK"
  exit 0
fi

# ── Check dependencies ───────────────────────────────────────
header "Checking dependencies..."

check_cmd() { command -v "$1" &>/dev/null && success "$1 found" && return 0 || return 1; }

check_cmd curl   || error "curl required: brew install curl"
check_cmd "$NODE_BIN" || error "node required: https://nodejs.org"

DECOMP=""; EXT=""
if check_cmd zstd; then
  DECOMP="zstd"; EXT="zst"
elif check_cmd gzip; then
  warn "zstd not found — using gzip fallback"
  DECOMP="gzip"; EXT="gz"
else
  error "zstd or gzip required: brew install zstd"
fi

"$NODE_BIN" -e "require('lbug')" 2>/dev/null || error "lbug not found: npm install lbug"

# ── Choose tier ──────────────────────────────────────────────
if [ -z "$MODE" ]; then
  header "Choose database tier:"
  echo ""
  echo "  [1] Lite  — 323 skills + 1536d embeddings             (~10 MB)"
  echo "  [2] Full  — Lite + 787 DevDocs docsets (~620k entries) (~500 MB)"
  echo ""
  read -rp "  Choice [1/2]: " CHOICE
  case "$CHOICE" in
    1) MODE="lite" ;;
    2) MODE="full" ;;
    *) error "Invalid choice." ;;
  esac
fi

FILENAME="alphaone-skills-${MODE}.db.${EXT}"
DOWNLOAD_URL="${GITHUB_BASE}/${RELEASE_VERSION}/${FILENAME}"
EXPECTED_SHA256="${MODE}" # resolved below
[ "$MODE" = "lite" ] && EXPECTED_SHA256="$LITE_SHA256" || EXPECTED_SHA256="$FULL_SHA256"

# ── Check existing DB ────────────────────────────────────────
if [ -f "$DB_FILE" ]; then
  warn "Existing DB found at $DB_FILE"
  read -rp "  Overwrite? [y/N]: " OW
  [[ "$OW" == "y" || "$OW" == "Y" ]] || { info "Keeping existing DB."; exit 0; }
  mv "$DB_FILE" "${DB_FILE}.bak-$(date +%H%M)"
  info "Backed up existing DB."
fi

mkdir -p "$DB_DIR"

# ── Download ─────────────────────────────────────────────────
header "Downloading ${MODE} database (${RELEASE_VERSION})..."
echo ""
info "URL: $DOWNLOAD_URL"
echo ""

COMPRESSED_FILE="$TMP_DIR/$FILENAME"

curl -L \
  --progress-bar \
  --fail \
  -o "$COMPRESSED_FILE" \
  "$DOWNLOAD_URL" \
  || error "Download failed. Check https://github.com/${REPO}/releases for available versions."

success "Downloaded: $(du -sh "$COMPRESSED_FILE" | cut -f1)"

# ── Checksum ─────────────────────────────────────────────────
header "Verifying checksum..."
if [[ "$EXPECTED_SHA256" != "PLACEHOLDER"* ]]; then
  if command -v sha256sum &>/dev/null; then
    ACTUAL=$(sha256sum "$COMPRESSED_FILE" | awk '{print $1}')
  else
    ACTUAL=$(shasum -a 256 "$COMPRESSED_FILE" | awk '{print $1}')
  fi
  [ "$ACTUAL" = "$EXPECTED_SHA256" ] || error "Checksum mismatch!\n  Expected: $EXPECTED_SHA256\n  Got:      $ACTUAL"
  success "Checksum OK"
else
  warn "Checksums not yet set in this install.sh — skipping verification"
fi

# ── Decompress ───────────────────────────────────────────────
header "Decompressing..."
if [ "$DECOMP" = "zstd" ]; then
  zstd -d "$COMPRESSED_FILE" -o "$DB_FILE"
else
  gzip -dc "$COMPRESSED_FILE" > "$DB_FILE"
fi
success "Decompressed: $(du -sh "$DB_FILE" | cut -f1)"

# ── Verify DB ────────────────────────────────────────────────
header "Verifying database..."
"$NODE_BIN" --input-type=module << EOF
import { Database, Connection } from 'lbug';
try {
  const db = new Database('$DB_FILE');
  await db.init(); const c = new Connection(db); await c.init();
  const s = await (await c.query('MATCH (n:Skill) RETURN count(n) AS n')).getAll();
  const r = await (await c.query('MATCH (n:Reference) RETURN count(n) AS n')).getAll();
  console.log('  Skills:     ' + (s[0]?.n ?? 0));
  console.log('  References: ' + (r[0]?.n ?? 0));
} catch(e) { console.error('Verify failed:', e.message); process.exit(1); }
EOF

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}🐞 Installation complete!${RESET}"
echo ""
echo "  DB: $DB_FILE ($(du -sh "$DB_FILE" | cut -f1))"
echo ""
echo "  Query the graph:"
echo "    node ladybugdb/scripts/query.js --cluster python"
echo "    node ladybugdb/scripts/query.js --semantic \"async rate limiting\""
echo ""
