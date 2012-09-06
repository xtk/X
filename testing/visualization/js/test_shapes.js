test = function() {

  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();
  
  // create some CSG primitives.. this is by the way an official example of CSG
  var cube = new X.cube();
  cube.center = [-20, -20, 0];
  cube.lengthX = cube.lengthY = cube.lengthZ = 20;
  cube.color = [1, 0, 0];
  
  var sphere = new X.sphere();
  sphere.center = [0, 0, 0];
  sphere.radius = 13;
  sphere.color = [0, 1, 0];
  
  var cylinder = new X.cylinder();
  cylinder.start = [-30, -30, 0];
  cylinder.end = [30, 30, 0];
  cylinder.radius = 7;
  cylinder.color = [0, 0, 1];
  
  // add the objects
  test_renderer.add(cube);
  test_renderer.add(sphere);
  test_renderer.add(cylinder);
  
  // perform some boolean actions
  var funstuff = cube.intersect(cylinder).union(sphere);
  funstuff.transform.translateX(-50);
  var funstuff2 = cylinder.subtract(sphere).inverse();
  funstuff2.transform.translateX(50);
  test_renderer.add(funstuff);
  test_renderer.add(funstuff2);
  
  // .. and render it
  test_renderer.camera.position = [-200, 0, 300];
  
  test_renderer.render();
  
  // now a hack to force the onshowtime function even if there is no loading
  // this way we get a loading time here as well.
  setTimeout(function() {

    eval('test_renderer.onShowtime()');
    
  }, 10);
  
};
