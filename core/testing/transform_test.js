goog.require('X.base');
goog.require('X.matrix');
goog.require('X.transform');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.asserts');


/**
 * Test for X.transform.classname
 */
function testXtransformClassname() {

  var t = new X.transform();
  
  assertEquals(t.classname, 'transform');
  
}

/**
 * Test for X.transform.matrix()
 */
function testXtransformMatrix() {

  // create new transform
  var t = new X.transform();
  
  // create test identity matrix as array
  var _identityBaseLine = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0],
                           [0, 0, 0, 1]];
  
  var _identityBaseLineFlattened = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0,
                                    0, 1];
  
  // by default, the transform should have an identity matrix associated
  var currentMatrix = t.matrix;
  // check if the matrices match
  assertArrayEquals(currentMatrix.toArray(), _identityBaseLine);
  // check if the flattened version matches the baseline
  assertArrayEquals(currentMatrix.flatten(), _identityBaseLineFlattened);
  
  var _testMatrix = new X.matrix([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12],
                                  [13.5, 14.5, 15.5, 16.5]]);
  var _testMatrixFlattened = [1, 5, 9, 13.5, 2, 6, 10, 14.5, 3, 7, 11, 15.5, 4,
                              8, 12, 16.5];
  
  // set the custom matrix
  t.matrix = _testMatrix;
  
  // compare it
  assertArrayEquals(t.matrix.toArray(), _testMatrix.toArray());
  assertArrayEquals(t.matrix.flatten(), _testMatrixFlattened);
  

  // the transform should be dirty now
  

}

/**
 * Test for X.transform._glMatrix
 */
function testXtransformGlMatrix() {

  // create new transform
  var t = new X.transform();
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  var _identityBaseLineFlattened = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0,
                                                     0, 1, 0, 0, 0, 0, 1]);
  
  // by default, the transform should have an identity matrix associated
  // since this is the gl version, it should be a 1D Float32Array
  var currentMatrix = t._glMatrix;
  assertTrue(currentMatrix instanceof Float32Array);
  // check if the flattened version matches the baseline
  assertObjectEquals(currentMatrix, _identityBaseLineFlattened);
  
  var _testMatrix = new X.matrix([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12],
                                  [13.5, 14.5, 15.5, 16.5]]);
  var _glTestMatrix = new Float32Array([1, 5, 9, 13.5, 2, 6, 10, 14.5, 3, 7,
                                        11, 15.5, 4, 8, 12, 16.5]);
  
  // set the custom matrix whcih should modify the gl-version as well
  t.matrix = _testMatrix;
  
  // compare the gl versions..
  assertObjectEquals(t._glMatrix, _glTestMatrix);
  
  // the transform should be dirty now
  

}

/**
 * Test for X.transform.flipX()
 */
function testXtransformFlipX() {

  // create new transform
  var t = new X.transform();
  
  var _identityBaselineFlipped = new X.matrix([[-1, 0, 0, 0], [0, 1, 0, 0],
                                               [0, 0, 1, 0], [0, 0, 0, 1]]);
  
  // flip the X coordinates
  t.flipX();
  
  assertArrayEquals(t.matrix.toArray(), _identityBaselineFlipped.toArray());
  
  var testPoint = [[10], [20], [30], [1]];
  var flippedTestPointBaseline = [[-10], [20], [30], [1]];
  var testPointMatrix = new X.matrix(testPoint);
  
  // the multiplication with the flipped matrix shoudl yield the same point as
  // our flippedTestPoint when multiplied
  var flippedTestPoint = new X.matrix(t.matrix.multiply(testPointMatrix));
  

  assertEquals(flippedTestPointBaseline[0][0], flippedTestPoint
      .getValueAt(0, 0));
  assertEquals(flippedTestPointBaseline[1][0], flippedTestPoint
      .getValueAt(1, 0));
  assertEquals(flippedTestPointBaseline[2][0], flippedTestPoint
      .getValueAt(2, 0));
  
  // the transform should be dirty now
  
}

/**
 * Test for X.transform.flipY()
 */
