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


goog.exportSymbol('X.vector', goog.math.Vec3);
goog.exportSymbol('X.vector.prototype.clone', goog.math.Vec3.prototype.clone);
goog.exportSymbol('X.vector.prototype.magnitude',goog.math.Vec3.prototype.magnitude);
goog.exportSymbol('X.vector.prototype.scale',goog.math.Vec3.prototype.scale);
goog.exportSymbol('X.vector.prototype.invert',goog.math.Vec3.prototype.invert);
goog.exportSymbol('X.vector.prototype.normalize',goog.math.Vec3.prototype.normalize);
goog.exportSymbol('X.vector.prototype.add',goog.math.Vec3.prototype.add);
goog.exportSymbol('X.vector.prototype.subtract',goog.math.Vec3.prototype.subtract);
goog.exportSymbol('X.vector.dot',goog.math.Vec3.dot);
goog.exportSymbol('X.vector.cross',goog.math.Vec3.cross);
goog.exportSymbol('X.vector.distance',goog.math.Vec3.distance);
goog.exportSymbol('X.vector.lerp',goog.math.Vec3.lerp);