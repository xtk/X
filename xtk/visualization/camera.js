/*
 * ${HEADER}
 */

// provides
goog.provide('X.camera');
goog.provide('X.camera.PanEvent');
goog.provide('X.camera.RotateEvent');
goog.provide('X.camera.ZoomEvent');
goog.provide('X.camera.RenderEvent')
// requires
goog.require('X.event');
goog.require('X.base');
goog.require('X.exception');
goog.require('X.matrixHelper');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec3');



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
  this._perspective = this.calculatePerspective_(this._fieldOfView,
      (width / height), 1, 10000);

  /**
   * The view matrix.
   *
   * @type {goog.math.Matrix}
   * @protected
   */
  this._view = this.lookAt_(this._position, this._focus);

};
// inherit from X.base
goog.inherits(X.camera, X.base);


/**
 * The events of this class.
 *
 * @enum {string}
 */
X.camera.events = {
  // the pan event, where the camera and focus get moved accordingly
  PAN: X.event.uniqueId('pan'),

  // the rotate event, where only the camera gets moved
  ROTATE: X.event.uniqueId('rotate'),

  // the zoom event, where the camera Z coordinate changes
  ZOOM: X.event.uniqueId('zoom'),

  // update the renderer
  RENDER_CAMERA: X.event.uniqueId('rendercamera')
};


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

  goog.events.listen(interactor, X.camera.events.PAN, this.onPan.bind(this));
  goog.events.listen(interactor, X.camera.events.ROTATE, this.onRotate
      .bind(this));
  goog.events.listen(interactor, X.camera.events.ZOOM, this.onZoom.bind(this));

};


/**
 * The callback for a ZOOM event.
 *
 * @param {!X.camera.ZoomEvent} event The event.
 * @throws {X.exception} An exception if the event is invalid.
 */
X.camera.prototype.onZoom = function(event) {

  if (!(event instanceof X.camera.ZoomEvent)) {

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

  if (!(event instanceof X.camera.PanEvent)) {

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

  if (!(event instanceof X.camera.RotateEvent)) {

    throw new X.exception('Fatal: Received no valid rotate event!');

  }

  this.rotate(event._distance);

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
 * Get the view matrix of the three-dimensional space.
 *
 * @return {!goog.math.Matrix} The view matrix.
 */
X.camera.prototype.view = function() {

  return this._view;

};


/**
 * Get the position of this camera.
 *
 * @return {!goog.math.Vec3} The position.
 */
X.camera.prototype.position = function() {

  return this._position;

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
 * Perform a pan operation. This method fires a X.camera.RenderEvent() after
 * the calculation is done.
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


  // fire a render event
  this.dispatchEvent(new X.camera.RenderEvent());

};


/**
 * Perform a rotate operation. This method fires a X.camera.RenderEvent()
 * after the calculation is done.
 *
 * @param {!goog.math.Vec2} distance The distance of the rotation in respect of
 *          the last camera position.
 */
X.camera.prototype.rotate = function(distance) {

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

  // fire a render event
  this.dispatchEvent(new X.camera.RenderEvent());

};


/**
 * Perform a zoom in operation. This method fires a X.camera.RenderEvent()
 * after the calculation is done.
 *
 * @param {boolean} fast Enables/disables the fast mode which zooms much
 *          quicker.
 */
X.camera.prototype.zoomIn = function(fast) {

  var zoomStep = 30;

  if (goog.isDefAndNotNull(fast) && !fast) {

    zoomStep = 1;

  }

  var zoomVector = new goog.math.Vec3(0, 0, zoomStep);

  var identity = goog.math.Matrix.createIdentityMatrix(4);
  var zoomMatrix = identity.translate(zoomVector);

  this._view = zoomMatrix.multiply(this._view);

  // fire a render event
  this.dispatchEvent(new X.camera.RenderEvent());

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

  // fire a render event
  this.dispatchEvent(new X.camera.RenderEvent());

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



/**
 * The pan event to initiate moving the camera and the focus.
 *
 * @constructor
 * @extends {X.event}
 */
X.camera.PanEvent = function() {

  // call the default event constructor
  goog.base(this, X.camera.events.PAN);

  /**
   * The distance to pan in screen space.
   *
   * @type {?goog.math.Vec2}
   * @protected
   */
  this._distance = null;

};
// inherit from X.event
goog.inherits(X.camera.PanEvent, X.event);



/**
 * The rotate event to initiate moving the camera around the focus.
 *
 * @constructor
 * @extends {X.event}
 */
X.camera.RotateEvent = function() {

  // call the default event constructor
  goog.base(this, X.camera.events.ROTATE);

  /**
   * The distance to pan in screen space.
   *
   * @type {?goog.math.Vec2}
   * @protected
   */
  this._distance = null;

  /**
   * The angle in degrees to pan around the last mouse position in screen space.
   *
   * @type {!number}
   * @protected
   */
  this._angle = 0;

};
// inherit from X.event
goog.inherits(X.camera.RotateEvent, X.event);

/**
 * The zoom event to initiate zoom in or zoom out.
 *
 * @constructor
 * @extends {X.event}
 */
X.camera.ZoomEvent = function() {

  // call the default event constructor
  goog.base(this, X.camera.events.ZOOM);

  /**
   * The flag for the zooming direction. If TRUE, the zoom operation will move
   * the objects closer to the camera. If FALSE, further away from the camera.
   *
   * @type {!boolean}
   * @protected
   */
  this._in = false;

  /**
   * The flag for the zooming speed. If TRUE, the zoom operation will happen
   * fast. If FALSE, there will be a fine zoom operation.
   *
   * @type {!boolean}
   * @protected
   */
  this._fast = false;

};
// inherit from X.event
goog.inherits(X.camera.ZoomEvent, X.event);

/**
 * The render event to update renderer.
 *
 * @constructor
 * @extends {X.event}
 */
X.camera.RenderEvent = function() {

  // call the default event constructor
  goog.base(this, X.camera.RENDER_CAMERA);
  
  /**
   * The timestamp of this render event.
   *
   * @type {!number}
   */
  this._timestamp = Date.now();
};
// inherit from X.event
goog.inherits(X.camera.RenderEvent, X.event);

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
goog.exportSymbol('X.camera.prototype.pan', X.camera.prototype.pan);
goog.exportSymbol('X.camera.prototype.rotate', X.camera.prototype.rotate);
goog.exportSymbol('X.camera.prototype.zoomIn', X.camera.prototype.zoomIn);
goog.exportSymbol('X.camera.prototype.zoomOut', X.camera.prototype.zoomOut);
goog.exportSymbol('X.camera.prototype.observe', X.camera.prototype.observe);
goog.exportSymbol('X.camera.PanEvent', X.camera.PanEvent);
goog.exportSymbol('X.camera.RotateEvent', X.camera.RotateEvent);
goog.exportSymbol('X.camera.ZoomEvent', X.camera.ZoomEvent);
goog.exportSymbol('X.camera.RenderEvent', X.camera.RenderEvent);

goog.exportSymbol('goog.math.Vec2', goog.math.Vec2);
goog.exportSymbol('goog.math.Vec3', goog.math.Vec3);
goog.exportSymbol('goog.math.Matrix', goog.math.Matrix);
