#!/usr/bin/env node
// explore-complex-powers.js - Interactive exploration of fractals with complex powers

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const { getColorFromPalette, getPaletteByName } = require('./src/data/palettes');
const { iterate } = require('./src/fractals/mandelbrotComplexPower');

// Load configuration
const configPath = path.join(__dirname, 'config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Load palettes module
const palettesModule = require('./src/data/palettes');

function saveFractal(canvas, outputDir, filename) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, `${filename}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

function generateComplexPowerFractal({
  powerReal,
  powerImag,
  centerX = -0.5,
  centerY = 0,
  width = 3.0,
  maxIter = 1000,
  resolution = 2048,
  paletteName = 'Sunset'
}) {
  console.log(`\nGenerating fractal with power = ${powerReal} + ${powerImag}i`);
  console.log(`  Center: (${centerX}, ${centerY})`);
  console.log(`  Width: ${width}`);
  console.log(`  Max iterations: ${maxIter}`);
  console.log(`  Resolution: ${resolution}×${resolution}`);
  console.log(`  Palette: ${paletteName}`);

  const canvas = createCanvas(resolution, resolution);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(resolution, resolution);
  const data = imageData.data;

  const palette = getPaletteByName(paletteName) || getPaletteByName('Tropical_Sunset');
  const height = width; // Square aspect ratio

  // Calculate bounds
  const xMin = centerX - width / 2;
  const xMax = centerX + width / 2;
  const yMin = centerY - height / 2;
  const yMax = centerY + height / 2;

  let minIter = Infinity;
  let maxIterNotInSet = -Infinity;

  // First pass: compute iterations
  const iterations = new Array(resolution * resolution);

  for (let py = 0; py < resolution; py++) {
    for (let px = 0; px < resolution; px++) {
      const x0 = xMin + (px / resolution) * width;
      const y0 = yMin + (py / resolution) * height;

      const result = iterate(x0, y0, maxIter, powerReal, powerImag);
      const idx = py * resolution + px;
      iterations[idx] = result;

      if (!result.inSet) {
        minIter = Math.min(minIter, result.smooth);
        maxIterNotInSet = Math.max(maxIterNotInSet, result.smooth);
      }
    }
  }

  // Normalize and render
  for (let py = 0; py < resolution; py++) {
    for (let px = 0; px < resolution; px++) {
      const idx = py * resolution + px;
      const result = iterations[idx];
      const dataIdx = idx * 4;

      if (result.inSet) {
        data[dataIdx] = 0;
        data[dataIdx + 1] = 0;
        data[dataIdx + 2] = 0;
        data[dataIdx + 3] = 255;
      } else {
        const normalized = (result.smooth - minIter) / (maxIterNotInSet - minIter);
        const color = getColorFromPalette(normalized, palette);
        data[dataIdx] = color[0];
        data[dataIdx + 1] = color[1];
        data[dataIdx + 2] = color[2];
        data[dataIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return {
    canvas,
    metadata: {
      powerReal,
      powerImag,
      centerX,
      centerY,
      width,
      maxIter,
      resolution,
      palette: paletteName
    }
  };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const powerRealArg = args.find(arg => arg.startsWith('--power-real='))?.split('=')[1];
  const powerImagArg = args.find(arg => arg.startsWith('--power-imag='))?.split('=')[1];
  const centerXArg = args.find(arg => arg.startsWith('--center-x='))?.split('=')[1];
  const centerYArg = args.find(arg => arg.startsWith('--center-y='))?.split('=')[1];
  const widthArg = args.find(arg => arg.startsWith('--width='))?.split('=')[1];
  const maxIterArg = args.find(arg => arg.startsWith('--max-iter='))?.split('=')[1];
  const resolutionArg = args.find(arg => arg.startsWith('--resolution='))?.split('=')[1];
  const paletteArg = args.find(arg => arg.startsWith('--palette='))?.split('=')[1];
  const randomMode = args.includes('--random');
  const countArg = args.find(arg => arg.startsWith('--count='))?.split('=')[1];
  const count = countArg ? parseInt(countArg, 10) : 1;
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Complex Power Fractal Explorer

Explore Mandelbrot-like fractals with arbitrary complex powers: z = z^(p_real + i*p_imag) + c

Usage:
  node explore-complex-powers.js [options]

Options:
  --power-real=N      Real part of the power (default: 2)
  --power-imag=N      Imaginary part of the power (default: 0)
  --center-x=N        X coordinate of center (default: -0.5)
  --center-y=N        Y coordinate of center (default: 0)
  --width=N           Width of viewing region (default: 3.0)
  --max-iter=N        Maximum iterations (default: 1000)
  --resolution=N      Image resolution (default: 2048)
  --palette=NAME      Color palette name (default: Tropical_Sunset)
  --random            Generate with random complex power
  --count=N           Generate N fractals with random powers (default: 1)
  --help, -h          Show this help

Examples:
  # Classic Mandelbrot (power = 2 + 0i)
  node explore-complex-powers.js --power-real=2 --power-imag=0

  # Mandelbrot cubed (power = 3 + 0i)
  node explore-complex-powers.js --power-real=3 --power-imag=0

  # Complex power with imaginary component
  node explore-complex-powers.js --power-real=2.5 --power-imag=0.5

  # Random exploration
  node explore-complex-powers.js --random --count=10

  # Zoom into specific region with complex power
  node explore-complex-powers.js --power-real=2.3 --power-imag=0.7 \\
    --center-x=-0.5 --center-y=0.6 --width=0.5 --max-iter=2000

  # Explore with different palette
  node explore-complex-powers.js --random --palette=Ocean_Depths --resolution=4096

Available palettes: ${palettesModule.colorPalettes.map(p => p.name).join(', ')}
    `);
    process.exit(0);
  }

  const outputDir = './complex-power-explorations';
  console.log(`\nComplex Power Fractal Explorer`);
  console.log(`Output directory: ${outputDir}\n`);

  for (let i = 0; i < count; i++) {
    if (count > 1) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fractal ${i + 1} of ${count}`);
      console.log('='.repeat(60));
    }

    // Determine power
    let powerReal, powerImag;
    if (randomMode) {
      // Random complex power
      // Real part: typically between 1.5 and 4.0
      // Imaginary part: typically between -1.0 and 1.0
      powerReal = 1.5 + Math.random() * 2.5;
      powerImag = -1.0 + Math.random() * 2.0;
    } else {
      powerReal = powerRealArg ? parseFloat(powerRealArg) : 2.0;
      powerImag = powerImagArg ? parseFloat(powerImagArg) : 0.0;
    }

    // Other parameters
    const centerX = centerXArg ? parseFloat(centerXArg) : -0.5;
    const centerY = centerYArg ? parseFloat(centerYArg) : 0.0;
    const width = widthArg ? parseFloat(widthArg) : 3.0;
    const maxIter = maxIterArg ? parseInt(maxIterArg, 10) : 1000;
    const resolution = resolutionArg ? parseInt(resolutionArg, 10) : 2048;
    const paletteName = paletteArg || 'Tropical_Sunset';

    try {
      const result = generateComplexPowerFractal({
        powerReal,
        powerImag,
        centerX,
        centerY,
        width,
        maxIter,
        resolution,
        paletteName
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const powerStr = `p${powerReal.toFixed(2)}_${powerImag >= 0 ? 'p' : 'm'}${Math.abs(powerImag).toFixed(2)}i`;
      const filename = `fractal_${timestamp}_${powerStr}`;
      const filepath = saveFractal(result.canvas, outputDir, filename);

      console.log(`\n✓ Generation complete!`);
      console.log(`✓ Saved: ${filepath}`);
      console.log(`  Power: ${powerReal.toFixed(3)} + ${powerImag.toFixed(3)}i`);
      console.log(`  Center: (${centerX}, ${centerY})`);
      console.log(`  Width: ${width}`);
      console.log(`  Resolution: ${resolution}×${resolution}`);
      console.log(`  Palette: ${paletteName}`);

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
    console.log(`Exploration complete!`);
    console.log('='.repeat(60));
  }
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
