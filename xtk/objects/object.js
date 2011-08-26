/*
 * ${HEADER}
 */

// provides
goog.provide('X.object');

// requires
goog.require('X.base');
goog.require('X.colors');
goog.require('X.exception');
goog.require('X.points');
goog.require('goog.structs.Set');

/**
 * Create a displayable object. Objects may have points, colors, a texture and a
 * lightning source.
 * 
 * @constructor
 * @extends {X.base}
 */
X.object = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'object';
  
  this._points_ = new X.points;
  
  this._colors_ = new X.colors();
  
  this._texture = null;
  
  this._lightning = null;
  
  this._visibility = true;
  
};
// inherit from X.base
goog.inherits(X.object, X.base);

X.object.prototype.points = function() {

  return this._points_;
  
};

X.object.prototype.colors = function() {

  return this._colors_;
  
};

// TODO a lot :)
