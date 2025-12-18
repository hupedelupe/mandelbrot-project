#!/usr/bin/env node
// main.js - Entry point for fractal generation with multi-fractal support

const fs = require('fs');
const path = require('path');
const { getFractal, getRandomFractal, getFractalNames } = require('./fractals');
const { generateFractal } = require('./core/generator');
const { generateDeviceCrops } = require('./output/dynamic-framing');

// Load configuration
const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Select a fractal based on configured weights
 */
function selectFractal() {
  if (!config.fractalVariety?.enabled) {
    // Default to classic Mandelbrot
    return getFractal('Mandelbrot');
  }

  const weights = config.fractalVariety.weights || {};
  const entries = Object.entries(weights);

  // Calculate total weight
  const totalWeight = entries.reduce((sum, [_, weight]) => sum + weight, 0);

  // Random selection based on weights
  let random = Math.random() * totalWeight;

  for (const [name, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      try {
        return getFractal(name);
      } catch (err) {
        console.warn(`Warning: ${err.message}, falling back to Mandelbrot`);
        return getFractal('Mandelbrot');
      }
    }
  }

  // Fallback (shouldn't happen)
  return getFractal('Mandelbrot');
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const forcedFractal = args.find(arg => arg.startsWith('--fractal='))?.split('=')[1];
  const forcedRegion = args.find(arg => arg.startsWith('--region='))?.split('=')[1];
  const forcedPalette = args.find(arg => arg.startsWith('--palette='))?.split('=')[1];
  const countArg = args.find(arg => arg.startsWith('--count='))?.split('=')[1];
  const count = countArg ? parseInt(countArg, 10) : 1;
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Fractal Generator - Multi-Fractal Support

Usage:
  node main.js [options]

Options:
  --fractal=NAME   Force specific fractal type
                   Available: ${getFractalNames().join(', ')}

  --region=NAME    Force specific region (e.g., Seahorse_Valley)
  --palette=NAME   Force specific palette
  --count=N        Generate N fractals (default: 1)
  --test, -t            Test mode: save to ./test-fractals with timestamp
  --test-production     Test production settings locally: save to ./test_production
  --help, -h            Show this help

Examples:
  node main.js --test                                    # Random fractal in test mode
  node main.js --fractal=BurningShip --count=5 --test    # 5 Burning Ship fractals
  node main.js --test-production --count=10              # Test production settings locally
  node main.js --fractal=Tricorn --region=Main_Body --test
  node main.js --count=10 --test                         # 10 random fractals
    `);
    process.exit(0);
  }

  // Determine output directory and mode
  const testMode = args.includes('--test') || args.includes('-t');
  const testProductionMode = args.includes('--test-production');

  let outputDir;
  let mode;

  if (testProductionMode) {
    outputDir = './test_production';
    mode = 'TEST PRODUCTION';
  } else if (testMode) {
    outputDir = './test-fractals';
    mode = 'TEST';
  } else {
    outputDir = config.server.outputDir;
    mode = 'PRODUCTION';
  }

  console.log(`\nMode: ${mode}`);
  console.log(`Generating ${count} fractal(s)...`);
  console.log(`Output directory: ${outputDir}\n`);

  const { saveFractal } = require('./core/generator');
  let successCount = 0;

  for (let i = 0; i < count; i++) {
    if (count > 1) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fractal ${i + 1} of ${count}`);
      console.log('='.repeat(60));
    }

    // Select fractal for each iteration (unless forced)
    let fractal;
    if (forcedFractal) {
      try {
        fractal = getFractal(forcedFractal);
        if (i === 0 || count === 1) console.log(`Forced fractal: ${fractal.name}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    } else {
      fractal = selectFractal();
      console.log(`Selected fractal: ${fractal.name} (weighted random)`);
    }

    console.log(`Generating ${fractal.name}...`);

    try {
      const result = await generateFractal({
        config,
        fractal,
        forcedRegion,
        forcedPalette
      });

      // Generate device crops (desktop 16:9 and mobile 9:16)
      if (testProductionMode || !testMode) {
        // Production or test-production: generate crops
        console.log(`\nGenerating device crops from ${result.scanResolution}×${result.scanResolution} scan...`);
        const crops = generateDeviceCrops({
          imageData: result.imageData,
          width: result.scanResolution,
          height: result.scanResolution,
          qualityConfig: config.qualityControl,
          metadata: result.metadata
        });

        console.log(`\n✓ Generation complete!`);
        console.log(`  Fractal: ${fractal.name}`);
        console.log(`  Palette: ${result.metadata.palette}`);
        console.log(`  Region: ${result.metadata.region}`);
        console.log(`  Zoom: ${result.metadata.zoom.toFixed(2)}×`);

        // Save both crops
        for (const crop of crops) {
          const useTimestamp = testProductionMode;
          const timestamp = useTimestamp ? new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) : '';
          const filename = useTimestamp
            ? `fractal_${timestamp}_${fractal.name}_${crop.name}`
            : `fractal_${crop.name}`;
          const filepath = saveFractal(crop.canvas, outputDir, filename);
          console.log(`✓ Saved ${crop.name}: ${filepath} (${crop.output.width}×${crop.output.height})`);
        }
      } else {
        // Test mode: save full image with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `fractal_${timestamp}_${fractal.name}`;
        const filepath = saveFractal(result.canvas, outputDir, filename);

        console.log(`\n✓ Generation complete!`);
        console.log(`✓ Saved: ${filepath}`);
        console.log(`  Fractal: ${fractal.name}`);
        console.log(`  Palette: ${result.metadata.palette}`);
        console.log(`  Region: ${result.metadata.region}`);
        console.log(`  Zoom: ${result.metadata.zoom.toFixed(2)}×`);
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

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
