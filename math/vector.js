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

X.vector = goog.math.Vec3;
X.vector.prototype.clone = goog.math.Vec3.prototype.clone;
X.vector.prototype.magnitude = goog.math.Vec3.prototype.magnitude;
X.vector.prototype.scale = goog.math.Vec3.prototype.scale;
X.vector.prototype.invert = goog.math.Vec3.prototype.invert;
X.vector.prototype.normalize = function() {
  // add a special check if the magnitude is 0
  var _magnitude = this.magnitude();
  if (_magnitude == 0) return 0;
  return this.scale(1 / _magnitude);
};
X.vector.prototype.add = goog.math.Vec3.prototype.add;
X.vector.prototype.subtract = goog.math.Vec3.prototype.subtract;
X.vector.dot = goog.math.Vec3.dot;
X.vector.cross = goog.math.Vec3.cross;
X.vector.distance = goog.math.Vec3.distance;
X.vector.lerp = goog.math.Vec3.lerp;

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