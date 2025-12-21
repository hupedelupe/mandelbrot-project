// dynamicFraming.js
// Finds best crops for multiple aspect ratios from a large render

const { createCanvas } = require('canvas');
const { analyzeImageQuality } = require('../core/quality');
const { renderFractal } = require('../core/renderer');

/* ================================
   Rectangle overlap utilities
================================ */

function calculateRectOverlap(rect1, rect2) {
  const x1 = Math.max(rect1.x, rect2.x);
  const y1 = Math.max(rect1.y, rect2.y);
  const x2 = Math.min(rect1.x + rect1.w, rect2.x + rect2.w);
  const y2 = Math.min(rect1.y + rect1.h, rect2.y + rect2.h);

  if (x2 <= x1 || y2 <= y1) {
    return null; // No overlap
  }

  return {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1
  };
}

/* ================================
   Fractal coordinate conversion
================================ */

function calculateCropFractalCoords(crop, scanWidth, scanHeight, centerX, centerY, zoom) {
  // Calculate the fractal region shown in the scan image
  // Scan is always square, so size is the same in X and Y
  const size = 3.5 / zoom;
  const scanXMin = centerX - size;
  const scanYMin = centerY - size;
  const scanXMax = centerX + size;
  const scanYMax = centerY + size;

  // Calculate the fractal bounds of the crop region
  const cropXMin = scanXMin + (scanXMax - scanXMin) * (crop.x / scanWidth);
  const cropXMax = scanXMin + (scanXMax - scanXMin) * ((crop.x + crop.w) / scanWidth);
  const cropYMin = scanYMin + (scanYMax - scanYMin) * (crop.y / scanHeight);
  const cropYMax = scanYMin + (scanYMax - scanYMin) * ((crop.y + crop.h) / scanHeight);

  // Calculate center of crop region
  const cropCenterX = (cropXMin + cropXMax) / 2;
  const cropCenterY = (cropYMin + cropYMax) / 2;

  // Calculate the size of the crop region
  // Use the larger dimension to ensure full region fits (renderer handles aspect ratio)
  const cropWidth = cropXMax - cropXMin;
  const cropHeight = cropYMax - cropYMin;
  const cropSize = Math.max(cropWidth, cropHeight);
  const cropZoom = 3.5 / cropSize;

  return {
    centerX: cropCenterX,
    centerY: cropCenterY,
    zoom: cropZoom
  };
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

      // Extract crop region for quality analysis
      const cropped = new Uint8ClampedArray(targetW * targetH * 4);
      for (let cy = 0; cy < targetH; cy++) {
        for (let cx = 0; cx < targetW; cx++) {
          const srcIdx = ((y + cy) * imgW + (x + cx)) * 4;
          const dstIdx = (cy * targetW + cx) * 4;
          cropped[dstIdx] = imageData.data[srcIdx];
          cropped[dstIdx + 1] = imageData.data[srcIdx + 1];
          cropped[dstIdx + 2] = imageData.data[srcIdx + 2];
          cropped[dstIdx + 3] = 255;
        }
      }

      const quality = analyzeImageQuality(
        { data: cropped },
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
          w: targetW,
          h: targetH,
          score: weightedScore,
          quality
        };
      }
    }
  }

  return bestCrop;
}

/* ================================
   MAIN ENTRY POINT
================================ */

function generateDeviceCrops({
    imageData,
    width,
    height,
    qualityConfig,
    metadata
  }) {
    // Extract fractal parameters from metadata
    const { centerX, centerY, zoom, maxIter, paletteObject, iterateFn, renderConfig } = metadata;

    // Define device targets
    const targets = [
      {
        name: 'desktop',
        aspectWidth: 16,
        aspectHeight: 9,
        outWidth: 4096,
        outHeight: 2304
      },
      {
        name: 'mobile',
        aspectWidth: 9,
        aspectHeight: 16,
        outWidth: 2304,
        outHeight: 4096
      }
    ];

    console.log(`\n📐 Finding best crops for both devices...`);

    // PHASE 1: Find best crops for both devices
    const crops = [];
    for (const target of targets) {
      console.log(`  Finding best ${target.name} crop (${target.aspectWidth}:${target.aspectHeight})...`);

      let cropW, cropH;
      const targetAspect = target.aspectWidth / target.aspectHeight;
      const imageAspect = width / height;

      if (imageAspect > targetAspect) {
        cropH = height;
        cropW = Math.floor(height * targetAspect);
      } else {
        cropW = width;
        cropH = Math.floor(width / targetAspect);
      }

      const crop = findBestCropForAspect(imageData, width, height, cropW, cropH, qualityConfig);

      if (!crop) {
        console.error(`❌ ERROR: No crop found for ${target.name}`);
        return [];
      }

      console.log(`    ✓ ${target.name} at (${crop.x}, ${crop.y}) ${crop.w}×${crop.h}, score ${crop.score.toFixed(3)}`);

      crops.push({ target, crop });
    }

    // PHASE 2: Calculate overlap between crops
    const desktopCrop = crops[0].crop;
    const mobileCrop = crops[1].crop;
    const overlap = calculateRectOverlap(desktopCrop, mobileCrop);

    if (overlap) {
      const overlapPixels = overlap.w * overlap.h;
      const desktopPixels = desktopCrop.w * desktopCrop.h;
      const mobilePixels = mobileCrop.w * mobileCrop.h;
      const overlapPctDesktop = (overlapPixels / desktopPixels * 100).toFixed(1);
      const overlapPctMobile = (overlapPixels / mobilePixels * 100).toFixed(1);

      console.log(`\n🔗 Crop overlap detected:`);
      console.log(`    Overlap region: ${overlap.w}×${overlap.h} (${overlapPixels.toLocaleString()} pixels)`);
      console.log(`    ${overlapPctDesktop}% of desktop, ${overlapPctMobile}% of mobile`);
    } else {
      console.log(`\n⚠️  No overlap between crops - rendering separately`);
    }

    // PHASE 3: Render with overlap optimization
    const results = [];

    for (let i = 0; i < crops.length; i++) {
      const { target, crop } = crops[i];

      const cropCoords = calculateCropFractalCoords(crop, width, height, centerX, centerY, zoom);

      console.log(`\n  Rendering ${target.name} at ${target.outWidth}×${target.outHeight}...`);

      const { canvas } = renderFractal(
        target.outWidth,
        target.outHeight,
        cropCoords.centerX,
        cropCoords.centerY,
        cropCoords.zoom,
        paletteObject,
        maxIter,
        renderConfig,
        iterateFn
      );

      console.log(`    ✓ ${target.name} complete`);

      results.push({
        name: target.name,
        canvas,
        crop,
        fractalCoords: cropCoords,
        output: {
          width: target.outWidth,
          height: target.outHeight
        }
      });
    }

    return results;
  }
  

module.exports = {
  generateDeviceCrops
};