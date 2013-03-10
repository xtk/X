if (X.DEV !== undefined) {
  // this test only runs against the DEV tree
  goog.require('X.loader');
  goog.require('X.mesh');
  goog.require('X.volume');
  goog.require('X.file');
}
goog.require('goog.testing.jsunit');

function testCheckFileFormat() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  var loader = new X.loader();
  var mockContainer = new X.loadable();


  // Has mimetype, no file extension
  mockContainer.file = 'files/test';
  var mimetype = "application/vnd.ms-pki.stl";
  var fileFormat = loader.checkFileFormat(mockContainer, mimetype);

  assertEquals('files/test', fileFormat[0]);
  assertEquals('application/vnd.ms-pki.stl', fileFormat[1]);
  assertEquals(X.parserSTL, fileFormat[2]);
  assertEquals(null, fileFormat[3]);


  // Prefer mimetype over file extension
  mockContainer.file = 'files/test.vtk';
  mimetype = "application/vnd.ms-pki.stl";
  fileFormat = loader.checkFileFormat(mockContainer, mimetype);

  assertEquals('files/test.vtk', fileFormat[0]);
  assertEquals('application/x-vtk', fileFormat[1]);
  assertEquals(X.parserVTK, fileFormat[2]);
  assertEquals(null, fileFormat[3]);


  // Fallback to file extension
  mockContainer.file = 'files/test.stl';
  mimetype = '';
  fileFormat = loader.checkFileFormat(mockContainer, mimetype);

  assertEquals('files/test.stl', fileFormat[0]);
  assertEquals('application/vnd.ms-pki.stl', fileFormat[1]);
  assertEquals(X.parserSTL, fileFormat[2]);
  assertEquals(null, fileFormat[3]);


  // Throw invalid type error
  mockContainer.file = 'files/test.unsupported';
  errorCall = loader.checkFileFormat.bind(this, mockContainer);
  assertThrows(errorCall);

  mockContainer.file = 'files/test';
  mimetype = 'something/notsupported';
  errorCall = loader.checkFileFormat.bind(this, mockContainer, mimetype);
  assertThrows(errorCall);

  mockContainer.file = 'files/test.unsupported';
  mimetype = 'something/notsupported';
  errorCall = loader.checkFileFormat.bind(this, mockContainer, mimetype);
  assertThrows(errorCall);
}