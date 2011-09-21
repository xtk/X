/*
 * ${HEADER}
 */

// provides
goog.provide('X.camera');
goog.provide('X.camera.ZoomEvent');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('X.event');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec3');

/**
 * Create a camera.
 * 
 * @constructor
 * @name X.camera
 * @extends {X.base}
 */
X.camera = function(renderer) {

  // call the standard constructor of X.base
  goog.base(this);
  
  if (!renderer) {
    
    throw new X.exception(
        'Fatal: A valid renderer is required to create a camera.');
    
  }
  
  // we want to communicate with the given renderer via events
  this.setParentEventTarget(renderer);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'camera';
  
  // TODO let's remove this..
  this._renderer = renderer;
  
  this._fieldOfView = 45;
  
  this._position = new goog.math.Vec3(0, 0, 100);
  
  this._focus = new goog.math.Vec3(0, 0, 0);
  
  this._up = new goog.math.Vec3(0, 1, 0);
  
  this._perspective = this.calculatePerspective_(this._fieldOfView,
      (this._renderer.width() / this._renderer.height()), 1, 10000);
  
  this._view = this.lookAt_(this._position, this._focus);
  
  goog.events.listen(this, X.camera.events.ZOOM, this.onZoom);
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

X.camera.prototype.zoomIn = function(fast) {

  var zoomStep = 30;
  
  if (goog.isDefAndNotNull(fast) && !fast) {
    
    zoomStep = 1;
    
  }
  
  this._position.z = this._position.z - zoomStep;
  this._focus.z = this._focus.z - zoomStep;
  
  this._view = this.lookAt_(this._position, this._focus);
  
  this.dispatchEvent(new X.renderer.RenderEvent());
  
};

X.camera.prototype.zoomOut = function(fast) {

  var zoomStep = 30;
  
  if (goog.isDefAndNotNull(fast) && !fast) {
    
    zoomStep = 1;
    
  }
  
  this._position.z = this._position.z + zoomStep;
  this._focus.z = this._focus.z + zoomStep;
  
  this._view = this.lookAt_(this._position, this._focus);
  
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
