# Mandelbrot Fractal Wallpaper Generator

Advanced fractal generator that creates stunning, high-quality wallpapers with intelligent quality control and adaptive rendering. Supports both **integer power fractals** (Mandelbrot, Burning Ship, Tricorn) with pre-defined regions, and **complex power fractals** with dynamic region discovery.

## Two Fractal Systems

### 1. Integer Power Mode (Classic Fractals)
Pre-defined fractals (Mandelbrot z², z³, z⁴, Burning Ship, Tricorn) with hand-crafted seed regions for production wallpaper generation.

### 2. Complex Power Mode (Exploration)
Arbitrary complex powers (z^(a + bi)) with dynamic region discovery - explore infinite fractal variations!

## Quick Start

### Integer Power (Classic)
```bash
# Generate random classic fractal
node src/index.js --test

# Specific fractal
node src/index.js --fractal=Mandelbrot3 --test
```

### Complex Power (Exploration)
```bash
# Quick exploration (fast)
node src/index.js --random --mode=quick

# Deep zoom (can reach millions× magnification!)
node src/index.js --power-real=2.5 --power-imag=0.3 --mode=deep

# Production quality
node src/index.js --random --mode=production --count=10
```

## Features

- **Multi-Fractal Support**: Mandelbrot (z²), Mandelbrot³, Mandelbrot⁴, Burning Ship, Tricorn
- **Adaptive Iteration Control**: Automatically scales down iterations to prevent crashes on dense fractals
- **CDF Color Normalization**: Histogram equalization for optimal color distribution
- **Smart Quality Checks**: Geometry detection, spatial distribution, edge density analysis
- **Device-Specific Outputs**: Automatically generates desktop (16:9) and mobile (9:16) crops
- **Intelligent Zoom Focus**: Finds and zooms into interesting fractal regions
- **Automated Distribution**: Hourly generation with HTTP serving to multiple devices

## Architecture

- **Server (Oracle Cloud)**: Generates fractals every hour, serves via HTTP
- **Mac**: Pulls latest fractal hourly and on wake/login
- **iPhone**: Uses iOS Shortcut to pull and set wallpaper

## Setup

### Server Setup (Oracle Cloud)

1. Clone repo:
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/mandelbrot-project.git
cd mandelbrot-project
```

2. Install dependencies:
```bash
npm install
```

3. Run deploy script (handles cron setup automatically):
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

The deploy script will:
- Detect your install location automatically
- Pull latest code from current branch
- Install/update dependencies
- Set up hourly cron job (runs at :50 past each hour)

4. **(Optional but recommended)** Test immediately on first install:
```bash
node src/index.js
```

This generates your first fractal and verifies everything works. Otherwise, wait until :50 past the hour for automatic generation.

### Mac Setup

1. Clone repo locally:
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/mandelbrot-project.git
cd mandelbrot-project
```

2. Run setup script (handles cron setup automatically):
```bash
chmod +x scripts/setup-mac.sh
./scripts/setup-mac.sh
```

The setup script will:
- Make update-wallpaper.sh executable
- Download and set wallpaper immediately
- Set up hourly cron job (runs on the hour)

Done! Your wallpaper will update automatically every hour.

### iPhone Setup

1. Open Shortcuts app
2. Create new shortcut:
   - Get Contents of URL: `http://141.147.117.4/fractals/fractal.png`
   - Set Wallpaper (disable preview)
3. Create Automation:
   - Time of Day → Every hour at :01
   - Run shortcut
   - Disable "Ask Before Running"

## Testing & Development

### Local Testing

```bash
# Test with a single fractal (saves full scan image)
node src/index.js --test

# Test production workflow locally (generates device crops)
node src/index.js --test-production

# Generate multiple fractals for testing
node src/index.js --test --count=10

# Force specific fractal type
node src/index.js --test --fractal=Mandelbrot4

# Force specific region and palette
node src/index.js --test --region=Seahorse_Valley --palette=Cyber_Spectrum
```

### Available Fractals

- `Mandelbrot` - Classic Mandelbrot set (z²)
- `Mandelbrot3` - Cubic Mandelbrot (z³)
- `Mandelbrot4` - Quartic Mandelbrot (z⁴) - densest, most likely to trigger adaptive constraints
- `MandelbrotI` - Imaginary powers Mandelbrot (z^(a+ib)) - abstract curved boundaries

## Configuration

Edit `config/config.json` to customize:

### Core Settings
- **`server.maxIter`**: Base iteration count (default: 2048)
- **`rendering.maxIterMultiplier`**: Iteration multiplier for detail (default: 10)
- **`rendering.maxTotalIterations`**: Safety threshold to prevent crashes (default: 100 billion)
- **`rendering.scanResolution`**: Preview resolution for crop finding (default: 1200)

### Fractal Selection
- **`fractalVariety.enabled`**: Enable multi-fractal mode
- **`fractalVariety.weights`**: Probability weights for each fractal type

### Quality Control
- **`qualityControl.minColorDiversity`**: Minimum color variety (0-1)
- **`qualityControl.minVisiblePixels`**: Minimum non-black pixels (0-1)
- **`qualityControl.minGeometryScore`**: Minimum edge/structure detail (0-1)
- **`qualityControl.minActiveCells`**: Minimum active grid cells (out of 25)

### Zoom & Generation
- **`generation.zoomRange`**: Initial zoom range (min/max)
- **`generation.zoomSteps`**: Number of zoom iterations (min/max)
- **`generation.zoomMultiplier`**: Zoom factor per step (min/max)

## How It Works

### Adaptive Iteration Control

The system automatically manages iteration counts to prevent crashes:

1. **Base Calculation**: `maxIter = baseIter × multiplier × log(zoom)`
2. **Visibility Scaling**: Reduces iterations for dense (mostly black) regions
3. **Constraint Check**: If total iterations > threshold, scales down proportionally
4. **Logging**: Shows projected vs actual iterations before rendering

Example output:
```
⚠️  ADAPTIVE CONSTRAINT TRIGGERED:
  Projected: 119,814,142,464 iterations
  Threshold: 100,000,000,000 iterations
  Scaling: 5898 → 4922 (83.5%)
  Fractal: Mandelbrot4
```

### Rendering Pipeline

1. **Zoom Focus**: Intelligently explores fractal space to find interesting regions
2. **Quick Sample**: Low-res check for visibility and quality
3. **Scan Render**: 1200×1200 preview with full quality checks
4. **Crop Detection**: Finds best desktop (16:9) and mobile (9:16) regions
5. **Final Render**: High-res renders (4096×2304, 2304×4096) with per-crop CDF normalization

### CDF Color Normalization

Each render uses histogram equalization (CDF) to optimize color distribution:
- Builds histogram of all iteration values
- Creates cumulative distribution function
- Maps iteration counts to normalized 0-1 range
- Results in better detail visibility and no color banding

## Maintenance

### Update code everywhere:
```bash
# On Mac: make changes, commit, push
git add .
git commit -m "Description"
git push origin main

# Server pulls automatically on next hourly run
# Or manually: ssh to server and run ./deploy.sh
```

### View logs:
```bash
# Server logs
ssh ubuntu@141.147.117.4
tail -f ~/deploy.log

# Mac logs
tail -f ~/Library/Logs/mandelbrot-wallpaper.log
```

## Uninstall

### Mac:
```bash
launchctl unload ~/Library/LaunchAgents/com.mandelbrot.wallpaper.plist
rm ~/Library/LaunchAgents/com.mandelbrot.wallpaper.plist
rm ~/fractal.png
```

### Server:
```bash
crontab -e  # Remove the cron entry
rm -rf ~/mandelbrot-project
```