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
   Render & save cropped canvas
================================ */

function renderCroppedCanvas(
    imageData,
    srcWidth,
    srcHeight,
    crop,
    outWidth = crop.w,
    outHeight = crop.h
  ) {
    const srcCanvas = createCanvas(srcWidth, srcHeight);
    const srcCtx = srcCanvas.getContext('2d');
  
    // 🔑 Create REAL ImageData object
    const imgData = srcCtx.createImageData(srcWidth, srcHeight);
    imgData.data.set(imageData.data);
  
    srcCtx.putImageData(imgData, 0, 0);
  
    const outCanvas = createCanvas(outWidth, outHeight);
    const outCtx = outCanvas.getContext('2d');
  
    outCtx.drawImage(
      srcCanvas,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      outWidth,
      outHeight
    );
  
    return outCanvas;
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
    // Always crop from the FULL master image
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
  
    const results = [];
  
    for (const target of targets) {
      console.log(
        `Finding best ${target.name} crop (${target.aspectWidth}:${target.aspectHeight}) from ${width}×${height}...`
      );

      // Compute largest possible crop with this aspect
        // Compute largest possible crop with this aspect
        let cropW, cropH;
        const targetAspect = target.aspectWidth / target.aspectHeight;
        const imageAspect = width / height;

        if (imageAspect > targetAspect) {
        // Image is wider → height constrained
        cropH = height;
        cropW = Math.floor(height * targetAspect);
        } else {
        // Image is taller → width constrained
        cropW = width;
        cropH = Math.floor(width / targetAspect);
        }

        const crop = findBestCropForAspect(
        imageData,
        width,
        height,
        cropW,
        cropH,
        qualityConfig
        );

  
      if (!crop) {
        console.error(`❌ ERROR: No crop found for ${target.name} — this should not happen`);
        continue;
      }
  
      console.log(
        `✓ Found ${target.name} crop at (${crop.x}, ${crop.y}) ` +
        `size ${crop.w}×${crop.h}, score ${crop.score.toFixed(3)}`
      );
  
      // 🔑 Render from FULL resolution, then scale
      const canvas = renderCroppedCanvas(
        imageData,
        width,
        height,
        crop,
        target.outWidth,
        target.outHeight
      );
  
      results.push({
        name: target.name,
        canvas,
        crop,
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