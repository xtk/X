test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();
  
  // load a .fsm file
  var surface = new X.mesh();
  surface.caption = 'this is a mesh';
  surface.file = 'data/daniel.fsm';
  surface.scalars.file = 'data/daniel.crv';
  
  // add the object
  test_renderer.add(surface);
  
  test_renderer.camera.position = [0,0,500];
  
  // .. and render it
  test_renderer.render();
  
};
