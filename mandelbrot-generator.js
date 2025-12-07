const fs = require('fs');
const { createCanvas } = require('canvas');
const { execSync } = require('child_process');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const CONFIG = config.server;
const QUALITY = config.qualityControl;

// [Keep all your seedRegions and colorPalettes arrays from before]

const seedRegions = [
  { cx: -0.7269, cy: 0.1889, name: "Spiral_Valley" },
  { cx: -0.7453, cy: 0.1127, name: "Elephant_Valley" },
  { cx: -0.1607, cy: 1.0376, name: "Seahorse_Valley" },
  { cx: -0.7902, cy: 0.1608, name: "Double_Hook" },
  { cx: -0.7747, cy: 0.1102, name: "Mini_Elephant" },
  { cx: 0.2850, cy: 0.0100, name: "Triple_Spiral" },
  { cx: -0.1011, cy: 0.9563, name: "Seahorse_Tail" },
  { cx: -0.7500, cy: 0.1000, name: "Baby_Elephant" },
  { cx: -0.1600, cy: 1.0405, name: "Filament_Region" },
  { cx: -0.7746, cy: 0.1102, name: "Deep_Spiral" },
  { cx: -0.1592, cy: 1.0317, name: "Tendril_Garden" },
  { cx: 0.3750, cy: 0.2170, name: "Eastern_Spiral" },
  { cx: -0.1011, cy: -0.9563, name: "Southern_Seahorse" },
  { cx: -0.1252, cy: 0.7500, name: "Northern_Arc" },
  { cx: -0.7269, cy: -0.1889, name: "Southern_Spiral" },
  { cx: 0.2850, cy: -0.0100, name: "Lower_Triple" },
  { cx: -0.5251, cy: 0.5260, name: "Western_Formation" },
  { cx: 0.3500, cy: 0.0500, name: "Eastern_Edge" },
  { cx: -0.1000, cy: 0.6557, name: "Upper_Arc" },
  { cx: -0.7010, cy: 0.3842, name: "Upper_Valley" }
];

const colorPalettes = [
  { 
    name: 'Fire_Ice', 
    colors: [[5,5,20], [40,20,80], [80,60,140], [180,40,80], [220,80,40], [240,160,60], [255,220,140]]
  },
  { 
    name: 'Tropical_Sunset', 
    colors: [[10,5,25], [100,20,80], [180,60,100], [220,100,80], [240,160,80], [255,200,100], [255,240,180]]
  },
  { 
    name: 'Ocean_Depths', 
    colors: [[5,10,20], [20,40,80], [40,80,140], [80,140,180], [120,180,200], [160,220,220], [200,240,240]]
  },
  { 
    name: 'Northern_Lights', 
    colors: [[5,10,30], [40,60,120], [60,120,160], [100,180,180], [140,200,140], [180,220,100], [220,240,160]]
  },
  { 
    name: 'Royal_Spectrum', 
    colors: [[10,5,20], [60,20,100], [120,60,160], [180,100,180], [220,120,140], [240,160,120], [255,220,180]]
  },
  { 
    name: 'Volcanic_Fury', 
    colors: [[10,5,5], [60,10,20], [120,30,30], [180,60,30], [220,120,40], [240,180,80], [255,230,140]]
  },
  { 
    name: 'Electric_Rainbow', 
    colors: [[10,5,30], [80,40,140], [140,60,180], [180,80,140], [200,120,100], [220,160,100], [240,200,140], [255,240,200]]
  },
  { 
    name: 'Mystic_Forest', 
    colors: [[10,15,20], [40,60,80], [60,100,120], [100,140,120], [140,180,100], [180,200,100], [220,220,140]]
  },
  { 
    name: 'Desert_Mirage', 
    colors: [[15,10,25], [80,40,60], [140,80,80], [180,120,80], [220,160,100], [240,200,140], [255,230,180]]
  },
  { 
    name: 'Cosmic_Nebula', 
    colors: [[5,5,15], [60,20,80], [100,40,120], [140,80,140], [180,120,160], [200,160,200], [220,200,240]]
  }
];

function interpolateColor(c1, c2, t) {
  const ease = t * t * (3 - 2 * t);
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * ease),
    Math.round(c1[1] + (c2[1] - c1[1]) * ease),
    Math.round(c1[2] + (c2[2] - c1[2]) * ease)
  ];
}

