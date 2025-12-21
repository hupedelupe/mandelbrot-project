// analysis/dynamicRegionFinder.js
// Dynamically discovers interesting regions for complex power fractals
// Uses boundary detection to create seed regions like the pre-defined ones

const {
  analyzeFractalRegion,
  findInterestingRegions,
  selectRandomRegion
} = require('./boundaryDetector');

/**
 * Find initial seed regions for a complex power fractal
 * Returns regions in the same format as pre-defined regions
 */
function findDynamicRegions({
  powerReal,
  powerImag,
  initialCenter = { x: -0.5, y: 0 },
  initialWidth = 3.0,
  numRegions = 5,
  analysisConfig = {}
}) {
  const {
    gridSize = 16,
    subsampleSize = 8,
    analysisMaxIter = 500,
    minVariance = 5  // Lower threshold for subtle complex powers
  } = analysisConfig;

  console.log(`\n[DynamicRegionFinder] Discovering regions for power ${powerReal.toFixed(2)} + ${powerImag.toFixed(2)}i`);
  console.log(`  Analyzing ${initialWidth.toFixed(2)} wide region centered at (${initialCenter.x}, ${initialCenter.y})`);

  // Analyze the initial view
  const cells = analyzeFractalRegion({
    centerX: initialCenter.x,
    centerY: initialCenter.y,
    width: initialWidth,
    height: initialWidth,
    gridSize,
    subsampleSize,
    maxIter: analysisMaxIter,
    powerReal,
    powerImag
  });

  // Find interesting regions
  const interestingRegions = findInterestingRegions(cells, {
    varianceThreshold: 'auto',
    topN: Math.max(numRegions * 2, 20), // Get more candidates than needed
    requireBoundary: true,
    minVariance
  });

  if (interestingRegions.length === 0) {
    console.warn(`  ⚠ No interesting regions found, using fallback center`);
    return [{
      cx: initialCenter.x,
      cy: initialCenter.y,
      name: `ComplexPower_Fallback`,
      variance: 0,
      qualityControl: getDefaultQualityControl()
    }];
  }

  // Convert to region format and select top regions
  const regions = interestingRegions
    .slice(0, numRegions)
    .map((region, index) => ({
      cx: region.centerX,
      cy: region.centerY,
      name: `ComplexPower_Region_${index + 1}`,
      variance: region.variance,
      qualityControl: getQualityControlForVariance(region.variance)
    }));

  console.log(`  ✓ Found ${regions.length} candidate regions`);
  console.log(`  Top region: (${regions[0].cx.toFixed(6)}, ${regions[0].cy.toFixed(6)}) variance: ${regions[0].variance.toFixed(2)}`);

  return regions;
}

/**
 * Get quality control settings based on variance
 * High visibility requirement to avoid mostly-black images
 */
function getQualityControlForVariance(variance) {
  // Normalize variance to 0-1 range (typical variance is 10,000 - 60,000)
  const normalizedVariance = Math.min(1, variance / 60000);

  return {
    minVisiblePixels: 0.90,                                // 90% visibility required
    minEdgeDensity: 0.005 + normalizedVariance * 0.01,    // 0.005 - 0.015
    minGeometryScore: 0.08 + normalizedVariance * 0.12,   // 0.08 - 0.20
    minActiveCells: Math.floor(4 + normalizedVariance * 4), // 4 - 8
    minColorDiversity: 0.06 + normalizedVariance * 0.04,  // 0.06 - 0.10
    minComplexityScore: 0
  };
}

/**
 * Default quality control for fallback regions
 * High visibility requirement to avoid mostly-black images
 */
function getDefaultQualityControl() {
  return {
    minVisiblePixels: 0.90,
    minEdgeDensity: 0.005,
    minGeometryScore: 0.10,
    minActiveCells: 4,
    minColorDiversity: 0.06,
    minComplexityScore: 0
  };
}

/**
 * Create zoom strategy for complex power fractals
 * Adjusts based on power characteristics
 */
// function createZoomStrategy(powerReal, powerImag) {
//   const powerMagnitude = Math.sqrt(powerReal * powerReal + powerImag * powerImag);

//   // Only treat as complex if imaginary component is significant (>= 0.2)
//   // Small imaginary components don't create meaningfully different fractals
//   const isComplex = Math.abs(powerImag) >= 0.2;
//   const isHighPower = powerMagnitude > 3.0;

//   return {
//     // Complexity weight: how much to prioritize variance in iteration counts
//     complexityWeight: isComplex ? 0.75 : 0.70,

//     // Average iteration weight: prefer regions that don't escape too quickly
//     avgIterWeight: isComplex ? 0.20 : 0.25,

//     // Center bias: stay near the selected region center
//     centerBiasWeight: 0.05,

//     // Zoom steps: more steps, gentle approach for all fractals
//     zoomSteps: {
//       min: isComplex ? 8 : 8,
//       max: isComplex ? 16 : 16
//     },

//     // Search samples: thorough search to find boundaries
//     searchSamples: isComplex ? 80 : 60,

//     // Zoom multiplier: very gentle, with adaptive speedup for high complexity
//     // Extra gentle for complex powers (1.2-1.4) since we're filtering maxIter now
//     zoomMult: {
//       min: isComplex ? 1.2 : 1.3,
//       max: isComplex ? 1.4 : 2.0,
//       adaptiveMax: isComplex ? 2.0 : 2.5  // Moderate speedup when safe
//     },

//     // Minimum complexity threshold (lower for complex - subtle boundaries)
//     minComplexity: isComplex ? 5 : 10,

//     // Complexity threshold for adaptive speedup
//     // If complexity > this, allow faster zoom (up to adaptiveMax)
//     highComplexityThreshold: 30,

//     // Skip complexity checks for first N steps
//     // Complex powers: 0 (no skip - smart targeting from step 1)
//     // Others: 2 (quick escape from obvious bulbs)
//     skipComplexityCheckSteps: isComplex ? 0 : 2
//   };
// }

function createZoomStrategy() {
  return {
    complexityWeight: 0.75,
    avgIterWeight: 0.20,
    centerBiasWeight: 0.05,

    zoomSteps: {
      min: 8,
      max: 16
    },

    searchSamples: 80,

    zoomMult: {
      min: 1.2,
      max: 1.4,
      adaptiveMax: 2.0
    },

    minComplexity: 5,
    highComplexityThreshold: 30,
    skipComplexityCheckSteps: 0
  };
}

module.exports = {
  findDynamicRegions,
  createZoomStrategy,
  getQualityControlForVariance,
  getDefaultQualityControl
};
