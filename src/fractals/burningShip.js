// fractals/burningShip.js
// Burning Ship: z = (|Re(z)| + i|Im(z)|)^2 + c

function iterate(x0, y0, maxIter) {
  let x = 0, y = 0;
  let iter = 0;

  while (x * x + y * y <= 256 && iter < maxIter) {
    // Take absolute values before squaring
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    const newX = absX * absX - absY * absY + x0;
    const newY = 2 * absX * absY + y0;

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
  name: 'BurningShip',
  iterate
};
