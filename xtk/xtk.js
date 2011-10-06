// entry point

// namespace
goog.provide('X');

// uniqueId mechanism
var __uniqueIdCounter = 0;

/**
 * Return a uniqueId with the given prefix.
 * 
 * @param {string} prefix A prefix for the unique id.
 * @returns {string} A uniqueId.
 */
X.uniqueId = function(prefix) {

  return prefix + __uniqueIdCounter++;
  
};
