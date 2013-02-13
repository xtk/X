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
  var _identityBaseline = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0,
                           0, 1]);

  // by default, the transform should have an identity matrix associated
  var currentMatrix = t.matrix;
  // check if the matrices match
  for (var i=0; i<16; i++) {
    assertEquals(_identityBaseline[i], currentMatrix[i]);
  }

  var _testMatrix = new Float32Array([1, 5, 9, 13.5, 2, 6, 10, 14.5, 3, 7, 11, 15.5, 4,
                              8, 12, 16.5]);

  // set the custom matrix
  t.matrix = _testMatrix;

  // compare it
  for (var i=0; i<16; i++) {
    assertEquals(_testMatrix[i], t.matrix[i]);
  }

}


/**
 * Test for X.transform.flipX()
 */
function testXtransformFlipX() {

  // create new transform
  var t = new X.transform();

  var _identityBaselineFlipped = new Float32Array([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  // flip the X coordinates
  t.flipX();

  for (var i=0; i<16; i++) {
    assertEquals(_identityBaselineFlipped[i], t.matrix[i]);
  }

  var testPoint = [10,20,30];
  var flippedTestPointBaseline = [-10,20,30];

  // the multiplication with the flipped matrix shoudl yield the same point as
  // our flippedTestPoint when multiplied
  var flippedTestPoint = X.matrix.multiplyByVector(t.matrix, testPoint[0], testPoint[1], testPoint[2]);


  assertEquals(flippedTestPointBaseline[0], flippedTestPoint.xx);
  assertEquals(flippedTestPointBaseline[1], flippedTestPoint.yy);
  assertEquals(flippedTestPointBaseline[2], flippedTestPoint.zz);

  // the transform should be dirty now

}

/**
 * Test for X.transform.flipY()
 */
function testXtransformFlipY() {

  // create new transform
  var t = new X.transform();

  var _identityBaselineFlipped = new Float32Array([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  // flip the X coordinates
  t.flipY();

  for (var i=0; i<16; i++) {
    assertEquals(_identityBaselineFlipped[i], t.matrix[i]);
  }

  var testPoint = [10,20,30];
  var flippedTestPointBaseline = [10,-20,30];

  // the multiplication with the flipped matrix shoudl yield the same point as
  // our flippedTestPoint when multiplied
  var flippedTestPoint = X.matrix.multiplyByVector(t.matrix, testPoint[0], testPoint[1], testPoint[2]);


  assertEquals(flippedTestPointBaseline[0], flippedTestPoint.xx);
  assertEquals(flippedTestPointBaseline[1], flippedTestPoint.yy);
  assertEquals(flippedTestPointBaseline[2], flippedTestPoint.zz);

  // the transform should be dirty now

}

/**
 * Test for X.transform.flipZ()
 */
function testXtransformFlipZ() {

  // create new transform
  var t = new X.transform();

  var _identityBaselineFlipped = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1]);

  // flip the X coordinates
  t.flipZ();

  for (var i=0; i<16; i++) {
    assertEquals(_identityBaselineFlipped[i], t.matrix[i]);
  }

  var testPoint = [10,20,30];
  var flippedTestPointBaseline = [10,20,-30];

  // the multiplication with the flipped matrix shoudl yield the same point as
  // our flippedTestPoint when multiplied
  var flippedTestPoint = X.matrix.multiplyByVector(t.matrix, testPoint[0], testPoint[1], testPoint[2]);


  assertEquals(flippedTestPointBaseline[0], flippedTestPoint.xx);
  assertEquals(flippedTestPointBaseline[1], flippedTestPoint.yy);
  assertEquals(flippedTestPointBaseline[2], flippedTestPoint.zz);

  // the transform should be dirty now

}

/**
 * Test for X.transform.translateX()
 */
function testXtransformTranslateX() {

  var t = new X.transform();

  // this is our target X
  var newX = -455;


  var _translatedIdentityBaseline = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, newX, 0, 0, 1]);

  // perform translation
  t.translateX(newX);

  // compare the resulting matrix to the baseline
  for (var i=0; i<16; i++) {
    assertEquals(_translatedIdentityBaseline[i], t.matrix[i]);
  }

}

/**
 * Test for X.transform.translateY()
 */
function testXtransformTranslateY() {

  var t = new X.transform();

  // this is our target Y
  var newY = 23543;

  var _translatedIdentityBaseline = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, newY, 0, 1]);

  // perform translation
  t.translateY(newY);

  // compare the resulting matrix to the baseline
  for (var i=0; i<16; i++) {
    assertEquals(_translatedIdentityBaseline[i], t.matrix[i]);
  }

}

