/*
 * ${HEADER}
 */

// provides
goog.provide('X.shader');

// requires
goog.require('X.base');
goog.require('X.exception');


/**
 * Create a shader.
 * 
 * @constructor
 * @extends {X.base}
 */
X.shader = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'shader';
  
  this._type = -1;
  
  this._source = null;
  
};
// inherit from X.base
goog.inherits(X.shader, X.base);

X.shader.prototype.getSource = function() {

  return this._source;
  
};

X.shader.prototype.setSource = function(source) {

  if (!source) {
    
    // throw exception if the source is invalid
    throw new X.exception('Fatal: Empty shader source!');
    
  }
  
  this._source = source;
  
};
