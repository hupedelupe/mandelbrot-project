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

  BurningShip: [
    {
      cx: -1.75,
      cy: -0.03,
      name: "Ship_Bow",
      qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.20, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
    },
    {
      cx: -1.755,
      cy: 0.03,
      name: "Ship_Stern",
      qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.18, minActiveCells: 8, minColorDiversity: 0.1, minComplexityScore: 0 }
    },
    {
      cx: -1.62,
      cy: -0.05,
      name: "Antenna",
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
      cx: 0.0,
      cy: 0.0,
      name: "Quartic_Core",
      qualityControl: {
        minVisiblePixels: 0.75,
        minEdgeDensity: 0.02,
        minGeometryScore: 0.20,
        minActiveCells: 10,
        minColorDiversity: 0.12,
        minComplexityScore: 0
      }
    },
    {
      cx: 0.0,
      cy: 0.95,
      name: "Upper_Petal",
      qualityControl: {
        minVisiblePixels: 0.70,
        minEdgeDensity: 0.025,
        minGeometryScore: 0.22,
        minActiveCells: 9,
        minColorDiversity: 0.12,
        minComplexityScore: 0
      }
    },
    {
      cx: 0.0,
      cy: -0.95,
      name: "Lower_Petal",
      qualityControl: {
        minVisiblePixels: 0.70,
        minEdgeDensity: 0.025,
        minGeometryScore: 0.22,
        minActiveCells: 9,
        minColorDiversity: 0.12,
        minComplexityScore: 0
      }
    },
    {
      cx: 0.7,
      cy: 0.7,
      name: "Diagonal_Flower",
      qualityControl: {
        minVisiblePixels: 0.65,
        minEdgeDensity: 0.03,
        minGeometryScore: 0.23,
        minActiveCells: 9,
        minColorDiversity: 0.14,
        minComplexityScore: 0
      }
    },
    {
      cx: -0.7,
      cy: 0.7,
      name: "Mirrored_Diagonal",
      qualityControl: {
        minVisiblePixels: 0.65,
        minEdgeDensity: 0.03,
        minGeometryScore: 0.23,
        minActiveCells: 9,
        minColorDiversity: 0.14,
        minComplexityScore: 0
      }
    },
    {
      cx: 0.45,
      cy: 0.0,
      name: "Side_Lobe",
      qualityControl: {
        minVisiblePixels: 0.70,
        minEdgeDensity: 0.028,
        minGeometryScore: 0.21,
        minActiveCells: 8,
        minColorDiversity: 0.13,
        minComplexityScore: 0
      }
    }
  ],
  

  Tricorn: [
    // {
    //   cx: -1.25,
    //   cy: 0.0,
    //   name: "Left_Tricorn_Fang",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // },

    // no edges
    // {
    //   cx: -0.1,
    //   cy: 0.65,
    //   name: "Northern_Tricorn_Claws",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // },

    // no complexity
    // {
    //   cx: -0.1,
    //   cy: -0.65,
    //   name: "Southern_Tricorn_Claws",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // },

    // {
    //   cx: -0.75,
    //   cy: 0.0,
    //   name: "Central_Tricorn_Blade",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // },
    // {
    //   cx: -0.05,
    //   cy: 0.745,
    //   name: "Spiral_Talon_North",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // },
    // {
    //   cx: -0.05,
    //   cy: -0.745,
    //   name: "Spiral_Talon_South",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // },
    {
      cx: -0.2,
      cy: 0.6,
      name: "Twisted_Filament_Garden",
      qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    },
    // {
    //   cx: -1.3,
    //   cy: 0.12,
    //   name: "Lightning_Claw_East",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // },
    // {
    //   cx: -1.15,
    //   cy: 0.2,
    //   name: "Electric_Talon",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // }
    // {
    //   cx: -0.085,
    //   cy: 0.742,
    //   name: "Micro_Spiral_Nexus",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // },
    // {
    //   cx: -0.18,
    //   cy: 0.57,
    //   name: "Quantum_Filament_Core",
    //   qualityControl: { minVisiblePixels: 0.5, minEdgeDensity: 0.008, minGeometryScore: 0.10, minActiveCells: 5, minColorDiversity: 0.08, minComplexityScore: 0 }
    // }
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
        skipComplexityCheckSteps: 3
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
        skipComplexityCheckSteps: 3
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
        skipComplexityCheckSteps: 3
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

module.exports = {
  regions,
  getRegionsForFractal,
  getRandomRegion,
  getRegionByName
};
