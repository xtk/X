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


/**
 * Set the raw data for this texture.
 * 
 * @param {?Object} rawData The raw data.
 * @public
 */
X.texture.prototype.__defineSetter__('rawData', function(rawData) {

  this._rawData = rawData;
  
});


/**
 * Get the raw data for this texture.
 * 
 * @return {?Object} The raw data.
 * @public
 */
X.texture.prototype.__defineGetter__('rawData', function() {

  return this._rawData;
  
});


/**
 * Set the raw data width for this texture.
 * 
 * @param {number} rawDataWidth The raw data width.
 * @public
 */
X.texture.prototype.__defineSetter__('rawDataWidth', function(rawDataWidth) {

  this._rawDataWidth = rawDataWidth;
  
});


/**
 * Get the raw data width for this texture.
 * 
 * @return {number} The raw data width.
 * @public
 */
X.texture.prototype.__defineGetter__('rawDataWidth', function() {

  return this._rawDataWidth;
  
});


/**
 * Set the raw data height for this texture.
 * 
 * @param {number} rawDataHeight The raw data height.
 * @public
 */
X.texture.prototype.__defineSetter__('rawDataHeight', function(rawDataHeight) {

  this._rawDataHeight = rawDataHeight;
  
});


/**
 * Get the raw data height for this texture.
 * 
 * @return {number} The raw data height.
 * @public
 */
X.texture.prototype.__defineGetter__('rawDataHeight', function() {

  return this._rawDataHeight;
  
});

goog.exportSymbol('X.texture', X.texture);
