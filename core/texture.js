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

goog.provide('X.texture');

// requires
goog.require('X.base');
goog.require('X.file');



/**
 * Create a texture using a two-dimensional image file or using raw-data.
 * 
 * @constructor
 * @extends X.base
 */
X.texture = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'texture';
  
  /**
   * The file of this texture.
   * 
   * @type {?X.file}
   * @protected
   */
  this._file = null;
  
  /**
   * The (optional) HTML Image element.
   * 
   * @type {?Element}
   * @protected
   */
  this._image = null;
  
  /**
   * The raw data of this texture as a uint8 array.
   * 
   * @type {?Object}
   * @protected
   */
  this._rawData = null;
  
  /**
   * The width of the raw data.
   * 
   * @type {number}
   * @protected
   */
  this._rawDataWidth = 0;
  
  /**
   * The height of the raw data.
   * 
   * @type {number}
   * @protected
   */
  this._rawDataHeight = 0;
  
};
// inherit from X.base
goog.inherits(X.texture, X.base);


/**
 * Get the file of this texture container.
 * 
 * @return {?X.file} The file of this texture container.
 * @public
 */
X.texture.prototype.__defineGetter__('file', function() {

  return this._file;
  
});


/**
 * Set the file for this texture container.
 * 
 * @param {?X.file|string} file The file path or an X.file object containing the
 *          path.
 * @public
 */
X.texture.prototype.__defineSetter__('file', function(file) {

  if (!goog.isDefAndNotNull(file)) {
    
    // null files are allowed
    this._file = null;
    return;
    
  }
  
  if (goog.isString(file)) {
    
    file = new X.file(file);
    
  }
  
  this._file = file;
  
});

goog.exportSymbol('X.texture', X.texture);
