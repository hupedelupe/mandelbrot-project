// generator.js - Pure execution, no selection logic

const fs = require('fs');
const { analyzeImageQuality, sampleFractalForQuality } = require('./quality');
const { renderFractal } = require('./renderer');
const { zoomIntoFractal } = require('./fractalZoomFocus');

/**
 * Generate fractal - pure execution with pre-selected parameters
 * Context must already have: selectedPalette, selectedRegion, and all other parameters
 * This function just executes - no selection, no retry loop
 */
async function generateFractal(context) {
  // Extract pre-selected parameters (already in context from prepareFractalContext)
  const { selectedPalette, selectedRegion, iterate: iterateFn, server, rendering, qualityControl, runtime } = context;
  const verbose = runtime?.verbose ?? true;
  const log = verbose ? console.log : () => {};

  log(`Palette: ${selectedPalette.name}, Region: ${selectedRegion.name}`);

  const regionQualityConfig = selectedRegion.qualityControl || qualityControl;

  const initialZoom = 10 + Math.random() * (100 - 10);
  const initialX = selectedRegion.cx;
  const initialY = selectedRegion.cy;

  // Execute zoom
  const { x: finalX, y: finalY, zoom: finalZoom, foundGood } =
    zoomIntoFractal({
      cx: initialX,
      cy: initialY,
      zoom: initialZoom,
      zoomStrategy: context.zoomStrategy,
      qualityConfig: regionQualityConfig,
      iterateFn,
      log: console.log
    });

  // Fail-fast: skip rendering if zoom couldn't find interesting regions
  if (!foundGood) {
    throw new Error('Zoom failed to find interesting regions');
  }

  log(`Rendering ${server.width}×${server.height}...`);

  // Use rendering config multiplier if available
  const iterMultiplier = rendering?.maxIterMultiplier || 1.0;

  // ============================================================================
  // QUICK SAMPLING: Check visibility before full render
  // ============================================================================
  const sample = sampleFractalForQuality(
    finalX,
    finalY,
    Math.min(finalZoom, finalZoom),
    10000,
    regionQualityConfig,
    iterateFn
  );

  // Visibility-based iteration scaling
  function visibilityScalar(visFactor) {
    const x = Math.max(0, Math.min(1, visFactor));
    return Math.pow(x, 6) * Math.exp(x - 1);
  }

  const minVisible = regionQualityConfig.minVisiblePixels || 0.1;
  const visFactor = Math.max(0.1, (sample.visibleRatio - minVisible) / (1 - minVisible));
  const visScalar = visibilityScalar(visFactor);

  // Calculate base maxIter based on zoom level
  const baseMaxIter = Math.floor(
    server.maxIter *
    iterMultiplier *
    (1 + Math.log10(finalZoom) / 2)
  );

  // Apply visibility-based scaling
  let maxIter = Math.max(
    64, // hard floor to prevent image degradation
    Math.floor(baseMaxIter * visScalar)
  );

  // ============================================================================
  // ADAPTIVE CONSTRAINT: Prevent crashes from excessive iteration counts
  // ============================================================================
  const scanRes = rendering.scanResolution || 1200;
  const desktopPixels = 4096 * 2304;
  const mobilePixels = 2304 * 4096;
  const scanPixels = scanRes * scanRes;
  const totalPixels = scanPixels + desktopPixels + mobilePixels;
  const projectedTotalIterations = totalPixels * maxIter;
  const maxTotalIterations = rendering.maxTotalIterations || 100000000000;

  if (projectedTotalIterations > maxTotalIterations) {
    const scaleFactor = maxTotalIterations / projectedTotalIterations;
    const originalMaxIter = maxIter;
    maxIter = Math.max(64, Math.floor(maxIter * scaleFactor));
    console.log(`\n⚠️  ADAPTIVE CONSTRAINT TRIGGERED:`);
    console.log(`  Projected: ${projectedTotalIterations.toLocaleString()} iterations`);
    console.log(`  Threshold: ${maxTotalIterations.toLocaleString()} iterations`);
    console.log(`  Scaling: ${originalMaxIter} → ${maxIter} (${(scaleFactor * 100).toFixed(1)}%)`);
    console.log(`  Fractal: ${context.name}\n`);
  }

  // Log final iteration settings
  log(`Max iterations: ${maxIter} (base: ${server.maxIter}, multiplier: ${iterMultiplier}, zoom: ${finalZoom.toFixed(0)}×)`);
  log(`Visible ratio: ${(sample.visibleRatio * 100).toFixed(1)}% (min: ${regionQualityConfig.minVisiblePixels * 100}%)`);

  if (!sample.passes) {
    throw new Error('Sample failed - too much black');
  }

  log(`✓ Sample passed - rendering scan image for crop finding...`);

  // Render at scan resolution to find crop regions
  const { canvas, imageData } = renderFractal(
    scanRes,
    scanRes,
    finalX,
    finalY,
    Math.min(finalZoom, rendering.maxTotalIterations),
    selectedPalette,
    maxIter,
    rendering,
    iterateFn
  );

  // Quality check on scan image
  const quality = analyzeImageQuality(
    imageData,
    scanRes,
    scanRes,
    regionQualityConfig
  );

  log(`Quality Check:`);
  log(`  Color Diversity: ${(quality.colorDiversity * 100).toFixed(1)}% (min: ${regionQualityConfig.minColorDiversity * 100}%)`);
  log(`  Visible Pixels: ${(quality.visibleRatio * 100).toFixed(1)}% (min: ${regionQualityConfig.minVisiblePixels * 100}%)`);
  log(`  Geometry Score: ${(quality.geometryScore * 100).toFixed(1)}% (min: ${(regionQualityConfig.minGeometryScore || 0.15) * 100}%)`);
  log(`  Edge Density: ${(quality.edgeDensity * 100).toFixed(1)}%`);
  log(`  Active Cells: ${quality.activeCells}/25 (min: ${regionQualityConfig.minActiveCells || 8})`);
  log(`  Spatial Distribution: ${(quality.spatialDistribution * 100).toFixed(1)}%`);

  if (!quality.passes) {
    throw new Error('Quality check failed');
  }

  log(`✓ Quality check passed!`);

  return {
    canvas,
    imageData,
    scanResolution: scanRes,
    metadata: {
      palette: selectedPalette.name,
      paletteObject: selectedPalette,
      region: selectedRegion.name,
      zoom: Math.min(finalZoom, rendering.maxTotalIterations),
      centerX: finalX,
      centerY: finalY,
      maxIter,
      quality,
      iterateFn,
      renderConfig: rendering
    }
  };
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
