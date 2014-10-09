var elements = require('./elements.js'),
  util = require('./util.js'),
  fullscreen = require('./fullscreen.js');

var global = window;

var Motion = function (stream) {

  this.video = global.document.createElement('video');
  this.video.width = 480;
  this.video.height = 360;
  this.video.autoplay = true;

  if (global.navigator.mozGetUserMedia) {
    this.video.mozSrcObject = stream;
  } else {
    this.video.src = (global.webkitURL) ? global.webkitURL.createObjectURL(stream) : stream;
  }

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
  try {
    this.ctxRaw.drawImage(this.video, 0, 0, this.video.width, this.video.height);
  } catch (e) {
    if (e.name === 'NS_ERROR_NOT_AVAILABLE') {
      console.log('mozilla bug');
    } else {
      throw e;
    }
  }
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
