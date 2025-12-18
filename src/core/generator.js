// generator-enhanced.js - Enhanced generation with more control options

const fs = require('fs');
const { getRandomPalette, getPaletteByName } = require('../data/palettes');
const { getRegionsForFractal, getRandomRegion, getRegionByName } = require('../data/regions');
const { analyzeImageQuality, sampleFractalForQuality } = require('./quality');
const { renderFractal } = require('./renderer');
const { zoomIntoFractal } = require('../zoom/fractalZoomFocus');

// Track recently used regions for variety
const recentRegions = [];

function selectRegion(config, fractal, regionName = null) {
  if (regionName) {
    const region = getRegionByName(fractal.name, regionName);
    if (!region) throw new Error(`Region "${regionName}" not found for fractal ${fractal.name}`);
    return region;
  }

  // Get all regions for this fractal
  let availableRegions = getRegionsForFractal(fractal.name);

  if (availableRegions.length === 0) {
    throw new Error(`No regions defined for fractal ${fractal.name}`);
  }

  // Filter out recently used regions if diversity settings exist
  const avoidCount = config.diversity?.avoidRecentRegions || 0;

  if (avoidCount > 0 && recentRegions.length > 0) {
    const filtered = availableRegions.filter(r => !recentRegions.includes(r.name));
    if (filtered.length > 0) {
      availableRegions = filtered;
    }
    // Otherwise keep all available regions
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

async function generateFractal({ config, fractal, forcedRegion, forcedPalette, maxAttempts = 30, verbose = true }) {
  // Extract the iterate function from the fractal
  const iterateFn = fractal.iterate;

  const log = verbose ? console.log : () => {};
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    log(`\n=== Generation Attempt ${attempts}/${maxAttempts} ===`);
    
    const selectedPalette = forcedPalette ? getPaletteByName(forcedPalette) : getRandomPalette();
    const selectedRegion = selectRegion(config, fractal, forcedRegion);

    if (!selectedPalette) {
      throw new Error(`Palette "${forcedPalette}" not found`);
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
    const qualityConfig = selectedRegion.qualityControl || config.qualityControl;
    
    let initialZoom = zoomMin + Math.random() * (zoomMax - zoomMin);
    let initialX = selectedRegion.cx;
    let initialY = selectedRegion.cy;
    
    const zoomSteps = zoomStepsMin + Math.floor(Math.random() * (zoomStepsMax - zoomStepsMin + 1));
    
    const { x: finalX, y: finalY, zoom: finalZoom, foundGood } = zoomIntoFractal(
      initialX,
      initialY,
      initialZoom,
      zoomSteps,
      searchSamples,
      zoomMultMin,
      zoomMultMax,
      qualityConfig,
      iterateFn,
      selectedRegion  // Pass full region config (includes zoomStrategy)
    );

    // Fail-fast: skip rendering if zoom couldn't find interesting regions
    if (!foundGood) {
      log(`❌ Zoom failed to find interesting regions - skipping render`);
      continue;
    }

    log(`Rendering ${config.server.width}×${config.server.height}...`);
    
    // Use rendering config multiplier if available
    const iterMultiplier = config.rendering?.maxIterMultiplier || 1.0;

    // ============================================================================
    // QUICK SAMPLING: Check visibility before full render
    // ============================================================================
    // Sample at low resolution to estimate how much of the image will be visible
    // (not in the set). This prevents wasting time rendering mostly-black images.
    const sample = sampleFractalForQuality(
      finalX,
      finalY,
      Math.min(finalZoom, config.generation.zoomMax),
      10000,
      qualityConfig,
      iterateFn
    );

    // Visibility-based iteration scaling
    // Dense regions (low visibility) get fewer iterations to save computation
    // while maintaining visual quality. Uses exponential scaling for smooth falloff.
    function visibilityScalar(visFactor) {
      const x = Math.max(0, Math.min(1, visFactor));
      return Math.pow(x, 6) * Math.exp(x - 1);
    }

    const minVisible = config.qualityControl.minVisiblePixels || 0.1;
    const visFactor = Math.max(0.1, (sample.visibleRatio - minVisible) / (1 - minVisible));
    const visScalar = visibilityScalar(visFactor);

    // Calculate base maxIter based on zoom level
    // Higher zoom = more detail = more iterations needed
    const baseMaxIter = Math.floor(
      config.server.maxIter *
      iterMultiplier *
      (1 + Math.log10(finalZoom) / 2)
    );

    // Apply visibility-based scaling
    // Dense/black regions get fewer iterations to save computation
    let maxIter = Math.max(
      64, // hard floor to prevent image degradation
      Math.floor(baseMaxIter * visScalar)
    );

    // ============================================================================
    // ADAPTIVE CONSTRAINT: Prevent crashes from excessive iteration counts
    // ============================================================================
    // Dense fractals (especially Mandelbrot^4) can have very high iteration counts
    // at deep zooms. This automatically scales down maxIter if the total projected
    // iterations across all renders would exceed the configured threshold.
    const scanRes = config.rendering.scanResolution || 1200;
    const desktopPixels = 4096 * 2304;
    const mobilePixels = 2304 * 4096;
    const scanPixels = scanRes * scanRes;
    const totalPixels = scanPixels + desktopPixels + mobilePixels;
    const projectedTotalIterations = totalPixels * maxIter;
    const maxTotalIterations = config.rendering.maxTotalIterations || 100000000000;

    if (projectedTotalIterations > maxTotalIterations) {
      const scaleFactor = maxTotalIterations / projectedTotalIterations;
      const originalMaxIter = maxIter;
      maxIter = Math.max(64, Math.floor(maxIter * scaleFactor));
      console.log(`\n⚠️  ADAPTIVE CONSTRAINT TRIGGERED:`);
      console.log(`  Projected: ${projectedTotalIterations.toLocaleString()} iterations`);
      console.log(`  Threshold: ${maxTotalIterations.toLocaleString()} iterations`);
      console.log(`  Scaling: ${originalMaxIter} → ${maxIter} (${(scaleFactor * 100).toFixed(1)}%)`);
      console.log(`  Fractal: ${fractal.name}\n`);
    }

    // Log final iteration settings
    log(`Max iterations: ${maxIter} (base: ${config.server.maxIter}, multiplier: ${iterMultiplier}, zoom: ${finalZoom.toFixed(0)}×)`);
    log(`Visible ratio: ${(sample.visibleRatio * 100).toFixed(1)}% (min: ${qualityConfig.minVisiblePixels * 100}%)`);

    if (!sample.passes) {
      log(`❌ Sample failed - too much black, skipping render`);
      continue;
    }

    log(`✓ Sample passed - rendering scan image for crop finding...`);

    // Render at scan resolution to find crop regions (much faster than full res)
    const scanTotalPixels = scanRes * scanRes;
    const scanMaxIterations = scanTotalPixels * maxIter;
    console.log(`\n📊 SCAN RENDER - Iteration Calculation:`);
    console.log(`  Dimensions: ${scanRes} × ${scanRes} = ${scanTotalPixels.toLocaleString()} pixels`);
    console.log(`  Max Iterations per pixel: ${maxIter}`);
    console.log(`  Maximum total iterations: ${scanMaxIterations.toLocaleString()}`);
    console.log(`  (Actual will be lower as many pixels escape early)\n`);

    const { canvas, imageData } = renderFractal(
      scanRes,
      scanRes,
      finalX,
      finalY,
      Math.min(finalZoom, config.generation.zoomMax),
      selectedPalette,
      maxIter,
      config.rendering,
      iterateFn
    );

    // Quality check on scan image
    const quality = analyzeImageQuality(
      imageData,
      scanRes,
      scanRes,
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

    // Calculate grand total iterations across all renders (reuse variables from constraint check)
    const grandTotalPixels = scanPixels + desktopPixels + mobilePixels;
    const grandTotalMaxIterations = grandTotalPixels * maxIter;
    console.log(`\n📊 GRAND TOTAL (All Renders):`);
    console.log(`  Scan: ${scanPixels.toLocaleString()} pixels`);
    console.log(`  Desktop: ${desktopPixels.toLocaleString()} pixels`);
    console.log(`  Mobile: ${mobilePixels.toLocaleString()} pixels`);
    console.log(`  Combined: ${grandTotalPixels.toLocaleString()} pixels`);
    console.log(`  Maximum total iterations: ${grandTotalMaxIterations.toLocaleString()}`);
    console.log(`  (This is the theoretical maximum - actual will be significantly lower)\n`);

    return {
      canvas,
      imageData,
      scanResolution: scanRes,
      metadata: {
        palette: selectedPalette.name,
        paletteObject: selectedPalette,
        region: selectedRegion.name,
        zoom: Math.min(finalZoom, config.generation.zoomMax),
        centerX: finalX,
        centerY: finalY,
        maxIter,
        quality,
        iterateFn,  // Pass the iterate function for re-rendering crops
        renderConfig: config.rendering
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