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

goog.exportSymbol('X.camera3D', X.camera3D);
