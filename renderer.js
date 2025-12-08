// renderer.js - Fractal image rendering

const { createCanvas } = require('canvas');
const { mandelbrotIterations } = require('./mandelbrot');
const { getColorFromPalette } = require('./palettes');

function renderFractal(width, height, centerX, centerY, zoom, palette, maxIter) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  
  const size = 3.5 / zoom;
  const xMin = centerX - size;
  const yMin = centerY - size;
  const xMax = centerX + size;
  const yMax = centerY + size;
  
  let idx = 0;
  for (let py = 0; py < height; py++) {
    const y0 = yMin + (yMax - yMin) * py / height;
    
    for (let px = 0; px < width; px++) {
      const x0 = xMin + (xMax - xMin) * px / width;
      const result = mandelbrotIterations(x0, y0, maxIter);
      
      let color;
      if (result.inSet) {
        color = [0, 0, 5];
      } else {
        const normalized = (result.smooth / maxIter) % 1.0;
        const baseColor = getColorFromPalette(normalized, palette);
        const brightness = 0.8 + 0.4 * Math.sin(result.smooth * 0.1);
        
        color = [
          Math.min(255, Math.round(baseColor[0] * brightness)),
          Math.min(255, Math.round(baseColor[1] * brightness)),
          Math.min(255, Math.round(baseColor[2] * brightness))
        ];
      }
      
      imageData.data[idx++] = color[0];
      imageData.data[idx++] = color[1];
      imageData.data[idx++] = color[2];
      imageData.data[idx++] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return { canvas, imageData };
}

module.exports = {
  renderFractal
};