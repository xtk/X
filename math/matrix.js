/*
 * ${HEADER}
 */

// provides
goog.provide('X.matrix');

// requires
goog.require('X.exception');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec2');
goog.require('goog.math.Vec3');



/**
 * Create a matrix as an object based on goog.math.Matrix but with additional
 * functionality.
 * 
 * @constructor
 * @param {goog.math.Matrix|Array.<Array.<number>>|goog.math.Size|number} m A
 *          matrix to copy, a 2D-array to take as a template, a size object for
 *          dimensions, or the number of rows.
 * @param {number=} opt_n Number of columns of the matrix (only applicable if
 *          the first argument is also numeric).
 * @extends goog.math.Matrix
 */
X.matrix = function(m, opt_n) {

  //
  // call the standard constructor
  goog.base(this, m, opt_n);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this._className = 'matrix';
  
};
// inherit from goog.math.Matrix
goog.inherits(X.matrix, goog.math.Matrix);


/**
 * Creates a square identity matrix. i.e. for n = 3:
 * 
 * <pre>
 * [ 1 0 0 ]
 * [ 0 1 0 ]
 * [ 0 0 1 ]
 * </pre>
 * 
 * @param {number} n The size of the square identity matrix.
 * @return {!X.matrix} Identity matrix of width and height {@code n}.
 */
X.matrix.createIdentityMatrix = function(n) {

  // (c) Google
  // Code taken from goog.math.Matrix since the 'static' methods are not
  // inherited..
  var rv = [];
  for ( var i = 0; i < n; i++) {
    rv[i] = [];
    for ( var j = 0; j < n; j++) {
      rv[i][j] = i == j ? 1 : 0;
    }
  }
  return new X.matrix(rv);
};


/**
 * Create a flattened, one-dimensional representation of a matrix.
 * 
 * @this {X.matrix}
 * @return {Array} A one-dimensional representation of this matrix.
 */
X.matrix.prototype.flatten = function() {

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
 * Translate a 3x3 or 4x4 matrix by a vector. In the 3x3 case, the vector has to
 * be 2 dimensional. In the 4x4 case, the vector has to be 3 dimensional.
 * 
 * @this {X.matrix}
 * @param {!goog.math.Vec2|!goog.math.Vec3} vector The translation vector.
 * @return {goog.math.Matrix} The result of this translation.
 * @throws {X.exception} An exception if the translation fails.
 */
X.matrix.prototype.translate = function(vector) {

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
 * Rotate a 4x4 matrix by an angle around an axis.
 * 
 * @this {X.matrix}
 * @param {!number} angle The rotation angle.
 * @param {!goog.math.Vec3} iaxis The axis to rotate around.
 * @return {goog.math.Matrix} The result of this rotation.
 * @throws {X.exception} An exception if the rotation fails.
 */
X.matrix.prototype.rotate = function(angle, iaxis) {

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
 * Multiply 3x3 or 4x4 matrix by a vector. In the 3x3 case, the vector has to be
 * at least 2 dimensional. In the 4x4 case, the vector has to be at least 3
 * dimensional.
 * 
 * @this {X.matrix}
 * @param {!goog.math.Vec2|!goog.math.Vec3} vector The multiplication vector.
 * @return {!goog.math.Vec2|!goog.math.Vec3} The result of this multiplication.
 * @throws {X.exception} An exception if the multiplication fails.
 */
X.matrix.prototype.multiplyByVector = function(vector) {

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


goog.exportSymbol('X.matrix', X.matrix);
goog.exportSymbol('X.matrix.createIdentityMatrix',
    X.matrix.createIdentityMatrix);
goog.exportSymbol('X.matrix.prototype.flatten', X.matrix.prototype.flatten);
goog.exportSymbol('X.matrix.prototype.translate', X.matrix.prototype.translate);
goog.exportSymbol('X.matrix.prototype.rotate', X.matrix.prototype.rotate);
goog.exportSymbol('X.matrix.prototype.multiplyByVector',
    X.matrix.prototype.multiplyByVector);
