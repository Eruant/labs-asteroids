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

  this.canvasDirections = elements.createCanvas(this.video.width, this.video.height);
  this.ctxDirections = this.canvasDirections.getContext('2d');

  //global.document.getElementsByTagName('body')[0].appendChild(this.canvasRaw);
  global.document.getElementsByTagName('body')[0].appendChild(this.canvasMovement);
  global.document.getElementsByTagName('body')[0].appendChild(this.canvasDirections);

};

Motion.prototype.update = function () {

  this.drawVideo();
  this.blend();

  this.drawDirections();

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

Motion.prototype.drawDirections = function () {

  // calculate directions based in canvas data
};

module.exports = Motion;
