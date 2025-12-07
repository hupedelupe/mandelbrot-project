#!/bin/bash
set -e

# Get absolute path to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
IMAGE_DIR="$PROJECT_DIR/images"

# Create images directory if missing
mkdir -p "$IMAGE_DIR"

# Download fractals
curl -s -o "$IMAGE_DIR/fractal.png"     http://141.147.117.4/fractals/fractal.png
curl -s -o "$IMAGE_DIR/fractal_2.png"   http://141.147.117.4/fractals/fractal_2.png

# Output first image path for Shortcuts input
echo "$IMAGE_DIR/fractal.png"
