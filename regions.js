// regions.js - Mandelbrot set seed regions with region-specific quality settings

const seedRegions = [
  {
    cx: -0.7269,
    cy: 0.1889,
    name: "Spiral_Valley",
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.25, minActiveCells: 10 }
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
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.01, minGeometryScore: 0.18, minActiveCells: 7, minColorDiversity: 0.1, minComplexityScore: 0 }
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
    qualityControl: { minVisiblePixels: 0.7, minEdgeDensity: 0.02, minGeometryScore: 0.18, minActiveCells: 7, minColorDiversity: 0.1, minComplexityScore: 0 }
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
];

function getRandomRegion() {
  return seedRegions[Math.floor(Math.random() * seedRegions.length)];
}

function getRegionByName(name) {
  return seedRegions.find(r => r.name === name);
}

module.exports = {
  seedRegions,
  getRandomRegion,
  getRegionByName
};
