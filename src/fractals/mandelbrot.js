// fractals/mandelbrot.js
// Classic Mandelbrot Set: z = z^2 + c

function iterate(x0, y0, maxIter) {
  let x = 0, y = 0, x2 = 0, y2 = 0;
  let iter = 0;

  while (x2 + y2 <= 256 && iter < maxIter) {
    y = 2 * x * y + y0;
    x = x2 - y2 + x0;
    x2 = x * x;
    y2 = y * y;
    iter++;
  }

  if (iter === maxIter) return { iter, smooth: maxIter, inSet: true };

  const log_zn = Math.log(x2 + y2) / 2;
  const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
  const smoothIter = iter + 1 - nu;

  return { iter, smooth: smoothIter, inSet: false };
}

module.exports = {
  name: 'Mandelbrot',
  iterate
};
