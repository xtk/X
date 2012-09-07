if (X.DEV !== undefined) {
  // this test only runs against the DEV tree
  goog.require('X.thresholdable');
}
goog.require('goog.testing.jsunit');

/**
 * Test for X.thresholdable.lowerThreshold
 */
function testXthresholdableLowerThreshold() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }  
  
  var t = new X.thresholdable();
  
  // the initial value should be -inf
  assertEquals(t.lowerThreshold, -Infinity);
  
  // now set a new one
  t.lowerThreshold = 10;
  
  // .. and check it
  assertEquals(t.lowerThreshold, 10);
  
}

/**
 * Test for X.thresholdable.upperThreshold
 */
function testXthresholdableUpperThreshold() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }  
  
  var t = new X.thresholdable();
  
  // the initial value should be inf
  assertEquals(t.upperThreshold, Infinity);
  
  // now set a new one
  t.upperThreshold = 1000;
  
  // .. and check it
  assertEquals(t.upperThreshold, 1000);
  
}

/**
 * Test for X.thresholdable.min
 */
function testXthresholdableMin() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }  
  
  var t = new X.thresholdable();
  
  // the initial value should be inf
  assertEquals(t.min, Infinity);
    
}

/**
 * Test for X.thresholdable.max
 */
function testXthresholdableMax() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }  
  
  var t = new X.thresholdable();
  
  // the initial value should be -inf
  assertEquals(t.max, -Infinity);
    
}

/**
 * Test for X.thresholdable.minColor
 */
function testXthresholdableMinColor() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }
  
  var t = new X.thresholdable();
    
  // the initial value should be black
  assertArrayEquals(t.minColor, [0, 0, 0]);
    
  // now set a new one
  t.minColor = [1, 0, 0];
  assertArrayEquals(t.minColor, [1, 0, 0]);
  
  // now set invalid ones and check for exceptions
  var _exceptionFired = false;
  try {
    t.minColor = null;
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);
  
  // .. and again  
  _exceptionFired = false;
  try {
    t.minColor = [1, 0];
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);
  
  // .. and again  
  _exceptionFired = false;
  try {
    t.minColor = 'black';
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);  
  
  // .. and again  
  _exceptionFired = false;
  try {
    t.minColor = [1,2,3,4];
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);  
  
}


/**
 * Test for X.thresholdable.maxColor
 */
function testXthresholdableMaxColor() {
  
  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }  
  
  var t = new X.thresholdable();
    
  // the initial value should be white
  assertArrayEquals(t.maxColor, [1, 1, 1]);
    
  // now set a new one
  t.maxColor = [1, 0, 0];
  assertArrayEquals(t.maxColor, [1, 0, 0]);
  
  // now set invalid ones and check for exceptions
  var _exceptionFired = false;
  try {
    t.maxColor = null;
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);
  
  // .. and again
  _exceptionFired = false;
  try {
    t.maxColor = [1, 0];
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);

  // .. and again  
  _exceptionFired = false;
  try {
    t.maxColor = 'black';
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);  
  
  // .. and again  
  _exceptionFired = false;
  try {
    t.maxColor = [1,2,3,4];
  } catch (Error) {
    _exceptionFired = true;
  }
  assertTrue(_exceptionFired);  
  
}