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
