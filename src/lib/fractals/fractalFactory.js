// fractals/fractalFactory.js
// Factory for creating fractal configurations from parameters

const { createIterator } = require('./core/iterate');
const { findDynamicRegions, createZoomStrategy } = require('./dynamicRegionFinder');

/**
 * Create a fractal configuration from parameters
 *
 * @param {Object} params
 * @param {Object} params.power - { real: number, imag: number }
 * @param {string} params.variant - 'standard' | 'conjugate' | 'burning-ship'
 * @param {boolean} params.useOrganicExploration - Force dynamic region discovery even for known powers
 * @param {boolean} params.testMode - Use reduced parameters for faster generation
 * @returns {Object} Fractal configuration
 */
function createFractal(params) {
  const {
    power,
    variant = 'standard',
    useOrganicExploration = false,
    testMode = false
  } = params;

  // Generate descriptive name
  const name = generateFractalName(power, variant);

  // Create iteration function
  const iterate = createIterator({ power, variant });

  // Determine if this is a "known" fractal with pre-defined regions
  const isKnownFractal = isKnown(power, variant) && !useOrganicExploration;

  // For unknown fractals or organic exploration, generate dynamic regions
  let regions = null;
  let zoomStrategy = null;

  if (!isKnownFractal) {
    // Configure analysis parameters based on test mode
    const analysisConfig = testMode ? {
      gridSize: 8,
      subsampleSize: 4,
      analysisMaxIter: 150
    } : {
      gridSize: 12,
      subsampleSize: 6,
      analysisMaxIter: 300
    };

    // Discover regions dynamically
    regions = findDynamicRegions({
      powerReal: power.real,
      powerImag: power.imag,
      initialCenter: { x: -0.5, y: 0 },
      initialWidth: 3.0,
      numRegions: 5,
      analysisConfig
    });

    // Create zoom strategy based on power
    zoomStrategy = createZoomStrategy(power.real, power.imag);

    // In test mode, reduce zoom steps for faster generation
    if (testMode) {
      zoomStrategy.zoomSteps.min = Math.max(1, zoomStrategy.zoomSteps.min - 2);
      zoomStrategy.zoomSteps.max = Math.max(2, zoomStrategy.zoomSteps.max - 2);
      zoomStrategy.searchSamples = Math.max(15, Math.floor(zoomStrategy.searchSamples * 0.6));
    }

    // Attach zoom strategy to each region and enhance quality control for complex powers
    regions.forEach(region => {
      region.zoomStrategy = zoomStrategy;

      // For complex/fractional powers, add edge density requirement
      // Complex powers create intricate boundaries that should have good edge detail
      // Higher threshold prevents blocks of empty space
      const isComplexPower = power.imag !== 0 || !Number.isInteger(power.real);
      if (isComplexPower && region.qualityControl) {
        region.qualityControl.minEdgeDensity = Math.max(
          region.qualityControl.minEdgeDensity || 0,
          0.05  // 5% minimum edge density for complex powers (sample resolution is low)
        );
      }
    });
  }

  return {
    name,
    power,
    variant,
    iterate,
    regions,
    zoomStrategy,
    isKnownFractal,
    usesDynamicRegions: !isKnownFractal
  };
}

/**
 * Check if a power/variant combination is "known" (has pre-defined regions)
 */
function isKnown(power, variant) {
  // Integer powers 2, 3, 4 with standard variant are known
  if (variant === 'standard' && power.imag === 0 && Number.isInteger(power.real)) {
    return power.real >= 2 && power.real <= 4;
  }

  // // Tricorn (power 2 with conjugate) is known
  // if (variant === 'conjugate' && power.real === 2 && power.imag === 0) {
  //   return true;
  // }

  // // Burning Ship (power 2 with burning-ship) is known
  // if (variant === 'burning-ship' && power.real === 2 && power.imag === 0) {
  //   return true;
  // }

  return false;
}

/**
 * Generate a descriptive name for a fractal
 */
function generateFractalName(power, variant) {
  const { real, imag } = power;

  // Standard variant with integer real power and zero imaginary
  if (variant === 'standard' && imag === 0 && Number.isInteger(real)) {
    if (real === 2) return 'Mandelbrot';
    if (real === 3) return 'Mandelbrot3';
    if (real === 4) return 'Mandelbrot4';
    return `Mandelbrot${real}`;
  }

  // // Tricorn (conjugate variant of z^2)
  // if (variant === 'conjugate' && real === 2 && imag === 0) {
  //   return 'Tricorn';
  // }

  // // Burning Ship
  // if (variant === 'burning-ship' && real === 2 && imag === 0) {
  //   return 'BurningShip';
  // }

  // Complex power: format like "Power_2.50_p0.75i" or "Power_3.20_m0.50i"
  const imagSign = imag >= 0 ? 'p' : 'm';
  const imagAbs = Math.abs(imag).toFixed(2);
  const realStr = real.toFixed(2);

  if (variant === 'standard') {
    return `Power_${realStr}_${imagSign}${imagAbs}i`;
  } else {
    return `Power_${realStr}_${imagSign}${imagAbs}i_${variant}`;
  }
}

module.exports = {
  createFractal,
  isKnown,
  generateFractalName
};
