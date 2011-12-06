/*
 * ${HEADER}
 */

// provides
goog.provide('X.parserVTK');

// requires
goog.require('X.exception');
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');



/**
 * Create a parser for the ascii .VTK format.
 * 
 * @constructor
 * @extends {X.base}
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
  this._className = 'parserVTK';
  
};
// inherit from X.parser
goog.inherits(X.parserVTK, X.parser);


/**
 * @inheritDoc
 */
X.parserVTK.prototype.parse = function(object, data) {

  var p = object.points();
  var n = object.normals();
  
  var readAsArray = data.split('\n');
  
  var numberOfLines = readAsArray.length;
  
  var line;
  
  // in .VTK files, the points are not ordered for rendering, so we need to
  // buffer everything in X.triplets containers and then order it
  var unorderedPoints = new X.triplets();
  var unorderedNormals = new X.triplets();
  
  // .. we also need a buffer for all indices
  var geometryIndexes = [];
  

  var pointsMode = false;
  var numberOfPoints = 0;
  
  var geometryMode = false;
  var geometryType = null;
  var numberOfGeometries = 0;
  
  var pointDataMode = false;
  var numberOfPointDatas = 0;
  var normalsMode = false;
  
  var i;
  for (i = 0; i < numberOfLines; i++) {
    
    line = readAsArray[i];
    
    // trim the line
    line = line.replace(/^\s+|\s+$/g, '');
    
    // split to array
    var lineFields = line.split(' ');
    
    if (lineFields[0] == 'POINTS') {
      
      pointsMode = true;
      
      numberOfPoints = lineFields[1];
      
      // go to next line
      continue;
      
    } else if (lineFields[0] == 'VERTICES') {
      
      geometryMode = true;
      numberOfGeometries = lineFields[1];
      geometryType = X.object.types.TRIANGLES;
      
      // go to next line
      continue;
      
    } else if (lineFields[0] == 'TRIANGLE_STRIPS') {
      
      geometryMode = true;
      numberOfGeometries = lineFields[1];
      geometryType = X.object.types.TRIANGLE_STRIPS;
      
      // go to next line
      continue;
      
    } else if (lineFields[0] == 'LINES') {
      
      geometryMode = true;
      numberOfGeometries = lineFields[1];
      geometryType = X.object.types.LINES;
      
      // go to next line
      continue;
      
    } else if (lineFields[0] == 'POLYGONS') {
      
      geometryMode = true;
      numberOfGeometries = lineFields[1];
      geometryType = X.object.types.TRIANGLES;
      
      // go to next line
      continue;
      
    } else if (lineFields[0] == 'POINT_DATA') {
      
      pointDataMode = true;
      numberOfPointDatas = lineFields[1];
      
      // go to next line
      continue;
      
    }
    
    if (pointsMode) {
      
      // TODO does not detect the end quite right now
      
      if (lineFields.length == 1 || isNaN(parseFloat(lineFields[0]))) {
        
        console.log('i:' + i + ' ' + lineFields);
        console.log('parsed ' + unorderedPoints.count() + ' points');
        
        // this likely means end of pointsMode
        pointsMode = false;
        
        continue;
        
      }
      
      // assume 9 coordinate values (== 3 points) in one row
      var x0 = parseFloat(lineFields[0]);
      var y0 = parseFloat(lineFields[1]);
      var z0 = parseFloat(lineFields[2]);
      unorderedPoints.add(x0, y0, z0);
      
      // TODO
      
      var x1 = parseFloat(lineFields[3]);
      var y1 = parseFloat(lineFields[4]);
      var z1 = parseFloat(lineFields[5]);
      unorderedPoints.add(x1, y1, z1);
      var x2 = parseFloat(lineFields[6]);
      var y2 = parseFloat(lineFields[7]);
      var z2 = parseFloat(lineFields[8]);
      unorderedPoints.add(x2, y2, z2);
      
    } else if (geometryMode) {
      console.log(i);
      console.log(lineFields);
      if (lineFields.length == 1 || isNaN(parseFloat(lineFields[0]))) {
        
        // this likely means end of geometryMode
        geometryMode = false;
        continue;
        
      }
      
      var numberOfValues = lineFields[0];
      
      var values = lineFields.slice(1);
      
      // append all index values to the main geometryIndexes array
      geometryIndexes = geometryIndexes.concat(values);
      
    } else if (pointDataMode) {
      
      // at the moment, only normals are supported
      
      if (lineFields[0] == 'NORMALS') {
        
        normalsMode = true;
        
        continue;
        
      }
      
      if (lineFields.length == 1 || isNaN(parseFloat(lineFields[0]))) {
        
        // this likely means end of pointDataMode
        pointsMode = false;
        normalsMode = false;
        
        continue;
        
      }
      
      if (normalsMode) {
        
        // assume 9 coordinate values (== 3 points) in one row
        var x0 = parseFloat(lineFields[0]);
        var y0 = parseFloat(lineFields[1]);
        var z0 = parseFloat(lineFields[2]);
        unorderedNormals.add(x0, y0, z0);
        var x1 = parseFloat(lineFields[3]);
        var y1 = parseFloat(lineFields[4]);
        var z1 = parseFloat(lineFields[5]);
        unorderedNormals.add(x1, y1, z1);
        var x2 = parseFloat(lineFields[6]);
        var y2 = parseFloat(lineFields[7]);
        var z2 = parseFloat(lineFields[8]);
        unorderedNormals.add(x2, y2, z2);
        
      }
      
    }
    
  }
  
  // now we have
  // a) a sequence of points
  // b) a sequence of normals (if applicable)
  // c) an ordered array of indices
  
  // we can now order the points and normals according to the indices
  // and create the points and normals for our X.object
  var j = 0;
  var length = geometryIndexes.length;
  for (j = 0; j < length; j++) {
    
    var currentIndex = geometryIndexes[j];
    
    // grab the point with the currentIndex
    var currentPoint = unorderedPoints.get(currentIndex);
    
    // .. and add it
    p.add(currentPoint[0], currentPoint[1], currentPoint[2]);
    
    // grab the normal with the currentIndex
    if (j < unorderedNormals.count()) {
      var currentNormals = unorderedNormals.get(currentIndex);
      
      // .. and them
      n.add(currentNormals[0], currentNormals[1], currentNormals[2]);
      n.add(currentNormals[0], currentNormals[1], currentNormals[2]);
      n.add(currentNormals[0], currentNormals[1], currentNormals[2]);
      
    }
    
  }
  
  // set the rendering type
  object.setType(geometryType);
  
  // the object should be set up
  
  console.log(object);
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};


