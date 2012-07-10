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
 */

// provides
goog.provide('X.parserLBL');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.parserHelper');
goog.require('X.triplets');



/**
 * Create a parser for the text .LBL format of Freesurfer.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserLBL = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserLBL';
  
};
// inherit from X.parser
goog.inherits(X.parserLBL, X.parser);

function cprintd(str_left, val) {
	console.log(sprintf('%20s%25s\n', str_left, sprintf('[ %d ]', val)));
}

function new_array(length, val) {
	val = typeof val !== 'undefined' ? val : 0;
	var array = [];
    var i = 0;
    while (i < length) {
        array[i++] = val;
    }
    return array;
}

/**
 * @inheritDoc
 */
X.parserLBL.prototype.parse = function(container, object, data, flag) {

  var dataAsArray = data.split('\n');
  var numberOfLines = dataAsArray.length;
  var arr_label	= new Array(numberOfLines-3);

  var i = 0;
  var j = 0;
  var vertex = 0;
  
  var numVertices = object._points.count;
  var arr_vertexCurvatures;

  // Start at the 3rd line, i.e. the 2nd index and create an array
  // of vertices that belong to this label
  for(i=2; i<numberOfLines-1; i++, j++) {
	  vertex = this.parseLine(dataAsArray[i]);
	  arr_label[i-2] = vertex;
  }
  
  // Now tag the label vertices. If an existing overlay exists, i.e.
  // object._scalars._array is non-null, then only change the vertex
  // values where the label is defined, otherwise also initialize
  // non-label vertices to zero.
  if(object._scalars._array) {
	  arr_vertexCurvature = object._scalars._array;
  }  else {
	  arr_vertexCurvatures = new_array(numVertices, 0);
  }
  for(i=0; i<arr_label.length; i++) {
	  arr_vertexCurvatures[arr_label[i]] = 1.0;
//	  cprintd(sprintf('%d', i), arr_label[i]);
  }
  
  console.log('j = %d, size arr_label = %d', j, arr_label.length);
  
  var ind = object._pointIndices;
  console.log('size object._pointIndices = %d', ind.length);

  // we need point indices here, so fail if there aren't any
  if (ind.length == 0) {
    
    throw new Error('No _pointIndices defined on the X.object.');
    
  }
   
  //
  // now order the curvature values based on the indices
  //
  var numberOfScalars = numVertices;
  var numberOfIndices = ind.length;
  
  var orderedCurvatures = [];
  
  for (i = 0; i < numberOfIndices; i++) {
    
    var currentIndex = ind[i];
    
    // validate
    if (currentIndex > numberOfScalars) {
      
      throw new Error('Could not find scalar for vertex.');
      
    }
    
    // grab the current scalar
    var currentScalar = arr_vertexCurvatures[currentIndex];
    
    // add the scalar 3x since we need to match the point array length
    orderedCurvatures.push(currentScalar);
    orderedCurvatures.push(currentScalar);
    orderedCurvatures.push(currentScalar);
    
  }
  
  object._scalars._array = arr_vertexCurvatures; // the un-ordered scalars
  object._scalars._glArray = orderedCurvatures; // the ordered, gl-Ready
  // now mark the scalars dirty
  object._scalars._dirty = true;
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};

/**
 * Parses a line of label-file data -- the only important field is the first.
 * 
 * 
 * @param {!string} line to parse.
 * @return {!number} vertex index
 * @protected
 */
X.parserLBL.prototype.parseLine = function(line) {

  // trim the line
  line = line.replace(/^\s+|\s+$/g, '');
  
  // split to array
  var lineFields = line.split(' ');

  // return the vertex index
  return parseInt(lineFields[0]);
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserLBL', X.parserLBL);
goog.exportSymbol('X.parserLBL.prototype.parse', X.parserLBL.prototype.parse);
