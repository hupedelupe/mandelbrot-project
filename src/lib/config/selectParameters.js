const { weightedRandom } = require('./weightedRandom');
const { parsePowerString } = require('./parsePowerString');
const { createFractal } = require('../fractals/fractalFactory');
const { prepareSelectionParams } = require('../cli/prepareSelectionParams');
const { getRandomPalette, getPaletteByName } = require('../data/palettes');
const { getRegionsForFractal, getRegionByName } = require('../data/regions');

function selectFractalParameters(config, testMode = false) {
  const paramConfig = config.parameterSelection || {};

  const powerType = weightedRandom({
    integer: paramConfig.integerPowerWeight ?? 0.6,
    complex: paramConfig.complexPowerWeight ?? 0.4
  });

  let power;

  if (powerType === 'integer') {
    const weights = paramConfig.integerPowers || { 2: 1, 3: 1, 4: 1};
    const n = weightedRandom(weights);
    power = { real: n, imag: 0 };
  } else {
    const weights = paramConfig.integerPowers || { 2: 1, 3: 1, 4: 1};
    const keys = Object.keys(weights).map(Number).filter(n => weights[n] > 0);

    const min = Math.min(...keys);
    const max = Math.max(...keys);

    const real = min + Math.random() * (max - min);
    const sign = Math.random() < 0.5 ? -1 : 1;
    const imag = sign * (0.2 + Math.random() * 1.8);

    power = { real, imag };
  }

  const variant = weightedRandom(
    paramConfig.variants || {
      standard: 0.7,
      conjugate: 0.15,
      'burning-ship': 0.15
    }
  );

  const organicRate = paramConfig.organicExplorationRate ?? 0.15;

  return {
    power,
    variant,
    useOrganicExploration: Math.random() < organicRate,
    testMode
  };
}

/**
 * Select palette (random or forced by override)
 */
function selectPalette(context) {
  const forcedPalette = context.overrides?.palette;
  if (forcedPalette) {
    const palette = getPaletteByName(forcedPalette);
    if (!palette) throw new Error(`Palette "${forcedPalette}" not found`);
    return palette;
  }
  return getRandomPalette();
}

/**
 * Select region (random or forced by override)
 */
function selectRegion(context) {
  const forcedRegion = context.overrides?.region;

  // Fractals with dynamically generated regions (e.g., complex powers or organic exploration)
  if (context.usesDynamicRegions && context.regions) {
    const availableRegions = context.regions;
    return availableRegions[Math.floor(Math.random() * availableRegions.length)];
  }

  // Forced region by name
  if (forcedRegion) {
    const region = getRegionByName(context.name, forcedRegion);
    if (!region) throw new Error(`Region "${forcedRegion}" not found for fractal ${context.name}`);
    return region;
  }

  // Get all regions for this fractal using name-based lookup
  const availableRegions = getRegionsForFractal(context.name);

  if (availableRegions.length === 0) {
    throw new Error(`No regions defined for fractal ${context.name}`);
  }

  return availableRegions[Math.floor(Math.random() * availableRegions.length)];
}

/**
 * Produces a COMPLETE fractal run context with ALL parameters selected.
 * This includes fractal definition, palette, region, zoom strategy, quality config, etc.
 * Nothing should need to be selected after this point - just execution.
 */
function prepareFractalContext(config, forcedArgs) {
  // Merge config + CLI overrides + runtime flags
  const prepared = prepareSelectionParams(config, forcedArgs);
  const testMode = prepared.runtime.testMode ?? false;

  // Choose base parameters (random or weighted)
  const selected = selectFractalParameters(config, testMode);

  // Resolve overrides (if any)
  const power = prepared.overrides.power
    ? parsePowerString(prepared.overrides.power)
    : selected.power;

  const variant = prepared.overrides.variant ?? selected.variant;
  const useOrganicExploration =
    prepared.overrides.organic ?? selected.useOrganicExploration;

  // Create fractal definition
  const fractal = createFractal({
    power,
    variant,
    useOrganicExploration,
    testMode
  });

  // Build base context (fractal + configs)
  const baseContext = {
    // Base fractal definition
    ...fractal,                  // name, iterate, regions, etc.

    // Explicit fractal parameters
    power,
    variant,
    useOrganicExploration,

    // Runtime + overrides
    runtime: prepared.runtime,
    overrides: prepared.overrides,

    // Server + rendering config
    server: prepared.server,
    rendering: prepared.rendering,
    qualityControl: prepared.qualityControl,

    // Fully-resolved zoom strategy (NO defaults elsewhere)
    zoomStrategy: {
      complexityWeight: 0.7,
      avgIterWeight: 0.25,
      centerBiasWeight: 0.05,

      zoomSteps: 10,
      searchSamples: 100,

      zoomMult: {
        min: 1.8,
        max: 2.5,
        adaptiveMax: 3.5
      },

      minComplexity: 5,
      highComplexityThreshold: 30,
      skipComplexityCheckSteps: 2
    }
  };

  // SELECT palette and region (random or forced by overrides)
  const selectedPalette = selectPalette(baseContext);
  const selectedRegion = selectRegion(baseContext);

  // Return COMPLETE context with everything selected
  return {
    ...baseContext,
    selectedPalette,
    selectedRegion
  };
}

module.exports = { prepareFractalContext };
