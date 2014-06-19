var tessel = require('tessel');
var blePort = tessel.port['A'];
var servoPort = tessel.port['C'];
var bleLib = require('ble-ble113a');
var servoLib = require('servo-pca9685');
var connectionIndicator = tessel.led[0];
var indicatorInterval;
var servo = servoLib.use(servoPort);
var slave = bleLib.use(blePort);

slave.on('ready', function() {
  connectionIndicator.low();
  console.log('beginning to advertise...');
  slave.startAdvertising();
  ledBlink(connectionIndicator);
});

slave.on('connect', function(connection_handle) {
  console.log('got a connection!')
  clearInterval(indicatorInterval);
  connectionIndicator.high();
  slave.on( 'remoteWrite', function(connection, index, valueWritten) {
    console.log('this value was written!', valueWritten);
    var position = valueWritten.readUInt8(0)/255;
    console.log('moving servo to position', position);
    servo.move(1, position);
  });
})

function ledBlink(led) {
  indicatorInterval = setInterval(function() {
    led.toggle();
  }, 1000);
}

slave.on('disconnect', function() {
  ledBlink(connectionIndicator);
  slave.startAdvertising();
})