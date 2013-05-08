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
   *    2 - LabelArray based scheme -- explicit value ranges are defined, and
   *        for each range, explicit min and max colors are specified.
   *
   * @type {!number}
   * @protected
   */
  this._interpolation = 0;

  /**
   * Number of (variable) labels for interpolation scheme 2
   *
   * @type {!number}
   * @protected
   */
  this._labelsCount = 0;

  /**
   * Label intensity range lookup is stored as a vec3 in a ten element
   * array. In javascript, this is a flat array of size 3 x 10 = 30.
   *
   * @type {?Float32Array}
   * @protected
   */
  this._labelIntensities = new Float32Array(30);

  /**
   * For each label, the minimum color for the label intensity range. 
   * This is encoded as a 4 element value of [R,G,B,alpha]. For interface
   * to the shaders, this is a flat array of size 4 x 10 = 40.
   * 
   *
   * @type {?Float32Array}
   * @protected
   */
  this._labelMinColor = new Float32Array(40);
  
  /**
   * For each label, the maxmimum color for the label intensity range. 
   * This is encoded as a 4 element value of [R,G,B,alpha]. For interface
   * to the shaders, this is a flat array of size 4 x 10 = 40.
   * 
   *
   * @type {?Float32Array}
   * @protected
   */
  this._labelMaxColor = new Float32Array(40);
 
  
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


/**
 * labelsCount
 * The number of labels defined for this object.
 *
 * @return {!number} The labelsCount variable.
 */
X.scalars.prototype.__defineGetter__('labelsCount', function() {

  return this._labelsCount;

});

/**
 * labelsCount
 * The number of labels defined for this object.
 *
 * @param {!number} value The number of labels.
 *
 */
X.scalars.prototype.__defineSetter__('labelsCount', function(value) {

  this._labelsCount = value;

});


/**
 * labelIntensities
 * The labelIntensities array -- minimum and maximum values for specific
 * labels
 *
 * @return {!number} The labelIntensities array.
 */
X.scalars.prototype.__defineGetter__('labelIntensities', function() {

  return this._labelIntensities;

});

/**
 * labelIntensities
 * The labelIntensities array -- minimum and maximum values for specific
 * labels
 *
 * @param {!number} value The labelIntensities array to assign.
 *
 */
X.scalars.prototype.__defineSetter__('labelIntensities', function(value) {

  this._labelIntensities = value;

});

/**
 * labelMinColor
 * The labelMinColor array -- the values associated with the "minimum"
 * intensities in the labelIntensities array.
 *
 * @return {!number} The labelMinColor array.
 */
X.scalars.prototype.__defineGetter__('labelMinColor', function() {

  return this._labelMinColor;

});

/**
 * labelMinColor
 * The labelMinColor array -- the values associated with the "minimum"
 * intensities in the labelIntensities array.
 *
 * @param {!number} value The labelMinColor array to assign.
 *
 */
X.scalars.prototype.__defineSetter__('labelMinColor', function(value) {

  this._labelMinColor = value;

});


/**
 * labelMaxColor
 * The labelMaxColor array -- the values associated with the "maximum"
 * intensities in the labelIntensities array.
 *
 * @return {!number} The labelMaxColor array.
 */
X.scalars.prototype.__defineGetter__('labelMaxColor', function() {

  return this._labelMaxColor;

});

/**
 * labelMaxColor
 * The labelMaxColor array -- the values associated with the "maximum"
 * intensities in the labelIntensities array.
 *
 * @param {!number} value The labelMaxColor array to assign.
 *
 */
X.scalars.prototype.__defineSetter__('labelMaxColor', function(value) {

  this._labelMaxColor = value;

});


// export symbols (required for advanced compilation)
goog.exportSymbol('X.scalars', X.scalars);
