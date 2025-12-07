#!/bin/bash
set -e

echo "=== Mandelbrot Mac Setup Script ==="
echo ""

# Get absolute path to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Paths
WALLPAPER_SCRIPT="$SCRIPT_DIR/update-wallpaper.sh"
PLIST_TEMPLATE="$SCRIPT_DIR/com.mandelbrot.wallpaper.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.mandelbrot.wallpaper.plist"
LOG_PATH="$HOME/Library/Logs/mandelbrot-wallpaper.log"

echo "Repository: $REPO_DIR"
echo "Script: $WALLPAPER_SCRIPT"
echo ""

# Make wallpaper script executable
chmod +x "$WALLPAPER_SCRIPT"
echo "✓ Made update-wallpaper.sh executable"

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/Library/Logs"

# Copy plist and replace placeholders
sed -e "s|SCRIPT_PATH_PLACEHOLDER|$WALLPAPER_SCRIPT|g" \
    -e "s|LOG_PATH_PLACEHOLDER|$LOG_PATH|g" \
    "$PLIST_TEMPLATE" > "$PLIST_DEST"

echo "✓ Created LaunchAgent plist"

# Unload if already loaded (in case of re-setup)
launchctl unload "$PLIST_DEST" 2>/dev/null || true

# Load the LaunchAgent
launchctl load "$PLIST_DEST"
echo "✓ Loaded LaunchAgent"

# Run once immediately
echo ""
echo "Running wallpaper update now..."
"$WALLPAPER_SCRIPT"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your Mac will now:"
echo "  • Update wallpaper every hour at :01"
echo "  • Update wallpaper on login/wake"
echo "  • Log to: $LOG_PATH"
echo ""
echo "To manually update: $WALLPAPER_SCRIPT"
echo "To uninstall: launchctl unload $PLIST_DEST && rm $PLIST_DEST"
echo ""