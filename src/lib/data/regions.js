// regions.js - Fractal seed regions with region-specific quality settings

const regions = {
  Mandelbrot: [
  {
    cx: -0.7269,
    cy: 0.1889,
    name: "Spiral_Valley",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.25, minActiveCells: 10, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.7453,
    cy: 0.1127,
    name: "Elephant_Valley",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.18, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0}
  },
  {
    cx: -0.1607,
    cy: 1.0376,
    name: "Seahorse_Valley",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.18, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.7902,
    cy: 0.1608,
    name: "Double_Hook",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.15, minActiveCells: 7, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.7747,
    cy: 0.1102,
    name: "Mini_Elephant",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.14, minActiveCells: 6, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: 0.2850,
    cy: 0.0100,
    name: "Triple_Spiral",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.22, minActiveCells: 9, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.1011,
    cy: 0.9563,
    name: "Seahorse_Tail",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.005, minGeometryScore: 0.18, minActiveCells: 7, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.7500,
    cy: 0.1000,
    name: "Baby_Elephant",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.16, minActiveCells: 7, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.1600,
    cy: 1.0405,
    name: "Filament_Region",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.01, minGeometryScore: 0.08, minActiveCells: 4, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.7746,
    cy: 0.1102,
    name: "Deep_Spiral",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.23, minActiveCells: 9, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.1592,
    cy: 1.0317,
    name: "Tendril_Garden",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.01, minGeometryScore: 0.12, minActiveCells: 6, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: 0.3750,
    cy: 0.2170,
    name: "Eastern_Spiral",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.2, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.1011,
    cy: -0.9563,
    name: "Southern_Seahorse",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.005, minGeometryScore: 0.18, minActiveCells: 7, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.1252,
    cy: 0.7500,
    name: "Northern_Arc",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.16, minActiveCells: 7, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.7269,
    cy: -0.1889,
    name: "Southern_Spiral",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.2, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: 0.2850,
    cy: -0.0100,
    name: "Lower_Triple",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.21, minActiveCells: 9, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.5251,
    cy: 0.5260,
    name: "Western_Formation",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.18, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: 0.3500,
    cy: 0.0500,
    name: "Eastern_Edge",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.19, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.1000,
    cy: 0.6557,
    name: "Upper_Arc",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.16, minActiveCells: 7, minColorDiversity: 0.1, minComplexityScore: 0 }
  },
  {
    cx: -0.7010,
    cy: 0.3842,
    name: "Upper_Valley",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.22, minActiveCells: 9, minColorDiversity: 0.1, minComplexityScore: 0 }
  }
  ],

  Mandelbrot3: [
    {
      cx: 0.0,
      cy: 0.0,
      name: "Center",
      qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.18, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
    },
    {
      cx: 0.0,
      cy: 0.8,
      name: "Upper_Lobe",
      qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.20, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
    },
    {
      cx: -0.5,
      cy: 0.5,
      name: "Side_Detail",
      qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.19, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
    }
  ],

  Mandelbrot4: [
    {
      cx: 0.5000,
      cy: 0.0000,
      name: "Eastern_Petal",
      qualityControl: {
        minVisiblePixels: 0.60,
        minEdgeDensity: 0.015,
        minGeometryScore: 0.15,
        minActiveCells: 6,
        minColorDiversity: 0.10,
        minComplexityScore: 0
      },
      zoomStrategy: {
        complexityWeight: 0.70,
        avgIterWeight: 0.25,
        centerBiasWeight: 0.05,
        zoomSteps: { min: 6, max: 14 },
        zoomMult: { min: 1.8, max: 3.0 },
        searchSamples: 200,
        minComplexity: 5,
        skipComplexityCheckSteps: 2
      }
    },
    {
      cx: 0.0000,
      cy: 0.5500,
      name: "Northern_Petal",
      qualityControl: {
        minVisiblePixels: 0.60,
        minEdgeDensity: 0.015,
        minGeometryScore: 0.15,
        minActiveCells: 6,
        minColorDiversity: 0.10,
        minComplexityScore: 0
      },
      zoomStrategy: {
        complexityWeight: 0.70,
        avgIterWeight: 0.25,
        centerBiasWeight: 0.05,
        zoomSteps: { min: 6, max: 14 },
        zoomMult: { min: 1.8, max: 3.0 },
        searchSamples: 200,
        minComplexity: 5,
        skipComplexityCheckSteps: 2
      }
    },
    {
      cx: -0.6000,
      cy: 0.0000,
      name: "Western_Petal",
      qualityControl: {
        minVisiblePixels: 0.60,
        minEdgeDensity: 0.015,
        minGeometryScore: 0.15,
        minActiveCells: 6,
        minColorDiversity: 0.10,
        minComplexityScore: 0
      },
      zoomStrategy: {
        complexityWeight: 0.70,
        avgIterWeight: 0.25,
        centerBiasWeight: 0.05,
        zoomSteps: { min: 6, max: 14 },
        zoomMult: { min: 1.8, max: 3.0 },
        searchSamples: 200,
        minComplexity: 5,
        skipComplexityCheckSteps: 2
      }
    },
    {
      cx: 0.0000,
      cy: -0.5800,
      name: "Southern_Petal",
      qualityControl: {
        minVisiblePixels: 0.60,
        minEdgeDensity: 0.015,
        minGeometryScore: 0.15,
        minActiveCells: 6,
        minColorDiversity: 0.10,
        minComplexityScore: 0
      },
      zoomStrategy: {
        complexityWeight: 0.70,
        avgIterWeight: 0.25,
        centerBiasWeight: 0.05,
        zoomSteps: { min: 6, max: 14 },
        zoomMult: { min: 1.8, max: 3.0 },
        searchSamples: 200,
        minComplexity: 5,
        skipComplexityCheckSteps: 2
      }
    },
    {
      cx: 0.4200,
      cy: 0.4200,
      name: "Diagonal_Nexus_NE",
      qualityControl: {
        minVisiblePixels: 0.60,
        minEdgeDensity: 0.015,
        minGeometryScore: 0.15,
        minActiveCells: 6,
        minColorDiversity: 0.10,
        minComplexityScore: 0
      },
      zoomStrategy: {
        complexityWeight: 0.70,
        avgIterWeight: 0.25,
        centerBiasWeight: 0.05,
        zoomSteps: { min: 6, max: 14 },
        zoomMult: { min: 1.8, max: 3.0 },
        searchSamples: 200,
        minComplexity: 5,
        skipComplexityCheckSteps: 2
      }
    },
    {
      cx: -0.4400,
      cy: 0.4400,
      name: "Diagonal_Nexus_NW",
      qualityControl: {
        minVisiblePixels: 0.60,
        minEdgeDensity: 0.015,
        minGeometryScore: 0.15,
        minActiveCells: 6,
        minColorDiversity: 0.10,
        minComplexityScore: 0
      },
      zoomStrategy: {
        complexityWeight: 0.70,
        avgIterWeight: 0.25,
        centerBiasWeight: 0.05,
        zoomSteps: { min: 6, max: 14 },
        zoomMult: { min: 1.8, max: 3.0 },
        searchSamples: 200,
        minComplexity: 5,
        skipComplexityCheckSteps: 2
      }
    },
    {
      cx: 0.4600,
      cy: -0.4600,
      name: "Diagonal_Nexus_SE",
      qualityControl: {
        minVisiblePixels: 0.60,
        minEdgeDensity: 0.015,
        minGeometryScore: 0.15,
        minActiveCells: 6,
        minColorDiversity: 0.10,
        minComplexityScore: 0
      },
      zoomStrategy: {
        complexityWeight: 0.70,
        avgIterWeight: 0.25,
        centerBiasWeight: 0.05,
        zoomSteps: { min: 6, max: 14 },
        zoomMult: { min: 1.8, max: 3.0 },
        searchSamples: 200,
        minComplexity: 5,
        skipComplexityCheckSteps: 2
      }
    },
    {
      cx: 0.5200,
      cy: 0.2000,
      name: "Eastern_Lobe_Upper",
      qualityControl: {
        minVisiblePixels: 0.60,
        minEdgeDensity: 0.015,
        minGeometryScore: 0.15,
        minActiveCells: 6,
        minColorDiversity: 0.10,
        minComplexityScore: 0
      },
      zoomStrategy: {
        complexityWeight: 0.70,
        avgIterWeight: 0.25,
        centerBiasWeight: 0.05,
        zoomSteps: { min: 6, max: 14 },
        zoomMult: { min: 1.8, max: 3.0 },
        searchSamples: 200,
        minComplexity: 5,
        skipComplexityCheckSteps: 2
      }
    }
  ]
};

