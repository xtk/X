if (X.DEV !== undefined) {
  // only require if we are testing the DEV tree
  goog.require('X.file');
}

goog.require('X.base');

goog.require('goog.testing.jsunit');

/**
 * Test for X.file.className
 */
function testXfileClassName() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // create test file
  var f = new X.file('/dev/null');
  
  assertEquals(f.classname, 'file');
  
};