#!/usr/bin/env node
// index.js - Unified parameter-based fractal generation

const fs = require('fs');
const path = require('path');
const { createFractal } = require('./fractals/fractalFactory');
const { generateFractal, saveFractal } = require('./core/generator');
const { generateDeviceCrops } = require('./output/dynamic-framing');

// Load configuration
const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Randomly select fractal parameters based on config weights
 */
function selectFractalParameters(testMode = false) {
  const paramConfig = config.parameterSelection || {};

  // Select power (integer vs complex/fractional)
  const powerType = weightedRandom({
    integer: paramConfig.integerPowerWeight ?? 0.6,
    complex: paramConfig.complexPowerWeight ?? 0.4
  });

  let power;
  if (powerType === 'integer') {
    // Select from known integer powers
    const weights = paramConfig.integerPowers || { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 };
    const n = weightedRandom(weights);
    power = { real: n, imag: 0 };
  } else {
    // Generate complex power with decimal components
    // Real part: range based on allowed integer powers (e.g., 2-6)
    const weights = paramConfig.integerPowers || { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 };
    const integerKeys = Object.keys(weights).map(Number).filter(n => !isNaN(n) && weights[n] > 0);
    const minPower = Math.min(...integerKeys);
    const maxPower = Math.max(...integerKeys);

    // Random decimal in the range (e.g., 2.0 to 6.0)
    const powerReal = minPower + Math.random() * (maxPower - minPower);

    // Imaginary part: minimum 0.2 magnitude to ensure meaningful complex behavior
    // Range: -2 to -0.2 or +0.2 to +2 (excludes -0.2 to +0.2)
    const sign = Math.random() < 0.5 ? -1 : 1;
    const powerImag = sign * (0.2 + Math.random() * 1.8);  // 0.2 to 2.0 magnitude

    power = { real: powerReal, imag: powerImag };
  }

  // Select variant
  const variantWeights = paramConfig.variants || {
    standard: 0.7,
    conjugate: 0.15,
    'burning-ship': 0.15
  };
  const variant = weightedRandom(variantWeights);

  // Organic exploration: sometimes use dynamic regions even for known fractals
  const organicRate = paramConfig.organicExplorationRate || 0.15;
  const useOrganicExploration = Math.random() < organicRate;

  return { power, variant, useOrganicExploration, testMode };
}

/**
 * Weighted random selection
 */
function weightedRandom(weights) {
  // Filter out non-numeric weights (like "comment" fields)
  const entries = Object.entries(weights).filter(([key, weight]) => {
    return typeof weight === 'number' && !isNaN(weight);
  });

  if (entries.length === 0) {
    throw new Error('No valid numeric weights found in weighted random selection');
  }

  const totalWeight = entries.reduce((sum, [_, weight]) => sum + weight, 0);

  let random = Math.random() * totalWeight;

  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      // Try to parse as number, otherwise return string
      const num = Number(key);
      return !isNaN(num) ? num : key;
    }
  }

  // Fallback (shouldn't happen)
  const fallbackKey = entries[0][0];
  const num = Number(fallbackKey);
  return !isNaN(num) ? num : fallbackKey;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const forcedPower = args.find(arg => arg.startsWith('--power='))?.split('=')[1];
  const forcedVariant = args.find(arg => arg.startsWith('--variant='))?.split('=')[1];
  const forcedRegion = args.find(arg => arg.startsWith('--region='))?.split('=')[1];
  const forcedPalette = args.find(arg => arg.startsWith('--palette='))?.split('=')[1];
  const organicFlag = args.includes('--organic');
  const countArg = args.find(arg => arg.startsWith('--count='))?.split('=')[1];
  const count = countArg ? parseInt(countArg, 10) : 1;
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Fractal Generator - Unified Parameter-Based System

Generates fractals by randomly selecting mathematical parameters.
Explores the entire fractal space: integer powers, complex powers, variants.

Usage:
  node src/index.js [options]

Options:
  --power=REAL[+IMAG]i  Force specific power (e.g., --power=2, --power=2.5+0.3i)
  --variant=TYPE        Force variant: standard | conjugate | burning-ship
  --region=NAME         Force specific region
  --palette=NAME        Force specific palette
  --organic             Force organic exploration (dynamic regions)
  --count=N             Generate N fractals (default: 1)
  --test-production     Test production mode locally
  --help, -h            Show this help

