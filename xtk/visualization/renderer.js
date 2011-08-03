/*
 * ${HEADER}
 */

// provides
goog.provide('X.renderer');

// requires
goog.require('X.base');

/**
 * Create a renderer with the given width and height.
 * 
 * @param {number}
 *          width The width of the renderer.
 * @param {number}
 *          height The height of the renderer.
 * @constructor
 * @extends {X.base}
 */
X.renderer = function(width, height) {
  
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  // The className of this class.
  this._className = 'renderer';
  
  // The dimension of this renderer.
  this._dimension = -1;
  
  // The width of this renderer.
  this._width = -1;
  
  // The height of this renderer.
  this._height = -1;
  
};
// inherit from X.base
goog.inherits(X.renderer, X.base);

/**
 * Get the dimension of this renderer.
 * E.g. 2 for two-dimensional, 3 for three-dimensional.
 * 
 * @returns {number} The dimension of this renderer.
 */
X.renderer.prototype.getDimension = function() {
  
  return this._dimension;
  
};

/**
 * Get the width of this renderer.
 * 
 * @returns {number} The width of this renderer.
 */
X.renderer.prototype.getWidth = function() {
  
  return this._width;
  
};

/**
 * Get the height of this renderer.
 * 
 * @returns {number} The height of this renderer.
 */
X.renderer.prototype.getHeight = function() {
  
  return this._height;
  
};
