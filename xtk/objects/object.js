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
 * @param {X.object.types} type The rendering type for this object.
 * @extends {X.base}
 */
X.object = function(type) {

  // by default, this object is described by triangles.
  var validType = X.object.types.TRIANGLES;

  if (goog.isDefAndNotNull(type) &&
      (type == X.object.types.LINES || type == X.object.types.TRIANGLES)) {

    // if a valid type was provided, we use it instead..
    // at this point, the provided type is always valid
    validType = type;

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
  this._className = 'object';

  /**
   * The rendering type of this object.
   *
   * @type {X.object.types}
   * @const
   */
  this._type = validType;

  /**
   * The object color.
   *
   * @type {X.color}
   * @protected
   */
  this._color = null;

  /**
   * The points of this object.
   *
   * @type {X.points}
   * @protected
   */
  this._points = new X.points();

  /**
   * The point colors of this object.
   *
   * @type {X.colors}
   * @protected
   */
  this._colors = new X.colors();

  /**
   * The texture of this object. TODO
   *
   * @protected
   */
  this._texture = null;

  /**
   * The lightning of this object. TODO
   *
   * @protected
   */
  this._lightning = null;

  /**
   * The opacity of this object.
   *
   * @type {number}
   * @protected
   */
  this._opacity = 1.0;

  /**
   * The visibility of this object.
   *
   * @type {boolean}
   * @protected
   */
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
  TRIANGLES: 'TRIANGLES',
  LINES: 'LINES'
};


/**
 * Get the rendering type of this object.
 *
 * @return {X.object.types} The rendering type.
 */
X.object.prototype.type = function() {

  return this._type;

};


/**
 * Get the points of this object.
 *
 * @return {X.points} The points.
 */
X.object.prototype.points = function() {

  return this._points;

};


/**
 * Get the point colors of this object.
 *
 * @return {X.colors} The point colors.
 */
X.object.prototype.colors = function() {

  return this._colors;

};


/**
 * Get the object color.
 *
 * @return {X.color} The object color.
 */
X.object.prototype.color = function() {

  return this._color;

};


/**
 * Set the object color. This overrides any point colors.
 *
 * @param {!X.color} color The color to set for the object.
 */
X.object.prototype.setColor = function(color) {

  // we accept either null or a X.color as argument
  if (!goog.isDefAndNotNull(color) && !(color instanceof X.color)) {

    throw new X.exception('Fatal: Invalid color.');

  }

  this._color = color;

};


/**
 * Get the opacity of this object. If the object is fully opaque, this returns
 * 1.
 *
 * @return {number} The opacity in the range 0..1.
 */
X.object.prototype.opacity = function() {

  return this._opacity;

};


/**
 * Set the opacity of this object.
 *
 * @param {number} opacity The opacity value in the range 0..1.
 */
X.object.prototype.setOpacity = function(opacity) {

  // check if the given opacity is in the range 0..1
  if (!goog.isNumber(opacity) || opacity > 1.0 || opacity < 0.0) {

    throw new X.exception('Fatal: Invalid opacity.');

  }

  this._opacity = opacity;

};


/**
 * Compare two X.objects by their opacity values.
 *
 * @param {X.object} object1 Object1 to compare against Object2.
 * @param {X.object} object2 Object2 to compare against Object1.
 * @return {Number} 1, if Object1 is less or equal opaque in comparison to
 *         Object2. -1, if Object1 is more opaque than Object2.
 */
X.object.OPACITY_COMPARATOR = function(object1, object2) {

  // check if we have two valid objects to compare
  if (!goog.isDefAndNotNull(object1) || !goog.isDefAndNotNull(object2) ||
      !(object1 instanceof X.object) || !(object2 instanceof X.object)) {

    throw new X.exception(
        'Fatal: Two valid X.objects are required for comparison.');

  }

  if (object1.opacity() <= object2.opacity()) {

    // return a positive value to indicate object1 is less or equal opaque in
    // comparison to object2
    // this means object1 should be ordered after object2
    return 1;

  } else if (object1.opacity() > object2.opacity()) {

    // return a negative value to indicate object1 is more opaque than object2
    // this means object1 should be ordered before object2
    return -1;

  }

};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.object', X.object);
goog.exportSymbol('X.object.prototype.type', X.object.prototype.type);
goog.exportSymbol('X.object.prototype.points', X.object.prototype.points);
goog.exportSymbol('X.object.prototype.colors', X.object.prototype.colors);
goog.exportSymbol('X.object.prototype.color', X.object.prototype.color);
goog.exportSymbol('X.object.prototype.setColor', X.object.prototype.setColor);
goog.exportSymbol('X.object.prototype.opacity', X.object.prototype.opacity);
goog.exportSymbol('X.object.prototype.setOpacity',
    X.object.prototype.setOpacity);
goog.exportSymbol('X.object.OPACITY_COMPARATOR', X.object.OPACITY_COMPARATOR);
