// rendering/adaptiveRenderer.js
// Adaptive rendering system that only calculates full detail where needed
// Optimized for expensive iteration functions (complex powers)

const { createCanvas } = require('canvas');

/**
 * Phase 1: Sparse sampling - calculate every Nth pixel
 */
function sparseSample(width, height, centerX, centerY, zoom, maxIter, iterateFn, step) {
  const size = 3.5 / zoom;
  const xMin = centerX - size;
  const yMin = centerY - size;
  const xMax = centerX + size;
  const yMax = centerY + size;

  const sparseWidth = Math.ceil(width / step);
  const sparseHeight = Math.ceil(height / step);
  const samples = new Float32Array(sparseWidth * sparseHeight);

  for (let sy = 0; sy < sparseHeight; sy++) {
    const py = Math.min(sy * step, height - 1);
    const y0 = yMin + (yMax - yMin) * (py / height);

    for (let sx = 0; sx < sparseWidth; sx++) {
      const px = Math.min(sx * step, width - 1);
      const x0 = xMin + (xMax - xMin) * (px / width);

      const result = iterateFn(x0, y0, maxIter);
      samples[sy * sparseWidth + sx] = result.smooth;
    }
  }

  return { samples, sparseWidth, sparseHeight };
}

/**
 * Phase 2: Classify tiles - ONLY mark solid maxIter regions
 */
function classifyTiles(sparseData, width, height, sparseStep, tileSize, maxIter) {
  const { samples, sparseWidth, sparseHeight } = sparseData;
  const tilesX = Math.ceil(width / tileSize);
  const tilesY = Math.ceil(height / tileSize);
  const tiles = [];

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const tileX = tx * tileSize;
      const tileY = ty * tileSize;
      const tileW = Math.min(tileSize, width - tileX);
      const tileH = Math.min(tileSize, height - tileY);

      // Get sparse samples within this tile
      const tileSamples = [];
      const sparseTileX = Math.floor(tileX / sparseStep);
      const sparseTileY = Math.floor(tileY / sparseStep);
      const sparseTileW = Math.ceil(tileW / sparseStep);
      const sparseTileH = Math.ceil(tileH / sparseStep);

      for (let sy = sparseTileY; sy < sparseTileY + sparseTileH && sy < sparseHeight; sy++) {
        for (let sx = sparseTileX; sx < sparseTileX + sparseTileW && sx < sparseWidth; sx++) {
          tileSamples.push(samples[sy * sparseWidth + sx]);
        }
      }

      if (tileSamples.length === 0) {
        tiles.push({ x: tileX, y: tileY, w: tileW, h: tileH, type: 'CALCULATE' });
        continue;
      }

      // ONLY mark as SOLID_SET if ALL samples are maxIter
      const allMaxIter = tileSamples.every(s => s >= maxIter - 0.1);

      if (allMaxIter) {
        tiles.push({ x: tileX, y: tileY, w: tileW, h: tileH, type: 'SOLID_SET_CANDIDATE' });
      } else {
        tiles.push({ x: tileX, y: tileY, w: tileW, h: tileH, type: 'CALCULATE' });
      }
    }
  }

  return tiles;
}

/**
 * Phase 2b: Verify SOLID_SET candidates with random sampling
 */
function verifySolidTiles(tiles, width, height, centerX, centerY, zoom, maxIter, iterateFn) {
  const size = 3.5 / zoom;
  const xMin = centerX - size;
  const yMin = centerY - size;
  const xMax = centerX + size;
  const yMax = centerY + size;

  const candidates = tiles.filter(t => t.type === 'SOLID_SET_CANDIDATE');
  const verifyCount = 8; // Random pixels to check per tile

  let verified = 0;
  let rejected = 0;

  for (const tile of candidates) {
    let allMaxIter = true;

    // Check random pixels within the tile
    for (let i = 0; i < verifyCount; i++) {
      const px = tile.x + Math.floor(Math.random() * tile.w);
      const py = tile.y + Math.floor(Math.random() * tile.h);

      const x0 = xMin + (xMax - xMin) * (px / width);
      const y0 = yMin + (yMax - yMin) * (py / height);

      const result = iterateFn(x0, y0, maxIter);
      if (result.smooth < maxIter - 0.1) {
        allMaxIter = false;
        break;
      }
    }

    if (allMaxIter) {
      tile.type = 'SOLID_SET';
      verified++;
    } else {
      tile.type = 'CALCULATE';
      rejected++;
    }
  }

  return { verified, rejected };
}

