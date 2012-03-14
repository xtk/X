goog.require('X.base');
goog.require('goog.testing.jsunit');


/**
 * Test for X.base.getClassName
 */
function testXbaseClassName() {

  b = new X.base();

  assertEquals(b.className(), 'base');

}


/**
 * Test for X.base.print
 */
function testXbasePrint() {

  b = new X.base();

  assertContains('== X.base ==\n', b.print());

}

/**
 * Test for X.base.dirty
 * Goal: Make sure the dirty flag is modified.
 */
function testXbaseDirty() {
  b = new X.base();

  // object dirty by default
  assertEquals( b.dirty(), false);

  // clean the object
  b.setClean();
  assertEquals( b.dirty(), false);
}
