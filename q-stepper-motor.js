var gpio = require('rpi-gpio');
var Q = require('q');

function stepperMotor(motorPins) {
    this.runStatus = 1;
    this.cycleNdx = 0;
    this.velocity = 500;
    this.motorPins = motorPins;
    this.cycle = [[1,0,0,0],
                  [1,1,0,0],
                  [0,1,0,0],
                  [0,1,1,0],
                  [0,0,1,0],
                  [0,0,1,1],
                  [0,0,0,1],
                  [1,0,0,1]];
    this.init();
}

stepperMotor.prototype.init = function() {
    var setupFuncArray = this.funcArrayGen(this.pinSetupFuncGen(this));

}
stepperMotor.prototype.pinSetupFuncGen = function pinSetupFuncGen(thisP) {
    var mygpio = gpio;
    return function(pinNdx) {
        var thisPointer = thisP;
        var gpio = mygpio;
        return function(callback) {
            gpio.setup(thisPointer.motorPins[pinNdx], gpio.DIR_OUT, callback)
        }
    }
}

stepperMotor.prototype.funcArrayGen = function funcArrayGen(func) {
    var result = [];
    for(var i = 0; i < this.motorPins.length; i++) {
        result.push(Q.denodeify(func(i)));
    }
    return result;
}