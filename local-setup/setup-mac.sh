#!/bin/bash
set -e

echo "=== Mandelbrot Mac Setup Script ==="
echo ""

# Get absolute path to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Paths
WALLPAPER_SCRIPT="$SCRIPT_DIR/update-wallpaper.sh"
LOG_PATH="$HOME/Library/Logs/mandelbrot-wallpaper.log"

echo "Repository: $REPO_DIR"
echo "Script: $WALLPAPER_SCRIPT"
echo ""

# Make wallpaper script executable
chmod +x "$WALLPAPER_SCRIPT"
echo "✓ Made update-wallpaper.sh executable"

# Run once immediately
echo ""
echo "Running wallpaper update now..."
"$WALLPAPER_SCRIPT"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your Mac will now:"
echo "  • Update wallpaper every hour at :01"
echo "  • Log to: $LOG_PATH"
echo ""
echo "To manually update: $WALLPAPER_SCRIPT"
echo ""

echo ""
echo "=== Checking cron job ==="

CRON_CMD="1 * * * * $WALLPAPER_SCRIPT"
EXISTING_CRON=$(crontab -l 2>/dev/null || true)

# Check if cron already contains the job
if echo "$EXISTING_CRON" | grep -F "$WALLPAPER_SCRIPT" >/dev/null; then
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
