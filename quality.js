// quality.js - Enhanced image quality analysis with geometry detection

const { mandelbrotIterations } = require('./mandelbrot');

/**
 * Detect edges/boundaries in the image
 * High edge density = lots of geometric detail
 */
function detectEdgeDensity(imageData, width, height) {
  const startRow = Math.floor(height / 3);
  const endRow = Math.floor((2 * height) / 3);

  let edgeCount = 0;
  const threshold = 30; // Brightness difference threshold
  
  // Sample every 4th pixel for speed
  for (let py = startRow + 2; py < endRow - 2; py += 4) {
    for (let px = 2; px < width - 2; px += 4) {
      const i = (py * width + px) * 4;
      const centerBrightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      
      // Check 4 neighbors
      const right = ((py * width + (px + 2)) * 4);
      const down = (((py + 2) * width + px) * 4);
      
      const rightBrightness = (imageData.data[right] + imageData.data[right + 1] + imageData.data[right + 2]) / 3;
      const downBrightness = (imageData.data[down] + imageData.data[down + 1] + imageData.data[down + 2]) / 3;
      
      const gradientMagnitude = Math.abs(centerBrightness - rightBrightness) + 
                                Math.abs(centerBrightness - downBrightness);
      
      if (gradientMagnitude > threshold) {
        edgeCount++;
      }
    }
  }
  
  const sampledPixels = ((endRow - startRow - 4) / 4) * ((width - 4) / 4);
  return edgeCount / sampledPixels;
}

/**
 * Detect spatial distribution of detail
 * Good images have detail spread across the frame, not just in corners
 */
function detectSpatialDistribution(imageData, width, height) {
  const startRow = Math.floor(height / 3);
  const endRow = Math.floor((2 * height) / 3);
  const cropHeight = endRow - startRow;
  const gridSize = 5; // Divide image into 5x5 grid
  const cellWidth = Math.floor(width / gridSize);
  const cellHeight = Math.floor(cropHeight / gridSize);
  
  const cellActivity = [];
  
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let cellNonBlack = 0;
      let cellSamples = 0;
      
      const startX = gx * cellWidth;
      const startY = startRow + (gy * cellHeight);
      const endX = Math.min((gx + 1) * cellWidth, width);
      const endY = Math.min(startRow + ((gy + 1) * cellHeight), endRow);
      
      // Sample every 8th pixel in this cell
      for (let py = startY; py < endY; py += 8) {
        for (let px = startX; px < endX; px += 8) {
          const i = (py * width + px) * 4;
          const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          
          if (brightness > 15) {
            cellNonBlack++;
          }
          cellSamples++;
        }
      }
      
      const cellRatio = cellSamples > 0 ? cellNonBlack / cellSamples : 0;
      cellActivity.push(cellRatio);
    }
  }
  
  // Calculate how many cells have significant activity (> 10%)
  const activeCells = cellActivity.filter(ratio => ratio > 0.1).length;
  const distributionScore = activeCells / (gridSize * gridSize);
  
  // Also check variance - we want detail spread out, not clustered
  const mean = cellActivity.reduce((sum, val) => sum + val, 0) / cellActivity.length;
  const variance = cellActivity.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / cellActivity.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower variance = more evenly distributed
  const evenness = mean > 0 ? 1 - Math.min(1, stdDev / mean) : 0;
  
  return {
    distributionScore,
    evenness,
    activeCells
  };
}

/**
 * Comprehensive image quality analysis
 */
function analyzeImageQuality(imageData, width, height, qualityConfig) {
  const pixels = width * height;
  const colorBuckets = new Array(256).fill(0);
  let nonBlackPixels = 0;
  
  // Analyze central region (middle third)
  const startRow = Math.floor(height / 3);
  const endRow = Math.floor((2 * height) / 3);
  
  for (let py = startRow; py < endRow; py++) {
    for (let px = 0; px < width; px++) {
      const i = (py * width + px) * 4;
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      
      const brightness = (r + g + b) / 3;
      colorBuckets[Math.floor(brightness)]++;
      
      if (brightness > 15) {
        nonBlackPixels++;
      }
    }
  }
  
  const centralPixels = (endRow - startRow) * width;

  // Calculate color diversity
  const usedBuckets = colorBuckets.filter(count => count > centralPixels * 0.001).length;
  const colorDiversity = usedBuckets / 256;
  
  // Calculate visible pixel ratio
  const visibleRatio = nonBlackPixels / centralPixels;
  
  // NEW: Detect geometric structure
  const edgeDensity = detectEdgeDensity(imageData, width, height);
  const spatial = detectSpatialDistribution(imageData, width, height);
  
  // Combined geometry score
  const geometryScore = (edgeDensity * 0.6) + (spatial.distributionScore * 0.3) + (spatial.evenness * 0.1);
  
  // Pass criteria
  const passes = 
    colorDiversity >= qualityConfig.minColorDiversity && 
    visibleRatio >= qualityConfig.minVisiblePixels &&
    geometryScore >= (qualityConfig.minGeometryScore || 0.15) &&
    spatial.activeCells >= (qualityConfig.minActiveCells || 8) && // At least 8 of 25 cells active
    edgeDensity >= (qualityConfig.minEdgeDensity);

  return {
    colorDiversity,
    visibleRatio,
    usedBuckets,
    edgeDensity,
    geometryScore,
    spatialDistribution: spatial.distributionScore,
    spatialEvenness: spatial.evenness,
    activeCells: spatial.activeCells,
    passes
  };
}

/**
 * Fast pre-check before rendering
 * Only checks visibility to avoid rendering mostly-black images
 */
function sampleFractalForQuality(centerX, centerY, zoom, maxIter, qualityConfig) {
  const sampleW = 48;
  const sampleH = 27;

  const size = 3.5 / zoom;
  const xMin = centerX - size;
  const yMin = centerY - size;
  const xMax = centerX + size;
  const yMax = centerY + size;

  let escaped = 0;
  let maxIterHits = 0;

  for (let sy = 0; sy < sampleH; sy++) {
    const y0 = yMin + (yMax - yMin) * (sy / sampleH);

    for (let sx = 0; sx < sampleW; sx++) {
      const x0 = xMin + (xMax - xMin) * (sx / sampleW);

      const result = mandelbrotIterations(x0, y0, maxIter);

      if (result.inSet) {
        maxIterHits++;
      } else {
        escaped++;
      }
    }
  }

  const total = sampleW * sampleH;
  const visibleRatio = escaped / total;

  const passes = visibleRatio >= qualityConfig.minVisiblePixels;

  return {
    passes,
    visibleRatio
  };
}

module.exports = {
  analyzeImageQuality,
  sampleFractalForQuality
};