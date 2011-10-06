/*
 * ${HEADER}
 */

// provides
goog.provide('X.color');

// requires
goog.require('X.base');
goog.require('X.exception');



/**
 * Create a three channel RGB-color.
 * 
 * @constructor
 * @name X.color
 * @param {number} red The red value between 0 and 1.
 * @param {number} green The green value between 0 and 1.
 * @param {number} blue The blue value between 0 and 1.
 * @extends {X.base}
 */
X.color = function(red, green, blue) {

  if ((!goog.isNumber(red) || red < 0.0 || red > 1.0)
      || (!goog.isNumber(green) || green < 0.0 || green > 1.0)
      || (!goog.isNumber(blue) || blue < 0.0 || blue > 1.0)) {
    
    throw new X.exception('Fatal: Wrong RGB values - must be in range 0..1!');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'color';
  
  /**
   * The red channel value.
   * 
   * @type {number}
   * @protected
   */
  this._red = red;
  
  /**
   * The green channel value.
   * 
   * @type {number}
   * @protected
   */
  this._green = green;
  
  /**
   * The blue channel value.
   * 
   * @type {number}
   * @protected
   */
  this._blue = blue;
  
};
// inherit from X.base
goog.inherits(X.color, X.base);

/**
 * Get the red channel value.
 * 
 * @returns {number} The value in the range 0..1.
 */
X.color.prototype.red = function() {

  return this._red;
  
};


/**
 * Get the green channel value.
 * 
 * @returns {number} The value in the range 0..1.
 */
X.color.prototype.green = function() {

  return this._green;
  
};


/**
 * Get the blue channel value.
 * 
 * @returns {number} The value in the range 0..1.
 */
X.color.prototype.blue = function() {

  return this._blue;
  
};


/**
 * Create an ordered and flattened 1-D array of this color.
 * 
 * @returns {Array} A one-dimensional array containing the red, green and blue
 *          values.
 */
X.color.prototype.flatten = function() {

  var colorArray = new Array(3);
  
  colorArray[0] = this._red;
  colorArray[1] = this._green;
  colorArray[2] = this._blue;
  
  return colorArray;
  
};


// TODO getters/setters
// TODO presets by string (e.g. green, blue etc.)
// TODO fromHex (e.g. #ffffff ..)

// export symbols (required for advanced compilation)
goog.exportSymbol('X.color', X.color);
goog.exportSymbol('X.color.prototype.red', X.color.prototype.red);
goog.exportSymbol('X.color.prototype.green', X.color.prototype.green);
goog.exportSymbol('X.color.prototype.blue', X.color.prototype.blue);
goog.exportSymbol('X.color.prototype.flatten', X.color.prototype.flatten);
