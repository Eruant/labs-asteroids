(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var webcam = require('./modules/webcam.js');

window.onload = function () {
  if (!webcam.create()) {
    throw new Error('Your browser does not support the webcam.');
  }
};

},{"./modules/webcam.js":8}],2:[function(require,module,exports){
var Asteroid = function (x, y, ctxSize) {

  this.x = x;
  this.y = y;
  this.ctxSize = ctxSize;
  this.width = Math.random() * 20;
  this.height = Math.random() * 20;
  this.alive = true;

  this.speed = {
    x: Math.random() * 20 - 10,
    y: Math.random() * 20 - 10
  };

  this.angle = Math.floor(Math.random() * 360);

  this.rotation = Math.random() * 0.5 - 0.25;

  this.lastUpdated = new Date().getTime();

};

Asteroid.prototype.reset = function (fromX) {

  this.alive = true;

  if (fromX) {
    this.x = Math.random() * this.ctxSize.width;
    this.y = (Math.random () > 0.5) ? 0 : this.ctxSize.height;
  } else {
    this.x = (Math.random() > 0.5) ? 0 : this.ctxSize.width;
    this.y = Math.random() * this.ctxSize.height;
  }
  this.angle = Math.floor(Math.random() * 360);

  this.speed.x = Math.random() * 20 - 10;
  this.speed.y = Math.random() * 20 - 10;
  this.rotation = Math.random() * 0.5 - 0.25;

};

Asteroid.prototype.update = function (time) {

  var timeSinceLastUpdate = (time - this.lastUpdated) / 1000;

  this.lastUpdated = time;

  this.angle += this.rotation * timeSinceLastUpdate;

  if (this.angle > 360) {
    this.angle -= 360;
  } else if (this.angle < 0) {
    this.angle += 360;
  }

  this.x += this.speed.x * timeSinceLastUpdate;
  this.y += this.speed.y * timeSinceLastUpdate;

  if (!this.alive) {
    this.speed.y += 10;
  }

  if (this.x > this.ctxSize.width ||this.x < 0) {
    this.reset(true);
  } else if (this.y > this.ctxSize.height || this.y < 0) {
    this.reset(false);
  }
};

Asteroid.prototype.draw = function (ctx) {

  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.angle * 3.14 / 180);
  ctx.fillStyle = this.alive ? '#00ff00' : '#ff0000';
  ctx.fillRect(-(this.width * 0.5), -(this.height * 0.5), this.width, this.height);
  ctx.restore();

};

Asteroid.prototype.hit = function () {
  this.alive = false;

  this.speed.x = -this.speed.x;
  this.rotation *= 10;
};

module.exports = Asteroid;

},{}],3:[function(require,module,exports){
var elements = require('./elements.js'),
  util = require('./util.js'),
  fullscreen = require('./fullscreen.js'),
  Asteroid = require('./asteroid.js'),

  global = window,

  Asteroids = function (stream) {

    this.video = global.document.createElement('video');
    this.video.width = 480;
    this.video.height=  360;
    this.video.autoplay = true;

    if (global.navigator.mozGetUserMedia) {
      this.video.mozSrcObject = stream;
    } else {
      this.video.src = (global.webkitURL) ? global.webkitURL.createObjectURL(stream) : stream;
    }

    this.createCanvas();
    this.createAsteroids();

    global.requestAnimationFrame(this.update.bind(this));

  };

Asteroids.prototype.createCanvas = function () {

  this.canvasRaw = elements.createCanvas(this.video.width, this.video.height);
  this.ctxRaw = this.canvasRaw.getContext('2d');

  // mirror the video feed
  this.ctxRaw.translate(this.canvasRaw.width, 0);
  this.ctxRaw.scale(-1, 1);

  this.canvasMovement = elements.createCanvas(this.video.width, this.video.height);
  this.ctxMovement = this.canvasMovement.getContext('2d');

  // show onscreen
  global.document.getElementsByTagName('body')[0].appendChild(this.canvasMovement);

  // add option to make webpage fullscreen
  fullscreen.init(global.document.getElementsByTagName('body')[0]);
};

Asteroids.prototype.createAsteroids = function () {

  var i, len, x, y, asteroid;

  i = 0;
  len = 20;

  this.asteroids = [];

  for (; i < len; i++) {
    x = Math.floor(Math.random() * this.video.width);
    y = Math.floor(Math.random() * this.video.height);
    asteroid = new Asteroid(x, y, {
      width: this.video.width,
      height: this.video.height
    });
    this.asteroids.push(asteroid);
  }
};

Asteroids.prototype.update = function () {

  this.drawVideoToRawCanvas();
  this.calculateAndDrawMotion();
  this.updateAsteroids();
  this.collisionTest();
  this.drawAsteroids();

  global.requestAnimationFrame(this.update.bind(this));
};

Asteroids.prototype.drawVideoToRawCanvas = function () {

  try {
    this.ctxRaw.drawImage(this.video, 0, 0, this.video.width, this.video.height);
  } catch (e) {
    if (e.name === 'NS_ERROR_NOT_AVAILAVLE') {
      // This is a known mozilla bug, it should be okay on the next cycle
    } else {
      throw e;
    }
  }

};

Asteroids.prototype.calculateAndDrawMotion = function () {

  var width, height, sourceData, motionData;

  width = this.canvasRaw.width;
  height = this.canvasRaw.height;

  sourceData = this.ctxRaw.getImageData(0, 0, width, height);

  if (!this.lastImageData) {
    this.lastImageData = sourceData;
  }

  motionData = this.ctxRaw.createImageData(width, height);

  util.difference(motionData.data, sourceData.data, this.lastImageData.data);


  this.ctxMovement.putImageData(motionData, 0, 0);
  this.lastImageData = sourceData;
};

Asteroids.prototype.updateAsteroids = function () {

  var i, len, time;

  i = 0;
  len = this.asteroids.length;
  time = new Date().getTime();

  for (; i < len; i++) {
    this.asteroids[i].update(time);
  }

};

Asteroids.prototype.drawAsteroids = function () {

  var i, len;

  i = 0;
  len = this.asteroids.length;

  for (; i < len; i++) {
    this.asteroids[i].draw(this.ctxMovement);
  }

};

Asteroids.prototype.collisionTest = function () {

  var i, j, len, asteroid, ctx, xMin, xMax, yMin, yMax, clipArea, clipLength, hitCount;

  i = 0;
  len = this.asteroids.length;
  ctx = this.ctxMovement;

  for (; i < len; i++) {
    asteroid = this.asteroids[i];

    xMin = -(asteroid.width * 0.5);
    xMax = asteroid.width * 0.5;
    yMin = -(asteroid.height * 0.5);
    yMax = asteroid.height * 0.5;

    ctx.save();
    //ctx.translate(asteroid.x, asteroid.y);
    //ctx.rotate(asteroid.angle * 3.14 / 180);

    clipArea = ctx.getImageData(asteroid.x + xMin, asteroid.y + yMin, asteroid.x + xMax, asteroid.y + yMax);
    clipLength = (asteroid.width * asteroid.height) * 0.25;
    j = 0;
    hitCount = 0;

    for (; j < clipLength; j++) {
      if (clipArea.data[4 * j] > 0) {
        hitCount++;
      }
    }

    if (hitCount > clipLength * 0.5) {
      asteroid.hit();
    }

    ctx.restore();

  }

};

module.exports = Asteroids;

},{"./asteroid.js":2,"./elements.js":4,"./fullscreen.js":5,"./util.js":7}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
var currentColor = {
  r: 0xff,
  g: 0xff,
  b: 0xff
};

var thresholdValue = 0x15;

/**
 * equivalant to Math.abs();
 */
var fastAbs = function (value) {
  return (value ^ (value >> 31)) - (value >> 31);
};

var threshold = function (value) {
  return (value > thresholdValue) ? value : 0;
};

var aboveThreshold = function (value) {
  return (value > thresholdValue) ? false : true;
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

var difference = function (target, data1, data2) {

  var i, len, avarage1, average2, diff, randomColor;

  if (data1.length !== data2.length) {
    return null;
  }

  i = 0;
  len = data1.length * 0.25;
  while (i < len) {

    avarage1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
    avarage2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;

    diff = aboveThreshold(fastAbs(avarage1 - avarage2));

    if (!diff) {
      target[4 * i] = 0xff;
      target[4 * i + 1] = 0xff;
      target[4 * i + 2] = 0xff;
    }
    target[4 * i + 3] = threshold(fastAbs(avarage1 - avarage2));

    ++i;
  }

};

module.exports = {
  threshold: threshold,
  aboveThreshold: aboveThreshold,
  difference: difference
};

},{}],8:[function(require,module,exports){
var polyfill = require('./polyfill.js'),
  Asteroids = require('./asteroids.js');

var global = window;

var success = function (stream) {
  var asteroids = new Asteroids(stream);
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

},{"./asteroids.js":3,"./polyfill.js":6}]},{},[1]);
