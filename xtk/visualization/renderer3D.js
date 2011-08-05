/*
 * ${HEADER}
 */

// provides
goog.provide('X.renderer3D');

// requires
goog.require('X.renderer');

/**
 * Create a 3D renderer with the given width and height.
 * 
 * @param {number} width The width of the renderer.
 * @param {number} height The height of the renderer.
 * @constructor
 * @extends {X.renderer}
 */
X.renderer3D = function(width, height) {
  
  // call the standard constructor of X.base
  goog.base(this, width, height);
  
  //
  // class attributes
  
  /** 
   * @inheritDoc 
   * @const
   */
  this._className = 'renderer3D';
  
  /** 
   * @inheritDoc
   * @const 
   */
  this._dimension = 3;
  
};
// inherit from X.renderer
goog.inherits(X.renderer3D, X.renderer);
