if (location.href.match(/(\?|&)build($|&|=)/)) {
  
  // testing the BUILD tree
  addJavascript('../../utils/xtk.js', 'head');
  
  console.log('Testing the BUILD tree.');
  
} else {
  
  console.log('Testing the DEV tree.');
  
  // includes
  goog.require('X.renderer3D');
  goog.require('X.fibers');
  
}

window.onload = function() {

  window.console.time('startup');
  
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
  
  test_renderer.onShowtime = function() {

    window.console.timeEnd('startup');
    
  };
  
};
