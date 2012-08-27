test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();
  
  // load a .nrrd file
  volume = new X.volume();
  volume.file = 'data/smallvolume.nrrd';
  volume.color = [1, 0, 0];
  volume.volumeRendering = true;
  volume.opacity = 0.2;
  volume.lowerThreshold = 600;
  
  // add the object
  test_renderer.add(volume);
  
  // .. and render it
  test_renderer.render();
  
};
