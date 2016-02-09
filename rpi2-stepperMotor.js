var gpio = require('rpi-gpio');
var async = require('async');

function stepperMotor(motorPins) {
    this.runStatus = 1;
    this.cycleNdx = 0;
    this.velocity = 500;
    this.motorPins = motorPins;
    this.init();
}

stepperMotor.prototype.init = function() {
    var setupFuncArray = this.funcArrayGen(this.pinSetupFuncGen(this));
    async.parallel(setupFuncArray, function(err, results) {
      console.log("Pins set up");
    })
}

stepperMotor.prototype.cycle = [[1,0,0,0],
                                [1,1,0,0],
                                [0,1,0,0],
                                [0,1,1,0],
                                [0,0,1,0],
                                [0,0,1,1],
                                [0,0,0,1],
                                [1,0,0,1]];
stepperMotor.prototype.pinSetupFuncGen = function pinSetupFuncGen(thisP) {
    return function(pinNdx) {
        var thisPointer = thisP;
        return function(callback) {
            gpio.setup(thisPointer.motorPins[pinNdx], gpio.DIR_OUT, callback)
        }
    }
}

stepperMotor.prototype.funcArrayGen = function funcArrayGen(func) {
    var result = [];
    for(var i = 0; i < this.motorPins.length; i++) {
        result.push(func(i));
    }
    return result;
}

stepperMotor.prototype.runMotorFuncGen = function runMotorFuncGen(thisP) {
    return function(pinNdx) {
        var thisPointer = thisP;
        return function(callback) {
            gpio.write(thisPointer.motorPins[pinNdx], (thisPointer.cycle[thisPointer.cycleNdx])[pinNdx] === 1, callback);
        }
    }
}

//0:stop 1:forward -1:backward

stepperMotor.prototype.delayWrite = function(pin, value, callback) {
    setTimeout(function() {
        gpio.write(pin, value, vallbeck);
    }, this.velocity)
}


stepperMotor.prototype.step = function() {
    switch(this.runStatus) {
        case 1:
        case 2:
        case -1:
        case -2:
            this.cycleNdx += this.runStatus;
            this.cycleNdx = this.cycleNdx > 7 ? this.cycleNdx - 8 : this.cycleNdx;
            this.cycleNdx = this.cycleNdx < 0 ? this.cycleNdx + 8 : this.cycleNdx;
            var runArray = this.funcArrayGen(this.runMotorFuncGen)
            async.parallel(runArray, function(err, results) {
              console.log("Pins set");
            })
            break;
        default:
            console.log("invalid status");
    }
}

//main
var motorPins = [11, 12, 13, 15];
var motor = new stepperMotor(motorPins);
setInterval(motor.step, motor.velocity);
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