/**
 * Phase 3a: Fill confirmed solid set tiles (all maxIter)
 */
function fillSolidTile(iterData, width, tile, maxIter) {
  for (let y = tile.y; y < tile.y + tile.h; y++) {
    for (let x = tile.x; x < tile.x + tile.w; x++) {
      iterData[y * width + x] = maxIter;
    }
  }
}

/**
 * Phase 3b: Calculate tiles in full detail
 */
function calculateTileFull(iterData, width, height, tile, centerX, centerY, zoom, maxIter, iterateFn) {
  const size = 3.5 / zoom;
  const xMin = centerX - size;
  const yMin = centerY - size;
  const xMax = centerX + size;
  const yMax = centerY + size;

  for (let y = tile.y; y < tile.y + tile.h; y++) {
    const y0 = yMin + (yMax - yMin) * (y / height);

    for (let x = tile.x; x < tile.x + tile.w; x++) {
      const x0 = xMin + (xMax - xMin) * (x / width);

      const result = iterateFn(x0, y0, maxIter);
      iterData[y * width + x] = result.smooth;
    }
  }
}

/**
 * Phase 4: Apply palette to iteration data
 * (Adapted from existing renderer)
 */
function applyPalette(iterData, imageData, width, height, palette, maxIter, renderConfig) {
  const colorSmoothing = renderConfig?.colorSmoothing || {};
  const antiGrain = renderConfig?.antiGrain || {};
  const paletteMapping = renderConfig?.paletteMapping || {};

  // Build CDF for histogram normalization
  const histogram = new Array(maxIter + 1).fill(0);
  for (let i = 0; i < iterData.length; i++) {
    const iter = Math.floor(iterData[i]);
    if (iter < maxIter) {
      histogram[iter]++;
    }
  }

  const cdf = new Array(maxIter + 1).fill(0);
  let total = 0;
  for (let i = 0; i < maxIter; i++) {
    total += histogram[i];
    cdf[i] = total;
  }

  const totalEscaped = total;

  // Apply colors
  for (let i = 0; i < iterData.length; i++) {
    const smoothIter = iterData[i];
    const iter = Math.floor(smoothIter);

    if (iter >= maxIter) {
      // In set - black
      imageData.data[i * 4] = 0;
      imageData.data[i * 4 + 1] = 0;
      imageData.data[i * 4 + 2] = 0;
      imageData.data[i * 4 + 3] = 255;
      continue;
    }

    // CDF normalization
    const normalized = totalEscaped > 0 ? cdf[iter] / totalEscaped : 0;

    // Color smoothing
    let colorIndex = normalized * palette.colors.length;
    if (colorSmoothing.enabled) {
      const brightness = colorSmoothing.brightness || {};
      const base = brightness.base || 0.8;
      const amplitude = brightness.amplitude || 0.6;
      const frequency = brightness.frequency || 0.05;
      const wave = base + amplitude * Math.sin(smoothIter * frequency);
      colorIndex *= wave;
    }

    // Map to palette
    const cycleMode = paletteMapping.cycleMode || 'modulo';
    let paletteIndex;
    if (cycleMode === 'modulo') {
      paletteIndex = Math.floor(colorIndex) % palette.colors.length;
    } else {
      paletteIndex = Math.min(Math.floor(colorIndex), palette.colors.length - 1);
    }

    const color = palette.colors[paletteIndex];

    // Anti-grain blending
    if (antiGrain.enabled && iter > 0) {
      const prevColor = palette.colors[(paletteIndex - 1 + palette.colors.length) % palette.colors.length];
      const blend = antiGrain.blendFactor || 0.45;
      const frac = smoothIter - iter;

      imageData.data[i * 4] = color[0] * (1 - frac * blend) + prevColor[0] * (frac * blend);
      imageData.data[i * 4 + 1] = color[1] * (1 - frac * blend) + prevColor[1] * (frac * blend);
      imageData.data[i * 4 + 2] = color[2] * (1 - frac * blend) + prevColor[2] * (frac * blend);
    } else {
      imageData.data[i * 4] = color[0];
      imageData.data[i * 4 + 1] = color[1];
      imageData.data[i * 4 + 2] = color[2];
    }

    imageData.data[i * 4 + 3] = 255;
  }
}

