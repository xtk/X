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

X.matrix.identity = goog.vec4.Mat4.createFloat32Identity;
X.matrix.clone = goog.vec.Mat4.cloneFloat32;
X.matrix.transpose = goog.vec.Mat4.transpose;
X.matrix.determinant = goog.vec.Mat4.determinant;
X.matrix.invert = goog.vec.Mat4.invert;
X.matrix.multVec3 = goog.vec.Mat4.multVec3;
X.matrix.makePerspective = goog.vec.Mat4.makePerspective;
X.matrix.makeFrustum = goog.vec.Mat4.makeFrustum;
X.matrix.makeOrtho = goog.vec.Mat4.makeOrtho;
X.matrix.translate = goog.vec.Mat4.translate;
X.matrix.scale = goog.vec.Mat4.scale;
X.matrix.rotate = goog.vec.Mat4.rotate;
X.matrix.rotateX = goog.vec.Mat4.rotateX;
X.matrix.rotateY = goog.vec.Mat4.rotateY;
X.matrix.rotateZ = goog.vec.Mat4.rotateZ;

goog.exportSymbol('X.matrix.identity', X.matrix.identity);
goog.exportSymbol('X.matrix.clone', X.matrix.clone);
goog.exportSymbol('X.matrix.transpose', X.matrix.transpose);
goog.exportSymbol('X.matrix.determinant', X.matrix.determinant);
goog.exportSymbol('X.matrix.invert', X.matrix.invert);
goog.exportSymbol('X.matrix.multVec3', X.matrix.multVec3);
goog.exportSymbol('X.matrix.makePerspective', X.matrix.makePerspective);
goog.exportSymbol('X.matrix.makeFrustum', X.matrix.makeFrustum);
goog.exportSymbol('X.matrix.makeOrtho', X.matrix.makeOrtho);
goog.exportSymbol('X.matrix.makeLookAt', X.matrix.makeLookAt);
goog.exportSymbol('X.matrix.translate', X.matrix.translate);
goog.exportSymbol('X.matrix.scale', X.matrix.scale);
goog.exportSymbol('X.matrix.rotate', X.matrix.rotate);
goog.exportSymbol('X.matrix.rotateX', X.matrix.rotateX);
goog.exportSymbol('X.matrix.rotateY', X.matrix.rotateY);
goog.exportSymbol('X.matrix.rotateZ', X.matrix.rotateZ);

