// generator-enhanced.js - Enhanced generation with more control options

const fs = require('fs');
const { findBestBoundaryPoint } = require('./mandelbrot');
const { getRandomPalette, getPaletteByName } = require('./palettes');
const { getRandomRegion, getRegionByName, seedRegions } = require('./regions');
const { analyzeImageQuality, sampleFractalForQuality } = require('./quality');
const { renderFractal } = require('./renderer');

// Track recently used regions for variety
const recentRegions = [];

function selectRegion(config, regionName = null) {
  if (regionName) {
    const region = getRegionByName(regionName);
    if (!region) throw new Error(`Region "${regionName}" not found`);
    return region;
  }
  
  // Filter out recently used regions if diversity settings exist
  const avoidCount = config.diversity?.avoidRecentRegions || 0;
  let availableRegions = seedRegions;
  
  if (avoidCount > 0 && recentRegions.length > 0) {
    availableRegions = seedRegions.filter(r => !recentRegions.includes(r.name));
    if (availableRegions.length === 0) {
      availableRegions = seedRegions; // Reset if we've used them all
    }
  }
  
  // Apply region weights if configured
  if (config.diversity?.regionWeights) {
    // This is a placeholder for weighted selection
    // You could categorize regions and apply weights
  }
  
  const selected = availableRegions[Math.floor(Math.random() * availableRegions.length)];
  
  // Track this region
  if (avoidCount > 0) {
    recentRegions.push(selected.name);
    if (recentRegions.length > avoidCount) {
      recentRegions.shift();
    }
  }
  
  return selected;
}

async function generateFractal(config, options = {}) {
  const {
    attemptNumber = 1,
    maxAttempts = 10,
    verbose = true,
    palette = null,
    region = null
  } = options;
  
  const log = verbose ? console.log : () => {};
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    log(`\n=== Generation Attempt ${attempts}/${maxAttempts} ===`);
    
    const selectedPalette = palette ? getPaletteByName(palette) : getRandomPalette();
    const selectedRegion = selectRegion(config, region);
    
    if (!selectedPalette) {
      throw new Error(`Palette "${palette}" not found`);
    }
    
    log(`Palette: ${selectedPalette.name}, Region: ${selectedRegion.name}`);
    
    // Use generation config if available
    const genConfig = config.generation || {};
    const zoomMin = genConfig.zoomRange?.min || 10;
    const zoomMax = genConfig.zoomRange?.max || 100;
    const zoomStepsMin = genConfig.zoomSteps?.min || 3;
    const zoomStepsMax = genConfig.zoomSteps?.max || 5;
    const zoomMultMin = genConfig.zoomMultiplier?.min || 3;
    const zoomMultMax = genConfig.zoomMultiplier?.max || 10;
    const searchSamples = genConfig.searchSamples || 35;
    
    let currentZoom = zoomMin + Math.random() * (zoomMax - zoomMin);
    let currentX = selectedRegion.cx;
    let currentY = selectedRegion.cy;
    
    const zoomSteps = zoomStepsMin + Math.floor(Math.random() * (zoomStepsMax - zoomStepsMin + 1));
    
    for (let step = 0; step < zoomSteps; step++) {
      const searchRadius = 2.0 / currentZoom;
      const boundary = findBestBoundaryPoint(
        currentX, 
        currentY, 
        searchRadius, 
        searchSamples, 
        256,
        config.qualityControl.minComplexityScore
      );
      
      if (boundary.foundGood && boundary.complexity > config.qualityControl.minComplexityScore) {
        currentX = boundary.x;
        currentY = boundary.y;
        const zoomMult = zoomMultMin + Math.random() * (zoomMultMax - zoomMultMin);
        currentZoom *= zoomMult;
        log(`Step ${step + 1}: Complexity ${boundary.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}× (${zoomMult.toFixed(1)}× mult)`);
      } else {
        log(`Step ${step + 1}: Low complexity - stopping`);
        break;
      }
    }
    
    log(`Rendering ${config.server.width}×${config.server.height}...`);
    
    // Use rendering config multiplier if available
    const iterMultiplier = config.rendering?.maxIterMultiplier || 1.0;
    const maxIter = Math.min(
      10000, 
      Math.floor(config.server.maxIter * iterMultiplier * (1 + Math.log10(currentZoom) / 2))
    );
    
    log(`Max iterations: ${maxIter} (multiplier: ${iterMultiplier})`);

        // QUICK SAMPLING PASS
    const sample = sampleFractalForQuality(
      currentX,
      currentY,
      currentZoom,
      maxIter,
      config,
      selectedPalette
    );

    log(`Sample Check: visibleRatio=${(sample.visibleRatio*100).toFixed(1)}%  ` +
        `colorSpread=${(sample.colorSpread*100).toFixed(1)}%  ` +
        `maxIterRatio=${(sample.maxIterRatio*100).toFixed(1)}%`);

    if (!sample.passes) {
      log("❌ Sample quality failed — skipping full render.");
      continue;   // or adjust zoom/position before retrying
    }

    log("✓ Sample quality passed — continuing to full render...");
    
    const { canvas, imageData } = renderFractal(
      config.server.width,
      config.server.height,
      currentX,
      currentY,
      currentZoom,
      selectedPalette,
      maxIter,
      config.rendering
    );
    
    // Quality check
    const quality = analyzeImageQuality(
      imageData, 
      config.server.width, 
      config.server.height,
      config.qualityControl
    );
    
    log(`Quality Check:`);
    log(`  Color Diversity: ${(quality.colorDiversity * 100).toFixed(1)}% (min: ${config.qualityControl.minColorDiversity * 100}%)`);
    log(`  Visible Pixels: ${(quality.visibleRatio * 100).toFixed(1)}% (min: ${config.qualityControl.minVisiblePixels * 100}%)`);
    log(`  Used Color Buckets: ${quality.usedBuckets}/256`);
    
    if (!quality.passes) {
      log(`❌ Quality check failed - retrying...`);
      continue;
    }
    
    log(`✓ Quality check passed!`);
    
    return {
      canvas,
      imageData,
      metadata: {
        palette: selectedPalette.name,
        region: selectedRegion.name,
        zoom: currentZoom,
        centerX: currentX,
        centerY: currentY,
        maxIter,
        quality
      }
    };
  }
  
  throw new Error(`Failed to generate quality image after ${maxAttempts} attempts`);
}

function saveFractal(canvas, outputDir, filename = 'fractal') {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const buffer = canvas.toBuffer('image/png');
  const filepath = `${outputDir}/${filename}.png`;
  
  fs.writeFileSync(filepath, buffer);
  
  return filepath;
}

module.exports = {
  generateFractal,
  saveFractal
};