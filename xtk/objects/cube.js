/*
 * ${HEADER}
 */

// provides
goog.provide('X.cube');

// requires
goog.require('X.base');
goog.require('X.cuboid');
goog.require('X.exception');
goog.require('X.object');



/**
 * Create a displayable cube.
 *
 * @constructor
 * @inheritDoc
 * @param {!number} radius The radius of the cube.
 * @extends {cuboid}
 */
X.cube = function(center, radius, type) {

  //
  // call the standard constructor of X.base
  goog.base(this, center, radius, radius, radius, type);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._className = 'cube';

};
// inherit from X.base
goog.inherits(X.cube, X.cuboid);

// export symbols (required for advanced compilation)
goog.exportSymbol('X.cube', X.cube);
