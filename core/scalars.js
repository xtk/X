/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.scalars');

// requires
goog.require('X.base');
goog.require('X.file');



/**
 * Create a container for a scalar array.
 * 
 * @constructor
 * @extends X.base
 */
X.scalars = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'scalars';
  
  /**
   * The file containing the scalars.
   * 
   * @type {?X.file}
   * @protected
   */
  this._file = null;
  
  /**
   * The array containing the scalars.
   * 
   * @type {?Array}
   * @protected
   */
  this._array = null;
  
  /**
   * The WebGL-ready version of the scalars array.
   * 
   * @type {?Array}
   * @protected
   */
  this._glArray = null;
  
  /**
   * The min. scalar.
   * 
   * @type {number}
   * @protected
   */
  this._min = Infinity;
  
  /**
   * The max. scalar.
   * 
   * @type {number}
   * @protected
   */
  this._max = -Infinity;
  
  /**
   * The color to map the min. scalar.
   * 
   * @type {!Array}
   * @protected
   */
  this._minColor = [0, 1, 0];
  
  /**
   * The color to map the max. scalar.
   * 
   * @type {!Array}
   * @protected
   */
  this._maxColor = [1, 0, 0];
  
  /**
   * The lower threshold.
   * 
   * @type {number}
   * @protected
   */
  this._lowerThreshold = -Infinity;
  
  /**
   * The upper threshold.
   * 
   * @type {number}
   * @protected
   */
  this._upperThreshold = Infinity;
  
  /**
   * Flag to replace the colors after thresholding. If FALSE, discard the
   * vertex.
   * 
   * @type {boolean}
   * @protected
   */
  this._replaceMode = true;
  
};
// inherit from X.base
goog.inherits(X.scalars, X.base);


/**
 * Get the file of this scalar container.
 * 
 * @return {?X.file} The file of this scalar container.
 * @public
 */
X.scalars.prototype.__defineGetter__('file', function() {

  return this._file;
  
});


/**
 * Set the file for this scalar container.
 * 
 * @param {?X.file|string} file The file path or an X.file object containing the
 *          path.
 * @public
 */
X.scalars.prototype.__defineSetter__('file', function(file) {

  if (!goog.isDefAndNotNull(file)) {
    
    // null files are allowed
    this._file = null;
    return;
    
  }
  
  if (goog.isString(file)) {
    
    file = new X.file(file);
    
  }
  
  this._file = file;
  
});


/**
 * Get the array containing the scalars. This array is 'WebGL-ready', meaning
 * that all values are represented by 3 elements to match the X,Y,Z coordinates
 * of points.
 * 
 * @public
 */
X.scalars.prototype.__defineGetter__('array', function() {

  return this._array;
  
});


/**
 * Set the array containing the scalars. This array has to be WebGL-ready
 * meaning that it has to match X.object.points().length(), which equals 3
 * entries for each vertex (X,Y,Z coordinates). Calling this method marks this
 * object as dirty so the X.renderer can pick it up. This method should be used
 * externally.
 * 
 * @param {Array} array The WebGL-ready array matching
 *          X.object.points().length() in size.
 * @public
 */
X.scalars.prototype.__defineSetter__('array', function(array) {

  this._array = array;
  this._glArray = array;
  
  // also, mark this dirty so the renderer can pick it up
  this._dirty = true;
  
});


/**
 * Get the lower threshold.
 * 
 * @return {number} The lower threshold.
 * @public
 */
X.scalars.prototype.__defineGetter__('lowerThreshold', function() {

  return this._lowerThreshold;
  
});


/**
 * Set the lower threshold if it is inside the min-max range.
 * 
 * @param {number} lowerThreshold
 * @public
 */
X.scalars.prototype.__defineSetter__('lowerThreshold',
    function(lowerThreshold) {

      if (lowerThreshold <= this._min && lowerThreshold >= this._max) {
        
        this._lowerThreshold = lowerThreshold;
        
      }
      
    });


/**
 * Get the upper threshold.
 * 
 * @return {number} The upper threshold.
 * @public
 */
X.scalars.prototype.__defineGetter__('upperThreshold', function() {

  return this._upperThreshold;
  
});


/**
 * Set the upper threshold if it is inside the min-max range.
 * 
 * @param {number} upperThreshold
 * @public
 */
X.scalars.prototype.__defineSetter__('upperThreshold',
    function(upperThreshold) {

      if (upperThreshold <= this._min && upperThreshold >= this._max) {
        
        this._upperThreshold = upperThreshold;
        
      }
      
    });


/**
 * Get the min. scalar value.
 * 
 * @return {number} The min. scalar value.
 * @public
 */
X.scalars.prototype.__defineGetter__('min', function() {

  return this._min;
  
});


/**
 * Get the max. scalar value.
 * 
 * @return {number} The max. scalar value.
 * @public
 */
X.scalars.prototype.__defineGetter__('max', function() {

  return this._max;
  
});


/**
 * Get the min color which is used to map the scalars to colors in a linear
 * fashion.
 * 
 * @return {!Array} An array holding the r,g,b components of the color.
 * @public
 */
X.scalars.prototype.__defineGetter__('minColor', function() {

  return this._minColor;
  
});


/**
 * Set the min color to linear map the scalars to colors.
 * 
 * @param {!Array} minColor The color corresponding to the min. scalar value.
 * @public
 */
X.scalars.prototype.__defineSetter__('minColor', function(minColor) {

  if (!goog.isDefAndNotNull(minColor) || !(minColor instanceof Array) ||
      (minColor.length != 3)) {
    
    throw new Error('Invalid min. color.');
    
  }
  
  this._minColor = minColor;
  
});


/**
 * Get the max color which is used to map the scalars to colors in a linear
 * fashion.
 * 
 * @return {!Array} An array holding the r,g,b components of the color.
 * @public
 */
X.scalars.prototype.__defineGetter__('maxColor', function() {

  return this._maxColor;
  
});


/**
 * Set the max color to linear map the scalars to colors.
 * 
 * @param {!Array} maxColor The color corresponding to the min. scalar value.
 * @public
 */
X.scalars.prototype.__defineSetter__('maxColor', function(maxColor) {

  if (!goog.isDefAndNotNull(maxColor) || !(maxColor instanceof Array) ||
      (maxColor.length != 3)) {
    
    throw new Error('Invalid max. color.');
    
  }
  
  this._maxColor = maxColor;
  
});

// export symbols (required for advanced compilation)
goog.exportSymbol('X.scalars', X.scalars);
