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
goog.provide('X.loadable');

// requires
goog.require('X.base');
goog.require('X.file');



/**
 * Injective mix-in for all loadable objects.
 * 
 * @constructor
 */
X.loadable = function() {

  /**
   * The file of this loadable object.
   * 
   * @type {?X.file}
   * @protected
   */
  this._file = null;
  
  /**
   * The file data.
   * 
   * @type {?ArrayBuffer}
   * @protected
   */
  this._filedata = null;
  
};


/**
 * Load this object from a file path or reset the associated file path.
 * 
 * @param {?string|Array} filepath The file path/URL to load. If null, reset the
 *          associated file. If an array is given, load multiple files (this only
 *          works for DICOM so far).
 */
X.loadable.prototype.__defineSetter__('file', function(filepath) {

  if (!goog.isDefAndNotNull(filepath)) {
    
    // if path is null, we reset the associated X.file object
    
    this._file = null;
    return;
    
  }
  
  // support for multiple files
  if (filepath instanceof Array) {
    
    if (filepath.length == 1) {
      
      // if this is only one file, proceed as usual
      this._file = new X.file(filepath);
      
      return;
      
    }
    
    // first sort the filepaths
    filepath = filepath.sort();
    
    // create an X.file object for each filepath
    var _file_array = goog.array.map(filepath, function(v) {

      return new X.file(v);
      
    });
    
    // and attach it
    this._file = _file_array;
    
  } else {
  
    this._file = new X.file(filepath);
  
  }
  
});


/**
 * Get the associated X.file for this object.
 * 
 * @return {string} The associated file path or null if no file is associated.
 */
X.loadable.prototype.__defineGetter__('file', function() {

  if (!this._file) {
    
    return '';
    
  }
  
  return this._file._path;
  
});


/**
 * Get the possibly attached file data for this object.
 * 
 * @return {?string} The associated file data or null if none is attached.
 */
X.loadable.prototype.__defineGetter__('filedata', function() {

  return this._filedata;
  
});


/**
 * Set raw file data for this object. Doing so, skips any additional loading and
 * just parses this raw data.
 * 
 * @param {?string} filedata The raw file data to parse.
 */
X.loadable.prototype.__defineSetter__('filedata', function(filedata) {

  this._filedata = filedata;
  
});
