#!/bin/bash
# ============================================================================
# MAC SETUP SCRIPT - Configure Mac client
# ============================================================================
# This script:
# 1. Makes update-wallpaper.sh executable
# 2. Runs an immediate wallpaper update
# 3. Sets up hourly cron job to pull and update wallpaper
#
# Run this once on your Mac to enable automatic wallpaper updates.
# ============================================================================
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
echo "  • Update wallpaper every hour on the hour (00 minutes past)"
echo "  • Log to: $LOG_PATH"
echo ""
echo "To manually update: $WALLPAPER_SCRIPT"
echo ""

echo ""
echo "=== Checking cron job ==="

# Cron runs on the hour (0 * * * *)
CRON_CMD="0 * * * * $WALLPAPER_SCRIPT >> $LOG_PATH 2>&1"
EXISTING_CRON=$(crontab -l 2>/dev/null || true)

# Check if cron already contains a job for this script
if echo "$EXISTING_CRON" | grep -F "$WALLPAPER_SCRIPT" >/dev/null; then
    echo "Found existing cron job - removing it..."

    # Remove any existing cron entries for this script
    echo "$EXISTING_CRON" | grep -v "$WALLPAPER_SCRIPT" | crontab - 2>/dev/null || true

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
crontab -l | grep update-wallpaper || echo "  (none found)"
