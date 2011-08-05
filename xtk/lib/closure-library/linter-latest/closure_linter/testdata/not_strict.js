/** // _WRONG_BLANK_LINE_COUNT
 * @fileoverview This file has errors that could trigger both in strict and non
 * strict mode. The errors beginning with _ should not be triggered when strict
 * flag is false.
 * // -1: _INVALID_AUTHOR_TAG_DESCRIPTION
 */

/** // _WRONG_BLANK_LINE_COUNT
 * A constructor with 1 line above it (BAD).
 * // +1: MISSING_JSDOC_TAG_TYPE
 * @param a A parameter.
 * @privtae // INVALID_JSDOC_TAG
 * @constructor
 */
function someFunction(a) {
  /** +1: _MISSING_BRACES_AROUND_TYPE
   * @type number
   */
  this.a = 0;
  someReallyReallyReallyReallyReallyReallyReallyReallyLongiName = quiteBigValue; // LINE_TOO_LONG
  if (this.a == 0) {
  // _WRONG_INDENTATION
    return // MISSING_SEMICOLON
  }
}; // ILLEGAL_SEMICOLON_AFTER_FUNCTION


// +1: _UNNECESSARY_BRACES_AROUND_INHERIT_DOC
/** {@inheritDoc} */
function someFunction.prototype.toString() {
}

