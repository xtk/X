goog.require('X.exception');
goog.require('goog.testing.jsunit');


/**
 * Test for X.exception without a message
 */
function testXexceptionWithoutMessage() {

  b = new X.exception();

  assertContains('== X.exception ==\nthis._message: Unknown error!\n', b
      .print());

}


/**
 * Test for X.exception with a message
 */
function testXexceptionWithMessage() {

  b = new X.exception('Uh-oh, this did not work!');

  assertContains(
      '== X.exception ==\nthis._message: Uh-oh, this did not work!\n', b
          .print());

}
