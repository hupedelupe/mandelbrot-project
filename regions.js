// regions.js - Mandelbrot set seed regions

const seedRegions = [
    { cx: -0.7269, cy: 0.1889, name: "Spiral_Valley" },
    { cx: -0.7453, cy: 0.1127, name: "Elephant_Valley" },
    { cx: -0.1607, cy: 1.0376, name: "Seahorse_Valley" },
    { cx: -0.7902, cy: 0.1608, name: "Double_Hook" },
    { cx: -0.7747, cy: 0.1102, name: "Mini_Elephant" },
    { cx: 0.2850, cy: 0.0100, name: "Triple_Spiral" },
    { cx: -0.1011, cy: 0.9563, name: "Seahorse_Tail" },
    { cx: -0.7500, cy: 0.1000, name: "Baby_Elephant" },
    { cx: -0.1600, cy: 1.0405, name: "Filament_Region" },
    { cx: -0.7746, cy: 0.1102, name: "Deep_Spiral" },
    { cx: -0.1592, cy: 1.0317, name: "Tendril_Garden" },
    { cx: 0.3750, cy: 0.2170, name: "Eastern_Spiral" },
    { cx: -0.1011, cy: -0.9563, name: "Southern_Seahorse" },
    { cx: -0.1252, cy: 0.7500, name: "Northern_Arc" },
    { cx: -0.7269, cy: -0.1889, name: "Southern_Spiral" },
    { cx: 0.2850, cy: -0.0100, name: "Lower_Triple" },
    { cx: -0.5251, cy: 0.5260, name: "Western_Formation" },
    { cx: 0.3500, cy: 0.0500, name: "Eastern_Edge" },
    { cx: -0.1000, cy: 0.6557, name: "Upper_Arc" },
    { cx: -0.7010, cy: 0.3842, name: "Upper_Valley" }
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