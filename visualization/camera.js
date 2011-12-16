/*
 * ${HEADER}
 */

// provides
goog.provide('X.camera');

// requires
goog.require('X.event.ZoomEvent');
goog.require('X.event.RotateEvent');
goog.require('X.event.PanEvent');
goog.require('X.event.RenderEvent');
goog.require('X.base');
goog.require('X.exception');
goog.require('X.matrixHelper');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec3');
goog.require('goog.math.Vec2');



/**
 * Create a camera.
 * 
 * @constructor
 * @param {number} width The width of the camera's viewport.
 * @param {number} height The height of the camera's viewport.
 * @extends {X.base}
 */
X.camera = function(width, height) {

  // validate width and height
  if (!goog.isNumber(width) || !goog.isNumber(height)) {
    
    throw new X.exception(
        'Fatal: A camera needs valid width and height values.');
    
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
  this._className = 'camera';
  
  /**
   * The field of view in degrees.
   * 
   * @type {number}
   * @const
   */
  this._fieldOfView = 45;
  
  /**
   * The position of this camera.
   * 
   * @type {goog.math.Vec3}
   * @protected
   */
  this._position = new goog.math.Vec3(0, 0, 100);
  
  /**
   * The focus point of this camera.
   * 
   * @type {goog.math.Vec3}
   * @protected
   */
  this._focus = new goog.math.Vec3(0, 0, 0);
  
  /**
   * The unit vector pointing to the top of the three-dimensional space.
   * 
   * @type {goog.math.Vec3}
   * @protected
   */
  this._up = new goog.math.Vec3(0, 1, 0);
  
  /**
   * The perspective matrix.
   * 
   * @type {goog.math.Matrix}
   * @protected
   */
  this._perspective = new Float32Array(this.calculatePerspective_(
      this._fieldOfView, (width / height), 1, 10000).flatten());
  
  /**
   * The view matrix.
   * 
   * @type {goog.math.Matrix}
   * @protected
   */
  this._view = this.lookAt_(this._position, this._focus);
  
  /**
   * The view matrix as a 'ready-to-use'-gl version.
   * 
   * @type {Object}
   * @protected
   */
  this._glView = new Float32Array(this._view.flatten());
  
  /**
   * The inverted and transposed view matrix as a 'ready-to-use'-gl version.
   * 
   * @type {Object}
   * @protected
   */
  this._glViewInvertedTransposed = new Float32Array(this._view.getInverse()
      .getTranspose().flatten());


  this._rotation = new goog.math.Vec2(0, 0);
};
// inherit from X.base
goog.inherits(X.camera, X.base);


/**
 * Configures observes for a given interactor. The method sets up listeners for
 * PAN, ROTATE and ZOOM events.
 * 
 * @param {!X.interactor} interactor The interactor which should be observed.
 */
X.camera.prototype.observe = function(interactor) {

  if (!goog.isDefAndNotNull(interactor) ||
      !(interactor instanceof X.interactor)) {
    
    throw new X.exception('Fatal: Could not observe the interactor.');
    
  }
  
  goog.events.listen(interactor, X.event.events.PAN, this.onPan.bind(this));
  goog.events.listen(interactor, X.event.events.ROTATE, this.onRotate
      .bind(this));
  goog.events.listen(interactor, X.event.events.ZOOM, this.onZoom.bind(this));
  
};


/**
 * The callback for a ZOOM event.
 * 
 * @param {!X.camera.ZoomEvent} event The event.
 * @throws {X.exception} An exception if the event is invalid.
 */
X.camera.prototype.onZoom = function(event) {

  if (!(event instanceof X.event.ZoomEvent)) {
    
    throw new X.exception('Fatal: Received no valid zoom event!');
    
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
 * @param {!X.camera.PanEvent} event The event.
 * @throws {X.exception} An exception if the event is invalid.
 */
X.camera.prototype.onPan = function(event) {

  if (!(event instanceof X.event.PanEvent)) {
    
    throw new X.exception('Fatal: Received no valid pan event!');
    
  }
  
  this.pan(event._distance);
  
};


/**
 * The callback for a ROTATE event.
 * 
 * @param {!X.camera.RotateEvent} event The event.
 * @throws {X.exception} An exception if the event is invalid.
 */
X.camera.prototype.onRotate = function(event) {

  if (!(event instanceof X.event.RotateEvent)) {
    
    throw new X.exception('Fatal: Received no valid rotate event!');
    
  }
 
  this._rotation.add(event._distance); 
  this.rotate(event._distance, true);
};


/**
 * Get the perspective matrix of the three-dimensional space.
 * 
 * @return {!goog.math.Matrix} The perspective matrix.
 */
X.camera.prototype.perspective = function() {

  return this._perspective;
  
};

/**
 * Set the perspective matrix of the three-dimensional space.
 * Useful to put back the matrix after modification for the orientationBox
 *
 * @param {!goog.math.Matrix} perspectiveMatrix The perspective matrix.
 */
X.camera.prototype.setPerspective = function(perspectiveMatrix) {
  this._perspective = perspectiveMatrix;
}


/**
 * Get the view matrix of the three-dimensional space.
 * 
 * @return {!goog.math.Matrix} The view matrix.
 */
X.camera.prototype.view = function() {

  return this._view;
  
};

/**
 * Get the view matrix of the three-dimensional space.
 * 
 * @param {!goog.math.Matrix} view The view matrix.
 */
X.camera.prototype.setView = function(view) {

  this._view = view;
  
};

/**
 * Get the view matrix as a 'ready-to-use'-gl version.
 * 
 * @return {!Object} The view matrix as a Float32Array.
 */
X.camera.prototype.glView = function() {

  return this._glView;
  
};

/**
 * Set the glView matrix
 * Useful to put back the matrix after modification for the orientationBox
 *
 * @param {!Object} glViewMatrix The glView matrix.
 */
X.camera.prototype.setGLView = function(glViewMatrix) {
  this._glView = glViewMatrix;
}

/**
 * Get the inverted and transposed view matrix as a 'ready-to-use'-gl version.
 * 
 * @return {!Object} The inverted and transposed view matrix as a Float32Array.
 */
X.camera.prototype.glViewInvertedTransposed = function() {

  return this._glViewInvertedTransposed;
  
};

/**
 * Set the glViewInverted matrix
 * Useful to put back the matrix after modification for the orientationBox
 *
 * @param {!Object} glViewInvertedMatrix The glView matrix.
 */
X.camera.prototype.setGLViewInverted = function(glViewInvertedMatrix) {
  this._glViewInvertedTransposed = glViewInvertedMatrix;
}


/**
 * Get the position of this camera.
 * 
 * @return {!goog.math.Vec3} The position.
 */
X.camera.prototype.position = function() {

  return this._position;
  
};


/**
 * Set the position of this camera. This forces a re-calculation of the view
 * matrix. This action _does not_ force an immediate render event automatically.
 * 
 * @param {!number} x The X component of the new camera position.
 * @param {!number} y The Y component of the new camera position.
 * @param {!number} z The Z component of the new camera position.
 */
X.camera.prototype.setPosition = function(x, y, z) {

  if (!goog.isNumber(x) || !goog.isNumber(y) || !goog.isNumber(z)) {
    
    throw new X.exception('Fatal: The position was invalid.');
    
  }
  
  this._position = new goog.math.Vec3(x, y, z);
  
  this.reset();
  
};


/**
 * Reset the camera according to its configured position and focus.
 */
X.camera.prototype.reset = function() {

  // update the view matrix and its gl versions
  this._view = this.lookAt_(this._position, this._focus);
  this._glView = new Float32Array(this._view.flatten());
  this._glViewInvertedTransposed = new Float32Array(this._view.getInverse()
      .getTranspose().flatten());
  
};


/**
 * Get the focus of this camera.
 * 
 * @return {!goog.math.Vec3} The focus.
 */
X.camera.prototype.focus = function() {

  return this._focus;
  
};


/**
 * Set the focus of this camera. This forces a re-calculation of the view
 * matrix. This action _does not_ force an immediate render event automatically.
 * 
 * @param {!number} x The X component of the new camera focus.
 * @param {!number} y The Y component of the new camera focus.
 * @param {!number} z The Z component of the new camera focus.
 */
X.camera.prototype.setFocus = function(x, y, z) {

  if (!goog.isNumber(x) || !goog.isNumber(y) || !goog.isNumber(z)) {
    
    throw new X.exception('Fatal: The focus was invalid.');
    
  }
  
  this._focus = new goog.math.Vec3(x, y, z);
  
  this.reset();
  
};


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
 * @return {goog.math.Matrix} The perspective matrix.
 * @private
 */
X.camera.prototype.calculatePerspective_ = function(fieldOfViewY, aspectRatio,
    zNearClippingPlane, zFarClippingPlane) {

  var ymax = zNearClippingPlane * Math.tan(fieldOfViewY * Math.PI / 360.0);
  var ymin = -ymax;
  var xmin = ymin * aspectRatio;
  var xmax = ymax * aspectRatio;
  
  return this.calculateViewingFrustum_(xmin, xmax, ymin, ymax,
      zNearClippingPlane, zFarClippingPlane);
  
};


/**
 * Calculate the view frustum which is the three-dimensional area which is
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
 * @return {goog.math.Matrix} The frustum matrix.
 * @private
 */
X.camera.prototype.calculateViewingFrustum_ = function(left, right, bottom,
    top, znear, zfar) {

  var X = 2 * znear / (right - left);
  var Y = 2 * znear / (top - bottom);
  var A = (right + left) / (right - left);
  var B = (top + bottom) / (top - bottom);
  var C = -(zfar + znear) / (zfar - znear);
  var D = -2 * zfar * znear / (zfar - znear);
  
  return new goog.math.Matrix([[X, 0, A, 0], [0, Y, B, 0], [0, 0, C, D],
                               [0, 0, -1, 0]]);
  
};


/**
 * Perform a pan operation. This method fires a X.camera.RenderEvent() after the
 * calculation is done.
 * 
 * @param {!goog.math.Vec2} distance The distance of the panning in respect of
 *          the last camera position.
 */
X.camera.prototype.pan = function(distance) {

  if (!(distance instanceof goog.math.Vec2)) {
    
    throw new X.exception('Fatal: Invalid distance vector for pan operation.');
    
  }
  
  var distance3d = new goog.math.Vec3(-distance.x, distance.y, 0);
  
  var identity = goog.math.Matrix.createIdentityMatrix(4);
  var panMatrix = identity.translate(distance3d);
  
  this._view = panMatrix.multiply(this._view);
  this._glView = new Float32Array(this._view.flatten());
  this._glViewInvertedTransposed = new Float32Array(this._view.getInverse()
      .getTranspose().flatten());
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * Perform a rotate operation. This method fires a X.camera.RenderEvent() after
 * the calculation is done.
 * 
 * @param {!goog.math.Vec2} distance The distance of the rotation in respect of
 *          the last camera position.
 * @param {!boolean} render do we fire a render
 */
X.camera.prototype.rotate = function(distance, render) {

  if (!(distance instanceof goog.math.Vec2)) {
    
    throw new X.exception(
        'Fatal: Invalid distance vector for rotate operation.');
    
  }
  
  // in radii, the 5 is a constant stating how quick the rotation performs..
  var angleX = -distance.x / 5 * Math.PI / 180;
  var angleY = -distance.y / 5 * Math.PI / 180;
  
  var identity = goog.math.Matrix.createIdentityMatrix(4);
  // the x-Axis vector is determined by the first row of the view matrix
  var xAxisVector = new goog.math.Vec3(this._view.getValueAt(0, 0), this._view
      .getValueAt(0, 1), this._view.getValueAt(0, 2));
  // the y-Axis vector is determined by the second row of the view matrix
  var yAxisVector = new goog.math.Vec3(this._view.getValueAt(1, 0), this._view
      .getValueAt(1, 1), this._view.getValueAt(1, 2));
  
  // we rotate around the Y Axis when the mouse moves along the screen in X
  // direction
  var rotateX = identity.rotate(angleX, yAxisVector);
  
  // we rotate around the X axis when the mouse moves along the screen in Y
  // direction
  var rotateY = identity.rotate(angleY, xAxisVector);
  
  // perform the actual rotation calculation
  this._view = this._view.multiply(rotateY.multiply(rotateX));
  this._glView = new Float32Array(this._view.flatten());
  this._glViewInvertedTransposed = new Float32Array(this._view.getInverse()
      .getTranspose().flatten());
  
  // fire a render event
  if( render ){
  this.dispatchEvent(new X.event.RenderEvent());
  }
};


/**
 * Perform a rotate operation. This method fires a X.camera.RenderEvent() after
 * the calculation is done.
 *          the last camera position.
 */
X.camera.prototype.rotation = function() {
  return this._rotation;
};

/**
 * Perform a zoom in operation. This method fires a X.camera.RenderEvent() after
 * the calculation is done.
 * 
 * @param {boolean} fast Enables/disables the fast mode which zooms much
 *          quicker.
 */
X.camera.prototype.zoomIn = function(fast) {

  var zoomStep = 20;
  
  if (goog.isDefAndNotNull(fast) && !fast) {
    
    zoomStep = 1;
    
  }
  
  var zoomVector = new goog.math.Vec3(0, 0, zoomStep);
  
  var identity = goog.math.Matrix.createIdentityMatrix(4);
  var zoomMatrix = identity.translate(zoomVector);
  
  this._view = zoomMatrix.multiply(this._view);
  this._glView = new Float32Array(this._view.flatten());
  this._glViewInvertedTransposed = new Float32Array(this._view.getInverse()
      .getTranspose().flatten());
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * Perform a zoom out operation. This method fires a X.camera.RenderEvent()
 * after the calculation is done.
 * 
 * @param {boolean} fast Enables/disables the fast mode which zooms much
 *          quicker.
 */
X.camera.prototype.zoomOut = function(fast) {

  var zoomStep = 30;
  
  if (goog.isDefAndNotNull(fast) && !fast) {
    
    zoomStep = 1;
    
  }
  
  var zoomVector = new goog.math.Vec3(0, 0, -zoomStep);
  
  var identity = goog.math.Matrix.createIdentityMatrix(4);
  var zoomMatrix = identity.translate(zoomVector);
  
  this._view = zoomMatrix.multiply(this._view);
  this._glView = new Float32Array(this._view.flatten());
  this._glViewInvertedTransposed = new Float32Array(this._view.getInverse()
      .getTranspose().flatten());
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * Calculate a view matrix by using the camera position and a focus point.
 * 
 * @param {!goog.math.Vec3} cameraPosition The camera position.
 * @param {!goog.math.Vec3} targetPoint The focus (target) point.
 * @return {!goog.math.Matrix} The view matrix.
 * @private
 */
X.camera.prototype.lookAt_ = function(cameraPosition, targetPoint) {

  if (!(cameraPosition instanceof goog.math.Vec3) ||
      !(targetPoint instanceof goog.math.Vec3)) {
    
    throw new X.exception(
        'Fatal: 3D vectors required for calculating the view.');
    
  }
  
  var matrix = goog.math.Matrix.createIdentityMatrix(4);
  
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
    yVector.z = 0.000001;
    
  }
  
  // X vector = Y x Z
  var xVector = goog.math.Vec3.cross(yVector, zVector);
  
  // recompute Y vector = Z x X
  yVector = goog.math.Vec3.cross(zVector, xVector);
  
  // normalize X and Y
  xVector = xVector.normalize();
  yVector = yVector.normalize();
  
  // create view matrix
  matrix.setValueAt(0, 0, xVector.x);
  matrix.setValueAt(0, 1, xVector.y);
  matrix.setValueAt(0, 2, xVector.z);
  matrix.setValueAt(0, 3, 0);
  
  matrix.setValueAt(1, 0, yVector.x);
  matrix.setValueAt(1, 1, yVector.y);
  matrix.setValueAt(1, 2, yVector.z);
  matrix.setValueAt(1, 3, 0);
  
  matrix.setValueAt(2, 0, zVector.x);
  matrix.setValueAt(2, 1, zVector.y);
  matrix.setValueAt(2, 2, zVector.z);
  matrix.setValueAt(2, 3, 0);
  
  matrix.setValueAt(3, 0, 0);
  matrix.setValueAt(3, 1, 0);
  matrix.setValueAt(3, 2, 0);
  matrix.setValueAt(3, 3, 1);
  
  var invertedCameraPosition = cameraPosition.clone();
  
  return matrix.translate(invertedCameraPosition.invert());
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.camera', X.camera);
goog.exportSymbol('X.camera.prototype.observe', X.camera.prototype.observe);
goog.exportSymbol('X.camera.prototype.onZoom', X.camera.prototype.onZoom);
goog.exportSymbol('X.camera.prototype.onPan', X.camera.prototype.onPan);
goog.exportSymbol('X.camera.prototype.onRotate', X.camera.prototype.onRotate);
goog.exportSymbol('X.camera.prototype.perspective',
    X.camera.prototype.perspective);
goog.exportSymbol('X.camera.prototype.view', X.camera.prototype.view);
goog.exportSymbol('X.camera.prototype.position', X.camera.prototype.position);
goog.exportSymbol('X.camera.prototype.setPosition',
    X.camera.prototype.setPosition);
goog.exportSymbol('X.camera.prototype.pan', X.camera.prototype.pan);
goog.exportSymbol('X.camera.prototype.rotate', X.camera.prototype.rotate);
goog.exportSymbol('X.camera.prototype.zoomIn', X.camera.prototype.zoomIn);
goog.exportSymbol('X.camera.prototype.zoomOut', X.camera.prototype.zoomOut);
goog.exportSymbol('X.camera.prototype.rotation', X.camera.prototype.rotation);
goog.exportSymbol('X.camera.prototype.observe', X.camera.prototype.observe);

goog.exportSymbol('X.camera.prototype.setPerspective', X.camera.prototype.setPerspective);
goog.exportSymbol('X.camera.prototype.setView', X.camera.prototype.setView);
goog.exportSymbol('X.camera.prototype.setGLView', X.camera.prototype.setGLView);
goog.exportSymbol('X.camera.prototype.setGLViewInverted', X.camera.prototype.setGLViewInverted);

goog.exportSymbol('goog.math.Vec2', goog.math.Vec2);
goog.exportSymbol('goog.math.Vec3', goog.math.Vec3);
goog.exportSymbol('goog.math.Matrix', goog.math.Matrix);
