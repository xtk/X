goog.require('X.matrix');
goog.require('goog.testing.jsunit');

function testXmatrixflatten() {

  // create 4x4 identity matrix
  //
  // 1 0 0 0
  // 0 1 0 0
  // 0 0 1 0
  // 0 0 0 1
  //
  var matrix = X.matrix.createIdentityMatrix(4);
  
  // flatten should return
  // [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
  var flattened = matrix.flatten();
  
  var baseline = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  
  assertArrayEquals(flattened, baseline);
  
}

function testXmatrixTranslate() {

  // create 4x4 identity matrix
  //
  // 1 0 0 0
  // 0 1 0 0
  // 0 0 1 0
  // 0 0 0 1
  //
  var matrix = X.matrix.createIdentityMatrix(4);
  
  if (X.DEV === undefined) {
    // jump out if we test the BUILD tree
    return;
  }
  
  // create 1x3 vector
  //
  // 6
  // 6
  // 6
  var vector = new goog.math.Vec3(6, 6, 6);
  
  // translating the matrix with the vector should result in this matrix
  //
  // 1 0 0 6
  // 0 1 0 6
  // 0 0 1 6
  // 0 0 0 1
  matrix = matrix.translate(vector);
  
  assertEquals(matrix.getValueAt(0, 0), 1);
  assertEquals(matrix.getValueAt(0, 1), 0);
  assertEquals(matrix.getValueAt(0, 2), 0);
  assertEquals(matrix.getValueAt(0, 3), 6);
  
  assertEquals(matrix.getValueAt(1, 0), 0);
  assertEquals(matrix.getValueAt(1, 1), 1);
  assertEquals(matrix.getValueAt(1, 2), 0);
  assertEquals(matrix.getValueAt(1, 3), 6);
  
  assertEquals(matrix.getValueAt(2, 0), 0);
  assertEquals(matrix.getValueAt(2, 1), 0);
  assertEquals(matrix.getValueAt(2, 2), 1);
  assertEquals(matrix.getValueAt(2, 3), 6);
  
  assertEquals(matrix.getValueAt(3, 0), 0);
  assertEquals(matrix.getValueAt(3, 1), 0);
  assertEquals(matrix.getValueAt(3, 2), 0);
  assertEquals(matrix.getValueAt(3, 3), 1);
  
  // try a non-square matrix, this should fail
  matrix = new X.matrix(3,4);
  var _exceptionFired = false;
  try {
    matrix = matrix.translate(vector);
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);    
  
  // .. and try a large matrix
  matrix = new X.matrix(10,10);
  var _exceptionFired = false;
  try {
    matrix = matrix.translate(vector);
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired); 
  
  // test a 3x3 matrix
  matrix = X.matrix.createIdentityMatrix(3);
  vector = new goog.math.Vec2(9, 9);

  // translating the matrix with the vector should result in this matrix
  //
  // 0 0 9
  // 0 0 9
  // 0 0 0
  matrix = matrix.translate(vector);
  
  assertEquals(matrix.getValueAt(0, 0), 1);
  assertEquals(matrix.getValueAt(0, 1), 0);
  assertEquals(matrix.getValueAt(0, 2), 9);
  
  assertEquals(matrix.getValueAt(1, 0), 0);
  assertEquals(matrix.getValueAt(1, 1), 1);
  assertEquals(matrix.getValueAt(1, 2), 9);
  
  assertEquals(matrix.getValueAt(2, 0), 0);
  assertEquals(matrix.getValueAt(2, 1), 0);
  assertEquals(matrix.getValueAt(2, 2), 1);
  
}

function testXmatrixMultiplyByVector() {

  // create 4x4 identity matrix
  //
  // 1 0 0 0
  // 0 1 0 0
  // 0 0 1 0
  // 0 0 0 1
  //
  var matrix = X.matrix.createIdentityMatrix(4);
  
  if (X.DEV === undefined) {
    // jump out if we test the BUILD tree
    return;
  }
  
  // create a 1x3 vector
  var vector = new goog.math.Vec3(7, 8, 9);
  
  var baseline = new goog.math.Vec3(7, 8, 9);
  
  // multiplying the matrix by the vector should result in the vector since the
  // matrix is the identity
  vector = matrix.multiplyByVector(vector);
  
  assertEquals(vector.x, baseline.x);
  assertEquals(vector.y, baseline.y);
  assertEquals(vector.z, baseline.z);
  
  // the multiplication should not work with a vector with
  // length < 3
  var _exceptionFired = false;
  try {
    vector = new goog.math.Vec3(7, 8);
    vector = matrix.multiplyByVector(vector);
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);  
  
}

