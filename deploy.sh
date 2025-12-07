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

# Run generator
echo "Running generator..."
node mandelbrot-generator.js

echo "=== Deploy Complete ==="