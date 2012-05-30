goog.require('X.base');
if (X.DEV !== undefined) {
  
  // only require if we are testing the DEV tree
  goog.require('X.file');
  goog.require('X.colortable');
  
}

goog.require('goog.testing.jsunit');
goog.require('goog.asserts');

/**
 * Test for X.colortable.classname
 */
function testXcolortableClassname() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  c = new X.colortable();
  
  // check for the classname
  assertEquals(c.classname, 'colortable');
  
}


/**
 * Test for X.colortable.file
 */
function testXcolortableFile() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  var c = new X.colortable();
  
  // be default, the file should be null
  assertEquals(c.file, '');
  
  // let's try to set the file by string
  c.file = '/dev/null';
  
  // .. this should be converted internally to an X.file object
  // but should still return a string
  assertEquals('/dev/null', c.file);
  
};

/**
 * Test for X.colortable.add
 */
function testXcolortableAdd() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  var c = new X.colortable();
  
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
