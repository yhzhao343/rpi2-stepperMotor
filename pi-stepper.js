var gpio = require('rpi-gpio');
var Q = require('q');
var cycle = [[true,false,false,false],
               [true,true,false,false],
               [false,true,false,false],
               [false,true,true,false],
               [false,false,true,false],
               [false,false,true,true],
               [false,false,false,true],
               [true,false,false,true]];

function Motor(motorPins) {
    var motorPins = motorPins;
    var runStatus = 1;
    var cycleNdx = 0;
    var velocity = 50;
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
    this._increCycleNdx = function() {
        var result = cycleNdx;
        cycleNdx += runStatus;
        cycleNdx = cycleNdx > 7 ? cycleNdx - 8 : cycleNdx;
        cycleNdx = cycleNdx < 0 ? cycleNdx + 8 : cycleNdx;
        return result;
    }
    this.getMotorPins = function() {
        return motorPins
    }
    lastState = this._init();
    this.newState = function(newState) {
        lastState = lastState.then(newState, console.log)
    }
}

function setupPin_out(pinNum, callback) {
    var deferred = Q.defer();
    gpio.setup(pinNum, gpio.DIR_OUT, function() {
        deferred.resolve();
    })
    return deferred.promise.nodeify(callback);
}

function writePin(pinNum, val, callback) {
    var deferred = Q.defer();
    gpio.setup(pinNum, val, function() {
        console.log("writePin");
        deferred.resolve();
    })
    return deferred.promise.nodeify(callback);
}

Motor.prototype._init = function _init() {
    var deferred = Q.defer();
    var allPromises = [];
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

Motor.prototype.step = function step() {
    var cycleState = this._increCycleNdx();
    var pinVal = cycle[cycleState];
    console.log("pinVal: " + pinVal);
    for (var i = 0; i < pinVal.length; i++) {
        this.newState(writePin(this.getMotorPins()[i], pinVal[i]), function() {console.log("writePin")});
    }
}

Motor.prototype.go = function() {
    var thisP = this;
    var callMethod = function() {
        thisP.step();
    }
    var inter = setInterval(callMethod, thisP.getVelocity());
}
exports.Motor = Motor;