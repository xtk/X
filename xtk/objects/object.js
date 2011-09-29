/*
 * ${HEADER}
 */

// provides
goog.provide('X.object');

// requires
goog.require('X.base');
goog.require('X.color');
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
X.object = function(type) {

  // by default, this object is described by triangles.
  var validType = X.object.types.TRIANGLES;
  
  if (goog.isDefAndNotNull(type)
      && (type == X.object.types.LINES || type == X.object.types.TRIANGLES)) {
    
    // if a valid type was provided, we use it instead..
    // at this point, the provided type is always valid
    validType = type;
    
  }
  
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'object';
  
  this._type = validType;
  
  this._color = null;
  
  this._points = new X.points();
  
  this._colors = new X.colors();
  
  this._texture = null;
  
  this._lightning = null;
  
  this._visibility = true;
  
};
// inherit from X.base
goog.inherits(X.object, X.base);

/**
 * Different render types for an X.object.
 * 
 * @enum {string}
 */
X.object.types = {
  // the render event
  TRIANGLES : 'TRIANGLES',
  LINES : 'LINES'
};

X.object.prototype.type = function() {

  return this._type;
  
};

X.object.prototype.points = function() {

  return this._points;
  
};

X.object.prototype.colors = function() {

  return this._colors;
  
};

X.object.prototype.color = function() {

  return this._color;
  
};

X.object.prototype.setColor = function(color) {

  // we accept either null or a X.color as argument
  if (!goog.isDefAndNotNull(color) && !(color instanceof X.color)) {
    
    throw new X.exception('Fatal: Invalid color.');
    
  }
  
  this._color = color;
  
};

// TODO a lot :)
