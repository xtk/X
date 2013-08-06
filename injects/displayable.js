/*
 *
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x
 *                    x:::::x  x:::::x
 *                     x:::::xx:::::x
 *                      x::::::::::x
 *                       x::::::::x
 *                       x::::::::x
 *                      x::::::::::x
 *                     x:::::xx:::::x
 *                    x:::::x  x:::::x
 *                   x:::::x    x:::::x
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *
 *                  http://www.goXTK.com
 *
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 *
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 *
 *
 */

// provides
goog.provide('X.displayable');

// requires
goog.require('X.base');
goog.require('X.transform');
goog.require('X.triplets');
goog.require('X.texture');


/**
 * Injective mix-in for all displayable objects.
 *
 * @constructor
 */
X.displayable = function() {

  //
  // class attributes

  /**
   * The rendering type of this object, default is
   * {X.displayable.types.TRIANGLES}.
   *
   * @type {X.displayable.types}
   * @protected
   */
  this._type = X.displayable.types.TRIANGLES;

  /**
   * The transform of this object.
   *
   * @type {!X.transform}
   * @protected
   */
  this._transform = new X.transform();

  /**
   * The object color. By default, this is white.
   *
   * @type {!Array}
   * @public
   */
  this._color = [1, 1, 1];

  /**
   * The points of this object.
   *
   * @type {?X.triplets}
   * @protected
   */
  this._points = null;

  /**
   * The normals of this object.
   *
   * @type {?X.triplets}
   * @protected
   */
  this._normals = null;

  /**
   * The point colors of this object.
   *
   * @type {?X.triplets}
   * @protected
   */
  this._colors = null;

  /**
   * The texture of this object.
   *
   * @type {?X.texture}
   * @protected
   */
  this._texture = null;

  /**
   * The mapping between object and texture coordinates.
   *
   * @type {?Array}
   * @protected
   */
  this._textureCoordinateMap = null;

  /**
   * An array reflecting the point or vertex indices.
   *
   * @type {!Array}
   * @protected
   */
  this._pointIndices = [];

  /**
   * The visibility of this object.
   *
   * @type {boolean}
   * @public
   */
  this._visible = true;

  /**
   * The point size, only used in X.displayable.types.POINTS mode.
   *
   * @type {number}
   * @protected
   */
  this._pointsize = 1;

  /**
   * The line width, only used in X.displayable.types.LINES mode.
   *
   * @type {number}
   * @protected
   */
  this._linewidth = 1;

  /**
   * The caption of this object.
   *
   * @type {?string}
   * @protected
   */
  this._caption = null;

  /**
   * The flag for the magic mode.
   *
   * @type {!boolean}
   * @protected
   */
  this._magicmode = false;

  /**
   * The opacity of this object.
   *
   * @type {number}
   * @protected
   */
  this._opacity = 1.0;

  /**
   * This distance of this object to the viewer's eye.
   *
   * @type {number}
   * @protected
   */
  this._distance = 0;

  /**
   * The flag if this object is pickable.
   *
   * @type {!boolean}
   * @protected
   */
  this._pickable = true;

};

/**
 * Different render types for any displayable objects.
 *
 * @enum {string}
 */
X.displayable.types = {
  // the displayable types
  TRIANGLES: 'TRIANGLES',
  TRIANGLE_STRIPS: 'TRIANGLE_STRIPS',
  LINES: 'LINES',
  POINTS: 'POINTS',
  POLYGONS: 'POLYGONS'
};


/**
 * Set the render type of this object. Valid types are: TRIANGLES,
 * TRIANGLE_STRIPS, LINES, POINTS, POLYGONS
 *
 * @param {!string} type The render type.
 */
X.displayable.prototype.__defineSetter__('type', function(type) {

  return this._type = type;

});


/**
 * Get the render type of this object.
 *
 * @return {!string} The render type.
 */
X.displayable.prototype.__defineGetter__('type', function() {

  return this._type;

});


/**
 * Get the texture of this object.
 *
 * @return {!X.texture} The texture.
 */
