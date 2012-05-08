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
goog.require('X.event.ZoomEvent');
goog.require('X.event.PanEvent');
goog.require('X.event.RenderEvent');
goog.require('X.base');
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
  this['className'] = 'camera';
  
  /**
   * The position of this camera, by default 0, 0, 100.
   * 
   * @type {!goog.math.Vec3}
   * @protected
   */
  this.position = new goog.math.Vec3(0, 0, 100);
  
  /**
   * The focus point of this camera, by default 0, 0, 0.
   * 
   * @type {!goog.math.Vec3}
   * @protected
   */
  this.focus = new goog.math.Vec3(0, 0, 0);
  
  /**
   * The unit vector pointing to the top of the three-dimensional space.
   * 
   * @type {!goog.math.Vec3}
   * @protected
   */
  this.up = new goog.math.Vec3(0, 1, 0);
  
  /**
   * The view matrix.
   * 
   * @type {!X.matrix}
   * @protected
   */
  this['view'] = this.lookAt_(this.position, this.focus);
  
  /**
   * The view matrix as a 'ready-to-use'-gl version.
   * 
   * @type {!Object}
   * @protected
   */
  this.glView = new Float32Array(this['view'].flatten());
  
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
  
  goog.events.listen(interactor, X.event.events.PAN, this.onPan_.bind(this));
  goog.events.listen(interactor, X.event.events.ZOOM, this.onZoom_.bind(this));
  
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
 * Set the view matrix for the three-dimensional space.
 * 
 * @param {!X.matrix} view The view matrix.
 * @throws {Error} An exception if the view matrix is invalid.
 * @public
 */
X.camera.prototype.setView = function(view) {

  if (!goog.isDefAndNotNull(view) || !(view instanceof X.matrix)) {
    
    throw new Error('Invalid view matrix.');
    
  }
  
  this['view'] = view;
  this.glView = new Float32Array(this['view'].flatten());
  
};


/**
 * Set the position of this camera. This forces a re-calculation of the view
 * matrix. This action _does not_ force an immediate render event automatically.
 * 
 * @param {!number} x The X component of the new camera position.
 * @param {!number} y The Y component of the new camera position.
 * @param {!number} z The Z component of the new camera position.
 * @public
 */
X.camera.prototype.setPosition = function(x, y, z) {

  if (!goog.isNumber(x) || !goog.isNumber(y) || !goog.isNumber(z)) {
    
    throw new Error('The position was invalid.');
    
  }
  
  this.position = new goog.math.Vec3(x, y, z);
  
  this.reset();
  
};


/**
 * Set the focus of this camera. This forces a re-calculation of the view
 * matrix. This action _does not_ force an immediate render event automatically.
 * 
 * @param {!number} x The X component of the new camera focus.
 * @param {!number} y The Y component of the new camera focus.
 * @param {!number} z The Z component of the new camera focus.
 * @public
 */
X.camera.prototype.setFocus = function(x, y, z) {

  if (!goog.isNumber(x) || !goog.isNumber(y) || !goog.isNumber(z)) {
    
    throw new Error('The focus was invalid.');
    
  }
  
  this.focus = new goog.math.Vec3(x, y, z);
  
  this.reset();
  
};


/**
 * Set the up-vector of this camera. This forces a re-calculation of the view
 * matrix. This action _does not_ force an immediate render event automatically.
 * 
 * @param {!number} x The X component of the new camera up-vector.
 * @param {!number} y The Y component of the new camera up-vector.
 * @param {!number} z The Z component of the new camera up-vector.
 * @public
 */
X.camera.prototype.setUp = function(x, y, z) {

  if (!goog.isNumber(x) || !goog.isNumber(y) || !goog.isNumber(z)) {
    
    throw new Error('The up-vector was invalid.');
    
  }
  
  this.up = new goog.math.Vec3(x, y, z);
  
  this.reset();
  
};


/**
 * Reset the camera according to its configured position and focus.
 */
X.camera.prototype.reset = function() {

  // update the view matrix and its gl versions
  this['view'] = this.lookAt_(this.position, this.focus);
  this.glView = new Float32Array(this['view'].flatten());
  
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

  if (!(distance instanceof goog.math.Vec2)) {
    
    throw new Error('Invalid distance vector for pan operation.');
    
  }
  
  var distance3d = new goog.math.Vec3(-distance.x, distance.y, 0);
  
  var identity = X.matrix.createIdentityMatrix(4);
  var panMatrix = identity.translate(distance3d);
  
  this['view'] = new X.matrix(panMatrix.multiply(this['view']));
  this.glView = new Float32Array(this['view'].flatten());
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
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
  
  this['view'] = new X.matrix(zoomMatrix.multiply(this['view']));
  this.glView = new Float32Array(this['view'].flatten());
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
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
  
  this['view'] = new X.matrix(zoomMatrix.multiply(this['view']));
  this.glView = new Float32Array(this['view'].flatten());
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
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
goog.exportSymbol('X.camera.prototype.setView', X.camera.prototype.setView);
goog.exportSymbol('X.camera.prototype.setPosition',
    X.camera.prototype.setPosition);
goog.exportSymbol('X.camera.prototype.setFocus', X.camera.prototype.setFocus);
goog.exportSymbol('X.camera.prototype.setUp', X.camera.prototype.setUp);
goog.exportSymbol('X.camera.prototype.pan', X.camera.prototype.pan);
goog.exportSymbol('X.camera.prototype.zoomIn', X.camera.prototype.zoomIn);
goog.exportSymbol('X.camera.prototype.zoomOut', X.camera.prototype.zoomOut);
