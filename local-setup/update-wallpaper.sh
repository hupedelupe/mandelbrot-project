#!/bin/bash

# Mandelbrot Wallpaper Updater
# Pulls latest fractal from server and sets as wallpaper

SERVER_URL="http://141.147.117.4/fractals/fractal.png"
LOCAL_PATH="$HOME/fractal.png"

# Download latest image
curl -s -o "$LOCAL_PATH" "$SERVER_URL"

# Set as wallpaper
osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"$LOCAL_PATH\""

echo "Wallpaper updated at $(date)"