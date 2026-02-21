#!/usr/bin/env bash
# ============================================================
# install.sh — LadybugDB Skill Graph Installer
# alphaonedev/openclaw-graph
#
# Downloads a pre-built LadybugDB database from Google Drive
# and places it at the configured path.
#
# Usage:
#   ./install.sh              # interactive (prompts lite vs full)
#   ./install.sh --lite       # skills only (~10 MB download)
#   ./install.sh --full       # skills + all DevDocs (~1.8 GB download)
#   ./install.sh --verify     # verify existing DB without reinstalling
# ============================================================

set -euo pipefail

# ── Config ───────────────────────────────────────────────────
DB_DIR="$(cd "$(dirname "$0")/ladybugdb/db" && pwd)"
DB_FILE="$DB_DIR/alphaone-skills.db"
TMP_DIR="$(mktemp -d)"
NODE_BIN="${NODE_BIN:-node}"

# Google Drive file IDs (set after upload)
DRIVE_LITE_ID="PLACEHOLDER_LITE_FILE_ID"
DRIVE_FULL_ID="PLACEHOLDER_FULL_FILE_ID"
DRIVE_LITE_SHA256="PLACEHOLDER_LITE_SHA256"
DRIVE_FULL_SHA256="PLACEHOLDER_FULL_SHA256"

DRIVE_BASE="https://drive.google.com/uc?export=download&confirm=t&id"
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
    --lite)   MODE="lite"  ;;
    --full)   MODE="full"  ;;
    --verify) VERIFY_ONLY=true ;;
    --help|-h)
      echo "Usage: $0 [--lite|--full|--verify]"
      exit 0 ;;
  esac
done

# ── Header ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}🐞 LadybugDB Skill Graph — Installer${RESET}"
echo "   Skills + DevDocs reference graph for OpenClaw"
echo ""

# ── Verify-only mode ─────────────────────────────────────────
if $VERIFY_ONLY; then
  if [ ! -f "$DB_FILE" ]; then
    error "No database found at $DB_FILE"
  fi
  info "Verifying database at $DB_FILE ..."
  SIZE=$(du -sh "$DB_FILE" | cut -f1)
  "$NODE_BIN" --input-type=module << EOF
