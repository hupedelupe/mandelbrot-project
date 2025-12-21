#!/usr/bin/env node
// test-success-rate.js - Run-level success testing with fixed power per run

const fs = require('fs');
const path = require('path');
const { createFractal } = require('./fractals/fractalFactory');
const { getRegionsForPower, getRegionsForFractal } = require('./data/regions');
const { zoomIntoFractal } = require('./zoom/fractalZoomFocus');
const { sampleFractalForQuality } = require('./core/quality');

// Load configuration
const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const MAX_ATTEMPTS_PER_RUN = 30;

/**
 * Weighted random selection
 */
function weightedRandom(weights) {
  const entries = Object.entries(weights).filter(
    ([, w]) => typeof w === 'number' && !isNaN(w)
  );

  if (!entries.length) throw new Error('No valid weights');
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (total === 0) throw new Error('Total weight zero');

  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return isNaN(Number(k)) ? k : Number(k);
  }

  return isNaN(Number(entries[0][0])) ? entries[0][0] : Number(entries[0][0]);
}

/**
 * Select fractal parameters (ONCE PER RUN)
 */
function selectFractalParameters() {
  const p = config.parameterSelection || {};

  const powerType = weightedRandom({
    integer: p.integerPowerWeight ?? 0.6,
    complex: p.complexPowerWeight ?? 0.4
  });

  let power;

  if (powerType === 'integer') {
    const weights = p.integerPowers || { 2: 1, 3: 1, 4: 1 };
    const n = weightedRandom(weights);
    power = { real: n, imag: 0 };
  } else {
    const weights = p.integerPowers || { 2: 1, 3: 1, 4: 1 };
    const keys = Object.keys(weights).map(Number).filter(n => !isNaN(n));
    const min = Math.min(...keys);
    const max = Math.max(...keys);

    power = {
      real: min + Math.random() * (max - min),
      imag: -2 + Math.random() * 4
    };
  }

  return { power, powerType };
}

/**
 * Select region
 */
function selectRegion(fractal) {
  if (fractal.usesDynamicRegions && fractal.regions?.length) {
    return fractal.regions[Math.floor(Math.random() * fractal.regions.length)];
  }

  let regions = [];
  if (fractal.power && fractal.variant) {
    regions = getRegionsForPower(fractal.power, fractal.variant);
  }

  if (!regions.length && fractal.name) {
    regions = getRegionsForFractal(fractal.name);
  }

  if (!regions.length) {
    throw new Error(`No regions for fractal ${fractal.name || 'unknown'}`);
  }

  return regions[Math.floor(Math.random() * regions.length)];
}

/**
 * ONE generation attempt (power fixed)
 */
function testGenerationAttempt(power, powerType) {
  const fractal = createFractal({ power });
  const region = selectRegion(fractal);
  const gen = config.generation || {};

  const zoomMin = gen.zoomRange?.min ?? 10;
  const zoomMax = gen.zoomRange?.max ?? 100;
  const zoomStepsMin = gen.zoomSteps?.min ?? 3;
  const zoomStepsMax = gen.zoomSteps?.max ?? 5;
  const zoomMultMin = gen.zoomMultiplier?.min ?? 3;
  const zoomMultMax = gen.zoomMultiplier?.max ?? 10;
  const searchSamples = gen.searchSamples ?? 35;

  const initialZoom = zoomMin + Math.random() * (zoomMax - zoomMin);
  const zoomSteps =
    zoomStepsMin +
    Math.floor(Math.random() * (zoomStepsMax - zoomStepsMin + 1));

  const { x, y, zoom, foundGood } = zoomIntoFractal(
    region.cx,
    region.cy,
    initialZoom,
    zoomSteps,
    searchSamples,
    zoomMultMin,
    zoomMultMax,
    region.qualityControl || config.qualityControl,
    fractal.iterate,
    region
  );

  if (!foundGood) {
    return { success: false };
  }

  const qc = { ...(region.qualityControl || config.qualityControl) };

  const basePower = 2;
  const actualPower = Math.max(basePower, Math.floor(power.real));
  const powerRatio = basePower / actualPower;
  qc.minVisiblePixels = 0.75 * Math.pow(powerRatio, 0.3);

  const sample = sampleFractalForQuality(
    x,
    y,
    Math.min(zoom, gen.zoomMax ?? zoom),
    10000,
    qc,
    fractal.iterate
  );

  return { success: sample.passes };
}

/**
 * ONE run = up to N attempts, SAME power
 */
function testRun(maxAttempts = MAX_ATTEMPTS_PER_RUN) {
  const { power, powerType } = selectFractalParameters();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = testGenerationAttempt(power, powerType);
    if (result.success) {
      return { success: true, attempts: attempt, power, powerType };
    }
  }

  return { success: false, attempts: maxAttempts, power, powerType };
}

/**
 * Histogram helper
 */
function record(map, attempts) {
  map[attempts] = (map[attempts] || 0) + 1;
}

/**
 * Main
 */
function main() {
  const runs = parseInt(process.argv[2] ?? '100', 10);

  console.log(
    `\n🧪 ${runs} runs — up to ${MAX_ATTEMPTS_PER_RUN} attempts each\n`
  );

  const results = {
    integer: {},
    complex: { runs: 0, success: 0, attempts: {} },
    overall: { runs: 0, success: 0 }
  };

  const intPowers = Object.keys(
    config.parameterSelection.integerPowers || {}
  ).map(Number);

  for (const n of intPowers) {
    results.integer[n] = { runs: 0, success: 0, attempts: {} };
  }

  process.stdout.write('Running: ');
  for (let i = 0; i < runs; i++) {
    if (i && i % 10 === 0) process.stdout.write(`${i}...`);

    const run = testRun();
    results.overall.runs++;

    if (run.powerType === 'integer') {
      const n = Math.floor(run.power.real);
      const bucket =
        results.integer[n] ??
        (results.integer[n] = { runs: 0, success: 0, attempts: {} });

      bucket.runs++;
      if (run.success) {
        bucket.success++;
        results.overall.success++;
        record(bucket.attempts, run.attempts);
      }
    } else {
      results.complex.runs++;
      if (run.success) {
        results.complex.success++;
        results.overall.success++;
        record(results.complex.attempts, run.attempts);
      }
    }
  }

  console.log(`${runs}\n\nResults\n=======\n`);

  const overallRate = (
    (results.overall.success / results.overall.runs) *
    100
  ).toFixed(1);
  console.log(
    `Overall: ${results.overall.success}/${results.overall.runs} (${overallRate}%)\n`
  );

  console.log('Integer powers:');
  for (const [p, s] of Object.entries(results.integer).sort(
    (a, b) => a[0] - b[0]
  )) {
    if (!s.runs) continue;
    const rate = ((s.success / s.runs) * 100).toFixed(1);
    console.log(`  z^${p}: ${s.success}/${s.runs} (${rate}%)`);
    Object.entries(s.attempts)
      .sort((a, b) => a[0] - b[0])
      .forEach(([a, c]) => console.log(`    ${a} attempts: ${c}`));
  }

  if (results.complex.runs) {
    const rate = (
      (results.complex.success / results.complex.runs) *
      100
    ).toFixed(1);
    console.log(
      `\nComplex powers: ${results.complex.success}/${results.complex.runs} (${rate}%)`
    );
    Object.entries(results.complex.attempts)
      .sort((a, b) => a[0] - b[0])
      .forEach(([a, c]) => console.log(`  ${a} attempts: ${c}`));
  }

  console.log('\n');
}

main();
