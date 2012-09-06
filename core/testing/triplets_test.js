goog.require('X.base');
goog.require('X.triplets');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.asserts');


/**
 * Test for X.triplets.classname
 */
function testXtripletsClassname() {

  var t = new X.triplets(1);
  
  assertEquals(t.classname, 'triplets');
  
}

/**
 * Test for X.triplets.add()
 */
function testXtripletsAdd() {

  var t = new X.triplets(9);
  
  if (X.DEV !== undefined) {
    // a fresh X.triplets container should be clean
    assertFalse(t._dirty);
  }
  
  var t0 = [1, 2, 3];
  var t1 = [4, 5, 6];
  var t2 = [7,8.100000381469727,9.199999809265137];
  
  // add some triplets
  t.add(t0[0], t0[1], t0[2]);
  t.add(t1[0], t1[1], t1[2]);
  t.add(t2[0], t2[1], t2[2]);
  
  if (X.DEV !== undefined) {
    // the triplets container should be dirty now
    assertTrue(t._dirty);
  }
  
  // check if we can get the exact values again
  assertArrayEquals(t.get(0), t0);
  assertArrayEquals(t.get(1), t1);
  assertArrayEquals(t.get(2), t2);
  
}

/**
 * Test for X.triplets.get()
 */
function testXtripletsGet() {

  var t = new X.triplets(9);
  
  assertArrayEquals(t.get(666), [undefined,undefined,undefined]);
  assertArrayEquals(t.get(-1), [undefined,undefined,undefined]);
  
}

/**
 * Test for X.triplets.remove()
 */
function testXtripletsRemove() {

  var t = new X.triplets(3);
  
  var t0 = [1, 2, 3];
  // add a triplet
  t.add(t0[0], t0[1], t0[2]);
  // check if we can get the exact values again
  assertArrayEquals(t.get(0), t0);
  
  // .. now let's remove it
  var exceptionThrown = false;
  try {
    t.remove(0);
  } catch (e) {
    exceptionThrown = true;
  }
  assertTrue(exceptionThrown);
  
  // NOTE: this is not implemented yet so should fail
  
//  
//  // .. getting it should now fail
//  var exceptionThrown = false;
//  try {
//    t.get(0);
//  } catch (e) {
//    exceptionThrown = true;
//  }
//  assertTrue(exceptionThrown);
//  
//  // .. let's try to remove it again which should result in an exception
//  exceptionThrown = false;
//  try {
//    t.remove(0);
//  } catch (e) {
//    exceptionThrown = true;
//  }
//  assertTrue(exceptionThrown);
  
}

/**
 * Test for X.triplets.clear()
 */
function testXtripletsClear() {

  var t = new X.triplets(300);
  
  var _caseNumber = 100;
  
  var i;
  for (i = 0; i < _caseNumber; i++) {
    
    // add a lot of triplets
    var a = Math.random(i);
    var b = Math.random(i);
    var c = Math.random(i);
    
    t.add(a, b, c);
    
  }
  
  // clear the whole container
  t.clear();
  
  // the container should be empty now but still have a fixed size
  assertEquals(t.length, 300);
  assertEquals(t.count, 100);
  
  // add another triplet
  var t0 = [1, 2, 3];
  t.add(t0[0], t0[1], t0[2]);
  
  // the count and length should be adjusted
  assertEquals(t.length, 303);
  assertEquals(t.count, 101);
  
}

/**
 * Test for X.triplets.count()
 */
function testXtripletsCount() {

  var _caseNumber = parseInt((Math.random() * 10) + 1, 10);  
  
  var t = new X.triplets(_caseNumber * 3);
  
  // the empty container should have count 0
  assertEquals(t.count, 0);
  
  var i;
  for (i = 0; i < _caseNumber; i++) {
    
    // add a lot of triplets
    var a = Math.random(i);
    var b = Math.random(i);
    var c = Math.random(i);
    
    t.add(a, b, c);
    
  }
  
  assertEquals(t.count, _caseNumber);
  
}

/**
 * Test for X.triplets.length()
 */
function testXtripletsLength() {

  var _caseNumber = parseInt((Math.random() * 10) + 1, 10);  
  
  var t = new X.triplets(_caseNumber * 3);
  
  // the empty container should have count 0
  assertEquals(t.length, 0);
  
  var i;
  for (i = 0; i < _caseNumber; i++) {
    
    // add a lot of triplets
    var a = Math.random(i);
    var b = Math.random(i);
    var c = Math.random(i);
    
    t.add(a, b, c);
    
  }
  
  assertEquals(t.length, _caseNumber * 3);
  
}
