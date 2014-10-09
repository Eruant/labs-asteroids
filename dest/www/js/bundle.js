(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var webcam = require('./modules/webcam.js');

window.onload = function () {
  if (!webcam.create()) {
    throw new Error('Your browser does not support the webcam.');
  }
};

},{"./modules/webcam.js":7}],2:[function(require,module,exports){
var elements = require('./elements.js'),
  util = require('./util.js'),
  fullscreen = require('./fullscreen.js');

var global = window;

var Motion = function (stream) {

  this.video = global.document.createElement('video');
  this.video.width = 480;
  this.video.height = 360;
  this.video.autoplay = true;
  this.video.src = (global.webkitURL) ? global.webkitURL.createObjectURL(stream) : stream;

  // TODO remove after testing
  //global.document.getElementsByTagName('body')[0].appendChild(this.video);

  this.createCanvas();

  global.requestAnimationFrame(this.update.bind(this));
};

Motion.prototype.createCanvas = function () {

  this.canvasRaw = elements.createCanvas(this.video.width, this.video.height);
  this.ctxRaw = this.canvasRaw.getContext('2d');

  // mirror the image
  this.ctxRaw.translate(this.canvasRaw.width, 0);
  this.ctxRaw.scale(-1, 1);

  this.canvasMovement = elements.createCanvas(this.video.width, this.video.height);
  this.ctxMovement = this.canvasMovement.getContext('2d');

  this.canvasDirections = elements.createCanvas(this.video.width, this.video.height);
  this.ctxDirections = this.canvasDirections.getContext('2d');

  //global.document.getElementsByTagName('body')[0].appendChild(this.canvasRaw);
  global.document.getElementsByTagName('body')[0].appendChild(this.canvasMovement);
  //global.document.getElementsByTagName('body')[0].appendChild(this.canvasDirections);

  //fullscreen.init(this.canvasMovement);
  fullscreen.init();

};

Motion.prototype.update = function () {

  this.drawVideo();
  this.blend();

  global.requestAnimationFrame(this.update.bind(this));
};

Motion.prototype.drawVideo = function () {
  this.ctxRaw.drawImage(this.video, 0, 0, this.video.width, this.video.height);
};

Motion.prototype.blend = function () {

  var width, height, sourceData, blendedData, lastUpdate;

  width = this.canvasRaw.width;
  height = this.canvasRaw.height;

  sourceData = this.ctxRaw.getImageData(0, 0, width, height);

  if (!this.lastImageData) {
    this.lastImageData = this.ctxRaw.getImageData(0, 0, width, height);
  }

  blendedData = this.ctxRaw.createImageData(width, height);
  lastUpdate = this.ctxDirections.getImageData(0, 0, width, height);

  util.difference(blendedData.data, sourceData.data, this.lastImageData.data, lastUpdate.data);

  this.ctxMovement.putImageData(blendedData, 0, 0);
  this.lastImageData = sourceData;

  this.ctxDirections.clearRect(0, 0, width, height);
  this.ctxDirections.drawImage(this.canvasMovement, 0, 0);
};

module.exports = Motion;

},{"./elements.js":3,"./fullscreen.js":4,"./util.js":6}],3:[function(require,module,exports){
var global = window,
  doc = global.document;

var createCanvas = function (width, height) {

  var canvas = doc.createElement('canvas');
  canvas.width = width || 640;
  canvas.height = height || 480;

  return canvas;
};

module.exports = {
  createCanvas: createCanvas
};

},{}],4:[function(require,module,exports){
var activeElement = window.document.getElementsByTagName('body')[0];

var requestFullScreen = function (el) {

  if (el.requestFullScreen) {
    el.requestFullScreen();
  } else if (el.msRequestFullScreen) {
    el.msRequestFullScreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequastFullScreen();
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
var currentColor = {
  r: 0xff,
  g: 0xff,
  b: 0xff
};

/**
 * equivalant to Math.abs();
 */
var fastAbs = function (value) {
  return (value ^ (value >> 31)) - (value >> 31);
};

var threshold = function (value) {
  return (value > 0x15) ? value : 0;
};

var aboveThreshold = function (value) {
  return (value > 0x15) ? false : true;
};

var cycleColor = function () {

  var color = {
    r: currentColor.r + (Math.random() * 10 - 5),
    b: currentColor.b + (Math.random() * 10 - 5),
    g: currentColor.g + (Math.random() * 10 - 5)
  };
  
  color.r = (color.r >= 0xff ? 0xff : (color.r <= 0 ? 0 : color.r));
  color.g = (color.g >= 0xff ? 0xff : (color.g <= 0 ? 0 : color.g));
  color.b = (color.b >= 0xff ? 0xff : (color.b <= 0 ? 0 : color.b));

  currentColor = color;

  return color;
};

var difference = function (target, data1, data2, lastBlend) {

  var i, len, avarage1, average2, diff, randomColor;

  if (data1.length !== data2.length) {
    return null;
  }

  randomColor = cycleColor();

  i = 0;
  len = data1.length * 0.25;
  while (i < len) {

    avarage1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
    avarage2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;

    diff = aboveThreshold(fastAbs(avarage1 - avarage2));

    target[4 * i] = 0xff;
    target[4 * i + 1] = 0xff;
    target[4 * i + 2] = 0xff;
    target[4 * i + 3] = threshold(fastAbs(avarage1 - avarage2));

    if (lastBlend[4 * i + 3] !== 0) {
      target[4 * i] = randomColor.r;
      target[4 * i + 1] = randomColor.g;
      target[4 * i + 2] = randomColor.b;
      target[4 * i + 3] = Math.floor(lastBlend[4 * i + 3] * 0.9999);
    }

    ++i;
  }

};

module.exports = {
  threshold: threshold,
  aboveThreshold: aboveThreshold,
  difference: difference
};

},{}],7:[function(require,module,exports){
var polyfill = require('./polyfill.js'),
  Motion = require('./coreMotion.js');

var global = window;

var success = function (stream) {
  var motion = new Motion(stream);

  //global.document.addEventListener('keydown', function (event) {
    //if (event.keyCode === 13) {
      //polyfill.requestFullScreen(motion.video);
    //}
  //});
};

var error = function () {
  throw new Error('Access has been denied');
};

var create = function () {

  polyfill.init();

  if (!global.navigator.getUserMedia) {
    return false;
  }

  global.navigator.getUserMedia({
    video: true,
    audio: false
  }, success, error);

  return true;

};

module.exports = {
  create: create
};

},{"./coreMotion.js":2,"./polyfill.js":5}]},{},[1]);
