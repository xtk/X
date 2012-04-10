goog.require('X.base');
goog.require('goog.testing.jsunit');


/**
 * Test for X.base.className()
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
 * Test for X.base.dirty. Make sure the dirty flag is not set by default.
 */
function testXbaseDirty() {

  b = new X.base();
  
  // object is not dirty by default
  assertEquals(b.dirty(), false);
  
}
