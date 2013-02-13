goog.require('X.matrix');
goog.require('X.vector');
goog.require('goog.testing.jsunit');

function testXmatrixMultiplyByVector() {

  // create 4x4 identity matrix
  //
  // 1 0 0 0
  // 0 1 0 0
  // 0 0 1 0
  // 0 0 0 1
  //
  var matrix = X.matrix.identity();

  // create a 1x3 vector
  var vector = new X.vector(7, 8, 9);

  var baseline = new X.vector(7, 8, 9);

  // multiplying the matrix by the vector should result in the vector since the
  // matrix is the identity
  vector = X.matrix.multiplyByVector(matrix, vector.xx, vector.yy, vector.zz);

  assertEquals(baseline.xx, vector.xx);
  assertEquals(baseline.yy, vector.yy);
  assertEquals(baseline.zz, vector.zz);

}

function testXmatrixSwapCols() {

  var matrix = X.matrix.identity();

  // make sure the identity matrix is valid
  assertEquals(matrix[0], 1);
  assertEquals(matrix[1], 0);
  assertEquals(matrix[2], 0);
  assertEquals(matrix[3], 0);

  assertEquals(matrix[4], 0);
  assertEquals(matrix[5], 1);
  assertEquals(matrix[6], 0);
  assertEquals(matrix[7], 0);

  assertEquals(matrix[8], 0);
  assertEquals(matrix[9], 0);
  assertEquals(matrix[10], 1);
  assertEquals(matrix[11], 0);

  assertEquals(matrix[12], 0);
  assertEquals(matrix[13], 0);
  assertEquals(matrix[14], 0);
  assertEquals(matrix[15], 1);

  // now swap cols 0 and 1
  X.matrix.swapCols(matrix, 0, 1);

  // and check the result again
  assertEquals(matrix[0], 0);
  assertEquals(matrix[1], 1);
  assertEquals(matrix[2], 0);
  assertEquals(matrix[3], 0);

  assertEquals(matrix[4], 1);
  assertEquals(matrix[5], 0);
  assertEquals(matrix[6], 0);
  assertEquals(matrix[7], 0);

  assertEquals(matrix[8], 0);
  assertEquals(matrix[9], 0);
  assertEquals(matrix[10], 1);
  assertEquals(matrix[11], 0);

  assertEquals(matrix[12], 0);
  assertEquals(matrix[13], 0);
  assertEquals(matrix[14], 0);
  assertEquals(matrix[15], 1);

}


function testXmatrixSwapRows() {

  var matrix = X.matrix.identity();

  // make sure the identity matrix is valid
  assertEquals(matrix[0], 1);
  assertEquals(matrix[1], 0);
  assertEquals(matrix[2], 0);
  assertEquals(matrix[3], 0);

  assertEquals(matrix[4], 0);
  assertEquals(matrix[5], 1);
  assertEquals(matrix[6], 0);
  assertEquals(matrix[7], 0);

  assertEquals(matrix[8], 0);
  assertEquals(matrix[9], 0);
  assertEquals(matrix[10], 1);
  assertEquals(matrix[11], 0);

  assertEquals(matrix[12], 0);
  assertEquals(matrix[13], 0);
  assertEquals(matrix[14], 0);
  assertEquals(matrix[15], 1);

  // now swap rows 0 and 1
  X.matrix.swapRows(matrix, 0, 1);

  // and check the result again
  assertEquals(matrix[0], 0);
  assertEquals(matrix[1], 1);
  assertEquals(matrix[2], 0);
  assertEquals(matrix[3], 0);

  assertEquals(matrix[4], 1);
  assertEquals(matrix[5], 0);
  assertEquals(matrix[6], 0);
  assertEquals(matrix[7], 0);

  assertEquals(matrix[8], 0);
  assertEquals(matrix[9], 0);
  assertEquals(matrix[10], 1);
  assertEquals(matrix[11], 0);

  assertEquals(matrix[12], 0);
  assertEquals(matrix[13], 0);
  assertEquals(matrix[14], 0);
  assertEquals(matrix[15], 1);


}
