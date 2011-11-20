/*
 * ${HEADER}
 */

// provides
goog.provide('X.matrixHelper');

// requires
goog.require('X.exception');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec2');
goog.require('goog.math.Vec3');


/**
 * Create a flattened, one-dimensional representation of a goog.math.Matrix.
 *
 * @this {goog.math.Matrix}
 * @return {Array} A one-dimensional representation of this goog.math.Matrix.
 */
X.matrixHelper.flatten = function() {

  var result = [];

  var dimensions = this.getSize();

  if (dimensions.height == 0 || dimensions.width == 0) {
    return [];
  }

  var i, j;
  for (j = 0; j < dimensions.height; j++) {
    for (i = 0; i < dimensions.width; i++) {
      result.push(this.getValueAt(i, j));
    }
  }
  return result;

};


/**
 * register the function to the goog.math.Matrix API
 */
goog.math.Matrix.prototype.flatten = X.matrixHelper.flatten;


/**
 * Translate a 3x3 or 4x4 goog.math.Matrix by a vector. In the 3x3 case, the
 * vector has to be 2 dimensional. In the 4x4 case, the vector has to be 3
 * dimensional.
 *
 * @this {goog.math.Matrix}
 * @param {!goog.math.Vec2|!goog.math.Vec3} vector The translation vector.
 * @return {goog.math.Matrix} The result of this translation.
 * @throws {X.exception} An exception if the translation fails.
 */
X.matrixHelper.translate = function translate(vector) {

  if (!this.isSquare()) {

    throw new X.exception('Fatal: Can not translate non-square matrix!');

  }

  var dimensions = this.getSize();

  var transformationMatrix = goog.math.Matrix
      .createIdentityMatrix(dimensions.height);

  if (vector instanceof goog.math.Vec2 && dimensions.height == 3) {

    transformationMatrix.setValueAt(0, 2, vector.x);
    transformationMatrix.setValueAt(1, 2, vector.y);

  } else if (vector instanceof goog.math.Vec3 && dimensions.height == 4) {

    transformationMatrix.setValueAt(0, 3, vector.x);
    transformationMatrix.setValueAt(1, 3, vector.y);
    transformationMatrix.setValueAt(2, 3, vector.z);

  } else {

    throw new X.exception('Fatal: Translation failed!');

  }

  // now multiply this matrix with the transformationMatrix and return it..
  return this.multiply(transformationMatrix);

};


/**
 * Register the function to the goog.math.Matrix API
 */
goog.math.Matrix.prototype.translate = X.matrixHelper.translate;


/**
 * Rotate a 4x4 goog.math.Matrix by an angle around an axis.
 *
 * @this {goog.math.Matrix}
 * @param {!number} angle The rotation angle.
 * @param {!goog.math.Vec3} axis The axis to rotate around.
 * @return {goog.math.Matrix} The result of this rotation.
 * @throws {X.exception} An exception if the rotation fails.
 */
X.matrixHelper.rotate = function(angle, iaxis) {

  var dimensions = this.getSize();

  if (dimensions.height != 4 || !this.isSquare()) {

    throw new X.exception('Fatal: Only 4x4 matrices can be rotated!');

  }

  if (!goog.isDefAndNotNull(iaxis) || !(iaxis instanceof goog.math.Vec3)) {

    throw new X.exception('Fatal: Invalid axis vector!');

  }

  if (!goog.isNumber(angle)) {

    throw new X.exception('Fatal: Invalid angle!');

  }

  // normalize the axis
  var axis = iaxis.normalize();

  // trigonometrical fun
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);

  var rotationMatrix = new goog.math.Matrix.createIdentityMatrix(4);

  // build rotation matrix according to
  // http://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle

  rotationMatrix.setValueAt(0, 0, cos + axis.x * axis.x * (1 - cos));
  rotationMatrix.setValueAt(0, 1, axis.x * axis.y * (1 - cos) - axis.z * sin);
  rotationMatrix.setValueAt(0, 2, axis.x * axis.z * (1 - cos) + axis.y * sin);

  rotationMatrix.setValueAt(1, 0, axis.y * axis.x * (1 - cos) + axis.z * sin);
  rotationMatrix.setValueAt(1, 1, cos + axis.y * axis.y * (1 - cos));
  rotationMatrix.setValueAt(1, 2, axis.y * axis.z * (1 - cos) - axis.x * sin);

  rotationMatrix.setValueAt(2, 0, axis.z * axis.x * (1 - cos) - axis.y * sin);
  rotationMatrix.setValueAt(2, 1, axis.z * axis.y * (1 - cos) + axis.x * sin);
  rotationMatrix.setValueAt(2, 2, cos + axis.z * axis.z * (1 - cos));

  // now multiply and return
  return this.multiply(rotationMatrix);

};


/**
 * Register the function to the goog.math.Matrix API
 */
goog.math.Matrix.prototype.rotate = X.matrixHelper.rotate;


/**
 * Multiply 3x3 or 4x4 goog.math.Matrix by a vector. In the 3x3 case, the vector
 * has to be at least 2 dimensional. In the 4x4 case, the vector has to be at
 * least 3 dimensional.
 *
 * @this {goog.math.Matrix}
 * @param {!goog.math.Vec2|!goog.math.Vec3} vector The multiplication vector.
 * @return {!goog.math.Vec2|!goog.math.Vec3} The result of this multiplication.
 * @throws {X.exception} An exception if the multiplication fails.
 */
X.matrixHelper.multiplyByVector = function(vector) {

  var dimensions = this.getSize();

  // we need to convert the vector to a matrix
  //
  var vectorAsArray = new Array(dimensions.width);

  // set all values to one TODO: is zero better?
  var i;
  for (i = 0; i < vectorAsArray.length; i++) {

    vectorAsArray[i] = new Array(1);
    vectorAsArray[i][0] = 1;

  }

  if (vector instanceof goog.math.Vec2 && dimensions.width >= 2) {

    vectorAsArray[0][0] = vector.x;
    vectorAsArray[1][0] = vector.y;

  } else if (vector instanceof goog.math.Vec3 && dimensions.width >= 3) {

    vectorAsArray[0][0] = vector.x;
    vectorAsArray[1][0] = vector.y;
    vectorAsArray[2][0] = vector.z;

  } else {

    throw new X.exception('Fatal: Multiplication by vector failed!');

  }

  // now convert the vectorAsArray to a matrix and multiply
  var vectorAsMatrix = new goog.math.Matrix(vectorAsArray);

  // ...and multiply it
  var resultMatrix = this.multiply(vectorAsMatrix);
  var resultDimensions = resultMatrix.getSize();

  var resultVector;

  // .. convert to vector and return it
  if (resultDimensions.height >= 3) {

    // 3d vector
    resultVector = new goog.math.Vec3(resultMatrix.getValueAt(0, 0),
        resultMatrix.getValueAt(1, 0), resultMatrix.getValueAt(2, 0));

  } else {

    // 2d vector
    resultVector = new goog.math.Vec2(resultMatrix.getValueAt(0, 0),
        resultMatrix.getValueAt(1, 0));

  }

  return resultVector;

};


/**
 * Register the function to the goog.math.Matrix API
 */
goog.math.Matrix.prototype.multiplyByVector = X.matrixHelper.multiplyByVector;
