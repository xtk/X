/*
 * ${HEADER}
 */

// provides
goog.provide('X.texture');

// requires
goog.require('X.base');
goog.require('X.exception');



/**
 * Create a texture using a two-dimensional image file.
 * 
 * @constructor
 * @param {string} file The filename of the image.
 * @extends X.base
 */
X.texture = function(file) {

  if (!goog.isDefAndNotNull(file)) {
    
    throw new X.exception('Fatal: Missing image file for the texture.');
    
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
  this._className = 'texture';
  
  this._file = file;
  
  this._filter = X.texture.filters.SHARP;
  
  this._image = null;
  
  // since we pass a new texture file in the constructor, directly mark this
  // object as dirty
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


/**
 * Get the image file of this texture.
 * 
 * @return {!string} The image file of this texture.
 */
X.texture.prototype.file = function() {

  return this._file;
  
};


X.texture.prototype.image = function() {

  return this._image;
  
};


X.texture.prototype.setImage = function(image) {

  this._image = image;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.texture', X.texture);
goog.exportSymbol('X.texture.filters', X.texture.filters);
goog.exportSymbol('X.texture.prototype.file', X.texture.prototype.file);

// TODO setFile, setFilter
