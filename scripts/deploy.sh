#!/bin/bash
# ============================================================================
# DEPLOY SCRIPT - Server deployment and cron setup
# ============================================================================
# This script:
# 1. Pulls latest code from git
# 2. Installs/updates npm dependencies
# 3. Sets up hourly cron job to generate fractals
#
# Run this script on the server after initial setup or when updating code.
# ============================================================================
set -e

echo "=== Mandelbrot Deploy Script ==="
echo "Time: $(date)"

# Get absolute path to script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
cd "$REPO_DIR"

echo "Repository: $REPO_DIR"
echo ""

# Pull latest code
echo "Pulling latest code..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git pull origin "$CURRENT_BRANCH"

# Install dependencies (only if package.json changed)
if [ package.json -nt node_modules/.installed ] || [ ! -f node_modules/.installed ]; then
    echo "Installing dependencies..."
    npm install
    touch node_modules/.installed
else
    echo "Dependencies up to date"
fi

echo ""
echo "=== Checking cron job ==="

GENERATOR_SCRIPT="src/index.js"
LOG_FILE="$REPO_DIR/mandelbrot.log"

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Cron runs at :50 past each hour (gives time to complete before the hour)
CRON_CMD="50 * * * * cd $REPO_DIR && node $GENERATOR_SCRIPT >> $LOG_FILE 2>&1"
EXISTING_CRON=$(crontab -l 2>/dev/null || true)

# Check if cron already contains a job for this script
if echo "$EXISTING_CRON" | grep -F "$GENERATOR_SCRIPT" >/dev/null; then
    echo "Found existing cron job - removing it..."

    # Remove any existing cron entries for this script
    echo "$EXISTING_CRON" | grep -v "$GENERATOR_SCRIPT" | crontab - 2>/dev/null || true

    echo "✓ Old cron job removed"
fi

echo "Adding new cron entry..."

# Get current crontab and add new entry
CURRENT_CRON=$(crontab -l 2>/dev/null || true)
(
    echo "$CURRENT_CRON"
    echo "$CRON_CMD"
) | crontab -

echo "✓ Cron job added: $CRON_CMD"

echo ""
echo "Current crontab:"
crontab -l | grep mandelbrot || echo "  (none found)"

echo ""
echo "=== Deploy Complete ==="
echo ""
echo "To test immediately (recommended on first install):"
echo "  node $GENERATOR_SCRIPT"
echo ""
echo "Or wait until :50 past the hour for automatic generation."