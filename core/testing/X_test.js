goog.require('X');
goog.require('goog.testing.jsunit');

/**
 * Test for the Function.prototype.bind shim
 * defined in X.js
 */
function testXbind() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }  
  
  // let's assume we don't have the built-in bind() function
  Function.prototype.bind = null;

  // .. it is gone baby
  assertNull(Function.prototype.bind);
  
  // now activate the shim
  bind_shim();
  
  // now we should have it back
  assertNotNull(Function.prototype.bind);
  
  // now let's really try it
  function abc(val) {
    
    return val*val;
    
  }
  
  // call the function using the bind shim
  assertEquals(abc.bind(this, 3)(), 3*3);
  
}

/**
 * Test for the requestAnimationFrame shim
 * defined in X.js
 */
function testXrequestAnimationFrame() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // let's assume we don't have the built-in
  // reqAnimFrame function
  window.requestAnimationFrame = null;
  window.msRequestAnimationFrame = null;
  window.mozRequestAnimationFrame = null;
  window.webkitRequestAnimationFrame = null;
  window.oRequestAnimationFrame = null;
  
  // .. it is gone baby
  assertNull(window.requestAnimationFrame);
  assertNull(window.msRequestAnimationFrame);
  assertNull(window.mozRequestAnimationFrame);
  assertNull(window.webkitRequestAnimationFrame);
  assertNull(window.oRequestAnimationFrame);
  
  // now activate the shim
  requestAnimationFrame_shim();
  
  // now we should have it back
  assertNotNull(window.requestAnimationFrame);
  
  // now let's really run it
  var some_val = 111;
  var id = -1;
  function abc() {
    some_val++;
    
    // cancel the loop
    window.cancelAnimationFrame(id);
    
  }
  
  // we now call the function using reqAnimFrame
  id = window.requestAnimationFrame(abc);
  
}