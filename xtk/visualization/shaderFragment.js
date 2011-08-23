/*
 * ${HEADER}
 */

// provides
goog.provide('X.shaderFragment');

// requires
goog.require('X.shader');



/**
 * Create a Fragment shader.
 *
 * @constructor
 * @extends {X.shader}
 */
X.shaderFragment = function() {

  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._className = 'shaderFragment';

  this._type = 'FRAGMENT';

};
// inherit from X.base
goog.inherits(X.shaderFragment, X.shader);
