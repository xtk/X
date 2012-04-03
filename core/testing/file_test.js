goog.require('X.base');
goog.require('X.file');
goog.require('goog.testing.jsunit');

/**
 * Test for X.file.className
 */
function testXfileClassName() {

  // create test file
  var f = new X.file('/dev/null');
  
  assertEquals(f.className(), 'file');
  
}

/**
 * Test for the X.file constructor
 */
function testXfile() {

  // create test file
  var f = new X.file('/dev/null');
  
  // we check if the new file is marked as dirty which it should be
  assertTrue(f.dirty());
  
}

/**
 * Test for X.file.path functionality
 */
function testXfilePath() {

  var path1 = '/dev/null';
  var path2 = '/root/test.js';
  
  // create test file
  var f = new X.file(path1);
  
  // the path should be set now
  assertEquals(f.path(), path1);
  
  // set a new path
  f.setPath(path2);
  
  // the 2nd path should be set now
  assertEquals(f.path(), path2);
  
}
