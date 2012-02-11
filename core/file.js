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

// provides
goog.provide('X.file');

// requires
goog.require('X.base');



/**
 * Create a container for the object <-> file mapping.
 * 
 * @constructor
 * @extends X.base
 */
X.file = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'file';
  
  /**
   * The file path.
   * 
   * @type {?string}
   * @protected
   */
  this._path = null;
  
};
// inherit from X.base
goog.inherits(X.file, X.base);


/**
 * Get the file path.
 * 
 * @return {?string} The file path.
 */
X.file.prototype.path = function() {

  return this._path;
  
};


/**
 * Set the file path.
 * 
 * @param {?string} path The file path.
 */
X.file.prototype.setPath = function(path) {

  this._path = path;
  
  // mark as dirty
  this._dirty = true;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.file', X.file);
goog.exportSymbol('X.file.prototype.path', X.file.prototype.path);
goog.exportSymbol('X.file.prototype.setPath', X.file.prototype.setPath);
