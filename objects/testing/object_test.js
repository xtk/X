goog.require('X.object');
goog.require('X.triplets');
goog.require('goog.testing.jsunit');


/**
 * Test for the copy constructor of X.object
 */
function testXobjectCopy() {

  // create a new X.object
  // and set some values
  var o = new X.object();
  o.type = 'POINTS';
  o.transform.rotateX(100);
  o.color = [1,2,3];
  o.points = new X.triplets(3);
  o.points.add(4,5,6);
  o.normals = new X.triplets(3);
  o.normals.add(7,8,9);
  o.colors = new X.triplets(3);
  o.colors.add(1,1,1);
  o.texture = new X.texture();
  o.file = 'abc.de';
  o.opacity = 0.5;
  o.children = [new X.object(),new X.object()];
  o.visible = false;
  o.pointsize = 2;
  o.linewidth = 3;
  o.caption = 'testing';
  o.magicmode = true;
  o.pickable = false;

  // now we want to copy the object
  var o2 = new X.object(o);

  // the objects should not be the same
  assertNotEquals(o, o2);

  // the id should not be the same
  assertNotEquals(o.id, o2.id);
  console.log(o, o2);
  // now check all other attributes, they should match
  assertEquals(o.type, o2.type);
  // compare the transform matrix
  for (var i=0; i<16; i++) {
    assertEquals(o.transform.matrix[i], o2.transform.matrix[i]);
  }
  assertArrayEquals(o.color, o2.color);
  assertArrayEquals(o.points.get(0), o2.points.get(0));
  assertArrayEquals(o.normals.get(0), o2.normals.get(0));
  assertArrayEquals(o.colors.get(0), o2.colors.get(0));
  if (X.DEV !== undefined) {
    assertEquals(o._texture, o2._texture);
  }
  // only loadable objects have a ._file
//  if (X.DEV !== undefined) {
//    assertEquals(o._file._path, o2._file._path);
//  }
//
  assertEquals(o.opacity, o2.opacity);
  assertEquals(o.children.length, o.children.length);
  assertEquals(o.visible, o2.visible);
  assertEquals(o.pointsize, o2.pointsize);
  assertEquals(o.linewidth, o2.linewidth);
  assertEquals(o.caption, o2.caption);
  assertEquals(o.magicmode, o2.magicmode);
  assertEquals(o.pickable, o2.pickable);

}
