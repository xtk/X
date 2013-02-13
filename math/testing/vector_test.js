goog.require('X.vector');
goog.require('goog.testing.jsunit');

function testXvectorNormalize() {

  // create an X.vector
  var vector = new X.vector(1,2,3);

  // normalize the vector
  vector.normalize();

  // magnitude = sqrt(1^2 + 2^2 + 3^3) = 3.7416573867739413
  // scaling with (1/magnitude = 0.2672612419124244)
  // should result in
  // x=0.2672612419124244, y=0.5345224838248488, z=0.8017837257372732
  assertEquals(0.2672612419124244, vector.xx);
  assertEquals(0.5345224838248488, vector.yy);
  assertEquals(0.8017837257372732, vector.zz);

}

function testXvectorNormalizeWithZeroMagnitude() {

  // create an X.vector with 0 magnitude
  var vector = new X.vector(0,0,0);

  // normalize the vector
  vector.normalize();

  assertEquals(0, vector.xx);
  assertEquals(0, vector.yy);
  assertEquals(0, vector.zz);

}

