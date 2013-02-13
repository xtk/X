if (X.DEV !== undefined) {

  goog.require('X.base');
  goog.require('X.event');
  goog.require('X.event.events');
  goog.require('X.event.ZoomEvent');
  goog.require('X.event.RotateEvent');
  goog.require('X.event.PanEvent');
  goog.require('X.event.RenderEvent');
  goog.require('X.event.HoverEvent');
  goog.require('X.event.HoverEndEvent');
  goog.require('X.event.ResetViewEvent');
  goog.require('X.event.ModifiedEvent');

}
goog.require('goog.testing.jsunit');

/**
 * Test for X.event.uniqueId
 */
function testXeventUniqueId() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  var id = "abcdef";

  // transform to unique string
  var uniqueStr = X.event.uniqueId(id);
  var uniqueStr2 = X.event.uniqueId(id);

  assertNotEquals(id, uniqueStr);
  assertNotEquals(id, uniqueStr2);
  assertNotEquals(uniqueStr, uniqueStr2);

}

/**
 * Test the X.event.PanEvent
 */
function testXeventPanEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var pe = new X.event.PanEvent();
  var pe2 = new X.event.PanEvent();

  // .. should be always the same type
  assertEquals(pe.type, pe2.type);

  // assign a distance
  var _x = 1;
  var _y = 2;
  pe._distance = new X.vector(_x, _y, 0);

  // check the distances..

  // the default distance should always be 0,0
  assertEquals(pe2._distance.x, 0);
  assertEquals(pe2._distance.y, 0);

  // .. test for the custom distance
  assertEquals(pe._distance.x, _x);
  assertEquals(pe._distance.y, _y);

}

/**
 * Test the X.event.RotateEvent
 */
function testXeventRotateEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var re = new X.event.RotateEvent();
  var re2 = new X.event.RotateEvent();

  // .. should be always the same type
  assertEquals(re.type, re2.type);

  // assign a distance
  var _x = 1;
  var _y = 2;
  re._distance = new X.vector(_x, _y, 0);

  // check the distances..

  // the default distance should always be 0,0
  assertEquals(re2._distance.x, 0);
  assertEquals(re2._distance.y, 0);

  // .. test for the custom distance
  assertEquals(re._distance.x, _x);
  assertEquals(re._distance.y, _y);

}

/**
 * Test the X.event.ZoomEvent
 */
function testXeventZoomEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var ze = new X.event.ZoomEvent();
  var ze2 = new X.event.ZoomEvent();

  // .. should be always the same type
  assertEquals(ze.type, ze2.type);

  // set some properties
  var _in = true;
  var _in2 = false;
  var _fast = false;
  var _fast2 = true;

  ze._in = _in;
  ze2._in = _in2;
  ze._fast = _fast;
  ze2._fast = _fast2;

  // check the assignments
  assertTrue(ze._in);
  assertFalse(ze2._in);
  assertFalse(ze._fast);
  assertTrue(ze2._fast);

}

/**
 * Test for the X.event.ScrollEvent
 */
function testXeventScrollEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create a new ScrollEvent
  var se = new X.event.ScrollEvent();
  var se2 = new X.event.ScrollEvent();

  // .. should be always the same type
  assertEquals(se.type, se2.type);

  var _up = true;
  var _up2 = false;

  se._up = _up;
  se2._up = _up2;

  // check the assignments
  assertTrue(se._up);
  assertFalse(se2._up);

}

/**
 * Test the X.event.RenderEvent
 */
function testXeventRenderEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var re = new X.event.RenderEvent();
  var re2 = new X.event.RenderEvent();

  // .. should be always the same type
  assertEquals(re.type, re2.type);

}

/**
 * Test the X.event.HoverEvent
 */
function testXeventHoverEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var he = new X.event.HoverEvent();
  var he2 = new X.event.HoverEvent();

  // .. should be always the same type
  assertEquals(he.type, he2.type);

  // assign coordinates
  var _x = 1;
  var _y = 2;
  he._x = _x;
  he._y = _y;

  // check the coordinates
  assertEquals(he._x, _x);
  assertEquals(he._y, _y);
  assertEquals(he2._x, 0); // default
  assertEquals(he2._y, 0); // default

}

/**
 * Test the X.event.HoverEndEvent
 */
function testXeventHoverEndEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var hee = new X.event.HoverEndEvent();
  var hee2 = new X.event.HoverEndEvent();

  // .. should be always the same type
  assertEquals(hee.type, hee2.type);

}


/**
 * Test the X.event.ResetViewEvent
 */
function testXeventResetViewEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var rve = new X.event.ResetViewEvent();
  var rve2 = new X.event.ResetViewEvent();

  // .. should be always the same type
  assertEquals(rve.type, rve2.type);

}

/**
 * Test the X.event.ModifiedEvent
 */
function testXeventModifiedEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var me = new X.event.ModifiedEvent();
  var me2 = new X.event.ModifiedEvent();

  // .. should be always the same type
  assertEquals(me.type, me2.type);

  // the object should be null
  assertEquals(me._object, null);


}

/**
 * Test the X.event.ProgressEvent
 */
function testXeventProgressEvent() {

  if (X.DEV === undefined) {
    // jump out if we are testing the BUILD tree
    return;
  }

  // create new pan events
  var pe = new X.event.ProgressEvent();
  var pe2 = new X.event.ProgressEvent();

  // .. should be always the same type
  assertEquals(pe.type, pe2.type);

  // assign a value
  var _value = 0.8;
  pe2._value = _value;

  // check it
  assertEquals(pe._value, 0);
  assertEquals(pe2._value, _value);

}
