

var start = (config, candleSize, daterange) => {
  console.log('child start',__filename,candleSize, daterange, config);

  var util = require(__dirname + '/../../util');

  // force correct gekko env
  util.setGekkoEnv('child-process');

  // force disable debug
  config.debug = false;
  util.setConfig(config);

  var dirs = util.dirs();

  var load = require(dirs.tools + 'candleLoader');
  load(config.candleSize, candles => {
    process.send(candles);
  })
}

console.log('process send ready', __filename);
process.send('ready');

process.on('message', (m) => {
  //tykim
  console.log('after calling process on message',m);
  //tykim
  if(m.what === 'start'){

    console.log('starting on process',__filename,m.candleSize, m.daterange);
    start(m.config, m.candleSize, m.daterange);
  }
});
