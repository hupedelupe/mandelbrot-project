// fractals/core/iterate.js
// Unified iteration engine with smart routing to fast paths

const { integerPower } = require('./integerPower');
const { complexPower } = require('./complexPower');

/**
 * Create an iteration function for a fractal defined by parameters
 *
 * @param {Object} params - Fractal parameters
 * @param {Object} params.power - { real: number, imag: number }
 * @param {string} params.variant - 'standard' | 'conjugate' | 'burning-ship'
 * @param {string} params.constantMode - 'mandelbrot' | 'julia' (future)
 * @returns {Function} iterate(x0, y0, maxIter) function
 */
function createIterator(params) {
  const { power, variant = 'standard', constantMode = 'mandelbrot' } = params;

  // Determine if we can use fast path
  const useFastPath = power.imag === 0 && Number.isInteger(power.real) && power.real > 0;

  if (useFastPath) {
    // Fast path for integer powers
    return createIntegerIterator(power.real, variant);
  } else {
    // Complex power path
    return createComplexIterator(power.real, power.imag);
  }
}

/**
 * Create fast iterator for integer powers
 */
function createIntegerIterator(n, variant) {
  const escapeRadius = 256;

  return function iterate(x0, y0, maxIter) {
    let x = 0, y = 0;
    let iter = 0;

    while (x * x + y * y <= escapeRadius && iter < maxIter) {
      // Apply variant transformation and compute z^n
      const result = integerPower(x, y, n, variant);

      // z = z^n + c
      x = result.real + x0;
      y = result.imag + y0;
      iter++;
    }

    // Smooth coloring
    if (iter === maxIter) {
      return { iter, smooth: maxIter, inSet: true };
    }

    const magnitude = x * x + y * y;
    const log_zn = Math.log(magnitude) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    const smoothIter = iter + 1 - nu;

    return { iter, smooth: smoothIter, inSet: false };
  };
}

/**
 * Create iterator for complex/fractional powers
 */
function createComplexIterator(powerReal, powerImag) {
  const escapeRadius = 256;

  return function iterate(x0, y0, maxIter) {
    let x = 0, y = 0;
    let iter = 0;

    while (x * x + y * y <= escapeRadius && iter < maxIter) {
      // Compute z^(powerReal + i*powerImag)
      const result = complexPower(x, y, powerReal, powerImag);

      // z = z^power + c
      x = result.real + x0;
      y = result.imag + y0;
      iter++;
    }

    // Smooth coloring
    if (iter === maxIter) {
      return { iter, smooth: maxIter, inSet: true };
    }

    const magnitude = x * x + y * y;
    const log_zn = Math.log(magnitude) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    const smoothIter = iter + 1 - nu;

    return { iter, smooth: smoothIter, inSet: false };
  };
}

module.exports = {
  createIterator
};
