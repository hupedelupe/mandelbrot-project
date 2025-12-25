#!/usr/bin/env node
// src/index.js - Production entry point (single fractal generation)

const fs = require('fs');
const path = require('path');

const { parseArgs } = require('./lib/cli/parseArgs');
const { showHelp } = require('./lib/cli/showHelp');
const { runGeneration, getGenerationInfo } = require('./lib/orchestrator');

const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Get info for logging
  const { testMode, outputDir } = getGenerationInfo(config, args);

  console.log(`\nMode: ${testMode ? 'TEST PRODUCTION' : 'GENERATION'}`);
  console.log(`Output: ${outputDir}\n`);

  try {
    // Orchestrator handles everything: prepare → execute → save → retry
    await runGeneration(config, args);
  } catch (err) {
    console.error(`\n✗ Generation failed: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
