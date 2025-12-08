// generator.js - Main fractal generation logic

const fs = require('fs');
const { findBestBoundaryPoint } = require('./mandelbrot');
const { getRandomPalette, getPaletteByName } = require('./palettes');
const { getRandomRegion, getRegionByName } = require('./regions');
const { analyzeImageQuality } = require('./quality');
const { renderFractal } = require('./renderer');

async function generateFractal(config, options = {}) {
  const {
    attemptNumber = 1,
    maxAttempts = 5,
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
    const selectedRegion = region ? getRegionByName(region) : getRandomRegion();
    
    if (!selectedPalette) {
      throw new Error(`Palette "${palette}" not found`);
    }
    if (!selectedRegion) {
      throw new Error(`Region "${region}" not found`);
    }
    
    log(`Palette: ${selectedPalette.name}, Region: ${selectedRegion.name}`);
    
    let currentZoom = 10 + Math.random() * 90;
    let currentX = selectedRegion.cx;
    let currentY = selectedRegion.cy;
    
    const zoomSteps = 3 + Math.floor(Math.random() * 3);
    
    for (let step = 0; step < zoomSteps; step++) {
      const searchRadius = 2.0 / currentZoom;
      const boundary = findBestBoundaryPoint(
        currentX, 
        currentY, 
        searchRadius, 
        35, 
        256,
        config.qualityControl.minComplexityScore
      );
      
      if (boundary.foundGood && boundary.complexity > config.qualityControl.minComplexityScore) {
        currentX = boundary.x;
        currentY = boundary.y;
        currentZoom *= (3 + Math.random() * 7);
        log(`Step ${step + 1}: Complexity ${boundary.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}×`);
      } else {
        log(`Step ${step + 1}: Low complexity - stopping`);
        break;
      }
    }
    
    log(`Rendering ${config.server.width}×${config.server.height}...`);
    
    const maxIter = Math.min(3072, Math.floor(config.server.maxIter * (1 + Math.log10(currentZoom) / 2)));
    
    const { canvas, imageData } = renderFractal(
      config.server.width,
      config.server.height,
      currentX,
      currentY,
      currentZoom,
      selectedPalette,
      maxIter
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