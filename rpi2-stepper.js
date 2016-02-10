var gpio = require('rpi-gpio');
var async = require('async');
function stepperMotor(motorPins) {
    this.runStatus = 1;
    this.cycleNdx = 0;
    this.velocity = 500;
    this.motorPins = motorPins;
    this.cycle  = [[true,false,false,false],
                   [true,true,false,false],
                   [false,true,false,false],
                   [false,true,true,false],
                   [false,false,true,false],
                   [false,false,true,true],
                   [false,false,false,true],
                   [true,false,false,true]];
    this.init();
    //setInterval(this.step(this), this.velocity);
}


stepperMotor.prototype.init = function() {
    var setupFuncArray = this.funcArrayGen(this.pinSetupFuncGen(this));
    async.parallel(setupFuncArray, function(err, results) {
      console.log("Pins set up");
    })
}

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

// stepperMotor.prototype.runMotorFuncGen = function runMotorFuncGen(thisP) {
//     return function(pinNdx) {
//         var thisPointer = thisP;
//         return function(callback) {
//             gpio.write(thisPointer.motorPins[pinNdx], (thisPointer.cycle[thisPointer.cycleNdx])[pinNdx] === 1, callback);
//         }
//     }
// }

//0:stop 1:forward -1:backward

// stepperMotor.prototype.delayWrite = function(pin, value, callback) {
//     setTimeout(function() {
//         gpio.write(pin, value, vallbeck);
//     }, this.velocity)
// }


stepperMotor.prototype.step = function(thisP) {
    switch(thisP.runStatus) {
        case 1:
        case 2:
        case -1:
        case -2:
            thisP.cycleNdx += thisP.runStatus;
            thisP.cycleNdx = thisP.cycleNdx > 7 ? thisP.cycleNdx - 8 : thisP.cycleNdx;
            thisP.cycleNdx = thisP.cycleNdx < 0 ? thisP.cycleNdx + 8 : thisP.cycleNdx;
            //var runArray = thisP.funcArrayGen(thisP.runMotorFuncGen)
            // async.parallel(runArray, function(err, results) {
            //   console.log("Pins set");
            // })
            var val2Write = thisP.cycle[thisP.cycleNdx];
            for (var i = 0; i < thisP.motorPins.length; i++) {
                gpio.write(thisP.motorPins[i], val2Write[i], function(){})
            };
            break;
        default:
            console.log("invalid status");
    }
}

//main
var motorPins = [11, 12, 13, 15];
var motor = new stepperMotor(motorPins);
