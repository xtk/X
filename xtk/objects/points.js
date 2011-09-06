/*
 * ${HEADER}
 */

// provides
goog.provide('X.points');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('goog.math.Coordinate3');
goog.require('goog.structs.Map');



/**
 * Create an ordered container for 3D points.
 * 
 * @constructor
 * @extends {X.base}
 */
X.points = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'points';
  
  /**
   * The hash map storing all points (objects of type goog.math.Coordinate3).
   * 
   * @type {!goog.structs.Map}
   * @private
   */
  this._points_ = new goog.structs.Map();
  
  /**
   * The id of the last added point or -1 if this container is empty.
   * 
   * @type {!number}
   * @private
   */
  this._id_ = -1;
  
};
// inherit from X.base
goog.inherits(X.points, X.base);

/**
 * Add a point to this container.
 * 
 * @param {!(Array|goog.math.Coordinate3)} point A three-dimensional coordinate.
 * @returns {!number} The internal id of the added point.
 * @throws {X.exception} An exception if the passed point is invalid or a unique
 *           id could not be generated.
 */
X.points.prototype.add = function(point) {

  if (!goog.isDefAndNotNull(point)) {
    
    throw new X.exception('Fatal: Invalid point.');
    
  }
  
  if (goog.isArray(point) && (point.length == 3)) {
    
    // we also accept arrays but directly convert them to our base type
    point = new goog.math.Coordinate3(point[0], point[1], point[2]);
    
  }
  
  if (!(point instanceof goog.math.Coordinate3)) {
    
    throw new X.exception('Fatal: Invalid point.');
    
  }
  
  if (this._points_.containsKey(++this._id_)) {
    
    throw new X.exception('Fatal: Could not get unique id.');
    
  }
  
  this._points_.set(this._id_, point);
  
  return this._id_;
  
};

/**
 * Get the point with the given id. This is a O(1) operation.
 * 
 * @param {!number} id The internal id of the requested point.
 * @returns {*} The point with the given id.
 * @throws {X.exception} An exception if the passed id is invalid or does not
 *           exist.
 */
X.points.prototype.get = function(id) {

  if (!goog.isDefAndNotNull(id) || !this._points_.containsKey(id)) {
    
    throw new X.exception('Fatal: Invalid id.');
    
  }
  
  return this._points_.get(id);
  
};

/**
 * Remove a given point from this container. This is a O(N) operation.
 * 
 * @param {!goog.math.Coordinate3} point The point to be removed.
 * @returns {boolean} TRUE/FALSE depending on success.
 * @throws {X.exception} An exception if the given point is invalid or if
 *           accessing the internal hash map led to problems.
 */
X.points.prototype.remove = function(point) {

  if (!goog.isDefAndNotNull(point) || !(point instanceof goog.math.Coordinate3)) {
    
    throw new X.exception('Fatal: Invalid point.');
    
  }
  
  if (!this._points_.containsValue(point)) {
    
    return false;
    
  }
  
  // now we do need to loop through the map
  var keyIterator = this._points_.getKeyIterator();
  
  try {
    
    while (true) {
      
      var key = keyIterator.next();
      
      var object = this._points_.get(key);
      
      if (object == point) {
        
        // we found the point
        // ..delete it
        return this._points_.remove(key);
        
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
 * Remove the point with the given id from this container. This is a O(1)
 * operation.
 * 
 * @param {!number} id The id of the point to be removed.
 * @returns {boolean} TRUE/FALSE depending on success.
 * @throws {X.exception} An exception if the given id is invalid.
 */
X.points.prototype.removeById = function(id) {

  if (!goog.isDefAndNotNull(id)) {
    
    throw new X.exception('Fatal: Invalid id.');
    
  }
  
  if (!this._points_.containsKey(id)) {
    
    return false;
    
  }
  
  return this._points_.remove(id);
  
};

/**
 * Get the number of points in this container.
 * 
 * @returns {!number} The number of points in this container.
 */
X.points.prototype.count = function() {

  return this._points_.getCount();
  
};

/**
 * Create an ordered and flattened 1-D array of all points in this container.
 * 
 * @returns {Array} A one-dimensional array containing all points.
 */
X.points.prototype.flatten = function() {

  var array = new Array();
  
  // now we need to loop through the map
  var keyIterator = this._points_.getKeyIterator();
  
  try {
    
    while (true) {
      
      var key = keyIterator.next();
      
      var point = this._points_.get(key);
      
      var pointAsArray = point.toArray();
      
      // append individual points to the return array
      array = array.concat(pointAsArray);
      
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
