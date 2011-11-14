// entry point

// namespace
goog.provide('X');

// uniqueId mechanism
var __uniqueIdCounter = 0;


/**
 * Return a uniqueId with the given prefix.
 * 
 * @param {string} prefix A prefix for the unique id.
 * @return {string} A uniqueId.
 */
X.uniqueId = function(prefix) {

  return prefix + __uniqueIdCounter++;
  
};


//
// BROWSER COMPATIBILITY FIXES GO HERE
//

//
// 1. Safari does not support the .bind(this) functionality which is crucial for
// XTK's event mechanism. This hack fixes this.
//
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {

    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError(
          "Function.prototype.bind - what is trying to be bound is not callable");
    }
    
    var fSlice = Array.prototype.slice, aArgs = fSlice.call(arguments, 1), fToBind = this, fNOP = function() {

    }, fBound = function() {

      return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs
          .concat(fSlice.call(arguments)));
    };
    
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    
    return fBound;
  };
}
