// quality.js - Image quality analysis

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
  
  module.exports = {
    analyzeImageQuality
  };