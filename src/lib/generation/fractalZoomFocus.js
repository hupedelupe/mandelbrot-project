// fractalZoomFocus.js
// Deterministic zoom executor (strategy must be pre-normalised)

function zoomIntoFractal({
  cx,
  cy,
  zoom,
  zoomStrategy,
  qualityConfig,
  iterateFn,
  log = () => {}
}) {
  let x = cx;
  let y = cy;
  let currentZoom = zoom;

  const {
    complexityWeight,
    avgIterWeight,
    centerBiasWeight,
    zoomSteps,
    searchSamples,
    zoomMult,
    minComplexity,
    highComplexityThreshold,
    skipComplexityCheckSteps
  } = zoomStrategy;

  // -----------------------------
  // OUTER ZOOM PASS
  // -----------------------------
  for (let step = 0; step < zoomSteps; step++) {
    const skipComplexity = step < skipComplexityCheckSteps;

    if (skipComplexity) {
      const mult = rand(zoomMult.min, zoomMult.max);
      currentZoom *= mult;
      log(`Step ${step + 1}: blind zoom → ${currentZoom.toFixed(0)}×`);
      continue;
    }

    const searchRadius = 2 / currentZoom;

    const boundary = findBestBoundaryPoint({
      cx: x,
      cy: y,
      searchRadius,
      samples: searchSamples,
      maxIter: 256,
      minComplexity,
      complexityWeight,
      avgIterWeight,
      centerBiasWeight,
      iterateFn
    });

    if (!boundary.foundGood) break;

    x = boundary.x;
    y = boundary.y;

    const isFast =
      boundary.complexity > highComplexityThreshold &&
      step < zoomSteps - 3;

    const maxMult = isFast ? zoomMult.adaptiveMax : zoomMult.max;
    const mult = rand(zoomMult.min, maxMult);

    currentZoom *= mult;

    log(
      `Step ${step + 1}: complexity ${boundary.complexity.toFixed(
        1
      )} → ${currentZoom.toFixed(0)}×`
    );
  }

  // -----------------------------
  // INNER DEEP-FOCUS PASS
  // -----------------------------
  for (let i = 0; i < 10; i++) {
    const searchRadius = Math.max(0.25 / currentZoom, 1e-6);

    const boundary = findBestBoundaryPoint({
      cx: x,
      cy: y,
      searchRadius,
      samples: searchSamples * 2,
      maxIter: 512,
      minComplexity,
      complexityWeight,
      avgIterWeight,
      centerBiasWeight,
      iterateFn
    });

    if (!boundary.foundGood) break;

    x = boundary.x;
    y = boundary.y;

    currentZoom *= rand(zoomMult.min, zoomMult.max);
  }

  return {
    x,
    y,
    zoom: currentZoom,
    foundGood: currentZoom > zoom * 2
  };
}

// -----------------------------
// Boundary scoring
// -----------------------------
function findBestBoundaryPoint({
  cx,
  cy,
  searchRadius,
  samples,
  maxIter,
  minComplexity,
  complexityWeight,
  avgIterWeight,
  centerBiasWeight,
  iterateFn
}) {
  let best = { score: 0 };
  let foundGood = false;

  for (let sy = 0; sy < samples; sy++) {
    for (let sx = 0; sx < samples; sx++) {
      const x = cx + ((sx / samples) - 0.5) * searchRadius * 2;
      const y = cy + ((sy / samples) - 0.5) * searchRadius * 2;

      const center = iterateFn(x, y, maxIter);
      if (center.inSet || center.iter < 8) continue;

      const delta = searchRadius / samples;

      const neighbors = [
        iterateFn(x + delta, y, maxIter),
        iterateFn(x - delta, y, maxIter),
        iterateFn(x, y + delta, maxIter),
        iterateFn(x, y - delta, maxIter)
      ].filter(n => !n.inSet);

      if (neighbors.length < 2) continue;

      const complexity = neighbors.reduce(
        (a, n) => a + Math.abs(center.iter - n.iter),
        0
      );

      if (complexity < minComplexity) continue;

      const avgIter =
        (center.iter + neighbors.reduce((a, n) => a + n.iter, 0)) /
        (neighbors.length + 1);

      const dx = (x - cx) / searchRadius;
      const dy = (y - cy) / searchRadius;
      const centerBias = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy));

      const score =
        complexityWeight * complexity +
        avgIterWeight * avgIter +
        centerBiasWeight * centerBias;

      if (score > best.score) {
        best = { x, y, complexity, score };
        foundGood = true;
      }
    }
  }

  return { ...best, foundGood };
}

// -----------------------------
function rand(min, max) {
  return min + Math.random() * (max - min);
}

module.exports = { zoomIntoFractal };
