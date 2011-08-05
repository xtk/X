goog.require('X.base');
goog.require('goog.testing.jsunit');


/**
 * Test for X.base.getClassName
 */
function testXbaseGetClassName() {

  b = new X.base();

  assertEquals(b.getClassName(), 'base');

}


/**
 * Test for X.base.print
 */
function testXbasePrint() {

  b = new X.base();

  assertEquals(b.print(), '== X.base ==\n');

}
