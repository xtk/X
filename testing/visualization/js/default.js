//
// check if we test the dev tree or the build tree
//
if (location.href.match(/(\?|&)build($|&|=)/)) {
  
  // testing the BUILD tree
  addJavascript('../../utils/xtk.js', 'head');
  
  console.log('Testing the BUILD tree.');
  
} else {
  
  console.log('Testing the DEV tree.');
  
  // includes
  goog.require('X.renderer2D');
  goog.require('X.renderer3D');
  goog.require('X.fibers');
  goog.require('X.mesh');
  goog.require('X.volume');
  goog.require('X.cube');
  goog.require('X.sphere');
  goog.require('X.cylinder');
  
}

/**
 * From http://javascript.about.com/library/bladdjs.htm Import javascript.
 * 
 * @param {string} jsname The js file path.
 * @param {string} pos 'head'/'body' as a position were to include.
 */
function addJavascript(jsname, pos) {

  var th = document.getElementsByTagName(pos)[0];
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', jsname);
  th.appendChild(s);
  
};

function startupTest() {

  // STARTUP TIME MEASUREMENT
  window.console.time('startup');
  start_time = new Date;
  // FPS MEASUREMENT
  filterStrength = 20, lastLoop = new Date, thisLoop = 0;
  frameTime = 0;
  
};

function teardownTest() {

  // STARTUP TIME MEASUREMENT
  test_renderer.onShowtime = function() {

    window.console.timeEnd('startup');
    startup = (new Date) - start_time;
    
  };
  
  // FPS MEASUREMENT
  test_renderer.onRender = function() {

    var thisFrameTime = (thisLoop = new Date) - lastLoop;
    frameTime += (thisFrameTime - frameTime) / filterStrength;
    lastLoop = thisLoop;
    
  };
  
};

//
// the wrapper around the actual test code
window.onload = function() {

  startupTest();
  
  test(); // this is the actual test code
  
  teardownTest();
  
};
