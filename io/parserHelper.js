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
 * @throws {Error} An error, if the data is invalid.
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
  this._classname = 'parserHelper';
  
  /**
   * The data.
   * 
   * @type {!String}
   * @protected
   */
  this._data = data;
  
  /**
   * The pointer to the current byte.
   * 
   * @type {!number}
   * @protected
   */
  this._dataPointer = 0;
  
  /**
   * The current size for elements.
   * 
   * @type {!number}
   * @protected
   */
  this._elementSize = 1;
  
  /**
   * Size of Char.
   * 
   * @type {!number}
   * @const
   */
  this._sizeOfChar = 1;
  
  /**
   * Size of Short.
   * 
   * @type {!number}
   * @const
   */
  this._sizeOfShort = 2;
  
  /**
   * Size of Int.
   * 
   * @type {!number}
   * @const
   */
  this._sizeOfInt = 4;
  
  /**
   * Size of Float.
   * 
   * @type {!number}
   * @const
   */
  this._sizeOfFloat = 4;
  
  /**
   * Size of Double.
   * 
   * @type {!number}
   * @const
   */
  this._sizeOfDouble = 8;
  
  /**
   * The current parse function as a void pointer.
   * 
   * @type {?Function}
   * @protected
   */
  this._parseFunction = null;
  
  this._bigEndian = null;
  
};
// inherit from X.base
goog.inherits(X.parserHelper, X.base);


/**
 * Set the current parseFunction.
 * 
 * @param {?Function} func The pointer to a parse function.
 * @param {!number} elementSize The size for elements.
 */
X.parserHelper.prototype.setParseFunction = function(func, elementSize) {

  this._parseFunction = func;
  this._elementSize = elementSize;
  
};


/**
 * Jump to a position in the byte stream.
 * 
 * @param {!number} offset The new offset.
 */
X.parserHelper.prototype.jumpTo = function(offset) {

  this._dataPointer = offset;
  
};

/**
 * Set to big endian
 * 
 * @param {!boolean} bigendian true if it's big endian, false otherwise
 */
X.parserHelper.prototype.setBigEndian = function(bigendian) {

  this._bigEndian = bigendian;
  
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
  
  var ret = null;
  if (this._bigEndian == null) {
  	ret = this._parseFunction(this._data, this._dataPointer, chunks);
  } else {
  	ret = this._parseFunction(this._data, this._dataPointer, chunks, this._bigEndian);	
  }
  var arr_byte = ret[0];
  this._dataPointer += this._elementSize * chunks;
  if (chunks == 1) {
    
    return arr_byte[0];
    
  } else {
    
    return arr_byte;
    
  }
  
};
