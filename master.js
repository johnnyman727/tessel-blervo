var tessel = require('tessel');
var port = tessel.port['A'];
var bleLib = require('ble-ble113a');

var ble = bleLib.use(port);

ble.on('ready', function() {
  console.log('searching for tessel slave');
  ble.startScanning();
});

ble.on('discover', function(peripheral) {
  console.log('found a peripheral:', peripheral.toString());
  for (var flag in peripheral.advertisingData) {
    if (peripheral.advertisingData[flag].type === 'Shortened Local Name' 
      && peripheral.advertisingData[flag].data === "Tessel") {
      console.log("Found Tessel!");
      peripheral.connect();
    } 
  }
});

ble.on('connect', function(peripheral) {
  console.log('connected to Tessel!');
  peripheral.discoverCharacteristics(['883f1e6b76f64da187eb6bdbdb617888'], function(err, characteristics) {
    if (err) throw err;
    
    var char = characteristics[0];

    console.log("Ready to receive commands. Enter a number between 0 and 254.");

    process.on('stdin', function(message) {
      message = parseInt(message.slice(0, message.length-1));
      var buf = new Buffer(1);
      buf.writeUInt8(message, 0);
      char.write(buf, function(err) {
        if (err) {
          console.log('unable to send', message, '. Wait for each command to complete.')
        }
        console.log('done!');
      });
    });
  });
})

