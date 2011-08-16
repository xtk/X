/*
 * ${HEADER}
 */

// provides
goog.provide('X.shaderVertex');

// requires
goog.require('X.shader');



/**
 * Create a Vertex shader.
 * 
 * @constructor
 * @extends {X.shader}
 */
X.shaderVertex = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'shaderVertex';
  
  this._type = 'VERTEX';
  
};
// inherit from X.base
goog.inherits(X.shaderVertex, X.shader);
