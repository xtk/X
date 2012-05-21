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

  if (lowerThreshold >= this._min && lowerThreshold <= this._max) {
    
    this._lowerThreshold = lowerThreshold;
    
  }
  
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

  if (upperThreshold >= this._min && upperThreshold <= this._max) {
    
    this._upperThreshold = upperThreshold;
    
  }
  
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
