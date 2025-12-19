// fractals/mandelbrotComplexPower.js
// Mandelbrot with arbitrary complex power: z = z^(powerReal + i*powerImag) + c

function complexPower(zReal, zImag, powerReal, powerImag) {
  // Compute z^power where both z and power are complex numbers
  // Formula: z^w = exp(w * ln(z))
  // where ln(z) = ln|z| + i*arg(z)

  // Handle z = 0 case
  if (zReal === 0 && zImag === 0) {
    return { real: 0, imag: 0 };
  }

  // Compute magnitude and argument of z
  const r = Math.sqrt(zReal * zReal + zImag * zImag);
  const theta = Math.atan2(zImag, zReal);

  // ln(z) = ln(r) + i*theta
  const lnR = Math.log(r);
  const lnReal = lnR;
  const lnImag = theta;

  // w * ln(z) = (powerReal + i*powerImag) * (lnReal + i*lnImag)
  // = (powerReal*lnReal - powerImag*lnImag) + i*(powerReal*lnImag + powerImag*lnReal)
  const productReal = powerReal * lnReal - powerImag * lnImag;
  const productImag = powerReal * lnImag + powerImag * lnReal;

  // exp(productReal + i*productImag) = exp(productReal) * (cos(productImag) + i*sin(productImag))
  const expReal = Math.exp(productReal);
  const resultReal = expReal * Math.cos(productImag);
  const resultImag = expReal * Math.sin(productImag);

  return { real: resultReal, imag: resultImag };
}

function iterate(x0, y0, maxIter, powerReal = 2, powerImag = 0) {
  let x = 0, y = 0;
  let iter = 0;
  const escapeRadius = 256;

  while (x * x + y * y <= escapeRadius && iter < maxIter) {
    // Compute z^power
    const result = complexPower(x, y, powerReal, powerImag);

    // z = z^power + c
    x = result.real + x0;
    y = result.imag + y0;
    iter++;
  }

  if (iter === maxIter) return { iter, smooth: maxIter, inSet: true };

  const magnitude = x * x + y * y;
  const log_zn = Math.log(magnitude) / 2;
  const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
  const smoothIter = iter + 1 - nu;

  return { iter, smooth: smoothIter, inSet: false };
}

module.exports = {
  name: 'MandelbrotComplexPower',
  iterate,
  complexPower
};