function testXtransformFlipY() {

  // create new transform
  var t = new X.transform();
  
  var _identityBaselineFlipped = new X.matrix([[1, 0, 0, 0], [0, -1, 0, 0],
                                               [0, 0, 1, 0], [0, 0, 0, 1]]);
  
  // flip the Y coordinates
  t.flipY();
  
  assertArrayEquals(t.matrix.toArray(), _identityBaselineFlipped.toArray());
  
  var testPoint = [[10], [20], [30], [1]];
  var flippedTestPointBaseline = [[10], [-20], [30], [1]];
  var testPointMatrix = new X.matrix(testPoint);
  
  // the multiplication with the flipped matrix shoudl yield the same point as
  // our flippedTestPoint when multiplied
  var flippedTestPoint = new X.matrix(t.matrix.multiply(testPointMatrix));
  

  assertEquals(flippedTestPointBaseline[0][0], flippedTestPoint
      .getValueAt(0, 0));
  assertEquals(flippedTestPointBaseline[1][0], flippedTestPoint
      .getValueAt(1, 0));
  assertEquals(flippedTestPointBaseline[2][0], flippedTestPoint
      .getValueAt(2, 0));
  
  // the transform should be dirty now
  
}

/**
 * Test for X.transform.flipZ()
 */
function testXtransformFlipZ() {

  // create new transform
  var t = new X.transform();
  
  var _identityBaselineFlipped = new X.matrix([[1, 0, 0, 0], [0, 1, 0, 0],
                                               [0, 0, -1, 0], [0, 0, 0, 1]]);
  
  // flip the Z coordinates
  t.flipZ();
  
  assertArrayEquals(t.matrix.toArray(), _identityBaselineFlipped.toArray());
  
  var testPoint = [[10], [20], [30], [1]];
  var flippedTestPointBaseline = [[10], [20], [-30], [1]];
  var testPointMatrix = new X.matrix(testPoint);
  
  // the multiplication with the flipped matrix shoudl yield the same point as
  // our flippedTestPoint when multiplied
  var flippedTestPoint = new X.matrix(t.matrix.multiply(testPointMatrix));
  
  assertEquals(flippedTestPointBaseline[0][0], flippedTestPoint
      .getValueAt(0, 0));
  assertEquals(flippedTestPointBaseline[1][0], flippedTestPoint
      .getValueAt(1, 0));
  assertEquals(flippedTestPointBaseline[2][0], flippedTestPoint
      .getValueAt(2, 0));
  
  // the transform should be dirty now
  
}

/**
 * Test for X.transform.translateX()
 */
function testXtransformTranslateX() {

  var t = new X.transform();
  
  // this is our target X
  var newX = -455;
  
  var _translatedIdentityBaseline = new X.matrix([[1, 0, 0, newX],
                                                  [0, 1, 0, 0], [0, 0, 1, 0],
                                                  [0, 0, 0, 1]]);
  var _translatedIdentityBaselineGl = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0,
                                                        0, 0, 1, 0, newX, 0, 0,
                                                        1]);
  
  // perform translation
  t.translateX(newX);
  
  // compare the resulting matrix to the baseline
  assertArrayEquals(t.matrix.toArray(), _translatedIdentityBaseline.toArray());
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // check also the gl version
  assertObjectEquals(t._glMatrix, _translatedIdentityBaselineGl);
  
}

/**
 * Test for X.transform.translateY()
 */
function testXtransformTranslateY() {

  var t = new X.transform();
  
  // this is our target Y
  var newY = -0.0533;
  
  var _translatedIdentityBaseline = new X.matrix([[1, 0, 0, 0],
                                                  [0, 1, 0, newY],
                                                  [0, 0, 1, 0], [0, 0, 0, 1]]);
  var _translatedIdentityBaselineGl = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0,
                                                        0, 0, 1, 0, 0, newY, 0,
                                                        1]);
  
  // perform translation
  t.translateY(newY);
  
  // compare the resulting matrix to the baseline
  assertArrayEquals(t.matrix.toArray(), _translatedIdentityBaseline.toArray());
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // check also the gl version
  assertObjectEquals(t._glMatrix, _translatedIdentityBaselineGl);
  
}

/**
 * Test for X.transform.translateZ()
 */
function testXtransformTranslateZ() {

  var t = new X.transform();
  
  // this is our target Z
  var newZ = 10000;
  
  var _translatedIdentityBaseline = new X.matrix([[1, 0, 0, 0],
                                                  [0, 1, 0, newZ],
                                                  [0, 0, 1, 0], [0, 0, 0, 1]]);
  var _translatedIdentityBaselineGl = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0,
                                                        0, 0, 1, 0, 0, newZ, 0,
                                                        1]);
  
  // perform translation
  t.translateY(newZ);
  
  // compare the resulting matrix to the baseline
  assertArrayEquals(t.matrix.toArray(), _translatedIdentityBaseline.toArray());
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // check also the gl version
  assertObjectEquals(t._glMatrix, _translatedIdentityBaselineGl);
  
}

