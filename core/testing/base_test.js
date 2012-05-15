goog.require('X.base');
goog.require('goog.testing.jsunit');


/**
 * Test for X.base.className
 */
function testXbase.className {

  b = new X.base();
  
  assertEquals(b.className, 'base');
  
}
