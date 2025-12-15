// fractalZoomFocus.js
// Zooming with outer variance and inner deep-focus scoring
const { mandelbrotIterations } = require('./mandelbrot');

function zoomIntoFractal(
    initialX,
    initialY,
    initialZoom,
    zoomSteps = 5,
    searchSamples = 40,
    zoomMultMin = 1.5,
    zoomMultMax = 3.5,
    qualityConfig
  ) {
    let currentX = initialX;
    let currentY = initialY;
    let currentZoom = initialZoom;
  
    function randomWeights3() {
        // Pick two random numbers between 0 and 1
        const r1 = Math.random();
        const r2 = Math.random();
      
        // Sort them so we can slice the [0,1] interval
        const [s1, s2] = [r1, r2].sort((a, b) => a - b);
      
        // Slice the interval to get three weights that sum to 1
        const w1 = s1;
        const w2 = s2 - s1;
        const w3 = 1 - s2;
      
        return [w1, w2, w3];
      }

      const [complexityWeight, avgIterWeight, centerBiasWeight] = randomWeights3();
  
    log(`Zoom weights → complexity: ${complexityWeight.toFixed(2)}, avgIter: ${avgIterWeight.toFixed(2)}, centerBias: ${centerBiasWeight.toFixed(2)}`);
  
    // -----------------------------
    // Outer rough zoom pass
    // -----------------------------
    for (let step = 0; step < zoomSteps; step++) {
      const searchRadius = 2.0 / currentZoom;
  
      const boundary = findBestBoundaryPoint(
        currentX,
        currentY,
        searchRadius,
        searchSamples,
        256,
        qualityConfig.minComplexityScore,
        complexityWeight,
        avgIterWeight,
        centerBiasWeight
      );
  
      if (boundary.foundGood) {
        currentX = boundary.x;
        currentY = boundary.y;
        const zoomMult = zoomMultMin + Math.random() * (zoomMultMax - zoomMultMin);
        currentZoom *= zoomMult;
        log(`Step ${step + 1}: Complexity ${boundary.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}× (zoomMult: ${zoomMult.toFixed(2)}×)`);
      } else {
        log(`Step ${step + 1}: Low complexity - stopping`);
        break;
      }
    }
  
    // -----------------------------
    // Inner deep-focus refine zoom
    // -----------------------------
    for (let stepInner = 0; stepInner < Math.min(5, (zoomSteps * 2)); stepInner++) {
      const searchRadiusInner = Math.max(0.25 / currentZoom, 1e-6);
  
      const boundaryInner = findBestBoundaryPoint(
        currentX,
        currentY,
        searchRadiusInner,
        searchSamples * 2,
        512,
        qualityConfig.minComplexityScore,
        complexityWeight,
        avgIterWeight,
        centerBiasWeight
      );
  
      if (boundaryInner.foundGood && boundaryInner.complexity > qualityConfig.minComplexityScore) {
        currentX = boundaryInner.x;
        currentY = boundaryInner.y;
        const zoomMultInner = zoomMultMin + Math.random() * (zoomMultMax - zoomMultMin);
        currentZoom += zoomMultInner;
  
        if ((stepInner + 1) % 10 === 0) {
          log(`Deep focus step ${stepInner + 1}: Complexity ${boundaryInner.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}× (zoomMult: ${zoomMultInner.toFixed(2)}×)`);
        }
      } else {
        log(`Deep focus step ${stepInner + 1}: Low complexity - stopping`);
        break;
      }
    }
  
    return { x: currentX, y: currentY, zoom: currentZoom };
  }
  
  // -----------------------------
  // Boundary finder (multi-pass scoring)
  // -----------------------------
  function findBestBoundaryPoint(
    cx,
    cy,
    searchRadius,
    samples = 40,
    maxIter = 256,
    minComplexity = 15,
    complexityWeight = 0.7,
    avgIterWeight = 0.3,
    centerBiasWeight = 0.2
  ) {
    let bestX = cx,
        bestY = cy,
        maxScore = 0;
    let foundGoodSpot = false;
  
    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const x = cx + (sx / samples - 0.5) * searchRadius * 2;
        const y = cy + (sy / samples - 0.5) * searchRadius * 2;
  
        const center = mandelbrotIterations(x, y, maxIter);
        if (center.inSet || center.iter < 8) continue;
  
        const delta = searchRadius / samples;
  
        const neighbors = [
          mandelbrotIterations(x + delta, y, maxIter),
          mandelbrotIterations(x - delta, y, maxIter),
          mandelbrotIterations(x, y + delta, maxIter),
          mandelbrotIterations(x, y - delta, maxIter)
        ];
  
        const complexity = neighbors.reduce((acc, n) => acc + Math.abs(center.iter - n.iter), 0);
        if (complexity < minComplexity) continue;
  
        const avgIter = (center.iter + neighbors.reduce((a, n) => a + n.iter, 0)) / 5;
  
        const dx = (x - cx) / searchRadius;
        const dy = (y - cy) / searchRadius;
        const distanceFactor = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy));
  
        // Final multi-pass score
        const score =
          complexityWeight * complexity +
          avgIterWeight * avgIter +
          centerBiasWeight * distanceFactor;
  
        foundGoodSpot = true;
  
        if (score > maxScore) {
          maxScore = score;
          bestX = x;
          bestY = y;
        }
      }
    }
  
    return { x: bestX, y: bestY, complexity: maxScore, foundGood: foundGoodSpot };
  }
  
  // -----------------------------
  // Logger
  // -----------------------------
  function log(...args) {
    console.log('[ZoomFocus]', ...args);
  }
  
  module.exports = {
    zoomIntoFractal
  };
  