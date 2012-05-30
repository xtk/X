goog.require('X.base');
if (X.DEV !== undefined) {
  // X.file is not available in build
  goog.require('X.file');
}
goog.require('X.texture');
goog.require('goog.testing.jsunit');

/**
 * Test for X.texture.className
 */
function testXtextureClassname() {

  t = new X.texture();
  
  assertEquals(t.classname, 'texture');
  
}


/**
 * Test for X.texture.file
 */
function testXtextureFile() {

  var t = new X.texture();
  
  // be default, the file should be null
  assertEquals(t.file, '');
  
  // let's try to set the file by string
  t.file = '/dev/null';
  
  // .. this should be converted internally to an X.file object
  // but always return a string
  assertEquals(t.file, '/dev/null');
  
}

/**
 * Test for X.texture.image
 */
function testXtextureImage() {

  // empty test image
  var i = new Image();
  
  var t = new X.texture();
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  t.image = i;
  
  // .. should be the same
  assertEquals(t.image, i);
  
}

/**
 * Test for X.texture.rawData
 */
function testXtextureRawData() {

  // create an empty array with a realistic size
  var height = 256;
  var width = 257;
  var arr = new Uint8Array(256 * 256);
  
  var t = new X.texture();
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  t._rawData = arr;
  t._rawDataHeight = height;
  t._rawDataWidth = width;
  
  assertEquals(t._rawData, arr);
  assertEquals(t._rawDataHeight, height);
  assertEquals(t._rawDataWidth, width);
  
}
