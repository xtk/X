test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();
  
  // load a .nrrd file
  var volume = new X.volume();
  volume.file = 'data/smallvolume.nrrd';
  volume.labelmap.file = 'data/smalllabelmap.nrrd';
  volume.labelmap.colortable.file = 'data/smallcolortable.txt';
  
  // add the object
  test_renderer.add(volume);
  
  test_renderer.camera.position = [60, 40, 100];
  
  // .. and render it
  test_renderer.render();
  
};
