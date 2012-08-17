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
goog.provide('X.parserVTK');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');



/**
 * Create a parser for the ascii .VTK format.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserVTK = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserVTK';
  
};
// inherit from X.parser
goog.inherits(X.parserVTK, X.parser);


/**
 * @inheritDoc
 */
X.parserVTK.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  var p = object._points;
  var n = object._normals;
  
  var dataAsArray = data.split('\n');
  var numberOfLines = dataAsArray.length;
  
  // in .VTK files, the points are not ordered for rendering, so we need to
  // buffer everything in X.triplets containers and then order it
  var unorderedPoints = new X.triplets();
  var unorderedNormals = new X.triplets();
  
  // .. we also need a buffer for all indices
  this._geometries = [];
  
  // even if vtk files support multiple object types in the same file, we only
  // support one kind
  this._objectType = X.displayable.types.TRIANGLES;
  
  // this mode indicates that the next lines will be X,Y,Z coordinates
  this._pointsMode = false;
  
  // this mode indicates that the next lines will be indices mapping to points
  // and pointData
  this._geometryMode = false;
  
  // this mode indicates that the next lines will be pointData
  this._pointDataMode = false;
  // one type of pointData are normals and right now the only supported ones
  this._normalsMode = false;
  

  //
  // LOOP THROUGH ALL LINES
  //
  // This uses an optimized loop.
  //
  
  /*
   * Fast Duff's Device
   * 
   * @author Miller Medeiros <http://millermedeiros.com>
   * 
   * @version 0.3 (2010/08/25)
   */
  var i = 0;
  var n2 = numberOfLines % 8;
  while (n2--) {
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
  }
  
  n2 = (numberOfLines * 0.125) ^ 0;
  while (n2--) {
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
    this.parseLine(unorderedPoints, unorderedNormals, dataAsArray[i]);
    i++;
  }
  

  // now, configure the object according to the objectType
  this.configure(unorderedPoints, unorderedNormals, p, n);
  
  // .. and set the objectType
  object._type = this._objectType;
  
  X.TIMERSTOP(this._classname + '.parse');
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};


/**
 * Parses a line of .VTK data and modifies the given X.triplets containers.
 * 
 * @param {!X.triplets} unorderedPoints A points container as a X.triplets
 *          object.
 * @param {!X.triplets} unorderedNormals A normals container as a X.triplets
 *          object.
 * @param {!string} line The line to parse.
 * @protected
 */
