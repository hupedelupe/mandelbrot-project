// palettes.js - Color palette definitions and utilities

const colorPalettes = [
  { 
    name: 'Fire_Ice', 
    colors: [[5,5,20], [40,20,80], [80,60,140], [180,40,80], [220,80,40], [240,160,60], [255,220,140]]
  },
  { 
    name: 'Tropical_Sunset', 
    colors: [[10,5,25], [100,20,80], [180,60,100], [220,100,80], [240,160,80], [255,200,100], [255,240,180]]
  },
  { 
    name: 'Ocean_Depths', 
    colors: [[5,10,20], [20,40,80], [40,80,140], [80,140,180], [120,180,200], [160,220,220], [200,240,240]]
  },
  { 
    name: 'Northern_Lights', 
    colors: [[5,10,30], [40,60,120], [60,120,160], [100,180,180], [140,200,140], [180,220,100], [220,240,160]]
  },
  { 
    name: 'Royal_Spectrum', 
    colors: [[10,5,20], [60,20,100], [120,60,160], [180,100,180], [220,120,140], [240,160,120], [255,220,180]]
  },
  { 
    name: 'Volcanic_Fury', 
    colors: [[10,5,5], [60,10,20], [120,30,30], [180,60,30], [220,120,40], [240,180,80], [255,230,140]]
  },
  { 
    name: 'Electric_Rainbow', 
    colors: [[10,5,30], [80,40,140], [140,60,180], [180,80,140], [200,120,100], [220,160,100], [240,200,140], [255,240,200]]
  },
  { 
    name: 'Mystic_Forest', 
    colors: [[10,15,20], [40,60,80], [60,100,120], [100,140,120], [140,180,100], [180,200,100], [220,220,140]]
  },
  { 
    name: 'Desert_Mirage', 
    colors: [[15,10,25], [80,40,60], [140,80,80], [180,120,80], [220,160,100], [240,200,140], [255,230,180]]
  },
  { 
    name: 'Cosmic_Nebula', 
    colors: [[5,5,15], [60,20,80], [100,40,120], [140,80,140], [180,120,160], [200,160,200], [220,200,240]]
  },
  // === HIGH-ENERGY SPECTRAL ===
  {
  name: 'Hyperion',
  colors: [[5,5,30],[80,20,160],[140,60,220],[180,100,200],[220,160,160],[255,220,200]]
  },


  // === COSMIC / DEEP SPACE ===
  {
  name: 'Event_Horizon',
  colors: [[2,2,10],[20,10,60],[60,30,120],[120,80,160],[180,140,200],[220,200,240]]
  },
  {
  name: 'Dark_Nebula',
  colors: [[5,5,15],[40,10,60],[80,40,120],[120,80,180],[180,140,220],[220,200,255]]
  },
  {
  name: 'Stellar_Core',
  colors: [[5,5,10],[80,20,40],[160,60,80],[220,120,120],[255,180,160],[255,230,210]]
  },


  // === ELECTRIC / NEON ===
  {
  name: 'Neon_Drift',
  colors: [[5,10,20],[40,40,160],[80,120,240],[120,200,255],[180,240,220],[240,255,240]]
  },
  {
  name: 'Cyber_Spectrum',
  colors: [[10,5,30],[80,40,200],[140,80,255],[200,120,220],[240,180,180],[255,240,220]]
  },
  {
  name: 'Laser_Bloom',
  colors: [[5,5,20],[120,40,220],[200,80,240],[240,140,200],[255,200,160],[255,240,220]]
  },


  // === ORGANIC / NATURE ===
  {
  name: 'Emerald_Canopy',
  colors: [[5,10,10],[20,60,40],[40,120,80],[80,160,120],[140,200,160],[200,240,200]]
  },
  {
  name: 'Bioluminescence',
  colors: [[5,10,20],[20,80,100],[40,140,160],[80,200,200],[160,240,220]]
  },
  {
  name: 'Autumn_Flux',
  colors: [[10,5,5],[80,30,20],[140,60,40],[200,120,60],[240,180,100],[255,230,160]]
  },


  // === PASTEL BUT HIGH CONTRAST ===
  {
  name: 'Opal_Mist',
  colors: [[10,10,20],[80,60,120],[140,120,180],[200,180,220],[240,220,240]]
  },
  {
  name: 'Iridescent_Sky',
  colors: [[10,10,30],[60,80,160],[120,140,220],[180,200,240],[240,240,255]]
  },


  // === MULTI-HUE CHAOS (FRACTAL FAVORITES) ===
  {
  name: 'Chromatic_Vortex',
  colors: [[5,5,25],[80,20,140],[140,60,200],[200,100,160],[240,160,120],[255,220,180]]
  },
  {
  name: 'Prismatic_Chaos',
  colors: [[10,5,30],[60,40,160],[120,80,220],[180,120,180],[220,160,120],[255,220,200]]
  },
  {
  name: 'Aurora_Storm',
  colors: [[5,10,25],[40,80,120],[60,140,160],[100,200,180],[160,240,200],[220,255,220]]
  }
];

function interpolateColor(c1, c2, t) {
  const ease = t * t * (3 - 2 * t);
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * ease),
    Math.round(c1[1] + (c2[1] - c1[1]) * ease),
    Math.round(c1[2] + (c2[2] - c1[2]) * ease)
  ];
}

function getColorFromPalette(normalized, palette) {
  const position = normalized * (palette.colors.length - 1);
  const index = Math.floor(position);
  const t = position - index;
  
  if (index >= palette.colors.length - 1) {
    return palette.colors[palette.colors.length - 1];
  }
  
  return interpolateColor(palette.colors[index], palette.colors[index + 1], t);
}

function getRandomPalette() {
  return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
}

function getPaletteByName(name) {
  return colorPalettes.find(p => p.name === name);
}

module.exports = {
  colorPalettes,
  getColorFromPalette,
  getRandomPalette,
  getPaletteByName
};