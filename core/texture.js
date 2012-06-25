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
goog.require('X.loadable');



/**
 * Create a texture using a two-dimensional image file or using raw-data.
 * 
 * @constructor
 * @extends X.base
 * @mixin X.loadable
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
  
  // inject functionality
  inject(this, new X.loadable()); // this object is loadable from a file
  
};
// inherit from X.base
goog.inherits(X.texture, X.base);

goog.exportSymbol('X.texture', X.texture);
