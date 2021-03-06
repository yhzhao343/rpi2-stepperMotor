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
    var runStatus = -runStatus; = 1;
    var cycleNdx = 0;
    var velocity = 20;
    //max speed for runStatus 1 is 20

    var lastState = Q();
    var stepInterval = undefined;
    this.stop = function() {
        clearInterval(stepInterval);
    }
    this.setVelocity = function(vel) {
        if (stepInterval) {
            this.stop();
            velocity = vel;
            this.go();
        } else {
            velocity = vel;
        }
    }
    this._setStepInterval = function(newInterval) {
        stepInterval = newInterval;
    }
    this.reverse = function() {
        runStatus = -runStatus;
    }
    this.newState = function(newState) {
        lastState = lastState.then(newState, console.log)
    }
    this.getVelocity = function() {
        return velocity
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
    this._init();

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
    gpio.write(pinNum, val, function(err, res) {

        deferred.resolve();
    })
    return deferred.promise.nodeify(callback);
}

Motor.prototype._init = function _init() {
    var motorPins = this.getMotorPins();
    for(var i = 0; i < this.getMotorPins().length; i++) {
        this.newState(setupPin_out(motorPins[i]));
    }
}

Motor.prototype.step = function step() {
    var cycleState = this._increCycleNdx();
    var pinVal = cycle[cycleState];
    var motorPins = this.getMotorPins();
    var status = this.getRunStatus();
    if ((status == 1 )|| (status == -1)) {
        switch(cycleState) {
            case 0:
                this.newState(writePin(motorPins[3], pinVal[3]));
                break;
            case 7:
                this.newState(writePin(motorPins[0], pinVal[0]));
                break;
            case 2:
            case 4:
            case 6:
                this.newState(writePin(motorPins[cycleState/2 - 1], pinVal[cycleState/2 - 1]));
                break;
            case 1:
            case 3:
            case 5:
                this.newState(writePin(motorPins[(cycleState + 1)/2], pinVal[(cycleState + 1)/2]));
                break;
        }
    } else {
        cycleState = cycleState%2 == 1 ? cycleState-1 : cycleState
        switch(cycleState) {
            case 0:
                this.newState(writePin(motorPins[0], pinVal[0]));
                this.newState(writePin(motorPins[3], pinVal[3]));
                break;
            default:
                this.newState(writePin(motorPins[cycleState/2], pinVal[cycleState/2]));
                this.newState(writePin(motorPins[cycleState/2 - 1], pinVal[cycleState/2 - 1]));
                break;
        }

    }
}

Motor.prototype.go = function() {
    var thisP = this;
    var callMethod = function() {
        thisP.step();
    }
    var setStepInterval = function() {
        thisP._setStepInterval(setInterval(callMethod, thisP.getVelocity()));
    }
    setTimeout(setStepInterval, 30);
}
exports.Motor = Motor;