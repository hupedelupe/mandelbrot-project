// generator-enhanced.js - Enhanced generation with more control options

const fs = require('fs');
const { findBestBoundaryPoint } = require('./mandelbrot');
const { getRandomPalette, getPaletteByName } = require('./palettes');
const { getRandomRegion, getRegionByName, seedRegions } = require('./regions');
const { analyzeImageQuality, sampleFractalForQuality } = require('./quality');


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

// function computeMaxIter(config, iterMultiplier, currentZoom, visibleRatio) {
//   const baseMaxIter = config.server.maxIter; // e.g., 2048
//   const minIter = 10000;

//   // Scale zoom into normal multiplier
//   const zoomFactor = 1 + Math.log10(currentZoom) / 2;

//   // Compute nominal max, capped to reasonable value
//   const nominalMax = Math.floor(baseMaxIter * iterMultiplier * zoomFactor);

//   // If image is sparse, scale linearly toward minIter
//   const clampedRatio = Math.min(Math.max(visibleRatio, 0), 1);
//   const scaledMaxIter = Math.floor(minIter + clampedRatio * (nominalMax - minIter));

//   // Optional: clamp maxIter to a hard ceiling if needed
//   const ceiling = 10000; 
//   return Math.min(scaledMaxIter, ceiling);
// }



async function generateFractal(config, options = {}) {
  const {
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
    
    // Config
    const genConfig = config.generation || {};
    const qualityConfig = config.qualityControl;
    const zoomMin = genConfig.zoomRange?.min || 10;
    const zoomMax = genConfig.zoomRange?.max || 100;
    const zoomStepsMin = genConfig.zoomSteps?.min || 3;
    const zoomStepsMax = genConfig.zoomSteps?.max || 8;
    const zoomMultMin = genConfig.zoomMultiplier?.min || 2;
    const zoomMultMax = genConfig.zoomMultiplier?.max || 6;
    const searchSamples = genConfig.searchSamples || 200;
    
    let currentZoom = zoomMin + Math.random() * (zoomMax - zoomMin);
    let currentX = selectedRegion.cx;
    let currentY = selectedRegion.cy;
    
    // ============================================
    // PHASE 1: BROAD ZOOM - Find the boundary
    // ============================================
    const broadSteps = zoomStepsMin + Math.floor(Math.random() * (zoomStepsMax - zoomStepsMin + 1));
    
    log(`Phase 1: Broad zoom to boundary (${broadSteps} steps)`);
    for (let step = 0; step < broadSteps; step++) {
      const searchRadius = 2.0 / currentZoom;
      const boundary = findBestBoundaryPoint(
        currentX, 
        currentY, 
        searchRadius, 
        searchSamples, 
        256,
        qualityConfig.minComplexityScore || 0
      );
      
      if (boundary.foundGood) {
        currentX = boundary.x;
        currentY = boundary.y;
        const zoomMult = zoomMultMin + Math.random() * (zoomMultMax - zoomMultMin);
        currentZoom *= zoomMult;
        log(`  Step ${step + 1}: Complexity ${boundary.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}×`);
      } else {
        log(`  Step ${step + 1}: Low complexity - stopping broad zoom`);
        break;
      }
    }

    // ============================================
    // PHASE 2: PRECISE ZOOM - Center on beauty
    // ============================================
    const preciseSteps = 3 + Math.floor(Math.random() * 4); // 3-6 precise steps
    const preciseZoomMult = 1.3; // Much slower zoom
    
    log(`Phase 2: Precise zoom into detail (${preciseSteps} steps)`);
    for (let step = 0; step < preciseSteps; step++) {
      const searchRadius = (0.8 / currentZoom) / (step + 1); // Shrinking search
      const boundary = findBestBoundaryPoint(
        currentX, 
        currentY, 
        searchRadius, 
        Math.floor(searchSamples * 1.5), // More precise sampling
        512, // Higher iterations to see fine detail
        qualityConfig.minComplexityScore * 0.7 || 0 // More lenient
      );
      
      if (boundary.foundGood) {
        currentX = boundary.x;
        currentY = boundary.y;
        currentZoom *= preciseZoomMult;
        log(`  Refine ${step + 1}: Complexity ${boundary.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}×`);
      } else {
        log(`  Refine ${step + 1}: No improvement - stopping precise zoom`);
        break;
      }
    }

    // Cap zoom at safe limit
    if (currentZoom > genConfig.zoomMax) {
      log(`⚠️  Capping zoom from ${currentZoom.toFixed(0)}× to ${genConfig.zoomMax}×`);
      currentZoom = genConfig.zoomMax;
    }

    // ============================================
    // VISIBILITY CHECK - Skip if too much black
    // ============================================
    const baseMaxIter = config.server.maxIter || 20480;
    const zoomIterBoost = 1 + Math.log10(currentZoom) / 2;
    const maxIter = Math.floor(baseMaxIter * zoomIterBoost);
    
    const sample = sampleFractalForQuality(
      currentX,
      currentY,
      currentZoom,
      maxIter,
      qualityConfig
    );

    log(`Visibility check: ${(sample.visibleRatio * 100).toFixed(1)}% visible (need ${(qualityConfig.minVisiblePixels * 100).toFixed(0)}%-95%)`);

    if (!sample.passes) {
      if (sample.visibleRatio < qualityConfig.minVisiblePixels) {
        log(`❌ Too much black (${((1 - sample.visibleRatio) * 100).toFixed(1)}% in-set)`);
      } else {
        log(`❌ Zoomed into exterior (everything escapes)`);
      }
      continue;
    }

    log(`✓ Visibility passed - generating crops...`);

    // ============================================
    // RENDER CROPS - No quality check needed
    // ============================================
    
    // Return fractal parameters for crop rendering
    return {
      fractalParams: {
        centerX: currentX,
        centerY: currentY,
        zoom: currentZoom,
        palette: selectedPalette,
        maxIter,
        renderConfig: config.rendering
      },
      metadata: {
        palette: selectedPalette.name,
        region: selectedRegion.name,
        zoom: currentZoom,
        centerX: currentX,
        centerY: currentY,
        maxIter,
        visibleRatio: sample.visibleRatio
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