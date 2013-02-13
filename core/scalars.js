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
goog.require('X.loadable');
goog.require('X.thresholdable');



/**
 * Create a container for a scalar array.
 *
 * @constructor
 * @extends X.base
 * @mixin X.loadable
 * @mixin X.thresholdable
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
   * The array containing the scalars.
   *
   * @type {?Float32Array}
   * @protected
   */
  this._array = null;

  /**
   * The WebGL-ready version of the scalars array.
   *
   * @type {?Float32Array}
   * @protected
   */
  this._glArray = null;

  /**
   * Flag to replace the colors after thresholding. If FALSE, discard the
   * vertex.
   *
   * @type {boolean}
   * @protected
   */
  this._replaceMode = true;

  /**
   * The interpolation scheme for this object.
   * 	0 -	linear interpolation across range from minColor to maxColor
   * 	1 - FreeSurfer curvature convention: negative values are interpolated
   * 	    over minColor range, positive curvatures separately over
   * 	    maxColor range.
   *
   * @type {!number}
   * @protected
   */
  this._interpolation = 0;


  // inject functionality
  inject(this, new X.loadable()); // this object is loadable from a file
  inject(this, new X.thresholdable()); // this object is thresholdable

  /**
   * @inheritDoc
   */
  this._minColor = [0, 1, 0];

  /**
   * @inheritDoc
   */
  this._maxColor = [1, 0, 0];

};
// inherit from X.base
goog.inherits(X.scalars, X.base);


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
 * meaning that it has to match X.object.points.length, which equals 3 entries
 * for each vertex (X,Y,Z coordinates). Calling this method marks this object as
 * dirty so the X.renderer can pick it up. This method should be used
 * externally.
 *
 * @param {Array} array The WebGL-ready array matching X.object._points.length
 *          in size.
 * @public
 */
X.scalars.prototype.__defineSetter__('array', function(array) {

  this._array = array;
  this._glArray = array;

  // also, mark this dirty so the renderer can pick it up
  this._dirty = true;

});


/**
 * The scalar interpolation associated with this object.
 * The interpolation scheme for this object.
 * 	0 -	linear interpolation across range from minColor to maxColor
 * 	1 - FreeSurfer curvature convention: negative values are interpolated
 * 	    over minColor range, positive curvatures separately over
 * 	    maxColor range.
 *
 * @return {!number} The scalarInterpolation variable.
 */
X.scalars.prototype.__defineGetter__('interpolation', function() {

  return this._interpolation;

});


/**
 * scalarsInterpolation
 * The interpolation scheme for this object.
 * 	0 -	linear interpolation across range from minColor to maxColor
 * 	1 - FreeSurfer curvature convention: negative values are interpolated
 * 	    over minColor range, positive curvatures separately over
 * 	    maxColor range.
 *
 * @param {!number} value The interpolation scheme.
 *
 */
X.scalars.prototype.__defineSetter__('interpolation', function(value) {

  this._interpolation = value;

});

// export symbols (required for advanced compilation)
goog.exportSymbol('X.scalars', X.scalars);
