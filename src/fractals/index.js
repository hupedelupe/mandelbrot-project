// fractals/index.js
// Central registry of all available fractal types

const mandelbrot = require('./mandelbrot');
const mandelbrot3 = require('./mandelbrot3');
const tricorn = require('./tricorn');
const burningShip = require('./burningShip');
const mandelbrot4 = require('./mandelbrot4');

const fractals = {
  Mandelbrot: mandelbrot,
  Mandelbrot3: mandelbrot3,
  Tricorn: tricorn,
  BurningShip: burningShip,
  Mandelbrot4: mandelbrot4,
};

// Get fractal by name
function getFractal(name) {
  const fractal = fractals[name];
  if (!fractal) {
    throw new Error(`Unknown fractal type: ${name}. Available: ${Object.keys(fractals).join(', ')}`);
  }
  return fractal;
}

// Get random fractal
function getRandomFractal() {
  const names = Object.keys(fractals);
  const randomName = names[Math.floor(Math.random() * names.length)];
  return fractals[randomName];
}

// Get all fractal names
function getFractalNames() {
  return Object.keys(fractals);
}

module.exports = {
  fractals,
  getFractal,
  getRandomFractal,
  getFractalNames
};
