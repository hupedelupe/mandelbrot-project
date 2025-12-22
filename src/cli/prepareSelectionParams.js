// src/cli/prepareSelectionParams.js

function prepareSelectionParams(config, forcedArgs) {
    return {
      // pass-through from config
      parameterSelection: config.parameterSelection,
      qualityControl: config.qualityControl,
      server: config.server,
  
      // CLI overrides (explicit only)
      overrides: {
        power: forcedArgs.forcedPower,
        variant: forcedArgs.forcedVariant,
        region: forcedArgs.forcedRegion,
        palette: forcedArgs.forcedPalette,
        organic: forcedArgs.organicFlag
      },
  
      // runtime flags
      runtime: {
        count: forcedArgs.count,
        testMode: forcedArgs.testProductionMode
      }
    };
  }
  
  module.exports = { prepareSelectionParams };
  