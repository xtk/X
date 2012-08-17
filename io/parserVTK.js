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

  this._data = data;
  console.time('a');
  var p = object._points;
  var n = object._normals;
  
  var _bytes = this.scan('uchar', data.byteLength);
  var _length = _bytes.length;
  
  var _points = null;
  var _pointsCount = 0;
  var _indices = null;
  var _indicesCount = 0;
  var _normals = null;
  
  var i;
  for (i = 0; i < _length; i++) {
    
    if (_bytes[i - 1] == 10) {
      


      if (_bytes[i] == 80) {
        
        // this is either POINTS, POLYGONS or POINT_DATA
        

        if (_bytes[i + 5] == 83) {
          
          // this is POINTS
          i += 7;
          
          // grab the number of points
          _pointsCount = new Int32Array(1);
          i = this.parseNumberFromBytestream(_bytes, i, _pointsCount, 1, 32, false );
          
          // fast forward to the line end
          do {
          } while (_bytes[i++] != 10);
          
          // grab the points
          _points = new Float32Array(_pointsCount[0]*3);
          i = this.parseNumberFromBytestream(_bytes, i, _points, _pointsCount[0]*3, 32, false );

        } else if (_bytes[i + 3] == 76) {
          
          // this is POLYGONS
          i += 9;
          console.log('POLYGONS')


        } else if (_bytes[i + 5] == 95) {
          
          // this is POINT_DATA
          // we don't really need that since we parse the normals down there and already know how many points there are
          
          i += 11;
          // fast forward to the line end
          do {
          } while (_bytes[i++] != 10);
          
        }
        
      } else if (_bytes[i] == 86) {
        
        // this is VERTICES
        i += 9;
        console.log('VERTICES', _bytes[i]);
        

      } else if (_bytes[i] == 76) {
        
        // this is LINES
        i += 6;
        console.log('LINES', _bytes[i]);
        
      } else if (_bytes[i] == 84) {
        
        // this is TRIANGLE_STRIPS
        i += 16;
        
        // grab the number of indices
        _indicesCount = new Int32Array(2);
        i = this.parseNumberFromBytestream(_bytes, i, _indicesCount, 2, 32, false );
        
        // grab the indices
        _indices = new Int32Array(_indicesCount[1]);
        i = this.parseNumberFromBytestream(_bytes, i, _indices, _indicesCount[0], 32, true );
        
      } else if (_bytes[i] == 78) {
        
        // this is NORMALS
        i += 8;

        // fast forward to the line end
        do {
        } while (_bytes[i++] != 10);
        
        // grab the points
        _normals = new Float32Array(_pointsCount[0]*3);
        i = this.parseNumberFromBytestream(_bytes, i, _normals, _pointsCount[0]*3, 32 );
        
      }
      
    }
    
  }
  console.timeEnd('a');
  return;
  
  // even if vtk files support multiple object types in the same file, we only
  // support one kind
  this._objectType = X.displayable.types.TRIANGLES;
    
  // now, configure the object according to the objectType
  this.configure(_points, _normals, _indices, p, n);
  
  // .. and set the objectType
  object._type = this._objectType;
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
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
X.parserVTK.prototype.configure = function(unorderedPoints, unorderedNormals, indices,p, n) {

  // cache often used values for fast access
  var numberOfUnorderedNormals = unorderedNormals.length;
  
  var numberOfGeometries = this._indices.length;
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
    
  } while (i > 0) {
    ;
  }
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserVTK', X.parserVTK);
goog.exportSymbol('X.parserVTK.prototype.parse', X.parserVTK.prototype.parse);
