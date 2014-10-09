var webcam = require('./modules/webcam.js');

window.onload = function () {
  if (!webcam.create()) {
    throw new Error('Your browser does not support the webcam.');
  }
};