/**
 * Test for X.transform.rotateX()
 */
function testXtransformRotateX() {

  var t = new X.transform();
  
  var degrees = 44;
  
  // baseline was created using matlab by rotating in Y direction (which means
  // around X axis)
  // >> format longE
  // >> M = makehgtform('axisrotate',[0 1 0],degtorad(44))
  //
  // M =
  // 7.193398003386512e-01 0 6.946583704589973e-01 0
  // 0 1.000000000000000e+00 0 0
  // -6.946583704589973e-01 0 7.193398003386512e-01 0
  // 0 0 0 1.000000000000000e+00
  

  var _rotatedIdentityBaseline = new X.matrix(
      [[7.193398003386512e-01, 0, 6.946583704589973e-01, 0],
       [0, 1.000000000000000e+00, 0, 0],
       [-6.946583704589973e-01, 0, 7.193398003386512e-01, 0],
       [0, 0, 0, 1.000000000000000e+00]]);
  var _rotatedIdentityBaselineGl = new Float32Array(_rotatedIdentityBaseline
      .flatten());
  
  // perform translation
  t.rotateX(degrees);
  
  // compare the resulting matrix to the baseline
  assertArrayEquals(t.matrix.toArray(), _rotatedIdentityBaseline.toArray());
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // check the gl version
  assertObjectEquals(t._glMatrix, _rotatedIdentityBaselineGl);
  
}


/**
 * Test for X.transform.rotateY()
 */
function testXtransformRotateY() {

  var t = new X.transform();
  
  var degrees = 60;
  
  // baseline was created using matlab by rotating in X direction (which means
  // around Y axis)
  // >> format longE
  // >> M = makehgtform('axisrotate',[1 0 0],degtorad(60))
  // M =
  //
  // 1.000000000000000e+00 0 0 0
  // 0 5.000000000000001e-01 -8.660254037844386e-01 0
  // 0 8.660254037844386e-01 5.000000000000001e-01 0
  // 0 0 0 1.000000000000000e+00
  
  var _rotatedIdentityBaseline = new X.matrix(
      [[1.000000000000000e+00, 0, 0, 0],
       [0, 5.000000000000001e-01, -8.660254037844386e-01, 0],
       [0, 8.660254037844386e-01, 5.000000000000001e-01, 0],
       [0, 0, 0, 1.000000000000000e+00]]);
  var _rotatedIdentityBaselineGl = new Float32Array(_rotatedIdentityBaseline
      .flatten());
  
  // perform translation
  t.rotateY(degrees);
  
  // compare the resulting matrix to the baseline
  assertArrayEquals(t.matrix.toArray(), _rotatedIdentityBaseline.toArray());
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // check the gl version
  assertObjectEquals(t._glMatrix, _rotatedIdentityBaselineGl);
  
}


/**
 * Test for X.transform.rotateZ()
 */
function testXtransformRotateZ() {

  var t = new X.transform();
  
  var degrees = 69;
  
  // baseline was created using matlab by rotating in X direction (which means
  // around Y axis)
  // >> format longE
  // M = makehgtform('axisrotate',[0 0 1],degtorad(69))
  // M =
  //
  // 3.583679495453004e-01 -9.335804264972017e-01 0 0
  // 9.335804264972017e-01 3.583679495453004e-01 0 0
  // 0 0 1.000000000000000e+00 0
  // 0 0 0 1.000000000000000e+00
  
  var _rotatedIdentityBaseline = new X.matrix(
      [[3.583679495453004e-01, -9.335804264972017e-01, 0, 0],
       [9.335804264972017e-01, 3.583679495453004e-01, 0, 0],
       [0, 0, 1.000000000000000e+00, 0], [0, 0, 0, 1.000000000000000e+00]]);
  var _rotatedIdentityBaselineGl = new Float32Array(_rotatedIdentityBaseline
      .flatten());
  
  // perform translation
  t.rotateZ(degrees);
  
  // compare the resulting matrix to the baseline
  assertArrayEquals(t.matrix.toArray(), _rotatedIdentityBaseline.toArray());
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // check the gl version
  assertObjectEquals(t._glMatrix, _rotatedIdentityBaselineGl);
  
}
