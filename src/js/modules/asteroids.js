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

  var i, j, len, asteroid, ctx, xMin, xMax, yMin, yMax, clipArea, clipLength, hitCount, tl, br;

  i = 0;
  len = this.asteroids.length;
  ctx = this.ctxMovement;

  for (; i < len; i++) {
    asteroid = this.asteroids[i];

    xMin = -(asteroid.width * 0.5);
    xMax = asteroid.width * 0.5;
    yMin = -(asteroid.height * 0.5);
    yMax = asteroid.height * 0.5;

    // top left = lt, bottom right = br
    tl = [asteroid.x + xMin, asteroid.y + yMin];
    br = [asteroid.x + xMax, asteroid.y + yMax];

    // make sure the x values are on screen
    if (tl[0] < 0) {
      tl[0] = 1;
    } else if (br[0] > this.canvasMovement.width) {
      br[0] = this.canvasMovement.width - 1;
    }

    // make sure the y values are on screen
    if (tl[1] < 0) {
      tl[1] = 1;
    } else if (br[1] > this.canvasMovement.height) {
      br[1] = this.canvasMovement.height - 1;
    }

    ctx.save();
    //ctx.translate(asteroid.x, asteroid.y);
    //ctx.rotate(asteroid.angle * 3.14 / 180);

    // this area does not take into account the rotation
    clipArea = ctx.getImageData(tl[0], tl[1], br[0], br[1]);
    clipLength = (asteroid.width * asteroid.height) * 0.25;
    j = 0;
    hitCount = 0;

    for (; j < clipLength; j++) {
      if (clipArea.data[4 * j] > 0) {
        hitCount++;
      }
    }

    if (hitCount > clipLength * 0.3) {
      asteroid.hit();
    }

    // display debugging
    //ctx.strokeStyle = '#0000ff';
    //ctx.beginPath();
    //ctx.moveTo(tl[0], tl[1]);
    //ctx.lineTo(br[0], tl[1]);
    //ctx.lineTo(br[0], br[1]);
    //ctx.lineTo(tl[0], br[1]);
    //ctx.closePath();
    //ctx.stroke();

    ctx.restore();

  }

};

module.exports = Asteroids;
