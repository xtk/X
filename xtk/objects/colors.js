/*
 * ${HEADER}
 */

// provides
goog.provide('X.colors');

// requires
goog.require('X.base');
goog.require('X.color');
goog.require('X.exception');
goog.require('goog.structs.Map');



/**
 * Create an ordered container for colors.
 * 
 * @constructor
 * @extends {X.base}
 */
X.colors = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'colors';
  
  /**
   * The hash map storing all colors (objects of type X.color).
   * 
   * @type {!goog.structs.Map}
   * @private
   */
  this._colors_ = new goog.structs.Map();
  
  /**
   * The id of the last added color or -1 if this container is empty.
   * 
   * @type {!number}
   * @private
   */
  this._id_ = -1;
  
};
// inherit from X.base
goog.inherits(X.colors, X.base);

/**
 * Add a color to this container.
 * 
 * @param {!X.color} color A color.
 * @returns {!number} The internal id of the added color.
 * @throws {X.exception} An exception if the passed color is invalid or a unique
 *           id could not be generated.
 */
X.colors.prototype.add = function(color) {

  if (!goog.isDefAndNotNull(color) || !(color instanceof X.color)) {
    
    throw new X.exception('Fatal: Invalid color.');
    
  }
  
  if (this._colors_.containsKey(++this._id_)) {
    
    throw new X.exception('Fatal: Could not get unique id.');
    
  }
  
  this._colors_.set(this._id_, color);
  
  return this._id_;
  
};

/**
 * Get the color with the given id. This is a O(1) operation.
 * 
 * @param {!number} id The internal id of the requested color.
 * @returns {!*} The color with the given id.
 * @throws {X.exception} An exception if the passed id is invalid or does not
 *           exist.
 */
X.colors.prototype.get = function(id) {

  if (!goog.isDefAndNotNull(id) || !this._colors_.containsKey(id)) {
    
    throw new X.exception('Fatal: Invalid id.');
    
  }
  
  return this._colors_.get(id);
  
};

/**
 * Remove a given color from this container. This is a O(N) operation.
 * 
 * @param {!X.color} color The X.color to be removed.
 * @returns {boolean} TRUE/FALSE depending on success.
 * @throws {X.exception} An exception if the given color is invalid or if
 *           accessing the internal hash map led to problems.
 */
X.colors.prototype.remove = function(color) {

  if (!goog.isDefAndNotNull(color) || !(color instanceof X.color)) {
    
    throw new X.exception('Fatal: Invalid color.');
    
  }
  
  if (!this._colors_.containsValue(color)) {
    
    return false;
    
  }
  
  // now we do need to loop through the map
  var keyIterator = this._colors_.getKeyIterator();
  
  try {
    
    while (true) {
      
      var key = keyIterator.next();
      
      var object = this._colors_.get(key);
      
      if (object == color) {
        
        // we found the color
        // ..delete it
        return this._colors_.remove(key);
        
      }
      
    } // while
    
  } catch (e) {
    
    if (e != goog.iter.StopIteration) {
      
      // there was an error
      throw e;
      
    }
    
  }
  
};

/**
 * Remove the color with the given id from this container. This is a O(1)
 * operation.
 * 
 * @param {!number} id The id of the color to be removed.
 * @returns {boolean} TRUE/FALSE depending on success.
 * @throws {X.exception} An exception if the given id is invalid.
 */
X.colors.prototype.removeById = function(id) {

  if (!goog.isDefAndNotNull(id)) {
    
    throw new X.exception('Fatal: Invalid id.');
    
  }
  
  if (!this._colors_.containsKey(id)) {
    
    return false;
    
  }
  
  return this._colors_.remove(id);
  
};

/**
 * Get the number of colors in this container.
 * 
 * @returns {!number} The number of colors in this container.
 */
X.colors.prototype.count = function() {

  return this._colors_.getCount();
  
};

/**
 * Create an ordered and flattened 1-D array of all colors in this container.
 * 
 * @returns {Array} A one-dimensional array containing all colors.
 */
X.colors.prototype.flatten = function() {

  var array = new Array();
  
  // now we need to loop through the map
  var keyIterator = this._colors_.getKeyIterator();
  
  try {
    
    while (true) {
      
      var key = keyIterator.next();
      
      var color = this._colors_.get(key);
      
      var colorAsArray = color.flatten();
      
      // append individual color to the return array
      array = array.concat(colorAsArray);
      
    } // while
    
  } catch (e) {
    
    if (e != goog.iter.StopIteration) {
      
      // there was an error
      throw e;
      
    }
    
  }
  
  // return the 1-D array
  return array;
  
};

// export symbols (requiered for advanced compilation)
goog.exportSymbol('X.colors',X.colors);
goog.exportSymbol('X.colors.prototype.add', X.colors.prototype.add);
goog.exportSymbol('X.colors.prototype.get',X.colors.prototype.get);
goog.exportSymbol('X.colors.prototype.remove', X.colors.prototype.remove);
goog.exportSymbol('X.colors.prototype.removeById', X.colors.prototype.removeById);
goog.exportSymbol('X.colors.prototype.count',X.colors.prototype.count);
goog.exportSymbol('X.colors.prototype.flatten', X.colors.prototype.flatten);