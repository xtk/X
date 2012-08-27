test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();
  
  // load a .trk file
  var fibers = new X.fibers();
  fibers.file = 'data/smalltrack.trk';
  
  // add the object
  test_renderer.add(fibers);
  
  // .. and render it
  test_renderer.render();
  
};
