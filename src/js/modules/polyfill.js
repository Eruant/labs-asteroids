var global = window;

var init = function () {

  global.navigator.getUserMedia = (global.navigator.getUserMedia ||
    global.navigator.mozGetUserMedia ||
    global.navigator.webkitGetUserMedia ||
    global.navigator.msGetUserMedia ||
    undefined);
};

module.exports = {
  init: init
};
