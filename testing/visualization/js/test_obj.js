test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();
  
  // load a .vtk file
  var surface = new X.mesh();
  surface.file = 'data/tri.obj';
  surface.color = [1,0,0];
  
  // add the object
  test_renderer.add(surface);
  
  // .. and render it
  test_renderer.camera.position = [0,0,3];
  test_renderer.camera.focus = [0,0,0];
  test_renderer.camera.up = [0,1,0];
  test_renderer.render();

};
