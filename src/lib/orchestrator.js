// orchestrator.js - Main coordinator for fractal generation
// Imports from all lib modules and orchestrates the complete pipeline

const fs = require('fs');
const path = require('path');

const { prepareFractalContext } = require('./config/selectParameters');
const { generateFractal } = require('./generation/generator');
const { saveFractal } = require('./generation/generator');
const { generateDeviceCrops } = require('./output/deviceCrops');

/**
 * Generate filename for output
 */
function makeFilename(fractalName, cropName, useTimestamp) {
  if (!useTimestamp) return `fractal_${cropName}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `fractal_${timestamp}_${fractalName}_${cropName}`;
}

/**
 * Save all crops to disk
 */
function saveCrops(crops, outputDir, fractalName, useTimestamp) {
  for (const crop of crops) {
    const filename = makeFilename(fractalName, crop.name, useTimestamp);
    saveFractal(crop.canvas, outputDir, filename);
    console.log(`  → ${crop.name}: ${crop.output.width}×${crop.output.height}`);
  }
}

/**
 * Main orchestration: prepare → execute → save
 * Handles retry loop with fresh context per attempt
 */
async function runGeneration(config, args, options = {}) {
  const maxAttempts = options.maxAttempts ?? 30;
  const verbose = options.verbose ?? true;
  const log = verbose ? console.log : () => {};

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    log(`\n=== Generation Attempt ${attempt}/${maxAttempts} ===`);

    try {
      // STEP 1: Prepare complete context (all selection happens here)
      const context = prepareFractalContext(config, args);
      const testMode = context.runtime.testMode;
      const outputDir = testMode ? './output/test-production' : context.server.outputDir;

      // STEP 2: Execute generation (pure execution, no selection)
      const result = await generateFractal(context);

      // STEP 3: Generate crops
      console.log(`\nGenerating crops from ${result.scanResolution}× scan...`);
      const crops = generateDeviceCrops(result, context);

      // STEP 4: Save output
      const { palette, region, zoom } = result.metadata;
      console.log(`\n✓ ${palette} | ${region} | ${zoom.toFixed(0)}× zoom`);
      saveCrops(crops, outputDir, context.name, testMode);

      return { success: true, result, crops };
    } catch (err) {
      log(`❌ Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxAttempts) {
        throw new Error(`Failed to generate quality image after ${maxAttempts} attempts`);
      }
      // Retry with fresh selection
    }
  }
}

/**
 * Get initial info for logging (without full generation)
 */
function getGenerationInfo(config, args) {
  const context = prepareFractalContext(config, args);
  return {
    testMode: context.runtime.testMode,
    outputDir: context.runtime.testMode ? './output/test-production' : context.server.outputDir
  };
}

module.exports = {
  runGeneration,
  getGenerationInfo
};
