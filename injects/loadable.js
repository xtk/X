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
 *          associated file. If an array is given, load multiple files (this
 *          only works for DICOM so far).
 */
X.loadable.prototype.__defineSetter__('file', function(filepath) {

  if (!goog.isDefAndNotNull(filepath) ||
      (goog.isArray(filepath) && filepath.length == 0)) {

    // if path is null, we reset the associated X.file object

    this._file = null;
    return;

  }

  // support for multiple files
  if (goog.isArray(filepath)) {

    if (filepath.length == 1) {

      // if this is only one file, proceed as usual
      this._file = new X.file(filepath[0]);

      return;

    }

    // create an X.file object for each filepath
    var _file_array = goog.array.map(filepath, function(v) {

      var _v = new X.volume();
      _v._file = new X.file(v);
      return _v;

    });

    // and attach it
    this._file = _file_array;

  } else {

    this._file = new X.file(filepath);

  }

  this._filedata = null;

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

  // if we have multiple files, return all filepaths
  if (goog.isArray(this._file)) {

    return this._file.map(function(v) {

      return v._file._path;

    });

  }

  return this._file._path;

});


/**
 * Get the possibly attached file data for this object.
 *
 * @return {?string} The associated file data or null if none is attached.
 */
X.loadable.prototype.__defineGetter__('filedata', function() {

  // if we have multiple files, return all filedata
  if (goog.isArray(this._file)) {

    return this._file.map(function(v) {

      return v._filedata;

    });

  }

  return this._filedata;

});


/**
 * Set raw file data for this object. Doing so, skips any additional loading and
 * just parses this raw data.
 *
 * @param {?string|Array} filedata The raw file data to parse.
 */
X.loadable.prototype.__defineSetter__('filedata', function(filedata) {

  if (!goog.isDefAndNotNull(filedata) ||
      (goog.isArray(filedata) && filedata.length == 0)) {

    this._filedata = null;

  }

  // support for multiple files
  if (goog.isArray(filedata)) {

    if (filedata.length == 1) {

      // if this is only one file, proceed as usual
      this._filedata = filedata[0];

      return;

    }

    // modify the filedata for each associated file
    var _number_of_files = this._file.length;

    var i;
    for (i = 0; i < _number_of_files; i++) {

      // attach the filedata for each associated file
      this._file[i]._filedata = filedata[i];

    }


  } else {

    this._filedata = filedata;

  }

});
