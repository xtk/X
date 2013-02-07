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
goog.provide('X.matrix');

// requires
goog.require('goog.vec.Mat4');


X.matrix.makeLookAt = function(mat, eyePt, centerPt, worldUpVec) {

  // from Google Closure Library
  // http://closure-library.googlecode.com/svn/docs/closure_goog_vec_mat4.js.source.html#line1389
  // but adjusted to use goog.math.Vec3 for performance

  // Compute the direction vector from the eye point to the center point and
  // normalize.
  var fwdVec = centerPt.subtract(eyePt);
  fwdVec.normalize();
  fwdVec.z = 0;

  // Compute the side vector from the forward vector and the input up vector.
  var sideVec = X.vector.cross(fwdVec, worldUpVec);
  sideVec.normalize();
  sideVec.z = 0;

  // Now the up vector to form the orthonormal basis.
  var upVec = X.vector.cross(sideVec, fwdVec);
  upVec.normalize();
  upVec.z = 0;

  // Update the view matrix with the new orthonormal basis and position the
  // camera at the given eye point.
  fwdVec.invert();
  goog.vec.Mat4.setRow(mat, 0, sideVec);
  goog.vec.Mat4.setRow(mat, 1, upVec);
  goog.vec.Mat4.setRow(mat, 2, fwdVec);
  goog.vec.Mat4.setRowValues(mat, 3, 0, 0, 0, 1);
  goog.vec.Mat4.translate(
      mat, -eyePt.x, -eyePt.y, -eyePt.z);

  return mat;
};



goog.exportSymbol('X.Matrix.identity', goog.vec.Mat4.createFloat32Identity);
goog.exportSymbol('X.Matrix.clone', goog.vec.Mat4.cloneFloat32);
goog.exportSymbol('X.Matrix.transpose', goog.vec.Mat4.transpose);
goog.exportSymbol('X.Matrix.determinant', goog.vec.Mat4.determinant);
goog.exportSymbol('X.Matrix.invert', goog.vec.Mat4.invert);
goog.exportSymbol('X.Matrix.multVec3', goog.vec.Mat4.multVec3);
goog.exportSymbol('X.Matrix.makePerspective', goog.vec.Mat4.makePerspective);
goog.exportSymbol('X.Matrix.makeFrustum', goog.vec.Mat4.makeFrustum);
goog.exportSymbol('X.Matrix.makeOrtho', goog.vec.Mat4.makeOrtho);
goog.exportSymbol('X.Matrix.makeLookAt', goog.vec.Mat4.makeLookAt);
goog.exportSymbol('X.Matrix.translate', goog.vec.Mat4.translate);
goog.exportSymbol('X.Matrix.scale', goog.vec.Mat4.scale);
goog.exportSymbol('X.Matrix.rotate', goog.vec.Mat4.rotate);
goog.exportSymbol('X.Matrix.rotateX', goog.vec.Mat4.rotateX);
goog.exportSymbol('X.Matrix.rotateY', goog.vec.Mat4.rotateY);
goog.exportSymbol('X.Matrix.rotateZ', goog.vec.Mat4.rotateZ);

