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
