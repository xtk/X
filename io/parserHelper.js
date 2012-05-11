/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

goog.provide('X.parserHelper');

// requires
goog.require('X.base');



/**
 * Create a parser for binary or ascii data.
 * 
 * @constructor
 * @param {!String} data The data to parse.
 * @extends X.base
 * @throws {Error} If the arguments are invalid.
 */
X.parserHelper = function(data) {

  if (!goog.isDefAndNotNull(data)) {
    
    throw new Error('Invalid data.');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'parserHelper';
  
  this._data = data;
  
  this._dataPointer = 0;
  
  this._elementSize = 1;
  
  // helper 'static'-like defs.
  this.sizeOfChar = 1;
  this.sizeOfShort = 2;
  this.sizeOfInt = 4;
  this.sizeOfFloat = 4;
  this.sizeOfDouble = 8;
  
};
// inherit from X.base
goog.inherits(X.parserHelper, X.base);


/**
 * Returns the currently associated parse function of this class. Should be
 * overloaded.
 * 
 * @param {*=} f1
 * @param {*=} f2
 * @param {*=} f3
 * @return {*}
 */
X.parserHelper.prototype.parseFunction = function(f1, f2, f3) {

  // do nothing
  
};


X.parserHelper.prototype.elementSize = function() {

  return this._elementSize;
  
};


X.parserHelper.prototype.setElementSize = function(elementSize) {

  if (!goog.isNumber(elementSize)) {
    
    throw new Error('Invalid element size.');
    
  }
  
  this._elementSize = elementSize;
  
};


X.parserHelper.prototype.data = function() {

  return this._data;
  
};


/**
 * @param data
 */
X.parserHelper.prototype.setData = function(data) {

  // TODO validation
  
  this._data = data;
  
};


X.parserHelper.prototype.dataPointer = function() {

  return this._dataPointer;
  
};


/**
 * @param dataPointer
 */
X.parserHelper.prototype.setDataPointer = function(dataPointer) {

  // TODO validation
  
  this._dataPointer = dataPointer;
  
};


X.parserHelper.prototype.setParseFunction = function(func, elementSize) {

  this.parseFunction = func;
  this._elementSize = elementSize;
  
};


/**
 * Read from the data stream.
 * 
 * @param {*=} chunks Number of elements to read. By default, 1.
 * @return {number|Array} The requested chunks, matching the requested number.
 */
X.parserHelper.prototype.read = function(chunks) {

  if (!goog.isDefAndNotNull(chunks)) {
    
    chunks = 1;
    
  }
  
  var ret = this.parseFunction(this._data, this._dataPointer, chunks);
  var arr_byte = ret[0];
  this._dataPointer += this._elementSize * chunks;
  if (chunks == 1) {
    
    return arr_byte[0];
    
  } else {
    
    return arr_byte;
    
  }
  
};
