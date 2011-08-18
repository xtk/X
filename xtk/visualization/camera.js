/*
 * ${HEADER}
 */

// provides
goog.provide('X.camera');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('goog.math.Matrix');


/**
 * Create a camera.
 * 
 * @constructor
 * @extends {X.base}
 */
X.camera = function(renderer) {

  // call the standard constructor of X.base
  goog.base(this);
  
  if (!renderer) {
    
    throw new X.exception(
        'Fatal: A valid renderer is required to create a camera.');
    
  }
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'camera';
  
  this._renderer = renderer;
  
  this._perspective = this.calculatePerspective_(45,
      (this._renderer.getWidth() / this._renderer.getHeight()), 0.1, 100.0);
  
};
// inherit from X.base
goog.inherits(X.camera, X.base);

/**
 * 
 */
X.camera.prototype.getPerspective = function() {

  return this._perspective;
  
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
