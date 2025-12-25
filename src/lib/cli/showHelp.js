function showHelp() {
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
    node src/index.js
    node src/index.js --count=10
    node src/index.js --power=2 --variant=standard
    node src/index.js --power=3.5+0.8i
    node src/index.js --organic
    node src/index.js --test-production
  `);
  }
  
  module.exports = { showHelp };
  