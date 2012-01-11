/*
 * ${HEADER}
 */

// provides
goog.provide('X.sphere');

// requires
goog.require('CSG');
goog.require('X.base');
goog.require('X.exception');
goog.require('X.object');
goog.require('goog.math.Vec3');



/**
 * Create a displayable sphere.
 * 
 * @constructor
 * @inheritDoc
 * @param {!Array} center The center position in 3D space as a 1-D Array with
 *          length 3.
 * @param {!number} radius The radius of the sphere.
 * @extends X.object
 */
X.sphere = function(center, radius) {

  if (!goog.isDefAndNotNull(center) || !(center instanceof Array) ||
      (center.length != 3)) {
    
    throw new X.exception('Invalid center.');
    
  }
  
  if (!goog.isNumber(radius)) {
    
    throw new X.exception('Invalid radius.');
    
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
  this._className = 'sphere';
  
  this._center = center;
  
  this._radius = radius;
  
  this._slices = 32;
  
  this._stacks = 16;
  
  this.create_();
  
};
// inherit from X.base
goog.inherits(X.sphere, X.object);


/**
 * Create the sphere.
 * 
 * @private
 */
X.sphere.prototype.create_ = function() {

  this.fromCSG(new CSG.sphere({
    center: this._center,
    radius: this._radius,
    slices: this._slices,
    stacks: this._stacks
  }));
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.sphere', X.sphere);
