/*
 * ${HEADER}
 */

// provides
goog.provide('X.camera');
goog.provide('X.camera.PanEvent');
goog.provide('X.camera.RotateEvent');
goog.provide('X.camera.ZoomEvent');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('X.event');
goog.require('X.matrixHelper');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec3');

/**
 * Create a camera.
 * 
 * @constructor
 * @name X.camera
 * @extends {X.base}
 */
X.camera = function(width, height) {

  // call the standard constructor of X.base
  goog.base(this);
  
  // validate width and height
  if (!goog.isNumber(width) || !goog.isNumber(height)) {
    
    throw new X.exception(
        'Fatal: A camera needs valid width and height values.');
    
  }
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'camera';
  
  this._fieldOfView = 45;
  
  this._position = new goog.math.Vec3(0, 0, 100);
  
  this._focus = new goog.math.Vec3(0, 0, 0);
  
  this._up = new goog.math.Vec3(0, 1, 0);
  
  this._perspective = this.calculatePerspective_(this._fieldOfView,
      (width / height), 1, 10000);
  
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
  PAN : X.event.uniqueId('pan'),
  
  // the rotate event, where only the camera gets moved
  ROTATE : X.event.uniqueId('rotate'),
  
  // the zoom event, where the camera Z coordinate changes
  ZOOM : X.event.uniqueId('zoom')
};


X.camera.prototype.observe = function(interactor) {

  if (!goog.isDefAndNotNull(interactor)
      || !(interactor instanceof X.interactor)) {
    
    throw new X.exception('Fatal: Could not observe the interactor.');
    
  }
  
  goog.events.listen(interactor, X.camera.events.PAN, this.onPan.bind(this));
  goog.events.listen(interactor, X.camera.events.ROTATE, this.onRotate
      .bind(this));
  goog.events.listen(interactor, X.camera.events.ZOOM, this.onZoom.bind(this));
  
};


/**
 * @param event
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
 * @param event
 */
X.camera.prototype.onPan = function(event) {

  if (!(event instanceof X.camera.PanEvent)) {
    
    throw new X.exception('Fatal: Received no valid pan event!');
    
  }
  
  this.pan(event._distance);
  
};


/**
 * @param event
 */
X.camera.prototype.onRotate = function(event) {

  if (!(event instanceof X.camera.RotateEvent)) {
    
    throw new X.exception('Fatal: Received no valid rotate event!');
    
  }
  
  this.rotate(event._distance);
  
};


/**
 *
 */
X.camera.prototype.perspective = function() {

  return this._perspective;
  
};

X.camera.prototype.view = function() {

  return this._view;
  
};

X.camera.prototype.position = function() {

  return this._position;
  
};

//
// gluPerspective
//
// fovy: Field of view in degrees
// aspect: aspect ratio width/height
// znear: near clipping plane
// zfar: far clipping plane
/**
 *
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

//
// glFrustum
//
// creates the 3d view area which is visible to the viewer, to check if objects
// are visible
// see http://en.wikipedia.org/wiki/Viewing_frustum
/**
 *
 */
X.camera.prototype.calculateViewingFrustum_ = function(left, right, bottom,
    top, znear, zfar) {

  var X = 2 * znear / (right - left);
  var Y = 2 * znear / (top - bottom);
  var A = (right + left) / (right - left);
  var B = (top + bottom) / (top - bottom);
  var C = -(zfar + znear) / (zfar - znear);
  var D = -2 * zfar * znear / (zfar - znear);
  
  return new goog.math.Matrix([ [ X, 0, A, 0 ], [ 0, Y, B, 0 ], [ 0, 0, C, D ],
      [ 0, 0, -1, 0 ] ]);
  
};

X.camera.prototype.pan = function(distance) {

  if (!goog.isDefAndNotNull(distance) || !(distance instanceof goog.math.Vec2)) {
    
    throw new X.exception('Fatal: Invalid distance vector for pan operation.');
    
  }
  
  // calculate new position and focus based on the distance vector
  this._position.x = this._position.x + distance.x;
  this._position.y = this._position.y - distance.y;
  this._focus.x = this._focus.x + distance.x;
  this._focus.y = this._focus.y - distance.y;
  
  // re-generate the view
  this._view = this.lookAt_(this._position, this._focus);
  
  // fire a render event
  this.dispatchEvent(new X.renderer.RenderEvent());
  
};

X.camera.prototype.rotate = function(distance) {

  if (!goog.isDefAndNotNull(distance) || !(distance instanceof goog.math.Vec2)) {
    
    throw new X.exception(
        'Fatal: Invalid distance vector for rotate operation.');
    
  }
  
  // TODO this is def. a wrong calculation! must ensure the new position is on
  // the viewing sphere around the focus with the same radius (distance between
  // position and focus)
  
  // calculate new position and focus based on the distance vector
  this._position.x = this._position.x + distance.x;
  this._position.y = this._position.y - distance.y;
  // this._focus.x = this._focus.x + distance.x;
  // this._focus.y = this._focus.y - distance.y;
  
  // re-generate the view
  this._view = this.lookAt_(this._position, this._focus);
  
  // fire a render event
  this.dispatchEvent(new X.renderer.RenderEvent());
  
};

X.camera.prototype.zoomIn = function(fast) {

  var zoomStep = 30;
  
  if (goog.isDefAndNotNull(fast) && !fast) {
    
    zoomStep = 1;
    
  }
  
  // calculate new position and focus
  this._position.z = this._position.z - zoomStep;
  this._focus.z = this._focus.z - zoomStep;
  
  // re-generate the view
  this._view = this.lookAt_(this._position, this._focus);
  
  // fire a render event
  this.dispatchEvent(new X.renderer.RenderEvent());
  
};

X.camera.prototype.zoomOut = function(fast) {

  var zoomStep = 30;
  
  if (goog.isDefAndNotNull(fast) && !fast) {
    
    zoomStep = 1;
    
  }
  
  // calculate new position and focus
  this._position.z = this._position.z + zoomStep;
  this._focus.z = this._focus.z + zoomStep;
  
  // re-generate the view
  this._view = this.lookAt_(this._position, this._focus);
  
  // fire a render event
  this.dispatchEvent(new X.renderer.RenderEvent());
  
};

X.camera.prototype.lookAt_ = function(cameraPosition, targetPoint) {

  if (!(cameraPosition instanceof goog.math.Vec3)
      || !(targetPoint instanceof goog.math.Vec3)) {
    
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
 * @name X.camera.PanEvent
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
 * @name X.camera.RotateEvent
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
 * @name X.camera.ZoomEvent
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