Examples:
  node src/index.js                              # Random parameters
  node src/index.js --count=10                   # Generate 10 random fractals
  node src/index.js --power=2 --variant=standard # Classic Mandelbrot
  node src/index.js --power=3.5+0.8i             # Complex power
  node src/index.js --organic                    # Force dynamic region discovery
  node src/index.js --test-production            # Test locally

Parameter Space:
  Powers: Integer (z^2, z^3, z^4) or Complex (z^(a+bi))
  Variants: standard, conjugate (Tricorn), burning-ship
  Regions: Pre-defined (known fractals) or Dynamic (exploration)

Output:
  ./output/fractals/          # All fractal generations
  ./output/test-production/   # Test production runs
    `);
    process.exit(0);
  }

  // Determine output directory and mode
  const testProductionMode = args.includes('--test-production');

  let outputDir;
  let mode;

  if (testProductionMode) {
    outputDir = './output/test-production';
    mode = 'TEST PRODUCTION';
  } else {
    outputDir = './output/fractals';
    mode = 'GENERATION';
  }

  console.log(`\nMode: ${mode}`);
  console.log(`Generating ${count} fractal(s)...`);
  console.log(`Output directory: ${outputDir}\n`);

  let successCount = 0;

  for (let i = 0; i < count; i++) {
    if (count > 1) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fractal ${i + 1} of ${count}`);
      console.log('='.repeat(60));
    }

    // Select or parse parameters
    let params;
    if (forcedPower || forcedVariant || organicFlag) {
      // Parse forced power
      let power;
      if (forcedPower) {
        power = parsePowerString(forcedPower);
      } else {
        // Random power if not forced
        const selected = selectFractalParameters(testProductionMode);
        power = selected.power;
      }

      params = {
        power,
        variant: forcedVariant || 'standard',
        useOrganicExploration: organicFlag,
        testMode: testProductionMode
      };
    } else {
      // Fully random selection
      params = selectFractalParameters(testProductionMode);
    }

    // Create fractal from parameters
    const fractal = createFractal(params);

    console.log(`\n${fractal.name} → z^(${params.power.real.toFixed(2)}${params.power.imag >= 0 ? '+' : ''}${params.power.imag.toFixed(2)}i)`);

    try {
      const result = await generateFractal({
        config,
        fractal,
        forcedRegion,
        forcedPalette
      });

      // Generate device crops (desktop 16:9 and mobile 9:16)
      console.log(`\nGenerating device crops from ${result.scanResolution}×${result.scanResolution} scan...`);
      const crops = generateDeviceCrops({
        imageData: result.imageData,
        width: result.scanResolution,
        height: result.scanResolution,
        qualityConfig: config.qualityControl,
        metadata: result.metadata
      });

      console.log(`\n✓ ${result.metadata.palette} palette | ${result.metadata.region} | ${result.metadata.zoom.toFixed(0)}× zoom`);

      // Save both crops
      for (const crop of crops) {
        const useTimestamp = testProductionMode;
        const timestamp = useTimestamp ? new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) : '';
        const filename = useTimestamp
          ? `fractal_${timestamp}_${fractal.name}_${crop.name}`
          : `fractal_${crop.name}`;
        const filepath = saveFractal(crop.canvas, outputDir, filename);
        console.log(`  → ${crop.name}: ${crop.output.width}×${crop.output.height}`);
      }

      successCount++;
    } catch (err) {
      console.error(`\n✗ Generation failed: ${err.message}`);
      if (process.env.DEBUG) {
        console.error(err.stack);
      }
      if (count === 1) {
        process.exit(1);
      }
    }
  }

  if (count > 1) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Successfully generated ${successCount} of ${count} fractal(s)`);
    console.log('='.repeat(60));
  }
}

/**
 * Parse power string like "2", "3.5", "2.5+0.3i", "3.2-0.8i"
 */
function parsePowerString(str) {
  // Remove spaces
  str = str.replace(/\s/g, '');

  // Check for imaginary part
  const match = str.match(/^([+-]?[\d.]+)([+-][\d.]+)i$/);

  if (match) {
    // Complex power: "2.5+0.3i" or "3.2-0.8i"
    return {
      real: parseFloat(match[1]),
      imag: parseFloat(match[2])
    };
  } else {
    // Real power only: "2" or "3.5"
    return {
      real: parseFloat(str),
      imag: 0
    };
  }
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