X.displayable.prototype.__defineGetter__('texture', function() {

  if (!this._texture) {

    this._texture = new X.texture();

  }

  return this._texture;

});


/**
 * Get the transform of this object.
 *
 * @return {!X.transform} The transform.
 */
X.displayable.prototype.__defineGetter__('transform', function() {

  return this._transform;

});


/**
 * Get the points of this object.
 *
 * @return {!X.triplets} The points.
 */
X.displayable.prototype.__defineGetter__('points', function() {

  return this._points;

});


/**
 * Set the points of this object.
 *
 * @param {!X.triplets} points The points.
 */
X.displayable.prototype.__defineSetter__('points', function(points) {

  this._points = points;

});


/**
 * Get the normals of this object.
 *
 * @return {!X.triplets} The normals.
 */
X.displayable.prototype.__defineGetter__('normals', function() {

  return this._normals;

});


/**
 * Set the normals of this object.
 *
 * @param {!X.triplets} normals The normals.
 */
X.displayable.prototype.__defineSetter__('normals', function(normals) {

  this._normals = normals;

});


/**
 * Get the point colors of this object.
 *
 * @return {!X.triplets} The point colors.
 */
X.displayable.prototype.__defineGetter__('colors', function() {

  return this._colors;

});


/**
 * Set the colors of this object.
 *
 * @param {!X.triplets} colors The colors.
 */
X.displayable.prototype.__defineSetter__('colors', function(colors) {

  this._colors = colors;

});


/**
 * Get the object color.
 *
 * @return {!Array} The object color.
 */
X.displayable.prototype.__defineGetter__('color', function() {

  return this._color;

});


/**
 * Set the object color. This overrides any point colors.
 *
 * @param {!Array} color The object color as an array with length 3 and values
 *          between 0..1.
 * @throws {Error} An exception if the given color is invalid.
 */
X.displayable.prototype.__defineSetter__('color', function(color) {

  // we accept only numbers as arguments
  if (!goog.isDefAndNotNull(color) || !goog.isArray(color) ||
      (color.length != 3)) {

    throw new Error('Invalid color.');

  }

  // loop through the children and propagate the new color
  var children = this._children;
  var numberOfChildren = children.length;
  var c = 0;

  for (c = 0; c < numberOfChildren; c++) {

    children[c]['color'] = color;

  }

  this._color = color;

  this._dirty = true;

  // no modified event since the rendering loop always checks it

});



/**
 * Get the opacity of this object. If the object is fully opaque, this returns
 * 1.
 *
 * @return {number} The opacity in the range 0..1.
 */
X.displayable.prototype.__defineGetter__('opacity', function() {

  return this._opacity;

});


/**
 * Set the opacity of this object.
 *
 * @param {number} opacity The opacity value in the range 0..1.
 */
X.displayable.prototype.__defineSetter__('opacity', function(opacity) {

  // check if the given opacity is in the range 0..1
  if (!goog.isNumber(opacity) || opacity > 1.0 || opacity < 0.0) {

    throw new Error('Invalid opacity.');

  }

  // loop through the children and propagate the new opacity
  var children = this._children;
  var numberOfChildren = children.length;
  var c = 0;

  for (c = 0; c < numberOfChildren; c++) {

    if(goog.isDefAndNotNull(children[c])) {

      children[c]['opacity'] = opacity;

    }

  }

  this._opacity = opacity;

  this._dirty = true;

  // no modified event since the rendering loop always checks it

});


/**
 * Get the caption of this object.
 *
 * @return {?string} The caption of this object.
 * @public
 */
X.displayable.prototype.__defineGetter__('caption', function() {

  return this._caption;

});


/**
 * Set the caption for this object.
 *
 * @param {?string} caption The caption for this object.
 * @public
 */
X.displayable.prototype.__defineSetter__('caption', function(caption) {

  this._caption = caption;

  this._dirty = true;

  // no modified event since the picking function always checks it

});


