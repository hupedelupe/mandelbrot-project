# Mandelbrot Fractal Wallpaper Generator

Automated system that generates beautiful Mandelbrot fractals hourly and distributes them to your devices.

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
   chmod +x deploy.sh
```

3. Test:
```bash
   ./deploy.sh
```

4. Setup hourly cron:
```bash
   crontab -e
   # Add:
   0 * * * * cd /home/ubuntu/mandelbrot-project && ./deploy.sh >> /home/ubuntu/deploy.log 2>&1
```

### Mac Setup

1. Clone repo locally:
```bash
   cd ~
   git clone https://github.com/YOUR_USERNAME/mandelbrot-project.git
   cd mandelbrot-project
```

2. Run one-time setup:
```bash
   cd local-setup
   ./setup-mac.sh
```

3. Done! Your wallpaper will update hourly and on wake.

### iPhone Setup

1. Open Shortcuts app
2. Create new shortcut:
   - Get Contents of URL: `http://141.147.117.4/fractals/fractal.png`
   - Set Wallpaper (disable preview)
3. Create Automation:
   - Time of Day → Every hour at :01
   - Run shortcut
   - Disable "Ask Before Running"

## Configuration

Edit `config.json` to adjust:
- Image resolution
- Quality thresholds
- Max iterations

## Quality Control

The generator ensures images meet minimum standards:
- **Color Diversity**: At least 15% of color spectrum used
- **Visible Pixels**: At least 20% non-black pixels
- **Complexity Score**: Minimum boundary variation of 8

Failed images are regenerated automatically (up to 5 attempts).

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