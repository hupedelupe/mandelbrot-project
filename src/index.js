#!/usr/bin/env node
// src/index.js
// Full entry point with refactored plumbing (no behavior change)

const fs = require('fs');
const path = require('path');

const { parseArgs } = require('./cli/parseArgs');
const { prepareSelectionParams } = require('./cli/prepareSelectionParams');
const { showHelp } = require('./cli/showHelp.js');

const { createFractal } = require('./fractals/fractalFactory');
const { generateFractal, saveFractal } = require('./core/generator');
const { generateDeviceCrops } = require('./output/dynamic-framing');
const { selectFractalParameters } = require('./params/selectFractalParameters');
const { parsePowerString } = require('./params/parsePowerString');

// Load config
const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function main() {
  // --- CLI + config plumbing (no logic) ---
  const forcedArgs = parseArgs(process.argv.slice(2));
  const prepared = prepareSelectionParams(config, forcedArgs);

  if (forcedArgs.help) {
    showHelp()
    process.exit(0);
  }

  // --- Runtime setup (same as before) ---
  const count = prepared.runtime.count ?? 1;
  const testMode = prepared.runtime.testMode;

  const outputDir = testMode
    ? './output/test-production'
    : prepared.server.outputDir;

  const mode = testMode ? 'TEST PRODUCTION' : 'GENERATION';

  console.log(`\nMode: ${mode}`);
  console.log(`Generating ${count} fractal(s)...`);
  console.log(`Output directory: ${outputDir}\n`);

  let successCount = 0;

  // --- Main generation loop (unchanged logic) ---
  for (let i = 0; i < count; i++) {
    if (count > 1) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fractal ${i + 1} of ${count}`);
      console.log('='.repeat(60));
    }

    let params;

    if (
      prepared.overrides.power ||
      prepared.overrides.variant ||
      prepared.overrides.organic
    ) {
      const power = prepared.overrides.power
        ? parsePowerString(prepared.overrides.power)
        : selectFractalParameters(config, testMode).power;

      params = {
        power,
        variant: prepared.overrides.variant || 'standard',
        useOrganicExploration: prepared.overrides.organic,
        testMode
      };
    } else {
      params = selectFractalParameters(config, testMode);
    }

    const fractal = createFractal(params);

    console.log(
      `\n${fractal.name} → z^(${params.power.real.toFixed(2)}${
        params.power.imag >= 0 ? '+' : ''
      }${params.power.imag.toFixed(2)}i)`
    );

    try {
      const result = await generateFractal({
        config,
        fractal,
        forcedRegion: prepared.overrides.region,
        forcedPalette: prepared.overrides.palette
      });

      console.log(
        `\nGenerating device crops from ${result.scanResolution}×${result.scanResolution} scan...`
      );

      const crops = generateDeviceCrops({
        imageData: result.imageData,
        width: result.scanResolution,
        height: result.scanResolution,
        qualityConfig: prepared.qualityControl,
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
          ? `fractal_${timestamp}_${fractal.name}_${crop.name}`
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
