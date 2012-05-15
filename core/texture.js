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
  this._className = 'texture';
  
  // the global id counter
  var counter = window["X.Counter"];
  // ..get a new unique id
  counter.increment();
  
  /**
   * The uniqueId of this texture. Each texture in XTK has a uniqueId.
   * 
   * @type {number}
   * @protected
   */
  this['_id'] = counter.value();
  
  /**
   * @type {X.file}
   */
  this._file = null;
  
  this._filter = X.texture.filters.SHARP;
  
  this._image = null;
  
  this._rawData = null;
  this._rawDataWidth = 0;
  this._rawDataHeight = 0;
  
  // mark as dirty by default
  this._dirty = true;
  
};
// inherit from X.base
goog.inherits(X.texture, X.base);


/**
 * Different filters for an X.texture.
 * 
 * @enum {string}
 */
X.texture.filters = {
  // different filters for texture display
  SHARP: 'SHARP',
  SMOOTH: 'SMOOTH'
};


X.texture.prototype.id = function() {

  return this['_id'];
  
};


/**
 * Get the image file of this texture.
 * 
 * @return {?X.file} The image file of this texture.
 */
X.texture.prototype.file = function() {

  return this._file;
  
};


/**
 * Set the image file for this texture.
 * 
 * @param {?X.file|string} file The image file path or an X.file object
 *          containing the path.
 */
X.texture.prototype.setFile = function(file) {

  if (!goog.isDefAndNotNull(file)) {
    
    // null files are allowed
    this._file = null;
    return;
    
  }
  
  if (goog.isString(file)) {
    
    file = new X.file(file);
    
  }
  
  this._file = file;
  
};


X.texture.prototype.image = function() {

  return this._image;
  
};


X.texture.prototype.setImage = function(image) {

  this._image = image;
  
};


X.texture.prototype.rawData = function() {

  return this._rawData;
  
};


X.texture.prototype.setRawData = function(rawData) {

  this._rawData = rawData;
  this._dirty = true;
  
};

X.texture.prototype.rawDataHeight = function() {

  return this._rawDataHeight;
  
};


X.texture.prototype.setRawDataHeight = function(rawDataHeight) {

  this._rawDataHeight = rawDataHeight;
  this._dirty = true;
  
};

X.texture.prototype.rawDataWidth = function() {

  return this._rawDataWidth;
  
};


X.texture.prototype.setRawDataWidth = function(rawDataWidth) {

  this._rawDataWidth = rawDataWidth;
  this._dirty = true;
  
};
