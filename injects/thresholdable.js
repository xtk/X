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
goog.provide('X.thresholdable');

// requires
goog.require('X.base');



/**
 * Injective mix-in for all thresholdable objects.
 * 
 * @constructor
 */
X.thresholdable = function() {

  /**
   * The lower threshold border.
   * 
   * @type {number}
   * @protected
   */
  this._min = Infinity;
  
  /**
   * The upper threshold border.
   * 
   * @type {number}
   * @protected
   */
  this._max = -Infinity;
  
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
   * The color to map the min. scalar.
   * 
   * @type {!Array}
   * @protected
   */
  this._minColor = [0, 0, 0];
  
  /**
   * The color to map the max. scalar.
   * 
   * @type {!Array}
   * @protected
   */
  this._maxColor = [1, 1, 1];
  
};


/**
 * Get the lower threshold.
 * 
 * @return {number} The lower threshold.
 * @public
 */
X.thresholdable.prototype.__defineGetter__('lowerThreshold', function() {

  return this._lowerThreshold;
  
});


/**
 * Set the lower threshold if it is inside the min-max range.
 * 
 * @param {number} lowerThreshold
 * @public
 */
X.thresholdable.prototype.__defineSetter__('lowerThreshold', function(
    lowerThreshold) {

  this._lowerThreshold = lowerThreshold;
  
  // no modified event since the rendering loop always checks it
  
});


/**
 * Get the upper threshold.
 * 
 * @return {number} The upper threshold.
 * @public
 */
X.thresholdable.prototype.__defineGetter__('upperThreshold', function() {

  return this._upperThreshold;
  
});


/**
 * Set the upper threshold if it is inside the min-max range.
 * 
 * @param {number} upperThreshold
 * @public
 */
X.thresholdable.prototype.__defineSetter__('upperThreshold', function(
    upperThreshold) {

  this._upperThreshold = upperThreshold;
  
  // no modified event since the rendering loop always checks it
  
});


/**
 * Get the lower threshold border.
 * 
 * @return {number} The lower threshold border.
 * @public
 */
X.thresholdable.prototype.__defineGetter__('min', function() {

  return this._min;
  
});


/**
 * Get the upper threshold border.
 * 
 * @return {number} The upper threshold border.
 * @public
 */
X.thresholdable.prototype.__defineGetter__('max', function() {

  return this._max;
  
});



/**
 * Get the min color which is used to map the scalars to colors in a linear
 * fashion.
 * 
 * @return {!Array} An array holding the r,g,b components of the color.
 * @public
 */
X.thresholdable.prototype.__defineGetter__('minColor', function() {

  return this._minColor;
  
});


/**
 * Set the min color to linear map the scalars to colors.
 * 
 * @param {!Array} minColor The color corresponding to the min. scalar value.
 * @public
 */
X.thresholdable.prototype.__defineSetter__('minColor', function(minColor) {

  if (!goog.isDefAndNotNull(minColor) || !goog.isArray(minColor) ||
      (minColor.length != 3)) {
    
    throw new Error('Invalid min. color.');
    
  }
  
  this._minColor = minColor;
  
  // no modified event since the rendering loop always checks it
  
});


/**
 * Get the max color which is used to map the scalars to colors in a linear
 * fashion.
 * 
 * @return {!Array} An array holding the r,g,b components of the color.
 * @public
 */
X.thresholdable.prototype.__defineGetter__('maxColor', function() {

  return this._maxColor;
  
});


/**
 * Set the max color to linear map the scalars to colors.
 * 
 * @param {!Array} maxColor The color corresponding to the min. scalar value.
 * @public
 */
X.thresholdable.prototype.__defineSetter__('maxColor', function(maxColor) {

  if (!goog.isDefAndNotNull(maxColor) || !goog.isArray(maxColor) ||
      (maxColor.length != 3)) {
    
    throw new Error('Invalid max. color.');
    
  }
  
  this._maxColor = maxColor;
  
  // no modified event since the rendering loop always checks it
  
});