function getColorFromPalette(normalized, palette) {
  const position = normalized * (palette.colors.length - 1);
  const index = Math.floor(position);
  const t = position - index;
  
  if (index >= palette.colors.length - 1) {
    return palette.colors[palette.colors.length - 1];
  }
  
  return interpolateColor(palette.colors[index], palette.colors[index + 1], t);
}

function mandelbrotIterations(x0, y0, maxIter) {
  let x = 0, y = 0, x2 = 0, y2 = 0;
  let iter = 0;
  
  while (x2 + y2 <= 256 && iter < maxIter) {
    y = 2 * x * y + y0;
    x = x2 - y2 + x0;
    x2 = x * x;
    y2 = y * y;
    iter++;
  }
  
  if (iter === maxIter) return { iter, smooth: maxIter, inSet: true };
  
  const log_zn = Math.log(x2 + y2) / 2;
  const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
  const smoothIter = iter + 1 - nu;
  
  return { iter, smooth: smoothIter, inSet: false };
}

function findBestBoundaryPoint(cx, cy, searchRadius, samples = 40, maxIter = 256) {
  let bestX = cx, bestY = cy, maxComplexity = 0;
  let foundGoodSpot = false;
  
  for (let sy = 0; sy < samples; sy++) {
    for (let sx = 0; sx < samples; sx++) {
      const x = cx + (sx / samples - 0.5) * searchRadius * 2;
      const y = cy + (sy / samples - 0.5) * searchRadius * 2;
      
      const center = mandelbrotIterations(x, y, maxIter);
      
      if (center.inSet || center.iter < 8) continue;
      
      const delta = searchRadius / samples;
      const right = mandelbrotIterations(x + delta, y, maxIter);
      const down = mandelbrotIterations(x, y + delta, maxIter);
      
      const complexity = Math.abs(center.iter - right.iter) + 
                        Math.abs(center.iter - down.iter);
      
      if (complexity > QUALITY.minComplexityScore) {
        foundGoodSpot = true;
        if (complexity > maxComplexity) {
          maxComplexity = complexity;
          bestX = x;
          bestY = y;
        }
      }
    }
  }
  
  return { x: bestX, y: bestY, complexity: maxComplexity, foundGood: foundGoodSpot };
}

// NEW: Analyze image quality
function analyzeImageQuality(imageData, width, height) {
  const pixels = width * height;
  const colorBuckets = new Array(256).fill(0);
  let nonBlackPixels = 0;
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    
    const brightness = (r + g + b) / 3;
    colorBuckets[Math.floor(brightness)]++;
    
    if (brightness > 15) {
      nonBlackPixels++;
    }
  }
  
  // Calculate color diversity (how spread out the colors are)
  const usedBuckets = colorBuckets.filter(count => count > pixels * 0.001).length;
  const colorDiversity = usedBuckets / 256;
  
  // Calculate visible pixel ratio
  const visibleRatio = nonBlackPixels / pixels;
  
  return {
    colorDiversity,
    visibleRatio,
    usedBuckets,
    passes: colorDiversity >= QUALITY.minColorDiversity && 
            visibleRatio >= QUALITY.minVisiblePixels
  };
}

