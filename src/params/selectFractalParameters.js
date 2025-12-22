const { weightedRandom } = require('./weightedRandom');

function selectFractalParameters(config, testMode = false) {
  const paramConfig = config.parameterSelection || {};

  const powerType = weightedRandom({
    integer: paramConfig.integerPowerWeight ?? 0.6,
    complex: paramConfig.complexPowerWeight ?? 0.4
  });

  let power;

  if (powerType === 'integer') {
    const weights = paramConfig.integerPowers || { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 };
    const n = weightedRandom(weights);
    power = { real: n, imag: 0 };
  } else {
    const weights = paramConfig.integerPowers || { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 };
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

module.exports = { selectFractalParameters };
