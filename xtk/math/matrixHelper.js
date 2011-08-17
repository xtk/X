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
 * @returns {array} A one-dimensional representation of this goog.math.Matrix.
 */
X.matrixHelper.flatten = function() {

  var result = [];
  
  var dimensions = this.getSize();
  
  if (dimensions.height == 0 || dimensions.width == 0) {
    return [];
  }
  
  for ( var j = 0; j < dimensions.height; j++) {
    for ( var i = 0; i < dimensions.width; i++) {
      result.push(this.getValueAt(i, j));
    }
  }
  return result;
  
};
// register the function to the goog.math.Matrix API
goog.math.Matrix.prototype.flatten = X.matrixHelper.flatten;

/**
 * Translate a 3x3 or 4x4 goog.math.Matrix by a vector. In the 3x3 case, the
 * vector has to be 2 dimensional. In the 4x4 case, the vector has to be 3
 * dimensional.
 * 
 * @param {!goog.math.Vec2|!goog.math.Vec3} vector The translation vector.
 * @returns {goog.math.Matrix} The result of this translation.
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
// register the function to the goog.math.Matrix API
goog.math.Matrix.prototype.translate = X.matrixHelper.translate;
