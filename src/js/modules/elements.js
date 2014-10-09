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
