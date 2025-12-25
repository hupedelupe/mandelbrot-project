function weightedRandom(weights) {
    const entries = Object.entries(weights).filter(
      ([_, weight]) => typeof weight === 'number' && !isNaN(weight)
    );
  
    if (!entries.length) {
      throw new Error('No valid numeric weights for weighted random selection');
    }
  
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let r = Math.random() * total;
  
    for (const [key, weight] of entries) {
      r -= weight;
      if (r <= 0) {
        const num = Number(key);
        return !isNaN(num) ? num : key;
      }
    }
  
    const fallback = entries[0][0];
    const num = Number(fallback);
    return !isNaN(num) ? num : fallback;
  }
  
  module.exports = { weightedRandom };
  