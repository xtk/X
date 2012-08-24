if (location.href.match(/(\?|&)build($|&|=)/)) {
  
  // testing the BUILD tree
  addJavascript('../../utils/xtk.js', 'head');
  
  console.log('Testing the BUILD tree.');
  
} else {
  
  console.log('Testing the DEV tree.');
  
  // includes
  goog.require('X.renderer3D');
  goog.require('X.volume');
  
}

window.onload = function() {

  window.console.time('startup');
  
  // create a new test_renderer
  test_renderer = new X.renderer3D();
  test_renderer.init();
  
  // load a .mgz file
  volume = new X.volume();
  volume.file = 'data/daniel.mgh';
  
  // add the object
  test_renderer.add(volume);
  
  test_renderer.camera.position = [60, 40, 100];
  
  // .. and render it
  test_renderer.render();
  
  test_renderer.onShowtime = function() {

    window.console.timeEnd('startup');
    
  };
  
};
