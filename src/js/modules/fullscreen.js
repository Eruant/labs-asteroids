var activeElement = window.document.getElementsByTagName('body')[0];

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

var eventHandler = function (event) {

  if (event.keyCode === 13) {
    requestFullScreen(activeElement);
  }

};

var addListener = function () {
  window.document.addEventListener("keydown", eventHandler, false);
};

var init = function (el) {

  if (typeof el !== 'undefined') {
    activeElement = el;
  }

  addListener();

};

module.exports = {
  init: init
};
