// fractals/mandelbrot4.js
// Mandelbrot Power 4: z = z^4 + c

function iterate(x0, y0, maxIter) {
    let x = 0, y = 0;
    let iter = 0;
  
    while (x * x + y * y <= 256 && iter < maxIter) {
      // z^4 = (x + iy)^4
      // = (x^4 - 6x^2y^2 + y^4) + i(4x^3y - 4xy^3)
  
      const x2 = x * x;
      const y2 = y * y;
  
      const x4 = x2 * x2 - 6 * x2 * y2 + y2 * y2;
      const y4 = 4 * x2 * x * y - 4 * x * y2 * y;
  
      x = x4 + x0;
      y = y4 + y0;
      iter++;
    }
  
    // Inside set
    if (iter === maxIter) {
      return {
        iter,
        smooth: maxIter,
        inSet: true
      };
    }
  
    // Smooth coloring (same method as Mandelbrot3)
    const magnitude = x * x + y * y;
    const log_zn = Math.log(magnitude) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    const smoothIter = iter + 1 - nu;
  
    return {
      iter,
      smooth: smoothIter,
      inSet: false
    };
  }
  
  module.exports = {
    name: 'Mandelbrot4',
    iterate
  };
  