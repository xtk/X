goog.require('X.base');
goog.require('X.file');
goog.require('X.colorTable');
goog.require('goog.testing.jsunit');
goog.require('goog.asserts');

/**
 * Test for X.colorTable.className
 */
function testXcolorTableClassName() {

  c = new X.colorTable();
  
  assertEquals(c.className, 'colorTable');
  
}


/**
 * Test for X.colorTable.file
 */
function testXcolorTableFile() {

  var c = new X.colorTable();
  
  // be default, the file should be null
  assertEquals(c.file, null);
  
  // let's try to set the file by string
  c.file = '/dev/null';
  
  // .. this should be converted internally to an X.file object
  assertTrue(c.file instanceof X.file);
  
  // let's try to set the file using X.file directly
  var f = new X.file('/dev/null');
  
  c.file = f;
  
  // .. should be the same
  assertEquals(c.file, f);
  
};

/**
 * Test for X.colorTable.add
 */
function testXcolorTableAdd() {

  var c = new X.colorTable();
  
  // define an example color table entry
  var colorValue = 0;
  var colorLabel = "Label value 0";
  var colorR = 255;
  var colorG = 254;
  var colorB = 253;
  var colorA = 128;
  
  // add the example color
  c.add(colorValue, colorLabel, colorR, colorG, colorB, colorA);
  
  // .. now grab the entry using the colorValue
  var returnedColor = c._map.get(colorValue);
  
  assertEquals(returnedColor[0], colorLabel);
  assertEquals(returnedColor[1], colorR);
  assertEquals(returnedColor[2], colorG);
  assertEquals(returnedColor[3], colorB);
  assertEquals(returnedColor[4], colorA);
  
};
