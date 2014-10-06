(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var webcam = require('./modules/webcam.js');

window.onload = function () {
  if (!webcam.create()) {
    throw new Error('Your browser does not support the webcam.');
  }
};

},{"./modules/webcam.js":6}],2:[function(require,module,exports){
var elements = require('./elements.js'),
  util = require('./util.js');

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

  //global.document.getElementsByTagName('body')[0].appendChild(this.canvasRaw);
  global.document.getElementsByTagName('body')[0].appendChild(this.canvasMovement);

};

Motion.prototype.update = function () {

  this.drawVideo();
  this.blend();
  //this.render();

  global.requestAnimationFrame(this.update.bind(this));
};

Motion.prototype.drawVideo = function () {
  this.ctxRaw.drawImage(this.video, 0, 0, this.video.width, this.video.height);
};

Motion.prototype.blend = function () {

  var width, height, sourceData, blendedData;

  width = this.canvasRaw.width;
  height = this.canvasRaw.height;

  sourceData = this.ctxRaw.getImageData(0, 0, width, height);

  if (!this.lastImageData) {
    this.lastImageData = this.ctxRaw.getImageData(0, 0, width, height);
  }

  blendedData = this.ctxRaw.createImageData(width, height);

  if (!this.lastBlendedData) {
    this.lastBlendedData = null;
  }
  
  util.difference(blendedData.data, sourceData.data, this.lastImageData.data, this.lastBlendedData);

  this.ctxMovement.putImageData(blendedData, 0, 0);
  this.lastImageData = sourceData;
  this.lastBlendedData = blendedData;
};

Motion.prototype.render = function () {
  this.ctxMovement.drawImage(this.canvasRaw, 0, 0);
};

module.exports = Motion;

},{"./elements.js":3,"./util.js":5}],3:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

var difference = function (target, data1, data2) {

  var i;

  if (data1.length !== data2.length) {
    return null;
  }

  i = 0;
  while (i < (data1.length * 0.25)) {


    target[4 * i] = (data1[4 * i] === 0) ? 0 : fastAbs(data1[4 * i] - data2[4 * i]);                  // r
    target[4 * i + 1] = (data1[4 * i + 1] === 0) ? 0 : fastAbs(data1[4 * i + 1] - data2[4 * i + 1]);  // g
    target[4 * i + 2] = (data1[4 * i + 2] === 0) ? 0 : fastAbs(data1[4 * i + 2] - data2[4 * i + 2]);  // b
    target[4 * i + 3] = 0xFF;                                                                             // a

    ++i;
  }

};

var differenceAcurate = function (target, data1, data2, lastBlend) {

  var i, avarage1, average2, diff;

  if (data1.length !== data2.length) {
    return null;
  }

  i = 0;
  while (i < (data1.length * 0.25)) {

    avarage1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
    avarage2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;

    diff = aboveThreshold(fastAbs(avarage1 - avarage2));

    if (lastBlend !== null) {

      // add in last frame
      if (lastBlend.data[4 * i] !== 0) {
        target[4 * i] = 0x88;
        target[4 * i + 1] = 0x88;
        target[4 * i + 2] = 0x88;
        target[4 * i + 3] = 0xff;
      }

    }

    if (diff) {

      target[4 * i] = (data1[4 * i] === 0) ? 0 : fastAbs(data1[4 * i] - data2[4 * i]);                  // r
      target[4 * i + 1] = (data1[4 * i + 1] === 0) ? 0 : fastAbs(data1[4 * i + 1] - data2[4 * i + 1]);  // g
      target[4 * i + 2] = (data1[4 * i + 2] === 0) ? 0 : fastAbs(data1[4 * i + 2] - data2[4 * i + 2]);  // b
      target[4 * i + 3] = 0xff;                                                                         // a

    }

    ++i;
  }

};

module.exports = {
  threshold: threshold,
  aboveThreshold: aboveThreshold,
  difference: differenceAcurate
};

},{}],6:[function(require,module,exports){
var polyfill = require('./polyfill.js'),
  Motion = require('./coreMotion.js');

var global = window;

var success = function (stream) {
  var motion = new Motion(stream);

  global.document.addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
      polyfill.requestFullScreen(motion.video);
    }
  });
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

},{"./coreMotion.js":2,"./polyfill.js":4}]},{},[1]);
