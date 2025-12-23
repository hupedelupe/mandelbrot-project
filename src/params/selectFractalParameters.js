const { weightedRandom } = require('./weightedRandom');
const { parsePowerString } = require('./parsePowerString');
// const { selectFractalParameters } = require('./selectFractalParameters');
const { createFractal } = require('../fractals/fractalFactory');
const { prepareSelectionParams } = require('../cli/prepareSelectionParams');

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
 * Produces a COMPLETE fractal run context.
 * No config should be needed after this point.
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

  // Return FINAL context object
  return {
    ...fractal,                  // name, iterate, regions, zoomStrategy, etc
    power,
    variant,
    useOrganicExploration,

    // Attached runtime + overrides
    runtime: prepared.runtime,
    overrides: prepared.overrides,

    // Server + output info
    server: prepared.server,

    rendering: prepared.rendering,

    qualityControl: prepared.qualityControl
  };
}

module.exports = { prepareFractalContext };
