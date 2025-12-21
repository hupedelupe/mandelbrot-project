// fractals/core/complexPower.js
// Complex power calculations: z^(a + bi)

/**
 * Compute z^power where both z and power are complex numbers
 * Formula: z^w = exp(w * ln(z))
 * where ln(z) = ln|z| + i*arg(z)
 */
function complexPower(zReal, zImag, powerReal, powerImag) {
  if (zReal === 0 && zImag === 0) {
    return { real: 0, imag: 0 };
  }

  const r = Math.sqrt(zReal * zReal + zImag * zImag);
  const theta = Math.atan2(zImag, zReal);
  const lnR = Math.log(r);

  const productReal = powerReal * lnR - powerImag * theta;
  const productImag = powerReal * theta + powerImag * lnR;

  const expReal = Math.exp(productReal);
  const resultReal = expReal * Math.cos(productImag);
  const resultImag = expReal * Math.sin(productImag);

  return { real: resultReal, imag: resultImag };
}

module.exports = {
  complexPower
};
