var Motor = require('./pi-stepper.js').Motor;
var myMotor = new Motor([11,12,13,15]);
myMotor.go();