#!/usr/bin/env node
// src/bulk-generate.js - Bulk fractal generation for testing

const fs = require('fs');
const path = require('path');

const { parseArgs } = require('./lib/cli/parseArgs');
const { showHelp } = require('./lib/cli/showHelp');
const { runGeneration } = require('./lib/orchestrator');

const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    console.log('\nBulk Generation:');
    console.log('  --count N    Generate N fractals (for testing)');
    process.exit(0);
  }

  // Get count from args
  const count = args.count ?? 1;

  console.log(`\nBULK GENERATION MODE`);
  console.log(`Generating ${count} fractal(s)...\n`);

  let successCount = 0;

  for (let i = 0; i < count; i++) {
    if (count > 1) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fractal ${i + 1} of ${count}`);
      console.log('='.repeat(60));
    }

    try {
      // Orchestrator handles everything for each generation
      await runGeneration(config, args);
      successCount++;
    } catch (err) {
      console.error(`\n✗ Generation failed: ${err.message}`);
      if (process.env.DEBUG) console.error(err.stack);
    }
  }

  if (count > 1) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Successfully generated ${successCount}/${count} fractal(s)`);
    console.log('='.repeat(60));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