/**
 * Main adaptive render function
 */
function adaptiveRenderFractal(
  width,
  height,
  centerX,
  centerY,
  zoom,
  palette,
  maxIter,
  renderConfig,
  iterateFn
) {
  const sparseStep = 4; // Sample every 4th pixel (1/16 of total)
  const tileSize = 32; // 32×32 tiles
  const totalPixels = width * height;

  console.log(`\n🔬 Adaptive rendering ${width}×${height} (${totalPixels.toLocaleString()} pixels)...`);

  // Phase 1: Sparse sampling
  const startSparse = Date.now();
  const sparseSamples = Math.ceil(width / sparseStep) * Math.ceil(height / sparseStep);
  console.log(`  Phase 1: Sparse sampling (${sparseSamples.toLocaleString()} pixels, ${(sparseSamples / totalPixels * 100).toFixed(1)}%)...`);
  const sparseData = sparseSample(width, height, centerX, centerY, zoom, maxIter, iterateFn, sparseStep);
  console.log(`    ✓ ${Date.now() - startSparse}ms`);

  // Phase 2a: Classify tiles
  const startClassify = Date.now();
  console.log(`  Phase 2: Classifying ${tileSize}×${tileSize} tiles...`);
  const tiles = classifyTiles(sparseData, width, height, sparseStep, tileSize, maxIter);
  const candidateCount = tiles.filter(t => t.type === 'SOLID_SET_CANDIDATE').length;
  console.log(`    Found ${candidateCount} solid set candidates`);

  // Phase 2b: Verify candidates
  console.log(`  Phase 2b: Verifying candidates with random sampling...`);
  const { verified, rejected } = verifySolidTiles(tiles, width, height, centerX, centerY, zoom, maxIter, iterateFn);
  console.log(`    ✓ ${verified} confirmed solid, ${rejected} rejected (${Date.now() - startClassify}ms)`);

  const solidCount = tiles.filter(t => t.type === 'SOLID_SET').length;
  const calculateCount = tiles.filter(t => t.type === 'CALCULATE').length;

  // Calculate pixel savings
  const solidPixels = tiles.filter(t => t.type === 'SOLID_SET').reduce((sum, t) => sum + t.w * t.h, 0);
  const calculatePixels = totalPixels - solidPixels;
  const skipPercentage = (solidPixels / totalPixels * 100).toFixed(1);

  console.log(`\n  📊 Optimization summary:`);
  console.log(`    Solid tiles: ${solidCount} (${solidPixels.toLocaleString()} pixels, ${skipPercentage}% skip)`);
  console.log(`    Calculate tiles: ${calculateCount} (${calculatePixels.toLocaleString()} pixels)`);

  // Phase 3: Build full iteration data
  const startRender = Date.now();
  console.log(`\n  Phase 3: Rendering tiles...`);
  const iterData = new Float32Array(width * height);

  let processedTiles = 0;
  const totalTiles = tiles.length;
  let lastProgress = 0;

  for (const tile of tiles) {
    if (tile.type === 'SOLID_SET') {
      fillSolidTile(iterData, width, tile, maxIter);
    } else {
      calculateTileFull(iterData, width, height, tile, centerX, centerY, zoom, maxIter, iterateFn);
    }

    processedTiles++;
    const progress = Math.floor((processedTiles / totalTiles) * 100);
    if (progress >= lastProgress + 10) {
      process.stdout.write(`\r    Progress: ${progress}%`);
      lastProgress = progress;
    }
  }
  console.log(`\r    ✓ Complete in ${Date.now() - startRender}ms`);

  // Phase 4: Color mapping
  const startColor = Date.now();
  console.log(`  Phase 4: Applying palette...`);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);

  applyPalette(iterData, imageData, width, height, palette, maxIter, renderConfig);
  ctx.putImageData(imageData, 0, 0);
  console.log(`    ✓ ${Date.now() - startColor}ms\n`);

  return { canvas, imageData };
}

module.exports = {
  adaptiveRenderFractal
};
