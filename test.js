var gpio = require('rpi-gpio');

gpio.setup(11, gpio.DIR_OUT, write);

function write() {
    gpio.write(11, true, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });
}