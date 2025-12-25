const { showHelp } = require("./showHelp");

function parseArgs(argv) {
    const get = key =>
      argv.find(arg => arg.startsWith(`--${key}=`))?.split('=')[1];
  
    return {
      forcedPower: get('power'),
      forcedVariant: get('variant'),
      forcedRegion: get('region'),
      forcedPalette: get('palette'),
      organicFlag: argv.includes('--organic'),
      count: get('count') !== undefined ? parseInt(get('count'), 10) : undefined,
      testProductionMode: argv.includes('--test-production'),
      help: argv.includes('--help') || argv.includes('-h'), showHelp
    };
  }
  
  module.exports = { parseArgs };
  