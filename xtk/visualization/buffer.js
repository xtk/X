/*
 * ${HEADER}
 */

// provides
goog.provide('X.buffer');

// requires
goog.require('X.base');
goog.require('X.exception');

/**
 * Create a GL buffer container. Beside the actual GL buffer, the container
 * stores the number of items and the size of each item.
 * 
 * @constructor
 * @extends {X.base}
 */
X.buffer = function(glBuffer, itemCount, itemSize) {

  if (!glBuffer) {
    
    throw new X.exception('Fatal: Invalid GL Buffer.');
    
  }
  
  if (!itemCount) {
    
    throw new X.exception('Fatal: Invalid number of items.');
    
  }
  
  if (!itemSize) {
    
    throw new X.exception('Fatal: Invalid item size.');
    
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
  
  this._glBuffer = glBuffer;
  
  this._itemCount = itemCount;
  
  this._itemSize = itemSize;
  
};
// inherit from X.base
goog.inherits(X.buffer, X.base);

X.buffer.prototype.glBuffer = function() {

  return this._glBuffer;
  
};

X.buffer.prototype.itemCount = function() {

  return this._itemCount;
  
};

X.buffer.prototype.itemSize = function() {

  return this._itemSize;
  
};
