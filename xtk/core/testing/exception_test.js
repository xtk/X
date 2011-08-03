goog.require('goog.testing.jsunit');
goog.require('X.exception');

/**
 * Test for X.exception without a message
 */
function testXexceptionWithoutMessage() {
  
  b = new X.exception();
  
  assertEquals(b.print(), '== X.exception ==\nthis._message: Unknown error!\n');
  
}

/**
 * Test for X.exception with a message
 */
function testXexceptionWithMessage() {
  
  b = new X.exception('Uh-oh, this did not work!');
  
  assertEquals(b.print(), '== X.exception ==\nthis._message: Uh-oh, this did not work!\n');
  
}