function testXmatrixSwapCols() {
  
  var matrix = X.matrix.createIdentityMatrix(4);

  // make sure the identity matrix is valid
  assertEquals(matrix.getValueAt(0, 0), 1);
  assertEquals(matrix.getValueAt(0, 1), 0);
  assertEquals(matrix.getValueAt(0, 2), 0);
  assertEquals(matrix.getValueAt(0, 3), 0);
  
  assertEquals(matrix.getValueAt(1, 0), 0);
  assertEquals(matrix.getValueAt(1, 1), 1);
  assertEquals(matrix.getValueAt(1, 2), 0);
  assertEquals(matrix.getValueAt(1, 3), 0);
  
  assertEquals(matrix.getValueAt(2, 0), 0);
  assertEquals(matrix.getValueAt(2, 1), 0);
  assertEquals(matrix.getValueAt(2, 2), 1);
  assertEquals(matrix.getValueAt(2, 3), 0);
  
  assertEquals(matrix.getValueAt(3, 0), 0);
  assertEquals(matrix.getValueAt(3, 1), 0);
  assertEquals(matrix.getValueAt(3, 2), 0);
  assertEquals(matrix.getValueAt(3, 3), 1);
    
  // now swap cols 1 and 2
  matrix.swapCols(1, 2);
  
  // and check the result again
  assertEquals(matrix.getValueAt(0, 0), 1);
  assertEquals(matrix.getValueAt(0, 1), 0);
  assertEquals(matrix.getValueAt(0, 2), 0);
  assertEquals(matrix.getValueAt(0, 3), 0);
  
  assertEquals(matrix.getValueAt(1, 0), 0);
  assertEquals(matrix.getValueAt(1, 1), 0);
  assertEquals(matrix.getValueAt(1, 2), 1);
  assertEquals(matrix.getValueAt(1, 3), 0);
  
  assertEquals(matrix.getValueAt(2, 0), 0);
  assertEquals(matrix.getValueAt(2, 1), 1);
  assertEquals(matrix.getValueAt(2, 2), 0);
  assertEquals(matrix.getValueAt(2, 3), 0);
  
  assertEquals(matrix.getValueAt(3, 0), 0);
  assertEquals(matrix.getValueAt(3, 1), 0);
  assertEquals(matrix.getValueAt(3, 2), 0);
  assertEquals(matrix.getValueAt(3, 3), 1);
      
  
}


function testXmatrixSwapRows() {
  
  var matrix = X.matrix.createIdentityMatrix(4);

  // make sure the identity matrix is valid
  assertEquals(matrix.getValueAt(0, 0), 1);
  assertEquals(matrix.getValueAt(0, 1), 0);
  assertEquals(matrix.getValueAt(0, 2), 0);
  assertEquals(matrix.getValueAt(0, 3), 0);
  
  assertEquals(matrix.getValueAt(1, 0), 0);
  assertEquals(matrix.getValueAt(1, 1), 1);
  assertEquals(matrix.getValueAt(1, 2), 0);
  assertEquals(matrix.getValueAt(1, 3), 0);
  
  assertEquals(matrix.getValueAt(2, 0), 0);
  assertEquals(matrix.getValueAt(2, 1), 0);
  assertEquals(matrix.getValueAt(2, 2), 1);
  assertEquals(matrix.getValueAt(2, 3), 0);
  
  assertEquals(matrix.getValueAt(3, 0), 0);
  assertEquals(matrix.getValueAt(3, 1), 0);
  assertEquals(matrix.getValueAt(3, 2), 0);
  assertEquals(matrix.getValueAt(3, 3), 1);
    
  // now swap cols 0 and 3
  matrix.swapRows(0, 3);
  
  // and check the result again
  assertEquals(matrix.getValueAt(0, 0), 0);
  assertEquals(matrix.getValueAt(0, 1), 0);
  assertEquals(matrix.getValueAt(0, 2), 0);
  assertEquals(matrix.getValueAt(0, 3), 1);
  
  assertEquals(matrix.getValueAt(1, 0), 0);
  assertEquals(matrix.getValueAt(1, 1), 1);
  assertEquals(matrix.getValueAt(1, 2), 0);
  assertEquals(matrix.getValueAt(1, 3), 0);
  
  assertEquals(matrix.getValueAt(2, 0), 0);
  assertEquals(matrix.getValueAt(2, 1), 0);
  assertEquals(matrix.getValueAt(2, 2), 1);
  assertEquals(matrix.getValueAt(2, 3), 0);
  
  assertEquals(matrix.getValueAt(3, 0), 1);
  assertEquals(matrix.getValueAt(3, 1), 0);
  assertEquals(matrix.getValueAt(3, 2), 0);
  assertEquals(matrix.getValueAt(3, 3), 0);
      
  
}
