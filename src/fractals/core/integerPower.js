// fractals/core/integerPower.js
// Fast integer power calculations using multiplication (no exp/log/trig)

/**
 * Compute z^n for integer n using fast multiplication
 * Supports variants: standard, conjugate, burning-ship
 */
function integerPower(zReal, zImag, power, variant = 'standard') {
  // Apply variant transformation before powering
  let x = zReal;
  let y = zImag;

  if (variant === 'conjugate') {
    y = -zImag;  // Conjugate: negate imaginary part
  } else if (variant === 'burning-ship') {
    x = Math.abs(zReal);  // Burning ship: absolute values
    y = Math.abs(zImag);
  }

  // Handle special cases
  if (power === 1) {
    return { real: x, imag: y };
  }

  if (power === 2) {
    return power2(x, y);
  }

  if (power === 3) {
    return power3(x, y);
  }

  if (power === 4) {
    return power4(x, y);
  }

  // General case: repeated squaring for higher powers
  return powerN(x, y, power);
}

/**
 * z^2 = (x + iy)^2 = (x^2 - y^2) + i(2xy)
 */
function power2(x, y) {
  const x2 = x * x;
  const y2 = y * y;
  return {
    real: x2 - y2,
    imag: 2 * x * y
  };
}

/**
 * z^3 = (x + iy)^3 = (x^3 - 3xy^2) + i(3x^2y - y^3)
 */
function power3(x, y) {
  const x2 = x * x;
  const y2 = y * y;
  return {
    real: x2 * x - 3 * x * y2,
    imag: 3 * x2 * y - y2 * y
  };
}

/**
 * z^4 = (x + iy)^4 = (x^4 - 6x^2y^2 + y^4) + i(4x^3y - 4xy^3)
 */
function power4(x, y) {
  const x2 = x * x;
  const y2 = y * y;
  return {
    real: x2 * x2 - 6 * x2 * y2 + y2 * y2,
    imag: 4 * x2 * x * y - 4 * x * y2 * y
  };
}

/**
 * z^n for arbitrary integer n using repeated multiplication
 */
function powerN(x, y, n) {
  if (n === 0) return { real: 1, imag: 0 };
  if (n === 1) return { real: x, imag: y };

  let resultReal = x;
  let resultImag = y;

  for (let i = 1; i < n; i++) {
    // Complex multiplication: (a + bi) * (c + di) = (ac - bd) + i(ad + bc)
    const newReal = resultReal * x - resultImag * y;
    const newImag = resultReal * y + resultImag * x;
    resultReal = newReal;
    resultImag = newImag;
  }

  return { real: resultReal, imag: resultImag };
}

module.exports = {
  integerPower,
  power2,
  power3,
  power4,
  powerN
};