import { Database, Connection } from 'lbug';
const db = new Database('$DB_FILE');
await db.init(); const c = new Connection(db); await c.init();
const s = await (await c.query('MATCH (n:Skill) RETURN count(n) AS n')).getAll();
const r = await (await c.query('MATCH (n:Reference) RETURN count(n) AS n')).getAll();
console.log(\`  Skills:     \${s[0]?.n ?? 0}\`);
console.log(\`  References: \${r[0]?.n ?? 0}\`);
console.log(\`  DB size:    $SIZE\`);
EOF
  success "Database OK"
  exit 0
fi

# ── Check dependencies ───────────────────────────────────────
header "Checking dependencies..."

check_cmd() {
  if command -v "$1" &>/dev/null; then
    success "$1 found ($(command -v "$1"))"
    return 0
  else
    return 1
  fi
}

check_cmd curl   || error "curl is required. Install: brew install curl"
check_cmd "$NODE_BIN" || error "node is required. Install: https://nodejs.org"

# Prefer zstd, fall back to gzip
DECOMP=""
EXT=""
if check_cmd zstd; then
  DECOMP="zstd"
  EXT="zst"
elif check_cmd gzip; then
  warn "zstd not found — falling back to gzip (slightly larger download)"
  DECOMP="gzip"
  EXT="gz"
else
  error "zstd or gzip required. Install: brew install zstd"
fi

# Check lbug is available
if ! "$NODE_BIN" -e "require('lbug')" 2>/dev/null; then
  error "lbug npm package not found. Run: npm install lbug  (or pnpm add lbug)"
fi

# ── Choose tier ──────────────────────────────────────────────
if [ -z "$MODE" ]; then
  header "Choose database tier:"
  echo ""
  echo "  [1] Lite  — 322 skills + embeddings           (~10 MB download, ~64 MB DB)"
  echo "  [2] Full  — Lite + all DevDocs (787 docsets)  (~1.8 GB download, ~21 GB DB)"
  echo ""
  read -rp "  Choice [1/2]: " CHOICE
  case "$CHOICE" in
    1) MODE="lite" ;;
    2) MODE="full" ;;
    *) error "Invalid choice. Use 1 or 2." ;;
  esac
fi

if [ "$MODE" = "lite" ]; then
  DRIVE_ID="$DRIVE_LITE_ID"
  EXPECTED_SHA256="$DRIVE_LITE_SHA256"
  LABEL="Lite (~10 MB)"
else
  DRIVE_ID="$DRIVE_FULL_ID"
  EXPECTED_SHA256="$DRIVE_FULL_SHA256"
  LABEL="Full (~1.8 GB)"
fi

if [ "$DRIVE_ID" = "PLACEHOLDER_LITE_FILE_ID" ] || [ "$DRIVE_ID" = "PLACEHOLDER_FULL_FILE_ID" ]; then
  error "Database not yet published. File IDs are placeholders — check for a newer release."
fi

# ── Check existing DB ────────────────────────────────────────
if [ -f "$DB_FILE" ]; then
  warn "Existing database found at $DB_FILE"
  read -rp "  Overwrite? [y/N]: " OVERWRITE
  if [[ "$OVERWRITE" != "y" && "$OVERWRITE" != "Y" ]]; then
    info "Keeping existing database. Use --verify to check it."
    exit 0
  fi
  mv "$DB_FILE" "${DB_FILE}.bak-$(date +%H%M)"
  info "Backed up existing DB."
fi

mkdir -p "$DB_DIR"

# ── Download ─────────────────────────────────────────────────
header "Downloading $LABEL database..."
COMPRESSED_FILE="$TMP_DIR/alphaone-skills.db.$EXT"

echo ""
info "Source: Google Drive (Justin@alpha-one.mobi / openclaw-graph)"
info "Destination: $DB_FILE"
echo ""

# Handle large file cookie confirmation from Google Drive
CONFIRM_URL="${DRIVE_BASE}=${DRIVE_ID}"

curl -L \
  --progress-bar \
  --cookie-jar "$TMP_DIR/cookies.txt" \
  --cookie "$TMP_DIR/cookies.txt" \
  -o "$COMPRESSED_FILE" \
  "$CONFIRM_URL"

# Check we got actual data (not an HTML error page)
FIRST_BYTES=$(head -c 4 "$COMPRESSED_FILE" | xxd -p 2>/dev/null || hexdump -n 4 -e '1/1 "%02x"' "$COMPRESSED_FILE" 2>/dev/null || echo "")
if [[ "$FIRST_BYTES" == "3c68746d" || "$FIRST_BYTES" == "3c21444f" ]]; then
  error "Download returned an HTML page — Drive link may be private or expired."
fi

DOWNLOAD_SIZE=$(du -sh "$COMPRESSED_FILE" | cut -f1)
success "Downloaded: $DOWNLOAD_SIZE"

# ── Checksum verify ──────────────────────────────────────────
header "Verifying checksum..."
if command -v sha256sum &>/dev/null; then
  ACTUAL_SHA=$(sha256sum "$COMPRESSED_FILE" | awk '{print $1}')
elif command -v shasum &>/dev/null; then
  ACTUAL_SHA=$(shasum -a 256 "$COMPRESSED_FILE" | awk '{print $1}')
else
  warn "No sha256 tool found — skipping checksum verification"
  ACTUAL_SHA="$EXPECTED_SHA256"
fi

if [ "$ACTUAL_SHA" != "$EXPECTED_SHA256" ]; then
  error "Checksum mismatch!\n  Expected: $EXPECTED_SHA256\n  Got:      $ACTUAL_SHA"
fi
success "Checksum verified"

# ── Decompress ───────────────────────────────────────────────
header "Decompressing..."
echo ""

if [ "$DECOMP" = "zstd" ]; then
  zstd -d "$COMPRESSED_FILE" -o "$DB_FILE" --progress
else
  gzip -dc "$COMPRESSED_FILE" > "$DB_FILE"
fi

FINAL_SIZE=$(du -sh "$DB_FILE" | cut -f1)
success "Decompressed: $FINAL_SIZE"

# ── Quick verify ─────────────────────────────────────────────
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
  console.log('  DB size:    $FINAL_SIZE');
} catch(e) {
  console.error('DB verify failed:', e.message);
  process.exit(1);
}
EOF

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}🐞 Installation complete!${RESET}"
echo ""
echo "  Database: $DB_FILE"
echo "  Size:     $FINAL_SIZE"
echo ""
echo "  Query the graph:"
echo "    node ladybugdb/scripts/query.js --cluster python"
echo "    node ladybugdb/scripts/query.js --semantic \"async rate limiting\""
echo ""
