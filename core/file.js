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
 * Create a container for a files path mapping.
 *
 * @param {?string} path The file path for the file.
 * @constructor
 * @extends X.base
 */
X.file = function(path) {

  //
  // call the standard constructor of X.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'file';

  /**
   * The file path.
   *
   * @type {?string}
   * @public
   */
  this._path = path;

  // mark as dirty since we configure a path here
  this._dirty = true;
};

// inherit from X.base
goog.inherits(X.file, X.base);


/**
 * Get the extension of the file by its file path
 * @return {string}
 */
X.file.prototype.getExtension = function ()
{
  var extension = this._path.split('.').pop().toUpperCase();

  // support no extensions
  if (extension == this._path.toUpperCase()) {

    // this means no extension
    extension = '';
  }
  return extension;
};
