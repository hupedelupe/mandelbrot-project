// fractalZoomFocus.js
// Zooming with outer variance and inner deep-focus scoring (fractal-agnostic)

function zoomIntoFractal(
    initialX,
    initialY,
    initialZoom,
    zoomSteps = 5,
    searchSamples = 40,
    zoomMultMin = 1.5,
    zoomMultMax = 3.5,
    qualityConfig,
    iterateFn,  // Accept any fractal's iterate function
    regionConfig = null  // NEW: Full region config with zoomStrategy
  ) {
    let currentX = initialX;
    let currentY = initialY;
    let currentZoom = initialZoom;

    // Get zoom strategy from region config
    const strategy = regionConfig?.zoomStrategy || null;

    let complexityWeight, avgIterWeight, centerBiasWeight;
    let actualZoomSteps, actualSearchSamples, actualZoomMultMin, actualZoomMultMax, actualMinComplexity;
    let adaptiveZoomMultMax, highComplexityThreshold;
    let skipComplexitySteps;

    if (strategy) {
      // Use strategy-defined weights
      complexityWeight = strategy.complexityWeight;
      avgIterWeight = strategy.avgIterWeight;
      centerBiasWeight = strategy.centerBiasWeight;

      // Override zoom parameters if strategy specifies them
      actualZoomSteps = strategy.zoomSteps ?
        strategy.zoomSteps.min + Math.floor(Math.random() * (strategy.zoomSteps.max - strategy.zoomSteps.min + 1)) :
        zoomSteps;
      actualSearchSamples = strategy.searchSamples || searchSamples;
      actualZoomMultMin = strategy.zoomMult?.min || zoomMultMin;
      actualZoomMultMax = strategy.zoomMult?.max || zoomMultMax;
      adaptiveZoomMultMax = strategy.zoomMult?.adaptiveMax || actualZoomMultMax;
      highComplexityThreshold = strategy.highComplexityThreshold || 30;
      actualMinComplexity = strategy.minComplexity !== undefined ? strategy.minComplexity : 15;
      skipComplexitySteps = strategy.skipComplexityCheckSteps || 0;
    } else {
      // Fallback to random weights (legacy behavior)
      function randomWeights3() {
        const r1 = Math.random();
        const r2 = Math.random();
        const [s1, s2] = [r1, r2].sort((a, b) => a - b);
        return [s1, s2 - s1, 1 - s2];
      }
      [complexityWeight, avgIterWeight, centerBiasWeight] = randomWeights3();
      actualZoomSteps = zoomSteps;
      actualSearchSamples = searchSamples;
      actualZoomMultMin = zoomMultMin;
      actualZoomMultMax = zoomMultMax;
      adaptiveZoomMultMax = zoomMultMax;
      highComplexityThreshold = 30;
      actualMinComplexity = 15;  // Default minimum complexity
      skipComplexitySteps = 0;   // No skipping by default
    }

    log(`Zoom weights → complexity: ${complexityWeight.toFixed(2)}, avgIter: ${avgIterWeight.toFixed(2)}, centerBias: ${centerBiasWeight.toFixed(2)}`);
    if (skipComplexitySteps > 0) {
      log(`Skipping complexity checks for first ${skipComplexitySteps} steps`);
    }
  
    // -----------------------------
    // Outer rough zoom pass
    // -----------------------------
    for (let step = 0; step < actualZoomSteps; step++) {
      const skipComplexityThisStep = step < skipComplexitySteps;

      if (skipComplexityThisStep) {
        // Skip complexity check - just zoom blindly to escape boring regions
        const zoomMult = actualZoomMultMin + Math.random() * (actualZoomMultMax - actualZoomMultMin);
        currentZoom *= zoomMult;
        log(`Step ${step + 1}: Skipping complexity check, blind zoom to ${currentZoom.toFixed(0)}× (zoomMult: ${zoomMult.toFixed(2)}×)`);
        continue;
      }

      // Normal complexity-based zoom
      const searchRadius = 2.0 / currentZoom;

      const boundary = findBestBoundaryPoint(
        currentX,
        currentY,
        searchRadius,
        actualSearchSamples,
        256,
        actualMinComplexity,
        complexityWeight,
        avgIterWeight,
        centerBiasWeight,
        iterateFn
      );

      if (boundary.foundGood) {
        currentX = boundary.x;
        currentY = boundary.y;

        // Adaptive zoom: use faster multiplier when complexity is high
        // Always use gentle zoom for final 3 steps (precision at end)
        const isHighComplexity = boundary.complexity > highComplexityThreshold;
        const isFinalSteps = step >= (actualZoomSteps - 3);
        const maxMult = (isHighComplexity && !isFinalSteps) ? adaptiveZoomMultMax : actualZoomMultMax;

        const zoomMult = actualZoomMultMin + Math.random() * (maxMult - actualZoomMultMin);
        currentZoom *= zoomMult;

        const adaptiveNote = (isHighComplexity && !isFinalSteps) ? ' [fast]' : '';
        log(`Step ${step + 1}: Complexity ${boundary.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}× (${zoomMult.toFixed(2)}×)${adaptiveNote}`);
      } else {
        log(`Step ${step + 1}: Low complexity - stopping`);
        break;
      }
    }
  
    // -----------------------------
    // Inner deep-focus refine zoom
    // -----------------------------
    for (let stepInner = 0; stepInner < Math.min(5, ((actualZoomSteps * 2))+10); stepInner++) {
      const searchRadiusInner = Math.max(0.25 / currentZoom, 1e-6);

      const boundaryInner = findBestBoundaryPoint(
        currentX,
        currentY,
        searchRadiusInner,
        actualSearchSamples * 2,
        512,
        actualMinComplexity,
        complexityWeight,
        avgIterWeight,
        centerBiasWeight,
        iterateFn
      );

      if (boundaryInner.foundGood && boundaryInner.complexity > actualMinComplexity) {
        currentX = boundaryInner.x;
        currentY = boundaryInner.y;
        const zoomMultInner = actualZoomMultMin + Math.random() * (actualZoomMultMax - actualZoomMultMin);
        currentZoom += zoomMultInner;
  
        if ((stepInner + 1) % 10 === 0) {
          log(`Deep focus step ${stepInner + 1}: Complexity ${boundaryInner.complexity.toFixed(1)} at ${currentZoom.toFixed(0)}× (zoomMult: ${zoomMultInner.toFixed(2)}×)`);
        }
      } else {
        log(`Deep focus step ${stepInner + 1}: Low complexity - stopping`);
        break;
      }
    }
  
    // Determine if we successfully found interesting regions
    // If we stopped very early (fewer than half the minimum steps), we likely failed
    const minSteps = actualZoomSteps / 2;
    const actualStepsTaken = Math.log(currentZoom / initialZoom) / Math.log(2); // Rough estimate
    const foundGood = actualStepsTaken >= minSteps;

    return { x: currentX, y: currentY, zoom: currentZoom, foundGood };
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
    centerBiasWeight = 0.2,
    iterateFn
  ) {
    let bestX = cx,
        bestY = cy,
        maxScore = 0;
    let foundGoodSpot = false;
  
    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const x = cx + (sx / samples - 0.5) * searchRadius * 2;
        const y = cy + (sy / samples - 0.5) * searchRadius * 2;
  
        const center = iterateFn(x, y, maxIter);
        if (center.inSet || center.iter < 8) continue;

        const delta = searchRadius / samples;

        const neighbors = [
          iterateFn(x + delta, y, maxIter),
          iterateFn(x - delta, y, maxIter),
          iterateFn(x, y + delta, maxIter),
          iterateFn(x, y - delta, maxIter)
        ];

        // Filter out maxIter neighbors - they're in the set (black) and create false variance
        // We only want complexity from actual escaped pixels (colorful boundary detail)
        const escapedNeighbors = neighbors.filter(n => !n.inSet);

        // Need at least 2 escaped neighbors to calculate meaningful complexity
        if (escapedNeighbors.length < 2) continue;

        const complexity = escapedNeighbors.reduce((acc, n) => acc + Math.abs(center.iter - n.iter), 0);
        if (complexity < minComplexity) continue;

        const avgIter = (center.iter + escapedNeighbors.reduce((a, n) => a + n.iter, 0)) / (escapedNeighbors.length + 1);
  
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
  