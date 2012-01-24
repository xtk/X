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
goog.require('X.exception');
goog.require('X.matrix');
goog.require('goog.math.Vec3');



/**
 * Create a transform.
 * 
 * @param {!Array} centroid The centroid for local rotations.
 * @constructor
 * @extends X.base
 */
X.transform = function(centroid) {

  if (!goog.isDefAndNotNull(centroid) || !(centroid instanceof Array) ||
      centroid.length != 3) {
    
    throw new X.exception('A valid centroid is required.');
    
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
  this._className = 'transform';
  
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
  
  /**
   * The centroid for local rotations.
   * 
   * @type {Array}
   * @protected
   */
  this._centroid = centroid;
  
};
// inherit from X.base
goog.inherits(X.transform, X.base);



/**
 * Rotate around the local X-axis.
 * 
 * @param {number} angle The angle to rotate in degrees.
 * @throws {X.exception} An exception, if the given angle is invalid.
 */
X.transform.prototype.rotateX = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {
    
    throw new X.exception('Invalid angle!');
    
  }
  
  // 'fake' translate to 0,0,0
  var centroidVector = new goog.math.Vec3(this._centroid[0], this._centroid[1],
      this._centroid[2]);
  console.log(centroidVector);
  console.log(this._matrix);
  // this._matrix = this._matrix.translate(centroidVector.clone().invert());
  console.log(this._matrix);
  
  var angleInRadii = angle * Math.PI / 180;
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(0, 1, 0));
  
  this._matrix = this._matrix.translate(new goog.math.Vec3(0, centroidVector
      .invert().y, 0));
  // this._matrix.setValueAt(0, 3, 0);
  // this._matrix.setValueAt(1, 3, 0);
  // this._matrix.setValueAt(2, 3, 0);
  console.log(this._matrix);
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
  // this.translateX(this._centroid[0] * -1);
  // this.translateY(this._centroid[1] * -1);
  // this.translateZ(this._centroid[2] * -1);
  //  
  // now world rotate
  // this.worldRotateX(angle);
  
  // and translate back to the original position
  // this.translateX(this._centroid[0]);
  // this.translateY(this._centroid[1]);
  // this.translateZ(this._centroid[2]);
  
  this._dirty = true;
  
};



/**
 * Rotate around the global X-axis.
 * 
 * @param {number} angle The angle to rotate in degrees.
 * @throws {X.exception} An exception, if the given angle is invalid.
 */
X.transform.prototype.worldRotateX = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {
    
    throw new X.exception('Invalid angle!');
    
  }
  
  var angleInRadii = angle * Math.PI / 180;
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(0, 1, 0));
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
  this._dirty = true;
  
};


/**
 * Rotate around the global Y-axis.
 * 
 * @param {number} angle The angle to rotate in degrees.
 * @throws {X.exception} An exception, if the given angle is invalid.
 */
X.transform.prototype.worldRotateY = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {
    
    throw new X.exception('Invalid angle!');
    
  }
  
  var angleInRadii = angle * Math.PI / 180;
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(1, 0, 0));
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
  this._dirty = true;
  
};


/**
 * Rotate around the global Z-axis.
 * 
 * @param {number} angle The angle to rotate in degrees.
 * @throws {X.exception} An exception, if the given angle is invalid.
 */
X.transform.prototype.worldRotateZ = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {
    
    throw new X.exception('Invalid angle!');
    
  }
  
  var angleInRadii = angle * Math.PI / 180;
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(0, 0, 1));
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
  this._dirty = true;
  
};


/**
 * Translate on the X-axis.
 * 
 * @param {number} distance The distance to move.
 * @throws {X.exception} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateX = function(distance) {

  if (!goog.isNumber(distance)) {
    
    throw new X.exception('Invalid distance!');
    
  }
  
  var vector = new goog.math.Vec3(distance, 0, 0);
  
  this._matrix = this._matrix.translate(vector);
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
  this._dirty = true;
  
};


/**
 * Translate on the Y-axis.
 * 
 * @param {number} distance The distance to move.
 * @throws {X.exception} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateY = function(distance) {

  if (!goog.isNumber(distance)) {
    
    throw new X.exception('Invalid distance!');
    
  }
  
  var vector = new goog.math.Vec3(0, distance, 0);
  
  this._matrix = this._matrix.translate(vector);
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
  this._dirty = true;
  
};


/**
 * Translate on the Z-axis.
 * 
 * @param {number} distance The distance to move.
 * @throws {X.exception} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateZ = function(distance) {

  if (!goog.isNumber(distance)) {
    
    throw new X.exception('Invalid distance!');
    
  }
  
  var vector = new goog.math.Vec3(0, 0, distance);
  
  this._matrix = this._matrix.translate(vector);
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
  this._dirty = true;
  
};


/**
 * Get the transformation matrix.
 * 
 * @return {!X.matrix} The transformation matrix.
 */
X.transform.prototype.matrix = function() {

  return this._matrix;
  
};


/**
 * Get the transformation matrix as a 'ready-to-use'-gl version.
 * 
 * @return {!Object} The transformation matrix as a Float32Array.
 */
X.transform.prototype.glMatrix = function() {

  return this._glMatrix;
  
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
goog.exportSymbol('X.transform.prototype.matrix', X.transform.prototype.matrix);
