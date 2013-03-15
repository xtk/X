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


function testXfileGetExtension() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  var f = new X.file('/dev/null');
  assertEquals('', f.getExtension());

  f._path = 'files/test.stl';
  assertEquals('STL', f.getExtension());

  f._path = 'files/test.nii.gz';
  assertEquals('GZ', f.getExtension());
};
