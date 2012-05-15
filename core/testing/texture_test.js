goog.require('X.base');
goog.require('X.file');
goog.require('X.texture');
goog.require('goog.testing.jsunit');

/**
 * Test for X.texture.className
 */
function testXtextureClassName() {

  t = new X.texture();
  
  assertEquals(t.className, 'texture');
  
}

/**
 * Test for X.texture.id to test uniqueness.
 */
function testXtextureId() {

  var counter = window["X.Counter"];
  var oldValue = counter.value();
  
  var t = new X.texture();
  
  // the counter should be increased by 1
  var newValue = counter.value();
  
  assertEquals(newValue, oldValue + 1);
  
}

/**
 * Test for X.texture.file
 */
function testXtextureFile() {

  var t = new X.texture();
  
  // be default, the file should be null
  assertEquals(t.file(), null);
  
  // let's try to set the file by string
  t.setFile('/dev/null');
  
  // .. this should be converted internally to an X.file object
  assertTrue(t.file() instanceof X.file);
  
  // let's try to set the file using X.file directly
  var f = new X.file('/dev/null');
  
  t.setFile(f);
  
  // .. should be the same
  assertEquals(t.file(), f);
  
}

/**
 * Test for X.texture.image
 */
function testXtextureImage() {

  // empty test image
  var i = new Image();
  
  var t = new X.texture();
  
  t.setImage(i);
  
  // .. should be the same
  assertEquals(t.image(), i);
  
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
  
  t.setRawData(arr);
  t.setRawDataHeight(height);
  t.setRawDataWidth(width);
  
  assertEquals(t.rawData(), arr);
  assertEquals(t.rawDataHeight(), height);
  assertEquals(t.rawDataWidth(), width);
  
}
