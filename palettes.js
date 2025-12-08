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