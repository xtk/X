/*
 * ${HEADER}
 */

// provides
goog.provide('X.transform');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('X.matrixHelper');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec3');



/**
 * Create a transform.
 * 
 * @constructor
 * @extends {X.base}
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
  this._className = 'transform';
  
  /**
   * The transformation matrix.
   * 
   * @type {!goog.math.Matrix}
   * @protected
   */
  this._matrix = goog.math.Matrix.createIdentityMatrix(4);
  
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
 * Rotate around the X-axis.
 * 
 * @param {number} angle The angle to rotate in degrees.
 * @throws {X.exception} An exception, if the given angle is invalid.
 */
X.transform.prototype.rotateX = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {
    
    throw new X.exception('Fatal: Invalid angle!');
    
  }
  
  var angleInRadii = angle * Math.PI / 180;
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(0, 1, 0));
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
};


/**
 * Rotate around the Y-axis.
 * 
 * @param {number} angle The angle to rotate in degrees.
 * @throws {X.exception} An exception, if the given angle is invalid.
 */
X.transform.prototype.rotateY = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {
    
    throw new X.exception('Fatal: Invalid angle!');
    
  }
  
  var angleInRadii = angle * Math.PI / 180;
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(1, 0, 0));
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
};


/**
 * Rotate around the Z-axis.
 * 
 * @param {number} angle The angle to rotate in degrees.
 * @throws {X.exception} An exception, if the given angle is invalid.
 */
X.transform.prototype.rotateZ = function(angle) {

  if (!goog.isNumber(angle) || angle < -360 || angle > 360) {
    
    throw new X.exception('Fatal: Invalid angle!');
    
  }
  
  var angleInRadii = angle * Math.PI / 180;
  
  this._matrix = this._matrix.rotate(angleInRadii, new goog.math.Vec3(0, 0, 1));
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
};


/**
 * Translate on the X-axis.
 * 
 * @param {number} distance The distance to move.
 * @throws {X.exception} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateX = function(distance) {

  if (!goog.isNumber(distance)) {
    
    throw new X.exception('Fatal: Invalid distance!');
    
  }
  
  var vector = new goog.math.Vec3(distance, 0, 0);
  
  this._matrix = this._matrix.translate(vector);
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
};


/**
 * Translate on the Y-axis.
 * 
 * @param {number} distance The distance to move.
 * @throws {X.exception} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateY = function(distance) {

  if (!goog.isNumber(distance)) {
    
    throw new X.exception('Fatal: Invalid distance!');
    
  }
  
  var vector = new goog.math.Vec3(0, distance, 0);
  
  this._matrix = this._matrix.translate(vector);
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
};


/**
 * Translate on the Z-axis.
 * 
 * @param {number} distance The distance to move.
 * @throws {X.exception} An exception, if the given distance is invalid.
 */
X.transform.prototype.translateZ = function(distance) {

  if (!goog.isNumber(distance)) {
    
    throw new X.exception('Fatal: Invalid distance!');
    
  }
  
  var vector = new goog.math.Vec3(0, 0, distance);
  
  this._matrix = this._matrix.translate(vector);
  this._glMatrix = new Float32Array(this._matrix.flatten());
  
};


/**
 * Get the transformation matrix.
 * 
 * @return {!goog.math.Matrix} The transformation matrix.
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
