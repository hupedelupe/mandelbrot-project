// fractals/tricorn.js
// Tricorn (Mandelbar): z = conj(z)^2 + c

function iterate(x0, y0, maxIter) {
  let x = 0, y = 0;
  let iter = 0;

  while (x * x + y * y <= 256 && iter < maxIter) {
    // conj(z)^2 means we negate y before squaring
    const x2 = x * x;
    const y2 = y * y;

    const newX = x2 - y2 + x0;
    const newY = -2 * x * y + y0;  // Note the negative sign

    x = newX;
    y = newY;
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
  name: 'Tricorn',
  iterate
};
