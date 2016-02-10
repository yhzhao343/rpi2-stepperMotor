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
    this.init().then(this.set0()).done();
}

stepperMotor.prototype.init = function init() {
    return Q.nfcall(gpio.setup, this.motorPins[0], gpio.DIR_OUT)
    // return Q.all(this.funcArrayGen(this.pinSetupFuncGen(this)));
}
stepperMotor.prototype.set0 = function set0() {
    return Q.nfcall(gpio.write, this.motorPins[0], true);
}
// stepperMotor.prototype.pinSetupFuncGen = function pinSetupFuncGen(thisP) {
//     var mygpio = gpio;
//     return function(pinNdx) {
//         mygpio.setup(thisP.motorPins[pinNdx], mygpio.DIR_OUT)
//     }
// }

// stepperMotor.prototype.funcArrayGen = function funcArrayGen(func) {
//     var result = [];
//     for(var i = 0; i < this.motorPins.length; i++) {
//         result.push(Q.denodeify(func(i)));
//     }
//     return result;
// }

// stepperMotor.prototype.go = function go() {
//     setInterval(this.step(this), this.velocity)
// }

stepperMotor.prototype.step = function(thisPointer) {
    switch(thisPointer.runStatus) {
        case 1:
        case 2:
        case -1:
        case -2:
            thisPointer.cycleNdx += thisPointer.runStatus;
            thisPointer.cycleNdx = thisPointer.cycleNdx > 7 ? thisPointer.cycleNdx - 8 : thisPointer.cycleNdx;
            thisPointer.cycleNdx = thisPointer.cycleNdx < 0 ? thisPointer.cycleNdx + 8 : thisPointer.cycleNdx;
            var val2Write = thisP.cycle[thisP.cycleNdx];
            for (var i = 0; i < thisP.motorPins.length; i++) {
                gpio.write(thisP.motorPins[i], val2Write[i], function(){})
            };
            break;
        default:
            console.log("invalid status");
    }
}
var motorPins = [11, 12, 13, 15];
var motor = new stepperMotor(motorPins);