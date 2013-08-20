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
goog.provide('X.camera3D');

// requires
goog.require('X.camera');
goog.require('X.event.RotateEvent');
goog.require('X.matrix');



/**
 * Create a 3D perspective camera.
 *
 * @constructor
 * @param {number} width The width of the camera's viewport.
 * @param {number} height The height of the camera's viewport.
 * @extends X.camera
 */
X.camera3D = function(width, height) {

  //
  // call the standard constructor of X.base
  goog.base(this, width, height);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'camera3D';

  /**
   * The field of view in degrees.
   *
   * @type {!number}
   * @const
   */
  this._fieldOfView = 45;

  /**
   * The perspective matrix.
   *
   * @type {Array.<number>|Float32Array|Float64Array|null}
   * @protected
   */
  this._perspective = X.matrix.makePerspective(X.matrix.identity(), this._fieldOfView, (width/height), 1, 10000);

};
// inherit from X.base
goog.inherits(X.camera3D, X.camera);


/**
 * @inheritDoc
 */
X.camera3D.prototype.rotate = function(distance) {

  // call the superclass
  distance = goog.base(this, 'rotate', distance);

  // in radii, the 5 is a constant stating how quick the rotation performs..
  var angleX = -distance.x / 5 * Math.PI / 180;
  var angleY = -distance.y / 5 * Math.PI / 180;

  // we need to normalize the axis here
  var axisX = new X.vector(this._view[1], this._view[5], this._view[9]);
  var axisY = new X.vector(this._view[0], this._view[4], this._view[8]);
  axisX.normalize();
  axisY.normalize();

  // row+col * 4
  X.matrix.rotate(this._view, angleX, axisX.x, axisX.y, axisX.z);
  X.matrix.rotate(this._view, angleY, axisY.x, axisY.y, axisY.z);

};


/**
 * @inheritDoc
 */
X.camera3D.prototype.lookAt_ = function(cameraPosition, targetPoint) {

  var matrix = goog.base(this, 'lookAt_', cameraPosition, targetPoint);
  X.matrix.makeLookAt(matrix, cameraPosition, targetPoint, this._up);

  return matrix;

};

/**
* Unproject from screen space to a 3D ray. This does not take the center into account.
*
* @param {!number} x The normalized x-coordinate on the viewport.
* @param {!number} y The normalized y-coordinate on the viewport.
* @param {?number=} z The z-coordinate on the viewport. (0 for near, 1 for far)
* @return {!Float32Array|Array} the resulting point in 3D coordinates
* @protected
*/
X.camera3D.prototype.unproject_ = function (x,y,z) {

  var _in = new Float32Array(4);
  var _out = new Float32Array(4);
  var _m = new Float32Array(16);
  var _A = new Float32Array(16);
  var _B = new Float32Array(16);

  // compute projection x modelview
  X.matrix.multiply(this._perspective, this._view, _A);
  // now invert _A
  X.matrix.invert(_A, _m);

  // setup vec4
  _in[0] = x;
  _in[1] = y;
  _in[2] = 2.0*z-1.0;
  _in[3] = 1.0;

  X.matrix.multiplyByVec4(_m, _in, _out);

  _out[3] = 1.0/_out[3];
  _out[0] = _out[0]*_out[3];
  _out[1] = _out[1]*_out[3];
  _out[2] = _out[2]*_out[3];

  return _out;

};

goog.exportSymbol('X.camera3D', X.camera3D);
