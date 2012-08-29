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
goog.require('goog.math.Vec3');



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
   * @type {!goog.math.Vec3}
   * @protected
   */
  this._position = new goog.math.Vec3(0, 0, 100);
  
  /**
   * The focus point of this camera, by default 0, 0, 0.
   * 
   * @type {!goog.math.Vec3}
   * @protected
   */
  this._focus = new goog.math.Vec3(0, 0, 0);
  
  /**
   * The unit vector pointing to the top of the three-dimensional space.
   * 
   * @type {!goog.math.Vec3}
   * @protected
   */
  this._up = new goog.math.Vec3(0, 1, 0);
  
  /**
   * The view matrix.
   * 
   * @type {!X.matrix}
   * @protected
   */
  this._view = this.lookAt_(this._position, this._focus);
  
  /**
   * The view matrix as a 'ready-to-use'-gl version.
   * 
   * @type {!Object}
   * @protected
   */
  this._glview = new Float32Array(this._view.flatten());
  
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
 * @return {!X.matrix} The view matrix.
 */
X.camera.prototype.__defineGetter__('view', function() {

  return this._view;
  
});


/**
 * Set the view matrix for the three-dimensional space.
 * 
 * @param {!X.matrix} view The view matrix.
 * @throws {Error} An exception if the view matrix is invalid.
 * @public
 */
X.camera.prototype.__defineSetter__('view', function(view) {

  if (!goog.isDefAndNotNull(view) || !(view instanceof X.matrix)) {
    
    throw new Error('Invalid view matrix.');
    
  }
  
  this._view = view;
  this._glview = new Float32Array(this._view.flatten());
  
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
  
  this._position = new goog.math.Vec3(x, y, z);
  
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
  
  this._focus = new goog.math.Vec3(x, y, z);
  
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
  
  this._up = new goog.math.Vec3(x, y, z);
  
  // we need to reset to re-calculate the matrices
  this.reset();
  
});


/**
 * Reset the camera according to its configured position and focus.
 */
X.camera.prototype.reset = function() {

  // update the view matrix and its gl versions
  this._view = this.lookAt_(this._position, this._focus);
  this._glview = new Float32Array(this._view.flatten());
  
};


/**
 * Perform a rotate operation. This method fires a X.event.RenderEvent() after
 * the calculation is done.
 * 
 * @param {!goog.math.Vec2|!Array} distance The distance of the rotation in
 *          respect of the last camera position as either a 2D Array or a
 *          goog.math.Vec2 containing the X and Y distances for the rotation.
 * @public
 */
X.camera.prototype.rotate = function(distance) {

  if (goog.isArray(distance) && (distance.length == 2)) {
    
    distance = new goog.math.Vec2(distance[0], distance[1]);
    
  } else if (!(distance instanceof goog.math.Vec2)) {
    
    throw new Error('Invalid distance vector for rotate operation.');
    
  }
  
  return distance;
  // actions need to be overloaded for 2D/3D
  
};


/**
 * Perform a pan operation. This method fires a X.event.RenderEvent() after the
 * calculation is done.
 * 
 * @param {!goog.math.Vec2} distance The distance of the panning in respect of
 *          the last camera position.
 * @public
 */
X.camera.prototype.pan = function(distance) {

  if (goog.isArray(distance) && (distance.length == 2)) {
    
    distance = new goog.math.Vec2(distance[0], distance[1]);
    
  } else if (!(distance instanceof goog.math.Vec2)) {
    
    throw new Error('Invalid distance vector for pan operation.');
    
  }
  
  var distance3d = new goog.math.Vec3(-distance.x, distance.y, 0);
  
  var identity = X.matrix.createIdentityMatrix(4);
  var panMatrix = identity.translate(distance3d);
  
  this._view = new X.matrix(panMatrix.multiply(this._view));
  this._glview = new Float32Array(this._view.flatten());
  
  // fire a render event
  // this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * Perform a zoom in operation. This method fires a X.event.RenderEvent() after
 * the calculation is done.
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
  
  var zoomVector = new goog.math.Vec3(0, 0, zoomStep);
  
  var identity = X.matrix.createIdentityMatrix(4);
  var zoomMatrix = identity.translate(zoomVector);
  
  this._view = new X.matrix(zoomMatrix.multiply(this._view));
  this._glview = new Float32Array(this._view.flatten());
  
  // fire a render event
  // this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * Perform a zoom out operation. This method fires a X.event.RenderEvent() after
 * the calculation is done.
 * 
 * @param {boolean} fast Enables/disables the fast mode which zooms much
 *          quicker.
 * @public
 */
X.camera.prototype.zoomOut = function(fast) {

  var zoomStep = 30;
  
  if (goog.isDefAndNotNull(fast) && !fast) {
    
    zoomStep = 1;
    
  }
  
  var zoomVector = new goog.math.Vec3(0, 0, -zoomStep);
  
  var identity = X.matrix.createIdentityMatrix(4);
  var zoomMatrix = identity.translate(zoomVector);
  
  this._view = new X.matrix(zoomMatrix.multiply(this._view));
  this._glview = new Float32Array(this._view.flatten());
  
  // fire a render event
  // this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * Calculate a view matrix by using the camera position and a focus point.
 * 
 * @param {!goog.math.Vec3} cameraPosition The camera position.
 * @param {!goog.math.Vec3} targetPoint The focus (target) point.
 * @return {!X.matrix} The view matrix.
 * @throws {Error} If the given arguments are invalid.
 * @protected
 */
X.camera.prototype.lookAt_ = function(cameraPosition, targetPoint) {

  if (!(cameraPosition instanceof goog.math.Vec3) ||
      !(targetPoint instanceof goog.math.Vec3)) {
    
    throw new Error('3D vectors required for calculating the view.');
    
  }
  
  return X.matrix.createIdentityMatrix(4);
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.camera', X.camera);
goog.exportSymbol('X.camera.prototype.pan', X.camera.prototype.pan);
goog.exportSymbol('X.camera.prototype.rotate', X.camera.prototype.rotate);
goog.exportSymbol('X.camera.prototype.zoomIn', X.camera.prototype.zoomIn);
goog.exportSymbol('X.camera.prototype.zoomOut', X.camera.prototype.zoomOut);
