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

X.color.prototype.red = function() {

  return this._red;
  
};

X.color.prototype.green = function() {

  return this._green;
  
};

X.color.prototype.blue = function() {

  return this._blue;
  
};

X.color.prototype.alpha = function() {

  return this._alpha;
  
};

X.color.prototype.flatten = function() {

  var colorArray = new Array(3);
  
  colorArray[0] = this._red;
  colorArray[1] = this._green;
  colorArray[2] = this._blue;
  // colorArray[3] = this._alpha;
  
  return colorArray;
  
};

X.color.prototype.setAlpha = function(alpha) {

  this._alpha = alpha;
  
};

// TODO getters/setters
// TODO presets by string (e.g. green, blue etc.)
// TODO fromHex (e.g. #ffffff ..)

// export symbols (requiered for advanced compilation)
goog.exportSymbol('X.color', X.color);
goog.exportSymbol('X.color.prototype.red', X.color.prototype.red);
goog.exportSymbol('X.color.prototype.green', X.color.prototype.green);
goog.exportSymbol('X.color.prototype.blue', X.color.prototype.blue);
goog.exportSymbol('X.color.prototype.alpha', X.color.prototype.alpha);
goog.exportSymbol('X.color.prototype.flatten', X.color.prototype.flatten);
goog.exportSymbol('X.color.prototype.setAlpha', X.color.prototype.setAlpha);
