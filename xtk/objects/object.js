/*
 * ${HEADER}
 */

// provides
goog.provide('X.object');

// requires
goog.require('X.base');
goog.require('X.color');
goog.require('X.exception');
goog.require('goog.math.Coordinate3');
goog.require('goog.structs.Set');

/**
 * Create a displayable object. Objects may have points, colors, a texture and a
 * lightning source.
 * 
 * @constructor
 * @extends {X.base}
 */
X.object = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'object';
  
  this._points = new goog.structs.Set();
  
  this._colors = new goog.structs.Set();
  
  this._texture = null;
  
  this._lightning = null;
  
  this._visibility = true;
  
};
// inherit from X.base
goog.inherits(X.object, X.base);

X.object.prototype.points = function() {

  return this._points;
  
};

X.object.prototype.colors = function() {

  return this._colors;
  
};

X.object.prototype.getPointsAsFlattenedArray = function() {

  // the array will be three times as big as the actual number of points since
  // each point has a x, y and z coordinate
  var pointsArray = new Array(this._points.getCount() * 3);
  
  var pointSetAsArray = this._points.getValues();
  console.log(pointSetAsArray);
  // loop through the array of goog.math.Coordinate3s and attach the x, y, z
  // values to the output array
  var pointsArrayPointer = 0;
  var i;
  for (i = 0; i < pointSetAsArray.length; i++) {
    
    var coordinates = pointSetAsArray[i];
    
    pointsArrayPointer = 3 * i;
    pointsArray[pointsArrayPointer] = coordinates.x;
    pointsArray[pointsArrayPointer + 1] = coordinates.y;
    pointsArray[pointsArrayPointer + 2] = coordinates.z;
    
  }
  
  console.log(pointsArray);
  return pointsArray;
  
};

X.object.prototype.getColorsAsFlattenedArray = function() {

  // the array will be four times as big as the actual number of colors since
  // each color has four channels
  var colorsArray = new Array(this._colors.getCount() * 4);
  
  var colorSetAsArray = this._colors.getValues();
  
  // loop through the array of X.colors and attach the r, g, b and alpha values
  // to the output array
  var colorsArrayPointer = 0;
  var i;
  for (i = 0; i < colorSetAsArray.length; i++) {
    
    var color = colorSetAsArray[i];
    
    colorsArrayPointer = 4 * i;
    colorsArray[colorsArrayPointer] = color.getRed();
    colorsArray[colorsArrayPointer + 1] = color.getGreen();
    colorsArray[colorsArrayPointer + 2] = color.getBlue();
    colorsArray[colorsArrayPointer + 3] = color.getAlpha();
    
  }
  
  return colorsArray;
  
};

X.object.prototype.addPoint = function(coordinates) {

  if (!coordinates) {
    
    // throw exception if the coordinates are invalid
    throw new X.exception('Fatal: Empty coordinates!');
    
  }
  
  if (coordinates instanceof Array && coordinates.length == 3) {
    
    // convert an array to a goog.math.Coordinate3 object
    coordinates = new goog.math.Coordinate3(coordinates[0], coordinates[1],
        coordinates[2]);
    
  } else if (!(coordinates instanceof goog.math.Coordinate3)) {
    
    // throw exception if the coordinates are invalid
    throw new X.exception('Fatal: Invalid coordinates!');
    
  }
  
  this._points.add(coordinates);
  
};

X.object.prototype.addColor = function(color) {

  if (!color || !(color instanceof X.color)) {
    
    // throw exception if the color is invalid
    throw new X.exception('Fatal: Empty or invalid color!');
    
  }
  
  this._colors.add(color);
  
};

// TODO a lot :)
