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
goog.provide('X.transform');

// requires
goog.require('X.base');
goog.require('X.matrix');



/**
 * Create a transform.
 *
 * @constructor
 * @extends X.base
 */
X.transform = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'transform';

  /**
   * The transformation matrix.
   *
   * @type {!Float32Array}
   * @protected
   */
  this._matrix = X.matrix.identity();

};
// inherit from X.base
goog.inherits(X.transform, X.base);


/**
 * Get the transformation matrix.
 *
 * @return {!Float32Array} The transformation matrix.
 */
X.transform.prototype.__defineGetter__('matrix', function() {

  return this._matrix;

});


/**
 * Set the transformation matrix.
 *
 * @param {!Float32Array} matrix The transformation matrix.
 */
X.transform.prototype.__defineSetter__('matrix', function(matrix) {

  if (!goog.isDefAndNotNull(matrix) || !(matrix instanceof Float32Array)) {

    throw new Error('Invalid matrix.');

  }

  this._matrix = matrix;
  this.modified();

});


/**
 * Rotate around the X-axis.
 *
 * @param {number} angle The angle to rotate in degrees.
 * @throws {Error} An exception, if the given angle is invalid.
 */
X.transform.prototype.rotateX = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {

    throw new Error('Invalid angle.');

  }

  var angleInRadii = angle * Math.PI / 180;

  X.matrix.rotateX(this._matrix, angleInRadii);

  this.modified();

};


/**
 * Rotate around the Y-axis.
 *
 * @param {number} angle The angle to rotate in degrees.
 * @throws {Error} An exception, if the given angle is invalid.
 */
X.transform.prototype.rotateY = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {

    throw new Error('Invalid angle.');

  }

  var angleInRadii = angle * Math.PI / 180;

  X.matrix.rotateY(this._matrix, angleInRadii);

  this.modified();

};


/**
 * Rotate around the Z-axis.
 *
 * @param {number} angle The angle to rotate in degrees.
 * @throws {Error} An exception, if the given angle is invalid.
 */
X.transform.prototype.rotateZ = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {

    throw new Error('Invalid angle.');

  }

  var angleInRadii = angle * Math.PI / 180;

  X.matrix.rotateZ(this._matrix, angleInRadii);

  this.modified();

};


/**
 * Translate on the X-axis.
 *
 * @param {number} distance The distance to move.
 * @throws {Error} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateX = function(distance) {

  if (!goog.isNumber(distance)) {

    throw new Error('Invalid distance.');

  }

  X.matrix.translate(this._matrix, distance, 0, 0);

  this.modified();

};


/**
 * Translate on the Y-axis.
 *
 * @param {number} distance The distance to move.
 * @throws {Error} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateY = function(distance) {

  if (!goog.isNumber(distance)) {

    throw new Error('Invalid distance.');

  }

  X.matrix.translate(this._matrix, 0, distance, 0);

  this.modified();

};


/**
 * Translate on the Z-axis.
 *
 * @param {number} distance The distance to move.
 * @throws {Error} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateZ = function(distance) {

  if (!goog.isNumber(distance)) {

    throw new Error('Invalid distance.');

  }

  X.matrix.translate(this._matrix, 0, 0, distance);

  this.modified();

};


/**
 * Flip the matrix value at the given index.
 *
 * @param {number} row The row index.
 * @param {number} col The column index.
 * @private
 */
X.transform.prototype.flip_ = function(row, col) {

  this._matrix[row + col*4] *= -1;

  this.modified();

};


/**
 * Flip in X direction.
 */
X.transform.prototype.flipX = function() {

  this.flip_(0, 0);

};


/**
 * Flip in Y direction.
 */
X.transform.prototype.flipY = function() {

  this.flip_(1, 1);

};


/**
 * Flip in Z direction.
 */
X.transform.prototype.flipZ = function() {

  this.flip_(2, 2);

};


/**
 * Mark the transform as modified.
 */
X.transform.prototype.modified = function() {

  this._dirty = true;

};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.transform', X.transform);
goog.exportSymbol('X.transform.prototype.rotateX',
    X.transform.prototype.rotateX);
goog.exportSymbol('X.transform.prototype.rotateY',
    X.transform.prototype.rotateY);
goog.exportSymbol('X.transform.prototype.rotateZ',
    X.transform.prototype.rotateZ);
goog.exportSymbol('X.transform.prototype.translateX',
    X.transform.prototype.translateX);
goog.exportSymbol('X.transform.prototype.translateY',
    X.transform.prototype.translateY);
goog.exportSymbol('X.transform.prototype.translateZ',
    X.transform.prototype.translateZ);
goog.exportSymbol('X.transform.prototype.flipX', X.transform.prototype.flipX);
goog.exportSymbol('X.transform.prototype.flipY', X.transform.prototype.flipY);
goog.exportSymbol('X.transform.prototype.flipZ', X.transform.prototype.flipZ);
goog.exportSymbol('X.transform.prototype.modified', X.transform.prototype.modified);
