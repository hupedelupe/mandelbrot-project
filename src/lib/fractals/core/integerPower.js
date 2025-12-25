// fractals/core/integerPower.js

/**
 * Compute z^n for integer n (n >= 0)
 * Supports variants: standard, conjugate, burning-ship
 */
function integerPower(zReal, zImag, n, variant = 'standard') {
  // Apply variant transform once
  let x = zReal;
  let y = zImag;

  if (variant === 'conjugate') {
    y = -y;
  } else if (variant === 'burning-ship') {
    x = Math.abs(x);
    y = Math.abs(y);
  }

  // Handle trivial cases
  if (n === 0) return { real: 1, imag: 0 };
  if (n === 1) return { real: x, imag: y };

  // Fast paths for common powers
  if (n === 2) {
    return {
      real: x * x - y * y,
      imag: 2 * x * y
    };
  }

  if (n === 3) {
    const x2 = x * x;
    const y2 = y * y;
    return {
      real: x2 * x - 3 * x * y2,
      imag: 3 * x2 * y - y2 * y
    };
  }

  if (n === 4) {
    const x2 = x * x;
    const y2 = y * y;
    return {
      real: x2 * x2 - 6 * x2 * y2 + y2 * y2,
      imag: 4 * x2 * x * y - 4 * x * y2 * y
    };
  }

  // General integer power (repeated multiplication)
  let real = x;
  let imag = y;

  for (let i = 1; i < n; i++) {
    const r = real * x - imag * y;
    const im = real * y + imag * x;
    real = r;
    imag = im;
  }

  return { real, imag };
}

module.exports = { integerPower };
