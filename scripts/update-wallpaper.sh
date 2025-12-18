#!/bin/bash
# ============================================================================
# UPDATE WALLPAPER SCRIPT - Download and set desktop wallpaper
# ============================================================================
# This script:
# 1. Downloads the latest desktop fractal from the server
# 2. Saves it to the local images directory
# 3. Outputs path for use by macOS Shortcuts or other automation
#
# Called automatically by cron (set up by setup-mac.sh).
# Can also be run manually to update immediately.
# ============================================================================
set -e

# Get absolute path to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
IMAGE_DIR="$PROJECT_DIR/images"

# Create images directory if missing
mkdir -p "$IMAGE_DIR"

# Download fractals
curl -s -o "$IMAGE_DIR/fractal.png"     http://141.147.117.4/fractals/fractal_desktop.png
curl -s -o "$IMAGE_DIR/fractal_2.png"   http://141.147.117.4/fractals/fractal_desktop.png

# Output first image path for Shortcuts input
echo "$IMAGE_DIR/fractal.png"
