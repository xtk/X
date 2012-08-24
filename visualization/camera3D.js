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
   * @type {!Object}
   * @protected
   */
  this._perspective = new Float32Array(this.calculatePerspective_(
      this._fieldOfView, (width / height), 1, 10000).flatten());
  
};
// inherit from X.base
goog.inherits(X.camera3D, X.camera);


/**
 * Calculate a perspective matrix based on the given values. This calculation is
 * based on known principles of Computer Vision (Source: TODO?).
 * 
 * @param {number} fieldOfViewY The field of view in degrees in Y direction.
 * @param {number} aspectRatio The aspect ratio between width and height of the
 *          viewport.
 * @param {number} zNearClippingPlane The Z coordinate of the near clipping
 *          plane (close to the eye).
 * @param {number} zFarClippingPlane The Z coordinate of the far clipping plane
 *          (far from the eye).
 * @return {X.matrix} The perspective matrix.
 * @private
 */
X.camera3D.prototype.calculatePerspective_ = function(fieldOfViewY,
    aspectRatio, zNearClippingPlane, zFarClippingPlane) {

  var ymax = zNearClippingPlane * Math.tan(fieldOfViewY * Math.PI / 360.0);
  var ymin = -ymax;
  var xmin = ymin * aspectRatio;
  var xmax = ymax * aspectRatio;
  
  return this.calculateViewingFrustum_(xmin, xmax, ymin, ymax,
      zNearClippingPlane, zFarClippingPlane);
  
};


/**
 * Calculate the viewing frustum which is the three-dimensional area which is
 * visible to the eye by 'trimming' the world space. This calculation is based
 * on known principles of Computer Vision (Source:
 * http://en.wikipedia.org/wiki/Viewing_frustum).
 * 
 * @param {number} left The Y coordinate of the left border.
 * @param {number} right The Y coordinate of the right border.
 * @param {number} bottom The X coordinate of the bottom border.
 * @param {number} top The X coordinate of the top border.
 * @param {number} znear The Z coordinate of the near the eye border.
 * @param {number} zfar The Z coordinate of the far of the eye border.
 * @return {X.matrix} The frustum matrix.
 * @private
 */
X.camera3D.prototype.calculateViewingFrustum_ = function(left, right, bottom,
    top, znear, zfar) {

  var x = 2 * znear / (right - left);
  var y = 2 * znear / (top - bottom);
  var a = (right + left) / (right - left);
  var b = (top + bottom) / (top - bottom);
  var c = -(zfar + znear) / (zfar - znear);
  var d = -2 * zfar * znear / (zfar - znear);
  
  return new X.matrix([[x, 0, a, 0], [0, y, b, 0], [0, 0, c, d], [0, 0, -1, 0]]);
  
};


/**
 * @inheritDoc
 */
X.camera3D.prototype.rotate = function(distance) {

  // call the superclass
  distance = goog.base(this, 'rotate', distance);
  
  // in radii, the 5 is a constant stating how quick the rotation performs..
  var angleX = -distance.x / 5 * Math.PI / 180;
  var angleY = -distance.y / 5 * Math.PI / 180;
  
  var identity = X.matrix.createIdentityMatrix(4);
  // the x-Axis vector is determined by the first row of the view matrix
  var xAxisVector = new goog.math.Vec3(parseFloat(this._view.getValueAt(0, 0)),
      parseFloat(this._view.getValueAt(0, 1)), parseFloat(this._view
          .getValueAt(0, 2)));
  // the y-Axis vector is determined by the second row of the view matrix
  var yAxisVector = new goog.math.Vec3(parseFloat(this._view.getValueAt(1, 0)),
      parseFloat(this._view.getValueAt(1, 1)), parseFloat(this._view
          .getValueAt(1, 2)));
  
  // we rotate around the Y Axis when the mouse moves along the screen in X
  // direction
  var rotateX = identity.rotate(angleX, yAxisVector);
  
  // we rotate around the X axis when the mouse moves along the screen in Y
  // direction
  var rotateY = identity.rotate(angleY, xAxisVector);
  
  // perform the actual rotation calculation
  this._view = new X.matrix(this._view.multiply(rotateY.multiply(rotateX)));
  this._glview = new Float32Array(this._view.flatten());
  
  // fire a render event
  // this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * @inheritDoc
 */
X.camera3D.prototype.lookAt_ = function(cameraPosition, targetPoint) {

  goog.base(this, 'lookAt_', cameraPosition, targetPoint);
  
  var matrix = X.matrix.createIdentityMatrix(4);
  
  // Make rotation matrix
  
  // Z vector = cameraPosition - targetPoint
  var zVector = goog.math.Vec3.difference(cameraPosition, targetPoint);
  
  // normalize Z
  zVector = zVector.normalize();
  
  // Y vector = up
  var yVector = this._up.clone();
  
  // WARNING: there is a problem if yVector == zVector
  if (yVector.equals(zVector)) {
    
    // we now change the zVector a little bit
    yVector.z += 0.000001;
    
  }
  
  // X vector = Y x Z
  var xVector = goog.math.Vec3.cross(yVector, zVector);
  
  // recompute Y vector = Z x X
  yVector = goog.math.Vec3.cross(zVector, xVector);
  
  // normalize X and Y
  xVector = xVector.normalize();
  yVector = yVector.normalize();
  
  // create view matrix
  // first row
  matrix.setValueAt(0, 0, xVector.x);
  matrix.setValueAt(0, 1, xVector.y);
  matrix.setValueAt(0, 2, xVector.z);
  matrix.setValueAt(0, 3, 0);
  
  // second row
  matrix.setValueAt(1, 0, yVector.x);
  matrix.setValueAt(1, 1, yVector.y);
  matrix.setValueAt(1, 2, yVector.z);
  matrix.setValueAt(1, 3, 0);
  
  // third row
  matrix.setValueAt(2, 0, zVector.x);
  matrix.setValueAt(2, 1, zVector.y);
  matrix.setValueAt(2, 2, zVector.z);
  matrix.setValueAt(2, 3, 0);
  
  // last row
  matrix.setValueAt(3, 0, 0);
  matrix.setValueAt(3, 1, 0);
  matrix.setValueAt(3, 2, 0);
  matrix.setValueAt(3, 3, 1);
  
  var invertedCameraPosition = cameraPosition.clone();
  
  return matrix.translate(invertedCameraPosition.invert());
  
};

goog.exportSymbol('X.camera3D', X.camera3D);
