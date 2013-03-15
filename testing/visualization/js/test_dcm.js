test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer2D();
  test_renderer.orientation = 'Z';
  test_renderer.init();
  test_renderer.rotate();
  test_renderer.rotate();

  // load dicom files
  var volume = new X.volume();
  volume.file = ['data/53322859', 'data/53322875', 'data/53322891', 'data/53322907', 'data/53322923', 'data/53322939', 'data/53322955'];


  // add the object
  test_renderer.add(volume);

  // .. and render it
  test_renderer.render();

};
