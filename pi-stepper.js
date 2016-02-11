var gpio = require('rpi-gpio');
var Q = require('q');
var cycle_8 = [[true,false,false,false],
               [true,true,false,false],
               [false,true,false,false],
               [false,true,true,false],
               [false,false,true,false],
               [false,false,true,true],
               [false,false,false,true],
               [true,false,false,true]];

function setupPin_out(pinNum, callback) {
    var deferred = Q.defer();
    gpio.setup(pinNum, gpio.DIR_OUT, function() {
        deferred.resolve();
    })
    return deferred.promise.nodeify(callback);
}

function Motor(motorPins) {
    var motorPins = motorPins;
    var runStatus = 1;
    var cycleNdx = 0;
    var velocity = 500;
    var lastState = null;

    this.getVelocity = function() {
        return velocity
    }
    this.setVelocity = function(vel) {
        velocity = vel
    }
    this.getRunStatus = function() {
        return runStatus
    }
    this.setRunStatus = function(status) {
        switch(status) {
            case 1:
            case 2:
            case -1:
            case -2:
                runStatus = status;
                break;
            default:
                console.log("Invalid status! Set failed");
        }
    }
    this.getCycleNdx = function() {return cycleNdx}
    this.getMotorPins = function() {
        return motorPins
    }
    lastState = this._init();
    this.newState = function(newState) {
        lastState = lastState.then(newState)
    }
}

function writePin(pinNum, val, callback) {
    var deferred = Q.defer();
    gpio.setup(pinNum, val, function() {
        deferred.resolve();
    })
    referred.resolve();
}

Motor.prototype._init = function _init() {
    var deferred = Q.defer();
    var allPromises = [];
    console.log(this);
    for(var i = 0; i < this.getMotorPins().length; i++) {
        allPromises.push(setupPin_out(this.getMotorPins()[i]));
    }
    Q.all(allPromises).then(
        function() {
            deferred.resolve();
            console.log("pin initiation finished~");
        }, console.error)

    return deferred.promise;
}
exports.Motor = Motor;
// Motor.prototype.step = function step() {
//     var deferred = Q.defer();

// }