var gpio = require('rpi-gpio');
var async = require('async');

function stepperMotor(motorPins) {
    this.motorPins = motorPins;
    var setupFuncArray = this.funcArrayGen(this.pinSetupFuncGen);
    async.parallel(setupFuncArray, function(err, results) {
      console.log("Pins set up");
    })
    this.go();
}

stepperMotor.prototype.cycle = [[1,0,0,0],
                                [1,1,0,0],
                                [0,1,0,0],
                                [0,1,1,0],
                                [0,0,1,0],
                                [0,0,1,1],
                                [0,0,0,1],
                                [1,0,0,1]];
stepperMotor.prototype.pinSetupFuncGen = function pinSetupFuncGen(pinNum) {
    return function(callback) {
        gpio.setup(pinNum, gpio.DIR_OUT, callback)
    }
}

stepperMotor.prototype.funcArrayGen = function funcArrayGen(func) {
    var result = [];
    for(var i = 0; i < this.motorPins.length; i++) {
        result.push(func(this.motorPins[i]));
    }
    return result;
}

stepperMotor.prototype.runMotorFuncGen = function runMotorFuncGen(pinNum) {
    var thisPointer = this;
    console.log(thisPointer);
    return function(callback) {
        gpio.write(pinNum, (thisPointer.cycle[thisPointer.cycleNdx])[pinNum] === 1, callback);
    }
}

//0:stop 1:forward -1:backward
stepperMotor.prototype.runStatus = 1;
stepperMotor.prototype.cycleNdx = 0;
stepperMotor.prototype.velocity = 500;
stepperMotor.prototype.delayWrite = function(pin, value, callback) {
    setTimeout(function() {
        gpio.write(pin, value, vallbeck);
    }, this.velocity)
}

stepperMotor.prototype.go = function() {
    while(!(this.runStatus === 0)) {
        switch(this.runStatus) {
            case 1:
            case 2:
            case -1:
            case -2:
                this.cycleNdx + this.runStatus;
                this.cycleNdx = this.cycleNdx > 7 ? this.cycleNdx - 8 : this.cycleNdx;
                this.cycleNdx = this.cycleNdx < 0 ? this.cycleNdx + 8 : this.cycleNdx;
                var runArray = this.funcArrayGen(this.runMotorFuncGen)
                async.parallel(runArray, function(err, results) {
                  console.log("Pins set up");
                })
                setTimeout(this.go, this.velocity)
                break;
            default:
                console.log("invalid status");
        }
    }
}

//main
var motorPin = [11, 12, 13, 15];
var motor = new stepperMotor(motorPin);

// gpio.setup(motorPin[0], gpio.DIR_OUT, function() {
//     gpio.setup(morotPin[1], gpio.DIR_OUT, function() {
//         gpio.setup(morotPin[2], gpio.DIR_OUT, function() {
//             gpio.setup(morotPin[3], gpio.DIR_OUT, write)
//         })
//     })
// });

// gpio.setup(motorPin[0], gpio.DIR_OUT, setup1);
// function setup1() {
//     gpio.setup(motorPin[1], gpio.DIR_OUT, setup2);
// }
// function setup2() {
//     gpio.setup(motorPin[2], gpio.DIR_OUT, setup3);
// }
// function setup3() {
//     gpio.setup(motorPin[3], gpio.DIR_OUT, run);
// }

// function run() {
//     var running = true;
//     while(running) {
//         for(var i = 0; i < cycle.length; i++) {
//             var pinValue = cycle[i];
//             for (var j = 0; j < pinValue.length; j++) {
//                 gpio.write(motorPin[j], pinValue[j], _writeErrHandle);
//             }
//         }
//     }
// }
// function _writeErrHandle(err) {
//     if (err) {
//         console.log("err");
//     } else {
//         console.log("Write successful!");
//     }
// }