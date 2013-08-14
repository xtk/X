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
goog.require('X.vector');
goog.require('goog.vec.Mat4');


/**
 * Makes the given 4x4 matrix a modelview matrix of a camera so that
 * the camera is 'looking at' the given center point.
 *
 * @param {!Float32Array} mat The matrix.
 * @param {!X.vector} eyePt The position of the eye point
 *     (camera origin).
 * @param {!X.vector} centerPt The point to aim the camera at.
 * @param {!X.vector} worldUpVec The vector that identifies
 *     the up direction for the camera.
 * @return {!Float32Array} return mat so that operations can be
 *     chained.
 */
X.matrix.makeLookAt = function(mat, eyePt, centerPt, worldUpVec) {

  // from Google Closure Library
  // http://closure-library.googlecode.com/svn/docs/closure_goog_vec_mat4.js.source.html#line1389
  // but adjusted to use goog.math.Vec3 for performance

  // Compute the direction vector from the eye point to the center point and
  // normalize.
  var fwdVec = centerPt.subtract(eyePt);
  fwdVec.normalize();

  // Compute the side vector from the forward vector and the input up vector.
  var sideVec = X.vector.cross(fwdVec, worldUpVec);
  sideVec.normalize();

  // Now the up vector to form the orthonormal basis.
  var upVec = X.vector.cross(sideVec, fwdVec);
  upVec.normalize();

  // Update the view matrix with the new orthonormal basis and position the
  // camera at the given eye point.
  fwdVec.invert();
  goog.vec.Mat4.setRowValues(mat, 0, sideVec.x, sideVec.y, sideVec.z, 0);
  goog.vec.Mat4.setRowValues(mat, 1, upVec.x, upVec.y, upVec.z, 0);
  goog.vec.Mat4.setRowValues(mat, 2, fwdVec.x, fwdVec.y, fwdVec.z, 0);
  goog.vec.Mat4.translate(
      mat, -eyePt.x, -eyePt.y, -eyePt.z);

  return mat;

};


/**
 * Multiply the matrix by a vector.
 *
 * @param {!Float32Array} mat The matrix.
 * @param {!number} x The x coordinate of the vector.
 * @param {!number} y The y coordinate of the vector.
 * @param {!number} z The z coordinate of the vector.
 * @return {!X.vector} The resulting vector.
 */
X.matrix.multiplyByVector = function(mat, x, y, z) {

  // from Google Closure Library
  // http://closure-library.googlecode.com/svn/docs/closure_goog_vec_mat4.js.source.html#line1133
  // but adjusted to *not* use goog.vec.Vec3 for performance

  var invw = 1 / (x * mat[3] + y * mat[7] + z * mat[11] + mat[15]);
  var _x = (x * mat[0] + y * mat[4] + z * mat[8] + mat[12]) * invw;
  var _y = (x * mat[1] + y * mat[5] + z * mat[9] + mat[13]) * invw;
  var _z = (x * mat[2] + y * mat[6] + z * mat[10] + mat[14]) * invw;

  return new X.vector(_x, _y, _z);

};


/**
 * Swap two rows of a matrix.
 *
 * @param {!Float32Array} mat The matrix.
 * @param {!number} row1 The index of the first row.
 * @param {!number} row2 The index of the second row.
 * @return {!Float32Array} The resulting matrix.
 */
X.matrix.swapRows = function(mat, row1, row2) {

  var _buffer1 = new Float32Array(4);
  var _buffer2 = new Float32Array(4);
  goog.vec.Mat4.getRow(mat, row1, _buffer1);
  goog.vec.Mat4.getRow(mat, row2, _buffer2);

  goog.vec.Mat4.setRow(mat, row1, _buffer2);
  goog.vec.Mat4.setRow(mat, row2, _buffer1);

  return mat;

};


/**
 * Swap two columns of a matrix.
 *
 * @param {!Float32Array} mat The matrix.
 * @param {!number} col1 The index of the first column.
 * @param {!number} col2 The index of the second column.
 * @return {!Float32Array} The resulting matrix.
 */
X.matrix.swapCols = function(mat, col1, col2) {

  var _buffer1 = new Float32Array(4);
  var _buffer2 = new Float32Array(4);
  goog.vec.Mat4.getColumn(mat, col1, _buffer1);
  goog.vec.Mat4.getColumn(mat, col2, _buffer2);

  goog.vec.Mat4.setColumn(mat, col1, _buffer2);
  goog.vec.Mat4.setColumn(mat, col2, _buffer1);

  return mat;

};

// expose the following goog.vec.Mat4 functionality
/**
 * @see goog.vec.Mat4.createFloat32Identity
 */
X.matrix.identity = goog.vec.Mat4.createFloat32Identity;


/**
 * @see goog.vec.Mat4.cloneFloat32
 */
X.matrix.clone = goog.vec.Mat4.cloneFloat32;


/**
 * @see goog.vec.Mat4.transpose
 */
X.matrix.transpose = goog.vec.Mat4.transpose;


/**
 * @see goog.vec.Mat4.determinant
 */
X.matrix.determinant = goog.vec.Mat4.determinant;


/**
 * @see goog.vec.Mat4.invert
 */
X.matrix.invert = goog.vec.Mat4.invert;


/**
 * @see goog.vec.Mat4.makePerspective
 */
X.matrix.makePerspective = goog.vec.Mat4.makePerspective;


/**
 * @see goog.vec.Mat4.makeFrustum
 */
X.matrix.makeFrustum = goog.vec.Mat4.makeFrustum;


/**
 * @see goog.vec.Mat4.makeOrtho
 */
X.matrix.makeOrtho = goog.vec.Mat4.makeOrtho;


/**
 * @see goog.vec.Mat4.multMat
 */
X.matrix.multiply = goog.vec.Mat4.multMat;

/**
 * @see goog.vec.Mat4.multVec4
 */
X.matrix.multiplyByVec4 = goog.vec.Mat4.multVec4;

/**
 * @see goog.vec.Mat4.translate
 */
X.matrix.translate = goog.vec.Mat4.translate;


/**
 * @see goog.vec.Mat4.scale
 */
X.matrix.scale = goog.vec.Mat4.scale;


/**
 * @see goog.vec.Mat4.rotate
 */
X.matrix.rotate = goog.vec.Mat4.rotate;


/**
 * @see goog.vec.Mat4.rotateX
 */
X.matrix.rotateX = goog.vec.Mat4.rotateX;


/**
 * @see goog.vec.Mat4.rotateY
 */
X.matrix.rotateY = goog.vec.Mat4.rotateY;


/**
 * @see goog.vec.Mat4.rotateZ
 */
X.matrix.rotateZ = goog.vec.Mat4.rotateZ;


goog.exportSymbol('X.matrix.identity', X.matrix.identity);
goog.exportSymbol('X.matrix.clone', X.matrix.clone);
goog.exportSymbol('X.matrix.transpose', X.matrix.transpose);
goog.exportSymbol('X.matrix.determinant', X.matrix.determinant);
goog.exportSymbol('X.matrix.invert', X.matrix.invert);
goog.exportSymbol('X.matrix.multiply', X.matrix.multiply);
goog.exportSymbol('X.matrix.multiplyByVector', X.matrix.multiplyByVector);
goog.exportSymbol('X.matrix.multiplyByVec4', X.matrix.multiplyByVec4);
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
goog.exportSymbol('X.matrix.swapRows', X.matrix.swapRows);
goog.exportSymbol('X.matrix.swapCols', X.matrix.swapCols);
