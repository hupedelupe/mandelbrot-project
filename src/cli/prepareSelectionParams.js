// src/cli/prepareSelectionParams.js

function prepareSelectionParams(config, forcedArgs) {
  // Shallow copy all config values
  const preparedParams = Object.assign({}, config, {
    overrides: {
      power: forcedArgs.forcedPower,
      variant: forcedArgs.forcedVariant,
      region: forcedArgs.forcedRegion,
      palette: forcedArgs.forcedPalette,
      organic: forcedArgs.organicFlag || false
    },
    runtime: {
      count: forcedArgs.count,
      testMode: forcedArgs.testProductionMode || false
    }
  });

  return preparedParams;
}

module.exports = { prepareSelectionParams };
  