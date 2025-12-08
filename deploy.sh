#!/bin/bash
set -e

echo "=== Mandelbrot Deploy Script ==="
echo "Time: $(date)"

cd /home/ubuntu/mandelbrot-project

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Install dependencies (only if package.json changed)
if [ package.json -nt node_modules/.installed ]; then
    echo "Installing dependencies..."
    npm install
    touch node_modules/.installed
else
    echo "Dependencies up to date"
fi

echo ""
echo "=== Checking cron job ==="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
GENERATOR_SCRIPT="$SCRIPT_DIR/mandelbrot-generator.sh"

# Make wallpaper script executable
chmod +x "$GENERATOR_SCRIPT"
echo "✓ Made update-wallpaper.sh executable"

CRON_CMD="0 * * * * $GENERATOR_SCRIPT"
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
# Run generator
echo "Running generator..."
node mandelbrot-generator.js

echo "=== Deploy Complete ==="