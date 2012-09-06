test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();

  // create a cube
  cube = new X.cube();
  cube.caption = 'a cube';
  // skin it..
  cube.texture.file = 'data/xtk.png';
  
  // add the objects
  test_renderer.add(cube);
  
  // .. and render it
  test_renderer.render();
  
};
