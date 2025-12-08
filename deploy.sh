#!/bin/bash
set -e

echo "=== Mandelbrot Deploy Script ==="
echo "Time: $(date)"

REPO_DIR="/home/ubuntu/mandelbrot-project"
cd "$REPO_DIR"

# Pull latest code
echo "Pulling latest code..."
git pull origin main

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

GENERATOR_SCRIPT="mandelbrot-generator.js"
LOG_FILE="$REPO_DIR/mandelbrot.log"

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Cron needs to cd to the repo directory first (for config.json and modules)
CRON_CMD="0 * * * * cd $REPO_DIR && node $GENERATOR_SCRIPT >> $LOG_FILE 2>&1"
EXISTING_CRON=$(crontab -l 2>/dev/null || true)

# Check if cron already contains the job
if echo "$EXISTING_CRON" | grep -F "$GENERATOR_SCRIPT" >/dev/null; then
    echo "✓ Cron job already exists"
else
    echo "Adding cron entry..."

    # Add the cron entry safely
    (
        echo "$EXISTING_CRON"
        echo "$CRON_CMD"
    ) | crontab -

    echo "✓ Cron job added: $CRON_CMD"
fi

echo ""
echo "Current crontab:"
crontab -l | grep mandelbrot || echo "  (none found)"

echo ""
echo "=== Deploy Complete ==="