async function generateFractal() {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n=== Generation Attempt ${attempts}/${maxAttempts} ===`);
    
    const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    const seed = seedRegions[Math.floor(Math.random() * seedRegions.length)];
    
    console.log(`Palette: ${palette.name}, Region: ${seed.name}`);
    
    let currentZoom = 10 + Math.random() * 90;
    let currentX = seed.cx;
    let currentY = seed.cy;
    
    const zoomSteps = 3 + Math.floor(Math.random() * 3);
    
    for (let step = 0; step < zoomSteps; step++) {
      const searchRadius = 2.0 / currentZoom;
      const boundary = findBestBoundaryPoint(currentX, currentY, searchRadius, 35, 256);
      
      if (boundary.foundGood && boundary.complexity > QUALITY.minComplexityScore) {
        currentX = boundary.x;
        currentY = boundary.y;
        currentZoom *= (3 + Math.random() * 7);
        console.log(`Step ${step + 1}: Complexity ${boundary.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}×`);
      } else {
        console.log(`Step ${step + 1}: Low complexity - stopping`);
        break;
      }
    }
    
    console.log(`Rendering ${CONFIG.width}×${CONFIG.height}...`);
    
    const canvas = createCanvas(CONFIG.width, CONFIG.height);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(CONFIG.width, CONFIG.height);
    
    const maxIter = Math.min(3072, Math.floor(CONFIG.maxIter * (1 + Math.log10(currentZoom) / 2)));
    const size = 3.5 / currentZoom;
    const xMin = currentX - size;
    const yMin = currentY - size;
    const xMax = currentX + size;
    const yMax = currentY + size;
    
    let idx = 0;
    for (let py = 0; py < CONFIG.height; py++) {
      const y0 = yMin + (yMax - yMin) * py / CONFIG.height;
      
      for (let px = 0; px < CONFIG.width; px++) {
        const x0 = xMin + (xMax - xMin) * px / CONFIG.width;
        const result = mandelbrotIterations(x0, y0, maxIter);
        
        let color;
        if (result.inSet) {
          color = [0, 0, 5];
        } else {
          const normalized = (result.smooth / maxIter) % 1.0;
          const baseColor = getColorFromPalette(normalized, palette);
          const brightness = 0.8 + 0.4 * Math.sin(result.smooth * 0.1);
          
          color = [
            Math.min(255, Math.round(baseColor[0] * brightness)),
            Math.min(255, Math.round(baseColor[1] * brightness)),
            Math.min(255, Math.round(baseColor[2] * brightness))
          ];
        }
        
        imageData.data[idx++] = color[0];
        imageData.data[idx++] = color[1];
        imageData.data[idx++] = color[2];
        imageData.data[idx++] = 255;
      }
    }
    
    // Quality check
    const quality = analyzeImageQuality(imageData, CONFIG.width, CONFIG.height);
    console.log(`Quality Check:`);
    console.log(`  Color Diversity: ${(quality.colorDiversity * 100).toFixed(1)}% (min: ${QUALITY.minColorDiversity * 100}%)`);
    console.log(`  Visible Pixels: ${(quality.visibleRatio * 100).toFixed(1)}% (min: ${QUALITY.minVisiblePixels * 100}%)`);
    console.log(`  Used Color Buckets: ${quality.usedBuckets}/256`);
    
    if (!quality.passes) {
      console.log(`❌ Quality check failed - retrying...`);
      continue;
    }
    
    console.log(`✓ Quality check passed!`);
    
    ctx.putImageData(imageData, 0, 0);
    
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    
    const buffer = canvas.toBuffer('image/png');
    
    fs.writeFileSync(`${CONFIG.outputDir}/fractal.png`, buffer);
    fs.writeFileSync(`${CONFIG.outputDir}/fractal_2.png`, buffer);
    
    console.log(`✓ Saved: fractal.png & fractal_2.png`);
    
    // Push to Macs
    pushToMacs(buffer);
    
    return;
  }
  
  console.error(`Failed to generate quality image after ${maxAttempts} attempts`);
  process.exit(1);
}

function pushToMacs(imageBuffer) {
  if (!config.macClients || config.macClients.length === 0) {
    console.log('No Mac clients configured');
    return;
  }
  
  const tempFile = '/tmp/fractal_push.png';
  fs.writeFileSync(tempFile, imageBuffer);
  
  for (const mac of config.macClients) {
    console.log(`Pushing to ${mac.name} (${mac.ip})...`);
    
    try {
      // Use global SSH key path
      const keyPath = config.server.sshKeyPath;
      
      // SCP the file to Mac
      const scpCmd = `scp -i ${keyPath} -o StrictHostKeyChecking=no ${tempFile} ${mac.username}@${mac.ip}:~/fractal.png`;
      execSync(scpCmd, { stdio: 'inherit' });
      
      // Set as wallpaper via SSH
      const sshCmd = `ssh -i ${keyPath} -o StrictHostKeyChecking=no ${mac.username}@${mac.ip} "osascript -e 'tell application \\"System Events\\" to tell every desktop to set picture to \\"~/fractal.png\\"'"`;
      execSync(sshCmd, { stdio: 'inherit' });
      
      console.log(`✓ Pushed to ${mac.name}`);
    } catch (error) {
      console.error(`✗ Failed to push to ${mac.name}:`, error.message);
    }
  }
  
  fs.unlinkSync(tempFile);
}

generateFractal().catch(console.error);