/*
 * ${HEADER}
 */

// provides
goog.provide('X.file');

// requires
goog.require('X.base');
goog.require('X.exception');



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
  this._className = 'file';
  
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
