goog.require('X.base');
goog.require('X.file');
goog.require('goog.testing.jsunit');

/**
 * Test for X.file.className
 */
function testXfileClassName() {

  // create test file
  var f = new X.file('/dev/null');
  
  assertEquals(f.className, 'file');
  
};