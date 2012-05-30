if (location.href.match(/(\?|&)build($|&|=)/)) {
  
  // testing the BUILD tree
  addJavascript('../../utils/xtk.js', 'head');
  
  console.log('Testing the BUILD tree.');
  
} else {
  
  console.log('Testing the DEV tree.');
  
  // includes
  goog.require('X.renderer3D');
  goog.require('X.cube');
  goog.require('X.sphere');
  goog.require('X.cylinder');
  
}

window.onload = function() {

  window.console.time('startup');
  
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
  
  // .. and render it
  test_renderer.camera.position = [-200, 0, 300];
  
  test_renderer.onShowtime = function() {

    window.console.timeEnd('startup');
    
  };
  
  test_renderer.render();
  
};
