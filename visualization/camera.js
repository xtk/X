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
goog.provide('X.camera');

// requires
goog.require('X.base');
goog.require('X.event.ZoomEvent');
goog.require('X.event.PanEvent');
goog.require('X.event.RenderEvent');
goog.require('X.interactor');
goog.require('X.matrix');
goog.require('X.vector');



/**
 * Create a camera.
 *
 * @constructor
 * @param {number} width The width of the camera's viewport.
 * @param {number} height The height of the camera's viewport.
 * @extends X.base
 */
X.camera = function(width, height) {

  // validate width and height
  if (!goog.isNumber(width) || !goog.isNumber(height)) {

    throw new Error('A camera needs valid width and height values.');

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
  this._classname = 'camera';

  /**
   * The position of this camera, by default 0, 0, 100.
   *
   * @type {!X.vector}
   * @protected
   */
  this._position = new X.vector(0, 100, 0);

  /**
   * The focus point of this camera, by default 0, 0, 0.
   *
   * @type {!X.vector}
   * @protected
   */
  this._focus = new X.vector(0, 0, 0);

  /**
   * The unit vector pointing to the top of the three-dimensional space.
   *
   * @type {!X.vector}
   * @protected
   */
  this._up = new X.vector(0, 0, 1);

  /**
   * The viewport width.
   * 
   * @type {!number}
   * @protected
   */
  this._width = width;

  /**
   * The viewport height.
   * 
   * @type {!number}
   * @protected
   */
  this._height = height;

  /**
   * The view matrix.
   *
   * @type {!Float32Array}
   * @protected
   */
  this._view = this.lookAt_(this._position, this._focus);

};
// inherit from X.base
goog.inherits(X.camera, X.base);


/**
 * Configures observers for a given interactor. The method sets up listeners for
 * PAN and ZOOM events.
 *
 * @param {!X.interactor} interactor The interactor which should be observed.
 */
X.camera.prototype.observe = function(interactor) {

  if (!goog.isDefAndNotNull(interactor) ||
      !(interactor instanceof X.interactor)) {

    throw new Error('Could not observe the interactor.');

  }

  goog.events.listen(interactor, X.event.events.ROTATE, this.onRotate_
      .bind(this));
  goog.events.listen(interactor, X.event.events.PAN, this.onPan_.bind(this));
  goog.events.listen(interactor, X.event.events.ZOOM, this.onZoom_.bind(this));

};


/**
 * The callback for a ROTATE event.
 *
 * @param {!X.event.RotateEvent} event The event.
 * @throws {Error} An exception if the event is invalid.
 * @protected
 */
X.camera.prototype.onRotate_ = function(event) {

  if (!(event instanceof X.event.RotateEvent)) {

    throw new Error('Received no valid rotate event.');

  }

  this.rotate(event._distance);

};


/**
 * The callback for a ZOOM event.
 *
 * @param {!X.event.ZoomEvent} event The event.
 * @throws {Error} An exception if the event is invalid.
 * @protected
 */
X.camera.prototype.onZoom_ = function(event) {

  if (!(event instanceof X.event.ZoomEvent)) {

    throw new Error('Received no valid zoom event.');

  }

  if (event._in) {

    this.zoomIn(event._fast);

  } else {

    this.zoomOut(event._fast);

  }

};


/**
 * The callback for a PAN event.
 *
 * @param {!X.event.PanEvent} event The event.
 * @throws {Error} An exception if the event is invalid.
 * @protected
 */
X.camera.prototype.onPan_ = function(event) {

  if (!(event instanceof X.event.PanEvent)) {

    throw new Error('Received no valid pan event.');

  }

  this.pan(event._distance);

};


/**
 * Get the view matrix for the three-dimensional space.
 *
 * @return {!Float32Array} The view matrix.
 */
X.camera.prototype.__defineGetter__('view', function() {

  return this._view;

});


/**
 * Set the view matrix for the three-dimensional space.
 *
 * @param {!Float32Array} view The view matrix.
 * @throws {Error} An exception if the view matrix is invalid.
 * @public
 */
X.camera.prototype.__defineSetter__('view', function(view) {

  if (!goog.isDefAndNotNull(view) || !(view instanceof Float32Array)) {

    throw new Error('Invalid view matrix.');

  }

  this._view = view;

});


/**
 * Get the position of this camera.
 *
 * @return {!Array} The position as an array [X,Y,Z].
 */
X.camera.prototype.__defineGetter__('position', function() {

  return [this._position.x, this._position.y, this._position.z];

});


/**
 * Set the position of this camera. This forces a re-calculation of the view
 * matrix. This action _does not_ force an immediate render event automatically.
 *
 * @param {!Array} position The X,Y,Z components of the position as an array.
 * @throws {Error} An error, if the position was invalid.
 * @public
 */
X.camera.prototype.__defineSetter__('position', function(position) {

  if (!goog.isDefAndNotNull(position) || !goog.isArray(position) ||
      (position.length != 3)) {

    throw new Error('Invalid position.');

  }

  var x = position[0];
  var y = position[1];
  var z = position[2];

  this._position = new X.vector(x, y, z);

  // we need to reset to re-calculate the matrices
  this.reset();

});


/**
 * Get the focus (target point) of this camera.
 *
 * @return {!Array} The focus as an array [X,Y,Z].
 */
X.camera.prototype.__defineGetter__('focus', function() {

  return [this._focus.x, this._focus.y, this._focus.z];

});


/**
 * Set the focus (target point) of this camera. This forces a re-calculation of
 * the view matrix. This action _does not_ force an immediate render event
 * automatically.
 *
 * @param {!Array} focus The X,Y,Z components of the focus as an array.
 * @throws {Error} An error, if the focus was invalid.
 * @public
 */
X.camera.prototype.__defineSetter__('focus', function(focus) {

  if (!goog.isDefAndNotNull(focus) || !goog.isArray(focus) ||
      (focus.length != 3)) {

    throw new Error('Invalid focus');

  }

  var x = focus[0];
  var y = focus[1];
  var z = focus[2];

  this._focus = new X.vector(x, y, z);

  // we need to reset to re-calculate the matrices
  this.reset();

});


/**
 * Get the up-vector of this camera.
 *
 * @return {!Array} The up-vector as an array [X,Y,Z].
 */
X.camera.prototype.__defineGetter__('up', function() {

  return [this._up.x, this._up.y, this._up.z];

});


/**
 * Set the up-vector of this camera. This forces a re-calculation of the view
 * matrix. This action _does not_ force an immediate render event automatically.
 *
 * @param {!Array} up The up vector as an array.
 * @throws {Error} An error, if the up vector was invalid.
 * @public
 */
X.camera.prototype.__defineSetter__('up', function(up) {

  if (!goog.isDefAndNotNull(up) || !goog.isArray(up) || (up.length != 3)) {

    throw new Error('Invalid up vector.');

  }

  var x = up[0];
  var y = up[1];
  var z = up[2];

  this._up = new X.vector(x, y, z);

  // we need to reset to re-calculate the matrices
  this.reset();

});


/**
 * Reset the camera according to its configured position and focus.
 */
X.camera.prototype.reset = function() {

  // update the view matrix and its gl versions
  this._view = this.lookAt_(this._position, this._focus);

};


/**
 * Perform a rotate operation.
 *
 * @param {!X.vector|!Array} distance The distance of the rotation in
 *          respect of the last camera position as either a 2D Array or a
 *          X.vector containing the X and Y distances for the rotation.
 * @public
 */
X.camera.prototype.rotate = function(distance) {

  if (goog.isArray(distance) && (distance.length == 2)) {

    distance = new X.vector(distance[0], distance[1], 0);

  } else if (!(distance instanceof X.vector)) {

    throw new Error('Invalid distance vector for rotate operation.');

  }

  return distance;
  // actions need to be overloaded for 2D/3D

};


/**
 * Perform a pan operation.
 *
 * @param {!X.vector|!Array} distance The distance of the panning in respect of
 *          the last camera position.
 * @public
 */
X.camera.prototype.pan = function(distance) {

  if (goog.isArray(distance) && (distance.length == 2)) {

    distance = new X.vector(distance[0], distance[1], 0);

  } else if (!(distance instanceof X.vector)) {

    throw new Error('Invalid distance vector for pan operation.');

  }

  // take spacing into account?
  this._view[12] -= distance.x;
  this._view[13] += distance.y;

};


/**
 * Perform a zoom in operation.
 *
 * @param {boolean} fast Enables/disables the fast mode which zooms much
 *          quicker.
 * @public
 */
X.camera.prototype.zoomIn = function(fast) {

  var zoomStep = 20;

  if (goog.isDefAndNotNull(fast) && !fast) {

  zoomStep = 1;

  }

  this._view[14] += zoomStep;

};


/**
 * Perform a zoom out operation.
 *
 * @param {boolean} fast Enables/disables the fast mode which zooms much
 *          quicker.
 * @public
 */
X.camera.prototype.zoomOut = function(fast) {

  var zoomStep = 20;

  if (goog.isDefAndNotNull(fast) && !fast) {

    zoomStep = 1;

  }

  this._view[14] -= zoomStep;

};


/**
 * Calculate a view matrix by using the camera position and a focus point.
 *
 * @param {!X.vector} cameraPosition The camera position.
 * @param {!X.vector} targetPoint The focus (target) point.
 * @return {!Float32Array} The view matrix.
 * @throws {Error} If the given arguments are invalid.
 * @protected
 */
X.camera.prototype.lookAt_ = function(cameraPosition, targetPoint) {

  if (!(cameraPosition instanceof X.vector) ||
      !(targetPoint instanceof X.vector)) {

    throw new Error('3D vectors required for calculating the view.');

  }

  return X.matrix.identity();

};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.camera', X.camera);
goog.exportSymbol('X.camera.prototype.pan', X.camera.prototype.pan);
goog.exportSymbol('X.camera.prototype.rotate', X.camera.prototype.rotate);
goog.exportSymbol('X.camera.prototype.zoomIn', X.camera.prototype.zoomIn);
goog.exportSymbol('X.camera.prototype.zoomOut', X.camera.prototype.zoomOut);
