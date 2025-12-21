// analysis/boundaryDetector.js
// Intelligent boundary detection for finding interesting fractal regions

const { createIterator } = require('../fractals/core/iterate');

/**
 * Compute variance of iteration values in a subsample grid
 * High variance indicates boundary regions (interesting geometry)
 */
function computeSubsampleVariance(
  centerX,
  centerY,
  width,
  height,
  subsampleSize,
  maxIter,
  powerReal,
  powerImag
) {
  const samples = [];

  const xMin = centerX - width / 2;
  const yMin = centerY - height / 2;

  // Create iterator for this power
  const iterate = createIterator({ power: { real: powerReal, imag: powerImag } });

  // Collect iteration values in a grid
  for (let sy = 0; sy < subsampleSize; sy++) {
    for (let sx = 0; sx < subsampleSize; sx++) {
      const x = xMin + (sx / (subsampleSize - 1)) * width;
      const y = yMin + (sy / (subsampleSize - 1)) * height;

      const result = iterate(x, y, maxIter);
      samples.push(result.smooth);
    }
  }

  // Calculate variance
  const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
  const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;

  return {
    variance,
    mean,
    samples: samples.length,
    hasSet: samples.some(s => s === maxIter)
  };
}

/**
 * Analyze a fractal region and find interesting sub-regions
 * Returns a grid of cells with variance scores
 */
function analyzeFractalRegion({
  centerX,
  centerY,
  width,
  height,
  gridSize = 16,           // Divide region into 16x16 grid
  subsampleSize = 8,       // Sample 8x8 points per cell
  maxIter = 500,
  powerReal = 2,
  powerImag = 0
}) {
  const cells = [];

  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  const xMin = centerX - width / 2;
  const yMin = centerY - height / 2;

  console.log(`Analyzing ${gridSize}×${gridSize} grid with ${subsampleSize}×${subsampleSize} subsamples per cell...`);

  let cellCount = 0;
  const totalCells = gridSize * gridSize;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      cellCount++;

      const cellCenterX = xMin + (gx + 0.5) * cellWidth;
      const cellCenterY = yMin + (gy + 0.5) * cellHeight;

      const stats = computeSubsampleVariance(
        cellCenterX,
        cellCenterY,
        cellWidth,
        cellHeight,
        subsampleSize,
        maxIter,
        powerReal,
        powerImag
      );

      cells.push({
        gridX: gx,
        gridY: gy,
        centerX: cellCenterX,
        centerY: cellCenterY,
        width: cellWidth,
        height: cellHeight,
        variance: stats.variance,
        mean: stats.mean,
        hasSet: stats.hasSet
      });

      if (cellCount % 32 === 0) {
        process.stdout.write(`\r  Progress: ${cellCount}/${totalCells} cells (${Math.round(cellCount/totalCells*100)}%)`);
      }
    }
  }

  console.log(`\r  Progress: ${totalCells}/${totalCells} cells (100%)    `);

  return cells;
}

/**
 * Find the most interesting regions based on variance threshold
 */
function findInterestingRegions(cells, options = {}) {
  const {
    varianceThreshold = 'auto',  // 'auto' or numeric value
    topN = 20,                     // Return top N regions
    requireBoundary = true,        // Require cells to have both set and non-set points
    minVariance = 10               // Minimum variance to consider
  } = options;

  // Filter cells
  let candidates = cells.filter(cell => {
    if (cell.variance < minVariance) return false;
    if (requireBoundary && !cell.hasSet) return false;
    return true;
  });

  if (candidates.length === 0) {
    console.warn('No candidates found with current filters, relaxing constraints...');
    candidates = cells.filter(cell => cell.variance >= minVariance);
  }

  // Calculate threshold
  let threshold;
  if (varianceThreshold === 'auto') {
    // Use top percentile of variance
    const variances = candidates.map(c => c.variance).sort((a, b) => b - a);
    const percentileIndex = Math.floor(variances.length * 0.25); // Top 25%
    threshold = variances[percentileIndex] || minVariance;
    console.log(`  Auto threshold: ${threshold.toFixed(2)} (top 25% of ${variances.length} candidates)`);
  } else {
    threshold = varianceThreshold;
    console.log(`  Using threshold: ${threshold}`);
  }

  // Select interesting regions
  const interesting = candidates
    .filter(cell => cell.variance >= threshold)
    .sort((a, b) => b.variance - a.variance)
    .slice(0, topN);

  console.log(`  Found ${interesting.length} interesting regions (variance >= ${threshold.toFixed(2)})`);

  if (interesting.length > 0) {
    const varRange = [
      Math.min(...interesting.map(c => c.variance)),
      Math.max(...interesting.map(c => c.variance))
    ];
    console.log(`  Variance range: ${varRange[0].toFixed(2)} - ${varRange[1].toFixed(2)}`);
  }

  return interesting;
}

/**
 * Select a random region from the interesting ones
 */
function selectRandomRegion(interestingRegions, options = {}) {
  const {
    weightByVariance = true  // Weight selection by variance (higher variance = more likely)
  } = options;

  if (interestingRegions.length === 0) {
    throw new Error('No interesting regions to select from');
  }

  if (!weightByVariance || interestingRegions.length === 1) {
    // Random uniform selection
    return interestingRegions[Math.floor(Math.random() * interestingRegions.length)];
  }

  // Weighted random selection
  const totalVariance = interestingRegions.reduce((sum, r) => sum + r.variance, 0);
  let random = Math.random() * totalVariance;

  for (const region of interestingRegions) {
    random -= region.variance;
    if (random <= 0) {
      return region;
    }
  }

  // Fallback (shouldn't happen)
  return interestingRegions[0];
}

module.exports = {
  computeSubsampleVariance,
  analyzeFractalRegion,
  findInterestingRegions,
  selectRandomRegion
};
