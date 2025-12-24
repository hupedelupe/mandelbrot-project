#!/usr/bin/env node
// src/index.js
// Full entry point with refactored plumbing (no behavior change)

const fs = require('fs');
const path = require('path');

const { parseArgs } = require('./cli/parseArgs');
const { showHelp } = require('./cli/showHelp.js');
const { generateFractal, saveFractal } = require('./core/generator');
const { generateDeviceCrops } = require('./output/dynamic-framing');
const { prepareFractalContext } = require('./params/selectFractalParameters');

// Load config
const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function main() {
  // --- CLI + config plumbing (no logic) ---
  const forcedArgs = parseArgs(process.argv.slice(2));

  if (forcedArgs.help) {
    showHelp()
    process.exit(0);
  }

  const fractalContext = prepareFractalContext(config, forcedArgs);

  // --- Runtime setup (same as before) ---
  const count = fractalContext.runtime.count ?? 1;
  const testMode = fractalContext.runtime.testMode;

  const outputDir = testMode
    ? './output/test-production'
    : fractalContext.server.outputDir;

  console.log(`\nMode: ${testMode ? 'TEST PRODUCTION' : 'GENERATION'}`);
  console.log(`Generating ${count} fractal(s)...`);
  console.log(`Output directory: ${outputDir}\n`);

  // console.log(fractalContext)
  // process.exit(0);
  let successCount = 0;
  console.log(fractalContext.name)
  
  for (let i = 0; i < count; i++) {
    if (count > 1) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fractal ${i + 1} of ${count}`);
      console.log('='.repeat(60));
    }

    try {
      const result = await generateFractal({
        fractalContext,
        fractal: fractalContext,
        forcedRegion: fractalContext.overrides.region,
        forcedPalette: fractalContext.overrides.palette
      });

      console.log(
        `\nGenerating device crops from ${result.scanResolution}×${result.scanResolution} scan...`
      );

      const crops = generateDeviceCrops({
        imageData: result.imageData,
        width: result.scanResolution,
        height: result.scanResolution,
        qualityConfig: fractalContext.qualityControl,
        metadata: result.metadata
      });

      console.log(
        `\n✓ ${result.metadata.palette} palette | ${result.metadata.region} | ${result.metadata.zoom.toFixed(
          0
        )}× zoom`
      );

      for (const crop of crops) {
        const timestamp = testMode
          ? new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
          : '';

        const filename = timestamp
          ? `fractal_${timestamp}_${fractalContext.name}_${crop.name}`
          : `fractal_${crop.name}`;

        saveFractal(crop.canvas, outputDir, filename);

        console.log(
          `  → ${crop.name}: ${crop.output.width}×${crop.output.height}`
        );
      }

      successCount++;
    } catch (err) {
      console.error(`\n✗ Generation failed: ${err.message}`);
      if (process.env.DEBUG) console.error(err.stack);
      if (count === 1) process.exit(1);
    }
  }

  if (count > 1) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Successfully generated ${successCount} of ${count} fractal(s)`);
    console.log('='.repeat(60));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