function getRegionsForFractal(fractalName) {
  return regions[fractalName] || [];
}

function getRandomRegion(fractalName) {
  const fractalRegions = getRegionsForFractal(fractalName);
  if (fractalRegions.length === 0) return null;
  return fractalRegions[Math.floor(Math.random() * fractalRegions.length)];
}

function getRegionByName(fractalName, regionName) {
  const fractalRegions = getRegionsForFractal(fractalName);
  return fractalRegions.find(r => r.name === regionName);
}

/**
 * Map power/variant parameters to legacy fractal names
 */
function parametersToFractalName(power, variant = 'standard') {
  const { real, imag } = power;

  // Standard variant with integer powers
  if (variant === 'standard' && imag === 0 && Number.isInteger(real)) {
    if (real === 2) return 'Mandelbrot';
    if (real === 3) return 'Mandelbrot3';
    if (real === 4) return 'Mandelbrot4';
  }

  // Tricorn (conjugate variant of z^2)
  if (variant === 'conjugate' && real === 2 && imag === 0) {
    return 'Tricorn';
  }

  // Burning Ship
  if (variant === 'burning-ship' && real === 2 && imag === 0) {
    return 'BurningShip';
  }

  return null; // Unknown power/variant - no pre-defined regions
}

/**
 * Get regions for a power/variant combination (NEW PARAMETER-BASED API)
 */
function getRegionsForPower(power, variant = 'standard') {
  const fractalName = parametersToFractalName(power, variant);
  return fractalName ? regions[fractalName] || [] : [];
}

/**
 * Get a specific region by name for a power/variant (NEW PARAMETER-BASED API)
 */
function getRegionByKey(power, variant, regionName) {
  const fractalRegions = getRegionsForPower(power, variant);
  return fractalRegions.find(r => r.name === regionName);
}

/**
 * Get random region for a power/variant (NEW PARAMETER-BASED API)
 */
function getRandomRegionForPower(power, variant = 'standard') {
  const fractalRegions = getRegionsForPower(power, variant);
  if (fractalRegions.length === 0) return null;
  return fractalRegions[Math.floor(Math.random() * fractalRegions.length)];
}

module.exports = {
  regions,
  // New parameter-based API
  getRegionsForPower,
  getRegionByKey,
  getRandomRegionForPower,
  parametersToFractalName,
  // Legacy name-based API
  getRegionsForFractal,
  getRandomRegion,
  getRegionByName
};
