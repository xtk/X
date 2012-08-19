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
goog.require('goog.math.Vec3');



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
   * @type {!X.matrix}
   * @protected
   */
  this._matrix = X.matrix.createIdentityMatrix(4);
  
  /**
   * The transformation matrix as a 'ready-to-use'-gl version.
   * 
   * @type {!Object}
   * @protected
   */
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
};
// inherit from X.base
goog.inherits(X.transform, X.base);


/**
 * Get the transformation matrix.
 * 
 * @return {!X.matrix} The transformation matrix.
 */
X.transform.prototype.__defineGetter__('matrix', function() {

  return this._matrix;
  
});


/**
 * Set the transformation matrix.
 * 
 * @param {!X.matrix} matrix The transformation matrix.
 */
X.transform.prototype.__defineSetter__('matrix', function(matrix) {

  if (!goog.isDefAndNotNull(matrix) || !(matrix instanceof X.matrix)) {
    
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
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(0, 1, 0));
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
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(1, 0, 0));
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
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(0, 0, 1));
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
  
  var vector = new goog.math.Vec3(distance, 0, 0);
  
  this._matrix = this._matrix.translate(vector);
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
  
  var vector = new goog.math.Vec3(0, distance, 0);
  
  this._matrix = this._matrix.translate(vector);
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
  
  var vector = new goog.math.Vec3(0, 0, distance);
  
  this._matrix = this._matrix.translate(vector);
  this.modified();
  
};


/**
 * Flip the matrix value at the given index.
 * 
 * @param {number} i The row index.
 * @param {number} j The column index.
 * @private
 */
X.transform.prototype.flip_ = function(i, j) {

  var oldValue = this._matrix.getValueAt(i, j);
  if (!oldValue) {
    oldValue = 0;
  }
  
  this._matrix.setValueAt(i, j, oldValue * -1);
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
 * Mark the transform as modified and update the GL-ready version.
 */
X.transform.prototype.modified = function() {
  
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
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
