// fractals/mandelbrot3.js
// Mandelbrot Power 3: z = z^3 + c

function iterate(x0, y0, maxIter) {
  let x = 0, y = 0;
  let iter = 0;

  while (x * x + y * y <= 256 && iter < maxIter) {
    // z^3 = (x + iy)^3
    const x2 = x * x;
    const y2 = y * y;
    const x3 = x2 * x - 3 * x * y2;
    const y3 = 3 * x2 * y - y2 * y;

    x = x3 + x0;
    y = y3 + y0;
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
  name: 'Mandelbrot3',
  iterate
};
