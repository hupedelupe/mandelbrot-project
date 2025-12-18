// renderer-enhanced.js - Enhanced fractal rendering with anti-grain and smoothing

const { createCanvas } = require('canvas');
const { getColorFromPalette } = require('../data/palettes');

function getColorWithSmoothing(normalized, palette, smoothIter, renderConfig) {
  const baseColor = getColorFromPalette(normalized, palette);
  
  if (!renderConfig.colorSmoothing || !renderConfig.colorSmoothing.enabled) {
    return baseColor;
  }
  
  const { base, amplitude, frequency } = renderConfig.colorSmoothing.brightness;
  const brightness = base + amplitude * Math.sin(smoothIter * frequency);
  
  return [
    Math.min(255, Math.round(baseColor[0] * brightness)),
    Math.min(255, Math.round(baseColor[1] * brightness)),
    Math.min(255, Math.round(baseColor[2] * brightness))
  ];
}

function applyAntiGrain(imageData, width, height, blendFactor) {
  // Create a copy of the data
  const original = new Uint8ClampedArray(imageData.data);
  
  for (let py = 1; py < height - 1; py++) {
    for (let px = 1; px < width - 1; px++) {
      const idx = (py * width + px) * 4;
      
      // Get neighboring pixels
      const neighbors = [
        (py * width + (px - 1)) * 4,     // left
        (py * width + (px + 1)) * 4,     // right
        ((py - 1) * width + px) * 4,     // up
        ((py + 1) * width + px) * 4,     // down
      ];
      
      // Average with neighbors
      for (let c = 0; c < 3; c++) {
        let sum = original[idx + c] * (1 - blendFactor);
        neighbors.forEach(nIdx => {
          sum += original[nIdx + c] * (blendFactor / 4);
        });
        imageData.data[idx + c] = Math.round(sum);
      }
    }
  }
}

// ============================================================================
// RENDER FRACTAL WITH CDF NORMALIZATION
// ============================================================================
// Two-pass rendering for optimal color distribution:
// Pass 1: Calculate all iteration values and build histogram
// Pass 2: Render with CDF-normalized colors for better visual distribution
//
// CDF (Cumulative Distribution Function) normalization ensures colors are
// evenly distributed across the visible range, preventing banding and
// improving detail visibility in both dense and sparse regions.
function renderFractal(width, height, centerX, centerY, zoom, palette, maxIter, renderConfig, iterateFn) {

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Store smooth iteration values for histogram analysis
  const smoothValues = new Float64Array(width * height);
  let index = 0;

  // Handle aspect ratio to avoid stretching
  const aspectRatio = width / height;
  const baseSize = 3.5 / zoom;

  let xSize, ySize;
  if (aspectRatio > 1) {
    // Landscape: expand X range
    ySize = baseSize;
    xSize = baseSize * aspectRatio;
  } else {
    // Portrait or square: expand Y range
    xSize = baseSize;
    ySize = baseSize / aspectRatio;
  }

  const xMin = centerX - xSize;
  const yMin = centerY - ySize;
  const xMax = centerX + xSize;
  const yMax = centerY + ySize;

  // ============================================================================
  // PASS 1: Collect smooth iteration values for all pixels
  // ============================================================================
  for (let py = 0; py < height; py++) {
    const y0 = yMin + (yMax - yMin) * py / height;

    for (let px = 0; px < width; px++) {
      const x0 = xMin + (xMax - xMin) * px / width;
      const result = iterateFn(x0, y0, maxIter);

      // Store smooth iteration value (-1 for pixels in the set)
      smoothValues[index++] = result.inSet ? -1 : result.smooth;
    }
  }

  // ============================================================================
  // BUILD CDF: Analyze iteration distribution for color normalization
  // ============================================================================
  // Creates a cumulative distribution function to map iteration values to
  // normalized 0-1 range. This ensures colors are evenly distributed across
  // the visible detail, regardless of the iteration distribution.
  function buildCDF(values, maxIter) {
    // High-resolution histogram for smooth color gradients
    const HIST_SIZE = maxIter * 100;

    const histogram = new Float64Array(HIST_SIZE);
    const count = values.length;

    // Build histogram, ignoring in-set pixels (-1)
    for (let i = 0; i < count; i++) {
      const v = values[i];
      if (v >= 0) {
        const bin = Math.min(HIST_SIZE - 1, Math.floor((v / maxIter) * (HIST_SIZE - 1)));
        histogram[bin]++;
      }
    }

    // Convert to cumulative histogram
    const cdf = new Float64Array(HIST_SIZE);
    let cumulative = 0;
    for (let i = 0; i < HIST_SIZE; i++) {
      cumulative += histogram[i];
      cdf[i] = cumulative;
    }

    // Normalize CDF to 0–1
    for (let i = 0; i < HIST_SIZE; i++) {
      cdf[i] /= cumulative;
    }

    return cdf;
  }

  // Build the CDF from collected iteration values
  const cdf = buildCDF(smoothValues, maxIter);

  // Map smooth iteration values to normalized color range using CDF
  function normalizeViaCDF(smooth, maxIter, cdf) {
    const HIST_SIZE = cdf.length;
    const bin = Math.min(HIST_SIZE - 1, Math.floor((smooth / maxIter) * (HIST_SIZE - 1)));
    return cdf[bin];
  }

  // ============================================================================
  // PASS 2: Render with CDF-normalized colors
  // ============================================================================
  const imageData = ctx.createImageData(width, height);
  index = 0;
  let svIndex = 0;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {

      const smooth = smoothValues[svIndex++];
      let color;

      if (smooth < 0) {
        // in-set pixel
        color = [0, 0, 5];
      } else {
        // CDF-normalized value
        let normalized = normalizeViaCDF(smooth, maxIter, cdf);

        // Keep your palette cycle-mode behavior
        switch (renderConfig.paletteMapping.cycleMode) {
          case 'clamp':
            normalized = Math.min(1, normalized);
            break;

          case 'reflect':
            const t = normalized % 2;
            normalized = t > 1 ? 2 - t : t;
            break;

          case 'modulo':
          default:
            normalized = normalized % 1;
            break;
        }

        color = getColorWithSmoothing(
          normalized,
          palette,
          smooth,
          renderConfig
        );
      }

      imageData.data[index++] = color[0];
      imageData.data[index++] = color[1];
      imageData.data[index++] = color[2];
      imageData.data[index++] = 255;
    }
  }

  // Anti-grain (unchanged)
  if (renderConfig.antiGrain && renderConfig.antiGrain.enabled) {
    applyAntiGrain(imageData, width, height, renderConfig.antiGrain.blendFactor);
  }

  ctx.putImageData(imageData, 0, 0);
  return { canvas, imageData };
}


module.exports = {
  renderFractal
};