X.parserVTK.prototype.parseLine = function(unorderedPoints, unorderedNormals,
    line) {

  // trim the line
  line = line.replace(/^\s+|\s+$/g, '');
  
  // split to array
  var lineFields = line.split(' ');
  
  // number of lineFields
  var numberOfLineFields = lineFields.length;
  
  // the first field of the line can be a keyword to indicate different modes
  var firstLineField = lineFields[0];
  
  // KEYWORD CHECK / MODE SWITCH
  //
  // identify the section of the next coming lines using the vtk keywords
  switch (firstLineField) {
  
  case 'POINTS':

    // this means that real X,Y,Z points are coming
    
    this._pointsMode = true;
    this._geometryMode = false;
    this._pointDataMode = false;
    
    // go to next line
    return;
    
  case 'VERTICES':

    // this means that triangles or points are coming
    
    this._geometryMode = true;
    this._pointsMode = false;
    this._pointDataMode = false;
    
    var numberOfElements = parseInt(lineFields[1], 10);
    
    if (numberOfElements >= 3) {
      this._objectType = X.displayable.types.TRIANGLES;
    } else if (numberOfElements == 1) {
      this._objectType = X.displayable.types.POINTS;
    } else {
      
      throw new Error('This VTK file is not supported!');
      
    }
    
    // reset all former geometries since we only support 1 geometry type per
    // file (the last one specified)
    this._geometries = [];
    
    // go to next line
    return;
    
  case 'TRIANGLE_STRIPS':

    // this means that triangle_strips are coming
    
    this._geometryMode = true;
    this._pointsMode = false;
    this._pointDataMode = false;
    this._objectType = X.displayable.types.TRIANGLE_STRIPS;
    
    // reset all former geometries since we only support 1 geometry type per
    // file (the last one specified)
    this._geometries = [];
    
    // go to next line
    return;
    
  case 'LINES':

    // this means that lines are coming
    
    this._geometryMode = true;
    this._pointsMode = false;
    this._pointDataMode = false;
    this._objectType = X.displayable.types.LINES;
    
    // reset all former geometries since we only support 1 geometry type per
    // file (the last one specified)
    this._geometries = [];
    
    // go to next line
    return;
    
  case 'POLYGONS':

    // this means that polygons are coming
    // we only support polygons which are triangles right now
    
    this._geometryMode = true;
    this._pointsMode = false;
    this._pointDataMode = false;
    this._objectType = X.displayable.types.POLYGONS;
    
    // reset all former geometries since we only support 1 geometry type per
    // file (the last one specified)
    this._geometries = [];
    
    // go to next line
    return;
    
  case 'POINT_DATA':

    // this means point-data is coming
    // f.e. normals
    
    this._pointDataMode = true;
    this._pointsMode = false;
    this._geometryMode = false;
    
    // go to next line
    return;
    
  }
  
  // PARSING
  //
  // now we parse according to the current mode
  //
  if (this._pointsMode) {
    
    // in pointsMode, each line has X,Y,Z coordinates separated by space
    
    if (numberOfLineFields == 1 || isNaN(parseFloat(firstLineField))) {
      
      // this likely means end of pointsMode
      this._pointsMode = false;
      
      return;
      
    }
    
    // assume max. 9 coordinate values (== 3 points) in one row
    if (numberOfLineFields >= 3) {
      var x0 = parseFloat(lineFields[0]);
      var y0 = parseFloat(lineFields[1]);
      var z0 = parseFloat(lineFields[2]);
      
      unorderedPoints.add(x0, y0, z0);
    }
    
    if (numberOfLineFields >= 6) {
      var x1 = parseFloat(lineFields[3]);
      var y1 = parseFloat(lineFields[4]);
      var z1 = parseFloat(lineFields[5]);
      unorderedPoints.add(x1, y1, z1);
    }
    
    if (numberOfLineFields >= 9) {
      var x2 = parseFloat(lineFields[6]);
      var y2 = parseFloat(lineFields[7]);
      var z2 = parseFloat(lineFields[8]);
      
      unorderedPoints.add(x2, y2, z2);
    }
    
  } // end of pointsMode
  else if (this._geometryMode) {
    
    // in geometryMode, each line has indices which map to points and pointsData
    
    if (numberOfLineFields == 1 || isNaN(parseFloat(firstLineField))) {
      
      // this likely means end of geometryMode
      this._geometryMode = false;
      return;
      
    }
    
    // the first element is the number of coming indices
    // so we just slice the first element to get all indices
    var values = lineFields.slice(1);
    
    // append all index values to the main geometries array
    this._geometries.push(values);
    
  } // end of geometryMode
  else if (this._pointDataMode) {
    
    // at the moment, only normals are supported as point-data
    
    if (firstLineField == 'NORMALS') {
      
      this._normalsMode = true;
      
      return;
      
    }
    
    if (numberOfLineFields == 1 || isNaN(parseFloat(firstLineField))) {
      
      // this likely means end of pointDataMode
      this._pointDataMode = false;
      this._normalsMode = false;
      
      return;
      
    }
    
    // the normals mode
    if (this._normalsMode) {
      
      // assume 9 coordinate values (== 3 points) in one row
      
      if (numberOfLineFields >= 3) {
        var x0 = parseFloat(lineFields[0]);
        var y0 = parseFloat(lineFields[1]);
        var z0 = parseFloat(lineFields[2]);
        unorderedNormals.add(x0, y0, z0);
      }
      if (numberOfLineFields >= 6) {
        var x1 = parseFloat(lineFields[3]);
        var y1 = parseFloat(lineFields[4]);
        var z1 = parseFloat(lineFields[5]);
        unorderedNormals.add(x1, y1, z1);
      }
      if (numberOfLineFields >= 9) {
        var x2 = parseFloat(lineFields[6]);
        var y2 = parseFloat(lineFields[7]);
        var z2 = parseFloat(lineFields[8]);
        unorderedNormals.add(x2, y2, z2);
      }
      
    } // end of normalsMode
    
  } // end of pointDataMode
  
};


/**
 * Configure X.object points and normals. This method takes the object type into
 * consideration to f.e. use degenerated triangles for TRIANGLE_STRIPS.
 * 
 * @param {!X.triplets} unorderedPoints The container for unordered points.
 * @param {!X.triplets} unorderedNormals The container for unordered normals.
 * @param {!X.triplets} p The points container of the X.object.
 * @param {!X.triplets} n The normals container of the X.object.
 */
