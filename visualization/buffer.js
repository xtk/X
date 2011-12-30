/*
 * ${HEADER}
 */

// provides
goog.provide('X.buffer');

// requires
goog.require('X.base');
goog.require('X.exception');



/**
 * Create a GL buffer container. Besides the actual GL buffer, the container
 * stores the number of items and the size of each item.
 * 
 * @constructor
 * @param {Object} glBuffer The GL buffer.
 * @param {number} itemCount The number of items.
 * @param {number} itemSize The size of each item.
 * @extends X.base
 */
X.buffer = function(glBuffer, itemCount, itemSize) {

  if (!goog.isDefAndNotNull(glBuffer)) {
    
    throw new X.exception('Fatal: Invalid GL Buffer!');
    
  }
  
  if (!goog.isDefAndNotNull(itemCount)) {
    
    throw new X.exception('Fatal: Invalid number of items!');
    
  }
  
  if (!goog.isDefAndNotNull(itemSize)) {
    
    throw new X.exception('Fatal: Invalid item size!');
    
  }
  
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'buffer';
  
  /**
   * The GL buffer.
   * 
   * @type {Object}
   * @const
   */
  this._glBuffer = glBuffer;
  
  /**
   * The number of items.
   * 
   * @type {number}
   * @const
   */
  this._itemCount = itemCount;
  
  /**
   * The size of each item.
   * 
   * @type {number}
   * @const
   */
  this._itemSize = itemSize;
  
};
// inherit from X.base
goog.inherits(X.buffer, X.base);


/**
 * Get the actual GL buffer.
 * 
 * @return {Object} The GL buffer.
 */
X.buffer.prototype.glBuffer = function() {

  return this._glBuffer;
  
};


/**
 * Get the number of the items in this buffer.
 * 
 * @return {number} The number of the items.
 */
X.buffer.prototype.itemCount = function() {

  return this._itemCount;
  
};


/**
 * Get the size of the items in this buffer.
 * 
 * @return {number} The size of the items.
 */
X.buffer.prototype.itemSize = function() {

  return this._itemSize;
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.buffer', X.buffer);
goog.exportSymbol('X.buffer.prototype.glBuffer', X.buffer.prototype.glBuffer);
goog.exportSymbol('X.buffer.prototype.itemCount', X.buffer.prototype.itemCount);
goog.exportSymbol('X.buffer.prototype.itemSize', X.buffer.prototype.itemSize);
