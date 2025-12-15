// dynamicFraming.js
// Finds best crops for multiple aspect ratios from a large render

const { createCanvas } = require('canvas');
const { analyzeImageQuality } = require('./quality');

/* ================================
   Crop utilities
================================ */

function cropImageDataRect(imageData, imgW, imgH, x, y, w, h) {
  const cropped = new Uint8ClampedArray(w * h * 4);

  for (let cy = 0; cy < h; cy++) {
    for (let cx = 0; cx < w; cx++) {
      const srcIdx = ((y + cy) * imgW + (x + cx)) * 4;
      const dstIdx = (cy * w + cx) * 4;

      cropped[dstIdx]     = imageData.data[srcIdx];
      cropped[dstIdx + 1] = imageData.data[srcIdx + 1];
      cropped[dstIdx + 2] = imageData.data[srcIdx + 2];
      cropped[dstIdx + 3] = 255;
    }
  }

  return { data: cropped, width: w, height: h };
}

/* ================================
   Best crop finder (aspect-aware)
================================ */

function findBestCropForAspect(
  imageData,
  imgW,
  imgH,
  targetW,
  targetH,
  qualityConfig
) {
  const grid = 6; // higher = more precise, slower
  const stepX = Math.max(1, Math.floor((imgW - targetW) / (grid - 1)));
  const stepY = Math.max(1, Math.floor((imgH - targetH) / (grid - 1)));

  let bestScore = -Infinity;
  let bestCrop = null;

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const x = Math.min(Math.floor(gx * stepX), imgW - targetW);
      const y = Math.min(Math.floor(gy * stepY), imgH - targetH);

      const cropped = cropImageDataRect(
        imageData,
        imgW,
        imgH,
        x,
        y,
        targetW,
        targetH
      );

      const quality = analyzeImageQuality(
        { data: cropped.data },
        targetW,
        targetH,
        qualityConfig
      );

      // DON'T check quality.passes - just rank by score
      // The full image already passed, so we just want the BEST crop

      // Center bias (prefer spiral centers)
      const cx = (x + targetW / 2) / imgW - 0.5;
      const cy = (y + targetH / 2) / imgH - 0.5;
      const centerBias = 1 - Math.min(1, Math.sqrt(cx * cx + cy * cy));

      // Final score
      const score =
        quality.geometryScore * 0.45 +
        quality.edgeDensity * 0.30 +
        quality.spatialDistribution * 0.15 +
        quality.visibleRatio * 0.10;

      const weightedScore = score * (0.9 + 0.1 * centerBias);

      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestCrop = {
          x,
          y,
          width: targetW,
          height: targetH,
          score: weightedScore,
          quality
        };
      }
    }
  }

  return bestCrop;
}

/* ================================
   Render & save cropped canvas
================================ */

function renderCroppedCanvas(
  imageData,
  imgW,
  imgH,
  crop
) {
  const canvas = createCanvas(crop.width, crop.height);
  const ctx = canvas.getContext('2d');

  const cropped = cropImageDataRect(
    imageData,
    imgW,
    imgH,
    crop.x,
    crop.y,
    crop.width,
    crop.height
  );

  const imgData = ctx.createImageData(crop.width, crop.height);
  imgData.data.set(cropped.data);
  ctx.putImageData(imgData, 0, 0);

  return canvas;
}

/* ================================
   MAIN ENTRY POINT
================================ */

function generateDeviceCrops({
  imageData,
  width,
  height,
  qualityConfig
}) {
  const targets = [
    { name: 'desktop', width: 2560, height: 1440 }, // 16:9
    { name: 'mobile',  width: 1440, height: 2560 }  // 9:16
  ];

  const results = [];

  for (const target of targets) {
    console.log(`Finding best crop for ${target.name} (${target.width}×${target.height})...`);
    
    const crop = findBestCropForAspect(
      imageData,
      width,
      height,
      target.width,
      target.height,
      qualityConfig
    );

    if (!crop) {
      // This should NEVER happen since we removed the quality.passes check
      console.error(`❌ ERROR: No crop found for ${target.name} - this is a bug!`);
      continue;
    }

    console.log(`✓ Found crop for ${target.name} at (${crop.x}, ${crop.y}) with score ${crop.score.toFixed(3)}`);

    const canvas = renderCroppedCanvas(
      imageData,
      width,
      height,
      crop
    );

    results.push({
      name: target.name,
      canvas,
      crop
    });
  }

  if (results.length === 0) {
    throw new Error('Failed to generate any crops - this should never happen!');
  }

  return results;
}

module.exports = {
  generateDeviceCrops
};