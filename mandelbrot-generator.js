#!/usr/bin/env node
// mandelbrot-generator.js - Command-line interface for fractal generation

const fs = require('fs');
const path = require('path');
const { generateFractal, saveFractal } = require('./generator');
const { colorPalettes } = require('./palettes');
const { seedRegions } = require('./regions');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    testMode: false,
    count: 1,
    outputDir: null,
    palette: null,
    region: null,
    verbose: true,
    configFile: 'config.json'
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test':
      case '-t':
        options.testMode = true;
        break;
      case '--count':
      case '-c':
        options.count = parseInt(args[++i], 10);
        break;
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--palette':
      case '-p':
        options.palette = args[++i];
        break;
      case '--region':
      case '-r':
        options.region = args[++i];
        break;
      case '--quiet':
      case '-q':
        options.verbose = false;
        break;
      case '--config':
        options.configFile = args[++i];
        break;
      case '--list-palettes':
        colorPalettes.forEach(p => console.log(`  ${p.name}`));
        process.exit(0);
      case '--list-regions':
        seedRegions.forEach(r => console.log(`  ${r.name} (${r.cx}, ${r.cy})`));
        process.exit(0);
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown option: ${args[i]}`);
        printHelp();
        process.exit(1);
    }
  }
  
  return options;
}

function printHelp() {
  console.log(`
Mandelbrot Fractal Generator

USAGE:
  node mandelbrot-generator.js [OPTIONS]

DEFAULT BEHAVIOR (Production):
  Generates ONE fractal and saves it as BOTH:
    - fractal.png
    - fractal_2.png
  in the directory specified in config.json

OPTIONS:
  -t, --test              Test mode: generate multiple images with timestamps
  -c, --count <n>         Number of fractals (test mode only, default: 1)
  -o, --output <dir>      Override output directory
  -p, --palette <name>    Use specific palette (random if not specified)
  -r, --region <name>     Use specific region (random if not specified)
  -q, --quiet             Suppress verbose output
  --config <file>         Config file path (default: config.json)
  --list-palettes         List all available color palettes
  --list-regions          List all available seed regions
  -h, --help              Show this help message

EXAMPLES:
  # Production (default): saves fractal.png & fractal_2.png
  node mandelbrot-generator.js

  # Test mode: generate 5 fractals with timestamps locally
  node mandelbrot-generator.js --test --count 5

  # Generate with specific palette and region
  node mandelbrot-generator.js --palette Fire_Ice --region Spiral_Valley

  # Test mode with custom output directory
  node mandelbrot-generator.js --test --count 3 --output ./test-output
`);
}

async function main() {
  const options = parseArgs();
  
  // Load configuration
  let config;
  try {
    config = JSON.parse(fs.readFileSync(options.configFile, 'utf8'));
  } catch (err) {
    console.error(`Error loading config file: ${err.message}`);
    process.exit(1);
  }
  
  // Determine output directory
  // In test mode with no override: use ./test-fractals
  // In test mode with override: use override
  // In production mode with no override: use config
  // In production mode with override: use override
  let outputDir;
  if (options.outputDir) {
    outputDir = options.outputDir;
  } else if (options.testMode) {
    outputDir = './test-fractals';
  } else {
    outputDir = config.server.outputDir;
  }
  
  // In production mode, always generate exactly 1 fractal
  const count = options.testMode ? options.count : 1;
  
  if (options.verbose) {
    console.log(`Mode: ${options.testMode ? 'TEST' : 'PRODUCTION'}`);
    if (options.testMode) {
      console.log(`Generating ${count} fractal(s)...`);
    }
    console.log(`Output directory: ${outputDir}\n`);
  }
  
  const results = [];
  
  for (let i = 0; i < count; i++) {
    if (count > 1 && options.verbose) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fractal ${i + 1} of ${count}`);
      console.log('='.repeat(60));
    }
    
    try {
      const result = await generateFractal(config, {
        maxAttempts: 5,
        verbose: options.verbose,
        palette: options.palette,
        region: options.region
      });
      
      if (options.testMode) {
        // TEST MODE: Save with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `fractal_${timestamp}_${i + 1}`;
        const filepath = saveFractal(result.canvas, outputDir, filename);
        
        if (options.verbose) {
          console.log(`✓ Saved: ${filepath}`);
          console.log(`  Palette: ${result.metadata.palette}`);
          console.log(`  Region: ${result.metadata.region}`);
          console.log(`  Zoom: ${result.metadata.zoom.toFixed(2)}×`);
        }
        
        results.push({
          file: filepath,
          metadata: result.metadata
        });
      } else {
        // PRODUCTION MODE: Save as fractal.png AND fractal_2.png
        const filepath1 = saveFractal(result.canvas, outputDir, 'fractal');
        const filepath2 = saveFractal(result.canvas, outputDir, 'fractal_2');
        
        if (options.verbose) {
          console.log(`✓ Saved: ${filepath1}`);
          console.log(`✓ Saved: ${filepath2}`);
        }
        
        results.push({
          files: [filepath1, filepath2],
          metadata: result.metadata
        });
      }
      
    } catch (err) {
      console.error(`Error generating fractal ${i + 1}:`, err.message);
      if (count === 1) {
        process.exit(1);
      }
    }
  }
  
  if (options.verbose && options.testMode) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Successfully generated ${results.length} fractal(s)`);
    console.log('='.repeat(60));
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { main };