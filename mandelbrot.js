// mandelbrot.js - Core Mandelbrot set calculations

function mandelbrotIterations(x0, y0, maxIter) {
    let x = 0, y = 0, x2 = 0, y2 = 0;
    let iter = 0;
    
    while (x2 + y2 <= 256 && iter < maxIter) {
      y = 2 * x * y + y0;
      x = x2 - y2 + x0;
      x2 = x * x;
      y2 = y * y;
      iter++;
    }
    
    if (iter === maxIter) return { iter, smooth: maxIter, inSet: true };
    
    const log_zn = Math.log(x2 + y2) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    const smoothIter = iter + 1 - nu;
    
    return { iter, smooth: smoothIter, inSet: false };
  }
  
  function findBestBoundaryPoint(cx, cy, searchRadius, samples = 40, maxIter = 256, minComplexity = 15) {
    let bestX = cx, bestY = cy, maxComplexity = 0;
    let foundGoodSpot = false;
    
    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const x = cx + (sx / samples - 0.5) * searchRadius * 2;
        const y = cy + (sy / samples - 0.5) * searchRadius * 2;
        
        const center = mandelbrotIterations(x, y, maxIter);
        
        if (center.inSet || center.iter < 8) continue;
        
        const delta = searchRadius / samples;
        const right = mandelbrotIterations(x + delta, y, maxIter);
        const down = mandelbrotIterations(x, y + delta, maxIter);
        
        const complexity = Math.abs(center.iter - right.iter) + 
                          Math.abs(center.iter - down.iter);
        
        if (complexity > minComplexity) {
          foundGoodSpot = true;
          if (complexity > maxComplexity) {
            maxComplexity = complexity;
            bestX = x;
            bestY = y;
          }
        }
      }
    }
    
    return { x: bestX, y: bestY, complexity: maxComplexity, foundGood: foundGoodSpot };
  }
  
  module.exports = {
    mandelbrotIterations,
    findBestBoundaryPoint
  };