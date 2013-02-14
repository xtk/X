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
goog.provide('X.vector');

// requires
goog.require('goog.math.Vec3');


// expose the following goog.math.Vec3 functionality
/**
 * @constructor
 * @see goog.math.Vec3
 */
X.vector = goog.math.Vec3;


/**
 * @see goog.math.Vec3.prototype.clone
 */
X.vector.prototype.clone = goog.math.Vec3.prototype.clone;


/**
 * @see goog.math.Vec3.prototype.magnitude
 */
X.vector.prototype.magnitude = goog.math.Vec3.prototype.magnitude;


/**
 * @see goog.math.Vec3.prototype.scale
 */
X.vector.prototype.scale = goog.math.Vec3.prototype.scale;


/**
 * @see goog.math.Vec3.prototype.invert
 */
X.vector.prototype.invert = goog.math.Vec3.prototype.invert;


/**
 * @see goog.math.Vec3.prototype.add
 */
X.vector.prototype.add = goog.math.Vec3.prototype.add;


/**
 * @see goog.math.Vec3.prototype.subtract
 */
X.vector.prototype.subtract = goog.math.Vec3.prototype.subtract;


/**
 * Normalize the vector. The goog.math.Vec3.prototype.normalize
 * did not check on a magnitude of 0 resulting in an error.
 *
 * @return {!X.vector|!goog.math.Vec3} The normalized vector.
 */
X.vector.prototype.normalize = function() {
  // add a special check if the magnitude is 0
  var _magnitude = this.magnitude();
  if (_magnitude == 0) {
    return this.scale(0);
  }
  return this.scale(1 / _magnitude);
};


/**
 * @see goog.math.Vec3.dot
 */
X.vector.dot = goog.math.Vec3.dot;


/**
 * @see goog.math.Vec3.cross
 */
X.vector.cross = goog.math.Vec3.cross;


/**
 * @see goog.math.Vec3.distance
 */
X.vector.distance = goog.math.Vec3.distance;


/**
 * @see goog.math.Vec3.lerp
 */
X.vector.lerp = goog.math.Vec3.lerp;

// now we need to make sure we can access the x,y,z
// components of a goog.math.Vec3 which might be renamed
// during the compilation. we don't want to modify the goog.math.Vec3
// class so this is the easiest workaround.
/**
 * Get the x component of this vector.
 *
 * @return {number} The x component of this vector.
 * @public
 */
X.vector.prototype.__defineGetter__('xx', function() {

  return this.x;

});


/**
 * Get the y component of this vector.
 *
 * @return {number} The y component of this vector.
 * @public
 */
X.vector.prototype.__defineGetter__('yy', function() {

  return this.y;

});


/**
 * Get the z component of this vector.
 *
 * @return {number} The z component of this vector.
 * @public
 */
X.vector.prototype.__defineGetter__('zz', function() {

  return this.z;

});


goog.exportSymbol('X.vector', X.vector);
goog.exportSymbol('X.vector.prototype.clone', X.vector.prototype.clone);
goog.exportSymbol('X.vector.prototype.magnitude', X.vector.prototype.magnitude);
goog.exportSymbol('X.vector.prototype.scale', X.vector.prototype.scale);
goog.exportSymbol('X.vector.prototype.invert', X.vector.prototype.invert);
goog.exportSymbol('X.vector.prototype.normalize', X.vector.prototype.normalize);
goog.exportSymbol('X.vector.prototype.add', X.vector.prototype.add);
goog.exportSymbol('X.vector.prototype.subtract', X.vector.prototype.subtract);
goog.exportSymbol('X.vector.dot', X.vector.dot);
goog.exportSymbol('X.vector.cross', X.vector.cross);
goog.exportSymbol('X.vector.distance', X.vector.distance);
goog.exportSymbol('X.vector.lerp', X.vector.lerp);