X.parserVTK.prototype.configure = function(unorderedPoints, unorderedNormals,
    p, n) {

  // cache often used values for fast access
  var numberOfUnorderedNormals = unorderedNormals.length;
  
  var numberOfGeometries = this._geometries.length;
  var i = numberOfGeometries;
  // we use this loop here since it's slightly faster than the for loop
  do {
    
    // we want to loop through the geometries in the range 0..(N - 1)
    var currentGeometry = this._geometries[numberOfGeometries - i];
    var currentGeometryLength = currentGeometry.length;
    
    // in the sub-loop we loop through the indices of the current geometry
    var k;
    for (k = 0; k < currentGeometryLength; k++) {
      
      // boundary check for LINES
      if (this._objectType == X.displayable.types.LINES &&
          (k + 1 >= currentGeometryLength)) {
        
        // jump out since we reached the end of the geometry
        break;
        
      }
      
      // grab the current index
      var currentIndex = parseInt(currentGeometry[k], 10);
      
      // grab the point with the currentIndex
      var currentPoint = unorderedPoints.get(currentIndex);
      
      //
      // POINTS
      //
      
      // .. and add it
      p.add(currentPoint[0], currentPoint[1], currentPoint[2]);
      
      var nextIndex = currentIndex;
      var nextPoint = currentPoint;
      // special case for LINES: we add the next element twice to
      // interrupt the line segments (in webGL, lines mode connects always 2
      // points)
      // if we would not do this, then all line segments would be connected
      if (this._objectType == X.displayable.types.LINES) {
        
        nextIndex = parseInt(currentGeometry[k + 1], 10);
        // grab the next point
        nextPoint = unorderedPoints.get(nextIndex);
        
        // and add it
        p.add(nextPoint[0], nextPoint[1], nextPoint[2]);
        
      } // LINES
      
      // special case for TRIANGLE_STRIPS: we add the first and the
      // last element twice to interrupt the strips (as degenerated triangles)
      // if we would not do this, then all strips would be connected
      else if (this._objectType == X.displayable.types.TRIANGLE_STRIPS) {
        
        // check if this is the first or last element
        if (k == 0 || k == currentGeometryLength - 1) {
          
          // if this is the first or last point of the triangle strip, add it
          // again
          p.add(currentPoint[0], currentPoint[1], currentPoint[2]);
          
        }
        
      } // TRIANGLE_STRIPS
      


      //
      // NORMALS
      // 
      if (currentIndex < numberOfUnorderedNormals) {
        
        // grab the normal with the currentIndex, if it exists
        var currentNormals = unorderedNormals.get(currentIndex);
        
        // .. and add it
        n.add(currentNormals[0], currentNormals[1], currentNormals[2]);
        
        // for LINES, add the next normal (neighbor)
        if (this._objectType == X.displayable.types.LINES) {
          
          // the neighbor
          var nextNormals = unorderedNormals.get(nextIndex);
          
          // .. and add it
          n.add(nextNormals[0], nextNormals[1], nextNormals[2]);
          
        } // LINES
        
        // for TRIANGLE_STRIPS, special case
        else if (this._objectType == X.displayable.types.TRIANGLE_STRIPS) {
          
          // check if this is the first or last element
          if (k == 0 || k == currentGeometryLength - 1) {
            
            // if this is the first or last point of the triangle strip, add it
            // again
            n.add(currentNormals[0], currentNormals[1], currentNormals[2]);
            
          }
          
        } // TRIANGLE_STRIPS
        

      } else {
        
        // add an artificial normal
        var artificialNormal = new goog.math.Vec3(currentPoint[0],
            currentPoint[1], currentPoint[2]);
        artificialNormal.normalize();
        n.add(artificialNormal.x, artificialNormal.y, artificialNormal.z);
        
        // for LINES, do it again
        if (this._objectType == X.displayable.types.LINES) {
          
          // grab the next normal (artificial)
          var artificialNormal2 = new goog.math.Vec3(nextPoint[0],
              nextPoint[1], nextPoint[2]);
          artificialNormal2.normalize();
          n.add(artificialNormal2.x, artificialNormal2.y, artificialNormal2.z);
          
        } // LINES
        
        // for TRIANGLE_STRIPS, special case
        else if (this._objectType == X.displayable.types.TRIANGLE_STRIPS) {
          
          // check if this is the first or last element
          if (k == 0 || k == currentGeometryLength - 1) {
            
            // add the artificial normal again
            n.add(artificialNormal.x, artificialNormal.y, artificialNormal.z);
            
          }
          
        } // TRIANGLE_STRIPS
        
      }
      
    } // for loop through the currentGeometry
    
    i--;
    
  } while (i > 0);
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserVTK', X.parserVTK);
goog.exportSymbol('X.parserVTK.prototype.parse', X.parserVTK.prototype.parse);
