/*
 * ${HEADER}
 */

// provides
goog.provide('X.cube');

// requires
goog.require('CSG');
goog.require('X.base');
goog.require('X.exception');
goog.require('X.object');



/**
 * Create a displayable cube.
 * 
 * @constructor
 * @inheritDoc
 * @param {!Array} center The center position in 3D space as a 1-D Array with
 *          length 3.
 * @param {!number} radiusX The radius of the box in X-direction.
 * @param {!number} radiusY The radius of the box in Y-direction.
 * @param {!number} radiusZ The radius of the box in Z-direction.
 * @extends X.object
 */
X.cube = function(center, radiusX, radiusY, radiusZ) {

  if (!goog.isDefAndNotNull(center) || !(center instanceof Array) ||
      (center.length != 3)) {
    
    throw new X.exception('Invalid center.');
    
  }
  
  if (!goog.isNumber(radiusX) || !goog.isNumber(radiusY) ||
      !goog.isNumber(radiusZ)) {
    
    throw new X.exception('Invalid radii.');
    
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
  this._className = 'cube';
  
  this._center = center;
  
  this._radiusX = radiusX;
  
  this._radiusY = radiusY;
  
  this._radiusZ = radiusZ;
  
  this.create_();
  
};
// inherit from X.base
goog.inherits(X.cube, X.object);


/**
 * Create the sphere.
 * 
 * @private
 */
X.cube.prototype.create_ = function() {

  this.fromCSG(new CSG.cube({
    center: this._center,
    radius: [this._radiusX, this._radiusY, this._radiusZ]
  }));
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.cube', X.cube);