/**
 * Test for X.transform.translateZ()
 */
function testXtransformTranslateZ() {

  var t = new X.transform();

  // this is our target Z
  var newZ = 10000;

  var _translatedIdentityBaseline = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, newZ, 1]);

  // perform translation
  t.translateZ(newZ);

  // compare the resulting matrix to the baseline
  for (var i=0; i<16; i++) {
    assertEquals(_translatedIdentityBaseline[i], t.matrix[i]);
  }

}

/**
 * Test for X.transform.rotateX()
 */
function testXtransformRotateX() {

  var t = new X.transform();

  var degrees = 44;

  // baseline was created using matlab by rotating in X direction
  // >> format longE
  // >> M = makehgtform('axisrotate',[1 0 0],degtorad(44))
  // now transpose this for column major ordering (like WebGL)
  //  >> M'
  //
  //  ans =
  //
  //       1.000000000000000e+00                         0                         0                         0
  //                           0     7.193398003386512e-01     6.946583704589973e-01                         0
  //                           0    -6.946583704589973e-01     7.193398003386512e-01                         0
  //                           0                         0                         0     1.000000000000000e+00


    var _rotatedIdentityBaseline = new Float32Array([1.000000000000000e+00, 0, 0, 0, 0, 7.193398003386512e-01,
                                                   6.946583704589973e-01, 0, 0,
                                                   -6.946583704589973e-01,
                                                   7.193398003386512e-01, 0, 0,
                                                   0, 0, 1.000000000000000e+00]);

  // perform rotation
  t.rotateX(degrees);

  // compare the resulting matrix to the baseline
  for (var i=0; i<16; i++) {
    assertEquals(_rotatedIdentityBaseline[i], t.matrix[i]);
  }
}


/**
 * Test for X.transform.rotateY()
 */
function testXtransformRotateY() {

  var t = new X.transform();

  var degrees = 60;

  // baseline was created using matlab by rotating in Y direction
  // >> format longE
  // >> M = makehgtform('axisrotate',[0 1 0],degtorad(60))
  // now transpose this for column major ordering (like WebGL)
  // >> M'
  //
  // ans =
  //
  // 5.000000000000001e-01 0 -8.660254037844386e-01 0
  //                           0     1.000000000000000e+00                         0                         0
  //       8.660254037844386e-01                         0     5.000000000000001e-01                         0
  //                           0                         0                         0     1.000000000000000e+00

  var _rotatedIdentityBaseline = new Float32Array([5.000000000000001e-01, 0,
                                                   -8.660254037844386e-01, 0,
                                                   0, 1.000000000000000e+00, 0,
                                                   0, 8.660254037844386e-01, 0,
                                                   5.000000000000001e-01, 0, 0,
                                                   0, 0, 1.000000000000000e+00]);

  // perform rotation
  t.rotateY(degrees);

  // compare the resulting matrix to the baseline
  for (var i=0; i<16; i++) {
    assertEquals(_rotatedIdentityBaseline[i], t.matrix[i]);
  }

}


/**
 * Test for X.transform.rotateZ()
 */
function testXtransformRotateZ() {

  var t = new X.transform();

  var degrees = 69;

  // baseline was created using matlab by rotating in Y direction
  // >> format longE
  // >> M = makehgtform('axisrotate',[0 0 1],degtorad(69))
  // now transpose this for column major ordering (like WebGL)
  //  >> M'
  //
  //  ans =
  //
  //       3.583679495453004e-01     9.335804264972017e-01                         0                         0
  //      -9.335804264972017e-01     3.583679495453004e-01                         0                         0
  //                           0                         0     1.000000000000000e+00                         0
  //                           0                         0                         0     1.000000000000000e+00
  //

  var _rotatedIdentityBaseline = new Float32Array([3.583679495453004e-01,
                                                 9.335804264972017e-01, 0, 0,
                                                 -9.335804264972017e-01,
                                                 3.583679495453004e-01, 0, 0,
                                                 0, 0, 1.000000000000000e+00,
                                                 0, 0, 0, 0,
                                                 1.000000000000000e+00]);

  // perform rotation
  t.rotateZ(degrees);

  // compare the resulting matrix to the baseline
  for (var i=0; i<16; i++) {
    assertEquals(_rotatedIdentityBaseline[i], t.matrix[i]);
  }

}
