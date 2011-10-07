goog.require('X.matrixHelper');
goog.require('goog.testing.jsunit');

function testXmatrixHelperflatten() {

  // create 4x4 identity matrix
  //
  // 1 0 0 0
  // 0 1 0 0
  // 0 0 1 0
  // 0 0 0 1
  //
  var matrix = goog.math.Matrix.createIdentityMatrix(4);

  // flatten should return
  // [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
  var flattened = matrix.flatten();

  var baseline = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  var i;
  for (i = 0; i < baseline.length; i++) {

    assertEquals(flattened[i], baseline[i]);

  }
}

function testXmatrixHelperTranslate() {

  // create 4x4 identity matrix
  //
  // 1 0 0 0
  // 0 1 0 0
  // 0 0 1 0
  // 0 0 0 1
  //
  var matrix = goog.math.Matrix.createIdentityMatrix(4);

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

  // TODO test also a 3x3 matrix translated by a 2d vector

}

function testXmatrixHelperMultiplyByVector() {

  // create 4x4 identity matrix
  //
  // 1 0 0 0
  // 0 1 0 0
  // 0 0 1 0
  // 0 0 0 1
  //
  var matrix = goog.math.Matrix.createIdentityMatrix(4);

  // create a 1x3 vector
  var vector = new goog.math.Vec3(7, 8, 9);

  var baseline = new goog.math.Matrix([[7], [8], [9], [1]]);

  // multiplying the matrix by the vector should result in the vector since the
  // matrix is the identity
  matrix = matrix.multiplyByVector(vector);

  assertEquals(matrix.getValueAt(0, 0), baseline.getValueAt(0, 0));
  assertEquals(matrix.getValueAt(1, 0), baseline.getValueAt(1, 0));
  assertEquals(matrix.getValueAt(2, 0), baseline.getValueAt(2, 0));
  assertEquals(matrix.getValueAt(3, 0), baseline.getValueAt(3, 0));

}
