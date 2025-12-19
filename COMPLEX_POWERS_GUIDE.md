# Complex Powers Exploration Guide

This branch introduces support for exploring fractals with arbitrary complex powers, extending the classic Mandelbrot set formula from `z = z^2 + c` to `z = z^(p_real + i*p_imag) + c`.

## Overview

When you change the power in the Mandelbrot formula, the fractal's structure changes dramatically. Using complex powers (where the exponent has both real and imaginary components) creates entirely new and unique fractal patterns.

## Mathematical Background

The iteration formula is:
```
z_(n+1) = z_n^(p_real + i*p_imag) + c
```

Where:
- `z` and `c` are complex numbers
- `p_real` is the real part of the power
- `p_imag` is the imaginary part of the power

To compute `z^w` where both `z` and `w` are complex:
```
z^w = exp(w * ln(z))
```

## Files Added

1. **src/fractals/mandelbrotComplexPower.js**
   - Implements complex power exponentiation
   - Contains the iterate function with adjustable power parameters

2. **explore-complex-powers.js**
   - Interactive command-line tool for generating fractals with complex powers
   - Supports parameter adjustment for real-time exploration

## Usage

### Basic Usage

Generate a classic Mandelbrot set (power = 2 + 0i):
```bash
node explore-complex-powers.js --power-real=2 --power-imag=0
```

Generate with a complex power:
```bash
node explore-complex-powers.js --power-real=2.5 --power-imag=0.3
```

### Random Exploration

Generate random complex power fractals:
```bash
# Single random fractal
node explore-complex-powers.js --random

# Generate 10 random fractals
node explore-complex-powers.js --random --count=10
```

### Advanced Parameters

Zoom into specific regions and adjust rendering:
```bash
node explore-complex-powers.js \
  --power-real=3.2 \
  --power-imag=-0.6 \
  --center-x=-0.7 \
  --center-y=0.3 \
  --width=0.8 \
  --max-iter=2000 \
  --resolution=4096 \
  --palette=Aurora_Storm
```

### All Available Options

```
--power-real=N      Real part of the power (default: 2)
--power-imag=N      Imaginary part of the power (default: 0)
--center-x=N        X coordinate of center (default: -0.5)
--center-y=N        Y coordinate of center (default: 0)
--width=N           Width of viewing region (default: 3.0)
--max-iter=N        Maximum iterations (default: 1000)
--resolution=N      Image resolution (default: 2048)
--palette=NAME      Color palette name (default: Tropical_Sunset)
--random            Generate with random complex power
--count=N           Generate N fractals (default: 1)
--help, -h          Show help
```

## Exploration Tips

### Power Ranges

For interesting results, try:
- **Real part**: 1.5 to 4.0
  - Values < 2: Simpler, more open structures
  - Values > 2: More complex, denser fractals

- **Imaginary part**: -1.0 to 1.0
  - Non-zero values create asymmetric, twisted patterns
  - Larger absolute values create more dramatic distortions

### Viewing Regions

Different powers create fractals with different optimal viewing regions:

- **Classic regions** (like the Mandelbrot main body at center -0.5, 0) may not be interesting for all powers
- **Experimentation needed**: Each power creates unique structures in different locations
- **Recommended approach**: Start with width=3.0 to see the full structure, then zoom into interesting areas

### Iteration Counts

Complex powers may require different iteration counts:
- Powers with large real parts (>3): May need more iterations (1500-2500)
- Powers with large imaginary parts: Often escape faster, fewer iterations needed (500-1000)
- Zoomed regions: Always increase iterations proportionally to zoom level

### Palette Selection

Different palettes work better for different powers:
- **High contrast** (Neon_Drift, Cyber_Spectrum): Good for powers with sharp boundaries
- **Smooth gradients** (Aurora_Storm, Ocean_Depths): Better for continuous variation
- **Multi-hue** (Chromatic_Vortex, Prismatic_Chaos): Excellent for complex powers with varied escape rates

## Interesting Power Combinations to Try

1. **Near-integer with slight imaginary**: `--power-real=2.0 --power-imag=0.1`
   - Creates subtle asymmetry in classic Mandelbrot structure

2. **Half-powers**: `--power-real=1.5 --power-imag=0.5`
   - Creates fractal "roots" with unique branching patterns

3. **High real, low imaginary**: `--power-real=3.5 --power-imag=0.2`
   - Dense, intricate structures with slight twist

4. **Balanced complex**: `--power-real=2.5 --power-imag=0.7`
   - Strong asymmetric distortions, good for discovering new patterns

5. **Negative imaginary**: `--power-real=2.8 --power-imag=-0.5`
   - Mirror-like effects compared to positive imaginary

## Output

All generated fractals are saved to `./complex-power-explorations/` with filenames indicating:
- Timestamp
- Power values (e.g., `p2.50_p0.30i` for 2.5 + 0.3i, `p3.20_m0.60i` for 3.2 - 0.6i)

## Performance Notes

- Generation time scales with resolution² and iteration count
- Typical times on modern hardware:
  - 512×512, 500 iterations: ~2-4 seconds
  - 2048×2048, 1000 iterations: ~30-60 seconds
  - 4096×4096, 2000 iterations: ~4-8 minutes

## Next Steps

1. Generate several random fractals to discover interesting patterns
2. When you find interesting structures, note the power values
3. Zoom into specific regions by adjusting center-x, center-y, and width
4. Experiment with different palettes to enhance visual appeal
5. Increase resolution and iterations for final high-quality renders

## Technical Details

The complex exponentiation is computed using the formula:
```javascript
z^w = exp(w * ln(z))
```

Where:
```
ln(z) = ln|z| + i*arg(z)
```

This allows for arbitrary complex powers while maintaining numerical stability for the range of values we explore.
