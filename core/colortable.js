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
goog.provide('X.colortable');

// requires
goog.require('X.base');
goog.require('X.loadable');
goog.require('goog.structs.Map');



/**
 * Create a container for a colortable.
 *
 * @constructor
 * @extends X.base
 * @mixin X.loadable
 */
X.colortable = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'colortable';

  /**
   * The internal hash map to store the value-color mapping.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._map = new goog.structs.Map();

  // inject functionality
  inject(this, new X.loadable()); // this object is loadable from a file

};
// inherit from X.base
goog.inherits(X.colortable, X.base);


/**
 * Add an entry to this color table.
 *
 * @param {!number} value The number to map to a color.
 * @param {!string} label The label.
 * @param {!number} r The red component.
 * @param {!number} g The green component.
 * @param {!number} b The blue component.
 * @param {!number} a The alpha component.
 * @throws {Error} An error, if the given values are invalid.
 */
X.colortable.prototype.add = function(value, label, r, g, b, a) {

  if (!goog.isNumber(value) || !goog.isNumber(r) || !goog.isNumber(g) ||
      !goog.isNumber(b) || !goog.isNumber(a)) {

    throw new Error('Invalid color table entry.');

  }

  this._map.set(value, [label, r, g, b, a]);

  this._dirty = true;

};


/**
 * Get the color for a label value.
 *
 * @param {!number} value The label value.
 * @return {*} The [label, r, g, b, a] entry for this value.
 */
X.colortable.prototype.get = function(value) {

  return this._map.get(value);

};


goog.exportSymbol('X.colortable.prototype.get', X.colortable.prototype.get);
