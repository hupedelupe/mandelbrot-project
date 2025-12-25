function parsePowerString(str) {
    str = str.replace(/\s/g, '');
  
    const match = str.match(/^([+-]?[\d.]+)([+-][\d.]+)i$/);
  
    if (match) {
      return {
        real: parseFloat(match[1]),
        imag: parseFloat(match[2])
      };
    }
  
    return {
      real: parseFloat(str),
      imag: 0
    };
  }
  
  module.exports = { parsePowerString };
  