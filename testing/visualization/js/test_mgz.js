test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();
  
  // load a .mgz file
  var volume = new X.volume();
  volume.file = 'data/smallvolume.mgz';
  volume.color = [1, 0, 0];
  
  // add the object
  test_renderer.add(volume);
  
  test_renderer.camera.position = [60, 40, 100];
  
  // .. and render it
  test_renderer.render();
  
};