/**
 * Get the visibility of this object.
 *
 * @return {boolean} TRUE if the object is visible, FALSE otherwise.
 * @public
 */
X.displayable.prototype.__defineGetter__('visible', function() {

  return this._visible;

});


/**
 * Set the visibility of this object.
 *
 * @param {boolean} visible The object's new visibility.
 * @public
 */
X.displayable.prototype.__defineSetter__('visible', function(visible) {

  // loop through the children and propagate the new visibility
  var children = this._children;
  var numberOfChildren = children.length;
  var c = 0;

  for (c = 0; c < numberOfChildren; c++) {

    if(goog.isDefAndNotNull(children[c])) {

      children[c]['visible'] = visible;

    }

  }

  this._visible = visible;

  this._dirty = true;

  // no modified event since the rendering loop always checks it

});


/**
 * Get the point size of this object. The point size is only used in
 * X.displayable.types.POINTS rendering mode.
 *
 * @return {!number} The point size.
 */
X.displayable.prototype.__defineGetter__('pointsize', function() {

  return this._pointsize;

});


/**
 * Set the point size for this object. The point size is only used in
 * X.displayable.types.POINTS rendering mode.
 *
 * @param {!number} size The point size.
 * @throws {Error} An exception if the given size is invalid.
 */
X.displayable.prototype.__defineSetter__('pointsize', function(size) {

  if (!goog.isNumber(size)) {

    throw new Error('Invalid point size.');

  }

  this._pointsize = size;

  this._dirty = true;

  // no modified event since the rendering loop always checks it

});


/**
 * Get the magic mode flag.
 *
 * @return {!boolean} The magic mode flag.
 */
X.displayable.prototype.__defineGetter__('magicmode', function() {

  return this._magicmode;

});


/**
 * Set the magic mode flag.
 *
 * @param {!boolean} magicmode The magic mode flag.
 */
X.displayable.prototype.__defineSetter__('magicmode', function(magicmode) {

  if (!goog.isBoolean(magicmode)) {

    throw new Error('Invalid magic mode setting.');

  }

  this._magicmode = magicmode;

  this._dirty = true;

  // no modified event since the rendering loop always checks it

});


/**
 * Get the line width of this object. The line width is only used in
 * X.displayable.types.LINES rendering mode.
 *
 * @return {!number} The line width.
 */
X.displayable.prototype.__defineGetter__('linewidth', function() {

  return this._linewidth;

});


/**
 * Set the line width for this object. The line width is only used in
 * X.displayable.types.LINES rendering mode.
 *
 * @param {!number} width The line width.
 * @throws {Error} An exception if the given width is invalid.
 */
X.displayable.prototype.__defineSetter__('linewidth', function(width) {

  if (!goog.isNumber(width)) {

    throw new Error('Invalid line width.');

  }

  this._linewidth = width;

  this._dirty = true;

  // no modified event since the rendering loop always checks it

});


/**
 * Get the pickable flag.
 *
 * @return {!boolean} The pickable flag.
 */
X.displayable.prototype.__defineGetter__('pickable', function() {

  return this._pickable;

});


/**
 * Set the pickable flag.
 *
 * @param {!boolean} pickable The pickable flag.
 */
X.displayable.prototype.__defineSetter__('pickable', function(pickable) {

  if (!goog.isBoolean(pickable)) {

    throw new Error('Invalid pickable setting.');

  }

  this._pickable = pickable;

  this._dirty = true;

  // no modified event since the rendering loop always checks it

});


/**
 * Get the textureCoordinateMap of this object.
 *
 * @return {?Array} The textureCoordinateMap.
 */
X.displayable.prototype.__defineGetter__('textureCoordinateMap', function() {

  return this._textureCoordinateMap;

});


/**
 * Set the textureCoordinateMap of this object.
 *
 * @param {?Array} textureCoordinateMap The textureCoordinateMap.
 */
X.displayable.prototype.__defineSetter__('textureCoordinateMap', function(textureCoordinateMap) {

  this._textureCoordinate = textureCoordinateMap;

});
