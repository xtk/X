goog.require('X.base');
goog.require('goog.testing.jsunit');


/**
 * Test for X.base.classname
 */
function testXbaseClassname() {

  b = new X.base();
  
  // check for the classname
  assertEquals(b.classname, 'base');
  
}

/**
 * Test for X.base.id
 */
function testXbaseId() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  // buffer the old id
  var oldId = window["X.counter"].uniqueId();
  
  // create a new X.base object
  var _b = new X.base();
  
  // check if the id increased
  assertEquals(oldId + 1, _b.id);
  
}
