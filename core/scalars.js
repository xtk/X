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
  this['_className'] = 'scalars';
  
  // the global id counter
  var counter = window["X.Counter"];
  // ..get a new unique id
  counter.increment();
  
  /**
   * The uniqueId of this object. Each object in XTK has a uniqueId.
   * 
   * @type {number}
   * @protected
   */
  this['_id'] = counter.value();
  
  /**
   * The file containing the scalars.
   * 
   * @type {?X.file|string}
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
  this['_minColor'] = [0, 1, 0];
  
  /**
   * The color to map the max. scalar.
   * 
   * @type {!Array}
   * @protected
   */
  this['_maxColor'] = [1, 0, 0];
  
  /**
   * The lower threshold.
   * 
   * @type {number}
   * @protected
   */
  this['_minThreshold'] = -Infinity;
  
  /**
   * The upper threshold.
   * 
   * @type {number}
   * @protected
   */
  this['_maxThreshold'] = Infinity;
  
  /**
   * Flag to replace the colors after thresholding. If FALSE, discard the the
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
 * Get the id of this scalars container.
 * 
 * @return {number} The id of this scalars container.
 */
X.scalars.prototype.id = function() {

  return this['_id'];
  
};


/**
 * Get the file of this scalars container.
 * 
 * @return {?X.file|string} The file of this scalars container.
 */
X.scalars.prototype.file = function() {

  return this._file;
  
};


/**
 * Set the file for this scalars container.
 * 
 * @param {?X.file|string} file The file path or an X.file object containing the
 *          path.
 */
X.scalars.prototype.setFile = function(file) {

  if (!goog.isDefAndNotNull(file)) {
    
    // null files are allowed
    this._file = null;
    return;
    
  }
  
  if (goog.isString(file)) {
    
    file = new X.file(file);
    
  }
  
  this._file = file;
  
};


/**
 * Set the WebGL-ready array containing the scalars. This marks this object as
 * dirty so the X.renderer can pick it up. Should be only used internally.
 * 
 * @param {Array} array The WebGL-ready array.
 */
X.scalars.prototype.setGlArray = function(array) {

  this._glArray = array;
  
  // also, mark this dirty so the renderer can pick it up
  this._dirty = true;
  
};


/**
 * Set the array containing the scalars. This array has to be WebGL-ready
 * meaning that it has to match X.object.points().length(), which equals 3
 * entries for each vertex (X,Y,Z coordinates). Calling this method marks this
 * object as dirty so the X.renderer can pick it up. This method should be used
 * externally.
 * 
 * @param {Array} array The WebGL-ready array matching
 *          X.object.points().length() in size.
 */
X.scalars.prototype.setArray = function(array) {

  this._array = array;
  this._glArray = array;
  
  // also, mark this dirty so the renderer can pick it up
  this._dirty = true;
  
};


/**
 * Get the min. scalar value.
 * 
 * @return {number} The min. scalar value.
 */
X.scalars.prototype.min = function() {

  return this._min;
  
};


/**
 * Get the max. scalar value.
 * 
 * @return {number} The max. scalar value.
 */
X.scalars.prototype.max = function() {

  return this._max;
  
};


/**
 * Set the color range to linear map the scalars to colors.
 * 
 * @param {Array} minColor The color corresponding to the min. scalar value.
 * @param {Array} maxColor The color corresponding to the max. scalar value.
 * @throws {Error} An exception if the given colors are invalid.
 */
X.scalars.prototype.setColorRange = function(minColor, maxColor) {

  if (!goog.isDefAndNotNull(minColor) || !(minColor instanceof Array) ||
      (minColor.length != 3)) {
    
    throw new Error('Invalid min. color.');
    
  }
  
  if (!goog.isDefAndNotNull(maxColor) || !(maxColor instanceof Array) ||
      (maxColor.length != 3)) {
    
    throw new Error('Invalid max. color.');
    
  }
  
  this['_minColor'] = minColor;
  this['_maxColor'] = maxColor;
  
};


/**
 * Get the color range which maps the scalars to colors in a linear fashion.
 * 
 * @return {Array} An array of length 2 where the min. color is element 0 and
 *         max. color is element 1. The elements are again arrays with length 3.
 */
X.scalars.prototype.colorRange = function() {

  return [this['_minColor'], this['_maxColor']];
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.scalars', X.scalars);
goog.exportSymbol('X.scalars.prototype.min', X.scalars.prototype.min);
goog.exportSymbol('X.scalars.prototype.max', X.scalars.prototype.max);
goog.exportSymbol('X.scalars.prototype.colorRange',
    X.scalars.prototype.colorRange);
goog.exportSymbol('X.scalars.prototype.setColorRange',
    X.scalars.prototype.setColorRange);
goog.exportSymbol('X.scalars.prototype.setArray', X.scalars.prototype.setArray);
