if (X.DEV !== undefined) {
  // this test only runs against the DEV tree
  goog.require('X.loadable');
  goog.require('X.volume');
  goog.require('X.file');
}
goog.require('goog.testing.jsunit');

/**
 * Test for X.loadable.file
 */
function testXloadableFile() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }  
  
  var l = new X.loadable();
  
  // file should be null initially
  assertEquals('', l.file);
  
  // let's set something
  l.file = 'abc';
  assertEquals('abc', l.file);
  
  // and reset it
  l.file = null;
  assertEquals('', l.file);
  
  // .. and an array with length 1
  // this should be converted to a string
  l.file = ['abc'];
  assertEquals('abc', l.file);
  
  // .. and another one
  l.file = ['abc', 'cba'];
  assertArrayEquals(['abc', 'cba'], l.file);
    
}

/**
 * Test for X.loadable.filedata
 */
function testXloadableFileData() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }  
  
  var l = new X.loadable();
  
  // file should be null initially
  assertEquals(null, l.filedata);
  
  // let's set something
  l.filedata = 'abc';
  assertEquals('abc', l.filedata);
  
  // and reset it
  l.filedata = null;
  assertEquals(null, l.filedata);
  
  // .. and an array with length 1
  // this should be converted to a string
  l.filedata = ['abc'];
  assertEquals('abc', l.filedata);
  
  // and reset it
  l.filedata = null;
  assertEquals(null, l.filedata);
  
  // .. and another one
  // but here we need to set the files as well
  var _data = ['abc', 'cba'];
  l.file = _data;
  l.filedata = _data;
  // this should have set the file data to each file
  // rather than to our array
  assertEquals(null, l.filedata);
  // check if the filedata was really associated to the files
  for (var i=0; i<_data.length; i++) {
    
    assertEquals(l._file[i]._file._path, _data[i]);
    
  }

}
