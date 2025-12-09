// quality.js - Image quality analysis
const { mandelbrotIterations } = require('./mandelbrot');

function analyzeImageQuality(imageData, width, height, qualityConfig) {
    const pixels = width * height;
    const colorBuckets = new Array(256).fill(0);
    let nonBlackPixels = 0;
    
    const startRow = Math.floor(height / 3);
    const endRow = Math.floor((2 * height) / 3);
    
    for (let py = startRow; py < endRow; py++) {
      for (let px = 0; px < width; px++) {
        const i = (py * width + px) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        
        const brightness = (r + g + b) / 3;
        colorBuckets[Math.floor(brightness)]++;
        
        if (brightness > 15) {
          nonBlackPixels++;
        }
      }
    }
    
    const centralPixels = (endRow - startRow) * width;
  
    // Calculate color diversity (how spread out the colors are)
    const usedBuckets = colorBuckets.filter(count => count > centralPixels * 0.001).length;
    const colorDiversity = usedBuckets / 256;
    
    // Calculate visible pixel ratio
    const visibleRatio = nonBlackPixels / centralPixels;
    
    return {
      colorDiversity,
      visibleRatio,
      usedBuckets,
      passes: colorDiversity >= qualityConfig.minColorDiversity && 
              visibleRatio >= qualityConfig.minVisiblePixels
    };
  }
  
  function sampleFractalForQuality(centerX, centerY, zoom, maxIter, config, palette) {
    const sampleW = 32;
    const sampleH = 18;
  
    const size = 3.5 / zoom;
    const xMin = centerX - size;
    const yMin = centerY - size;
    const xMax = centerX + size;
    const yMax = centerY + size;
  
    let escaped = 0;
    let smoothMin = Infinity;
    let smoothMax = -Infinity;
    let maxIterHits = 0;
  
    for (let sy = 0; sy < sampleH; sy++) {
      const y0 = yMin + (yMax - yMin) * (sy / sampleH);
  
      for (let sx = 0; sx < sampleW; sx++) {
        const x0 = xMin + (xMax - xMin) * (sx / sampleW);
  
        const result = mandelbrotIterations(x0, y0, maxIter);
  
        if (result.inSet) {
          maxIterHits++;
          continue;
        }
  
        escaped++;
  
        // track smooth value range
        if (result.smooth < smoothMin) smoothMin = result.smooth;
        if (result.smooth > smoothMax) smoothMax = result.smooth;
      }
    }
  
    const total = sampleW * sampleH;
    const visibleRatio = escaped / total;
    const maxIterRatio = maxIterHits / total;
  
    // Estimate color diversity using smooth range
    let colorSpread = 0;
    if (smoothMin !== Infinity) {
      colorSpread = (smoothMax - smoothMin) / maxIter;
    }
  
    return {
      passes:
        visibleRatio >= config.qualityControl.minVisiblePixels,
        // colorSpread >= config.qualityControl.minColorDiversity,
  
      visibleRatio,
      maxIterRatio,
      colorSpread
    };
  }

  module.exports = {
    analyzeImageQuality,
    sampleFractalForQuality
  };