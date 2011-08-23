/*
 * ${HEADER}
 */

// provides
goog.provide('X.color');

// requires
goog.require('X.base');
goog.require('X.exception');



/**
 * Create a four channel RGBA-color.
 *
 * @constructor
 * @extends {X.base}
 */
X.color = function(red, green, blue) {

  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._className = 'color';

  this._red = red;

  this._green = green;

  this._blue = blue;

  this._alpha = 1.0;

};
// inherit from X.base
goog.inherits(X.color, X.base);

X.color.prototype.getRed = function() {

  return this._red;

};

X.color.prototype.getGreen = function() {

  return this._green;

};

X.color.prototype.getBlue = function() {

  return this._blue;

};

X.color.prototype.getAlpha = function() {

  return this._alpha;

};

X.color.prototype.toArray = function() {

  var colorArray = new Array(4);

  colorArray[0] = this._red;
  colorArray[1] = this._green;
  colorArray[2] = this._blue;
  colorArray[3] = this._alpha;

  return colorArray;

};

X.color.prototype.setAlpha = function(alpha) {

  this._alpha = alpha;

};

// TODO getters/setters
// TODO presets by string (e.g. green, blue etc.)
// TODO fromHex (e.g. #ffffff ..)
