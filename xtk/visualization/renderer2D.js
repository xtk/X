/*
 * ${HEADER}
 */

// provides
goog.provide('X.renderer2D');

// requires
goog.require('X.renderer');

/**
 * Create a 2D renderer with the given width and height.
 * 
 * @param {number} width The width of the renderer.
 * @param {number} height The height of the renderer.
 * @constructor
 * @extends {X.renderer}
 */
X.renderer2D = function(width, height) {
  
  // call the standard constructor of X.base
  goog.base(this, width, height);
  
  //
  // class attributes
  
  /** 
   * @inheritDoc 
   * @const 
   */
  this._className = 'renderer2D';
  
  /** @inheritDoc 
   *  @const 
   */
  this._dimension = 2;
  
};
// inherit from X.renderer
goog.inherits(X.renderer2D, X.renderer);
