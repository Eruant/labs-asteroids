var global = window;

var init = function () {

  global.navigator.getUserMedia = (global.navigator.getUserMedia ||
    global.navigator.mozGetUserMedia ||
    global.navigator.webkitGetUserMedia ||
    global.navigator.msGetUserMedia ||
    undefined);
};

var requestFullScreen = function (el) {

  if (el.requestFullScreen) {
    el.requestFullScreen();
  } else if (el.msRequestFullScreen) {
    el.msRequestFullScreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullScreen) {
    el.webkitRequestFullScreen();
  }

};

module.exports = {
  init: init,
  requestFullScreen: requestFullScreen
};
