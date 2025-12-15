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

function computeMaxIter(config, iterMultiplier, currentZoom, visibleRatio) {
  const baseMaxIter = config.server.maxIter; // e.g., 2048
  const minIter = 10000;

  // Scale zoom into normal multiplier
  const zoomFactor = 1 + Math.log10(currentZoom) / 2;

  // Compute nominal max, capped to reasonable value
  const nominalMax = Math.floor(baseMaxIter * iterMultiplier * zoomFactor);

  // If image is sparse, scale linearly toward minIter
  const clampedRatio = Math.min(Math.max(visibleRatio, 0), 1);
  const scaledMaxIter = Math.floor(minIter + clampedRatio * (nominalMax - minIter));

  // Optional: clamp maxIter to a hard ceiling if needed
  const ceiling = 10000; 
  return Math.min(scaledMaxIter, ceiling);
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
    const qualityConfig = selectedRegion.qualityControl;
    
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
        qualityConfig.minComplexityScore
      );
      
      if (boundary.foundGood) {
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

    // refine zoom
    for (let stepInner = 0; stepInner < 100; stepInner++) {
      const searchRadiusInner = 1.0 / currentZoom;
      const boundaryInner = findBestBoundaryPoint(
        currentX, 
        currentY, 
        searchRadiusInner, 
        searchSamples, 
        512,
        qualityConfig.minComplexityScore
      );
      
      if (boundaryInner.foundGood && boundaryInner.complexity > qualityConfig.minComplexityScore) {
        currentX = boundaryInner.x;
        currentY = boundaryInner.y;
        const zoomMultInner = zoomMultMin + Math.random() * (zoomMultMax - zoomMultMin);
        currentZoom += zoomMultInner;
        if ((stepInner + 1) % 10 == 0) {
          log(`Step ${stepInner + 1}: Complexity ${boundaryInner.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}× (${zoomMultInner.toFixed(1)}× mult)`);
        }
      } else {
        log(`Step ${stepInner + 1}: Low complexity - stopping`);
        break;
      }
    }
    
    log(`Rendering ${config.server.width}×${config.server.height}...`);
    
    // Use rendering config multiplier if available
    const iterMultiplier = config.rendering?.maxIterMultiplier || 1.0;

    // QUICK SAMPLING PASS
    const sample = sampleFractalForQuality(
      currentX,
      currentY,
      Math.min(currentZoom, config.generation.zoomMax),
      10000,
      qualityConfig,
    );

    function visibilityScalar(visFactor) {
      // Clamp for safety
      const x = Math.max(0, Math.min(1, visFactor));
      return Math.pow(x, 6) * Math.exp(x - 1);
    }
    
    const samplePixels = 48 * 27;
    const fullPixels = config.server.width * config.server.height;
  
    
    // Visibility factor (1 = full iterations, low visibility = aggressive clamp)
    // Linear scaling: minVisiblePixels → 10% of max, 1.0 → 100% of scaledMaxIter
    const minVisible = config.qualityControl.minVisiblePixels || 0.1;
    const visFactor = Math.max(0.1, (sample.visibleRatio - minVisible) / (1 - minVisible));
    const visScalar = visibilityScalar(visFactor);

    const baseMaxIter = Math.floor(
      config.server.maxIter *
      iterMultiplier *
      (1 + Math.log10(currentZoom) / 2)
    );

    const maxIter = Math.max(
      64, // hard floor so image doesn't die
      Math.floor(baseMaxIter * visScalar)
    );

    // scaledMaxIter = Math.floor(scaledMaxIter * visFactor);
    
    // // Clamp to server maxIter * multiplier
    // const maxIter = Math.min(scaledMaxIter, Math.floor(config.server.maxIter * iterMultiplier));
    
    console.log(`Sample Check: Visible Ratio ${(sample.visibleRatio*100).toFixed(1)}%, setting maxIter = ${maxIter}`);


    log(`Max iterations: ${maxIter} (multiplier: ${iterMultiplier})`);

    log(`Sample Check: Visible Ratio ${(sample.visibleRatio * 100).toFixed(1)}% (min: ${qualityConfig.minVisiblePixels * 100}%)`);

    if (!sample.passes) {
      log(`❌ Sample failed - too much black, skipping render`);
      continue;
    }

    log(`✓ Sample passed - rendering full image...`);
    
    const { canvas, imageData } = renderFractal(
      config.server.width,
      config.server.height,
      currentX,
      currentY,
      Math.min(currentZoom, config.generation.zoomMax),
      selectedPalette,
      maxIter,
      config.rendering
    );
    
    // Quality check
    const quality = analyzeImageQuality(
      imageData, 
      config.server.width, 
      config.server.height,
      qualityConfig
    );

    log(`Quality Check:`);
    log(`  Color Diversity: ${(quality.colorDiversity * 100).toFixed(1)}% (min: ${qualityConfig.minColorDiversity * 100}%)`);
    log(`  Visible Pixels: ${(quality.visibleRatio * 100).toFixed(1)}% (min: ${qualityConfig.minVisiblePixels * 100}%)`);
    log(`  Geometry Score: ${(quality.geometryScore * 100).toFixed(1)}% (min: ${(qualityConfig.minGeometryScore || 0.15) * 100}%)`);
    log(`  Edge Density: ${(quality.edgeDensity * 100).toFixed(1)}%`);
    log(`  Active Cells: ${quality.activeCells}/25 (min: ${qualityConfig.minActiveCells || 8})`);
    log(`  Spatial Distribution: ${(quality.spatialDistribution * 100).toFixed(1)}%`);

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