/**
 * Parses a line of .STL data and modifies the given X.triplets containers.
 * 
 * @param {!X.triplets} p The object's points as a X.triplets container.
 * @param {!X.triplets} n The object's normals as a X.triplets container.
 * @param {!String} line The line to parse.
 * @protected
 */
X.parserSTL.prototype.parseLine = function(p, n, line) {

  // trim the line
  line = line.replace(/^\s+|\s+$/g, '');
  
  // split to array
  var lineFields = line.split(' ');
  
  if (lineFields[0] == 'vertex') {
    
    // add point
    var x = parseFloat(lineFields[1]);
    var y = parseFloat(lineFields[2]);
    var z = parseFloat(lineFields[3]);
    p.add(x, y, z);
    
  } else if (lineFields[0] == 'facet') {
    
    // add normals
    var x = parseFloat(lineFields[2]);
    var y = parseFloat(lineFields[3]);
    var z = parseFloat(lineFields[4]);
    n.add(x, y, z);
    n.add(x, y, z);
    n.add(x, y, z);
    
  }
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserSTL', X.parserSTL);
goog.exportSymbol('X.parserSTL.prototype.parse', X.parserSTL.prototype.parse);
goog.exportSymbol('X.parserSTL.prototype.parseLine',
    X.parserSTL.prototype.parseLine);
