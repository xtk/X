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
  
  // load a .nrrd file
  var volume = new X.volume();
  volume.file = 'data/smallvolume.nrrd';
  volume.color = [1, 0, 0];
  
  // add the object
  test_renderer.add(volume);
  
  // .. and render it
  test_renderer.render();
  
  test_renderer.onShowtime = function() {

    // activate volume rendering
    volume.volumeRendering = true;
    volume.opacity = 0.2;
    volume.lowerThreshold = 600;
    volume.upperThreshold = volume.max;
    volume.modified();
    
    window.console.timeEnd('startup');
    
  };
  
};
