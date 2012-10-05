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

/**
 * @inheritDoc
 */
X.parserLBL.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  var ind = object._pointIndices;
  var numberOfIndices = ind.length;
  
  // we need point indices here, so fail if there aren't any
  if (numberOfIndices == 0) {
    
    throw new Error('No _pointIndices defined on the X.object.');
    
  }
  
  //
  // PARSE
  //
  
  // attach the data so we can use the internal scan function
  this._data = data;
  
  // this holds the parsed indices of this label
  var _indices = [];
  
  var _bytes = this.scan('uchar', data.byteLength);
  var _length = _bytes.length;
  
  // scan mode indicates that a new vertex index is coming
  var _scanMode = false;
  // store the start of the vertex index bytes
  var _rangeStart = 0;
  
  var i;
  for (i = 1; i < _length; i++) {
    
    if (_bytes[i - 1] == 10) {
      
      // the last byte was a line break
      // this means, we buffer now until the next space
      _rangeStart = i;
      _scanMode = true;
      
    } else if (_scanMode && _bytes[i] == 32) {
      
      // the current byte is a space
      
      // grab the buffered data as integer
      var _value = parseInt(this.parseChars(_bytes, _rangeStart, i), 10);
      // buffer this value
      _indices.push(_value);
      
      // reset the scan mode
      _scanMode = false;
      
    }
    
  }
  
  //
  // MERGE AND TAG
  //
  
  // Now tag the label vertices. If an existing overlay exists, i.e.
  // object._scalars._array is non-null, then only change the vertex
  // values where the label is defined, otherwise also initialize
  // non-label vertices to zero.
  var _unorderedLabels;
  if (object._scalars._array) {
    
    _unorderedLabels = object._scalars._array;
    
  } else {
    
    _unorderedLabels = new Float32Array(numberOfIndices);
    
  }
  
  var _labelsCount = _indices.length;
  for (i = 0; i < _labelsCount; i++) {
    
    _unorderedLabels[_indices[i]] = 1.0;
    
  }
  
  //
  // ORDER AND STORE
  //
  
  //
  // now order the label values based on the indices
  //
  
  // .. and store the new scalars in a float32array
  var _orderedLabels = new Float32Array(numberOfIndices * 3);
  var _curvaturePointer = 0;
  
  for (i = 0; i < numberOfIndices; i++) {
    
    var currentIndex = ind[i];
    
    // validate
    if (currentIndex > numberOfIndices) {
      
      throw new Error('Could not find scalar for vertex.');
      
    }
    
    // grab the current scalar
    var currentScalar = _unorderedLabels[currentIndex];
    
    // add the scalar 3x since we need to match the point array length
    _orderedLabels[_curvaturePointer++] = currentScalar;
    _orderedLabels[_curvaturePointer++] = currentScalar;
    _orderedLabels[_curvaturePointer++] = currentScalar;
    
  }
  
  object._scalars._array = _unorderedLabels; // the un-ordered scalars
  object._scalars._glArray = _orderedLabels; // the ordered, gl-Ready
  // now mark the scalars dirty
  object._scalars._dirty = true;
  
  X.TIMERSTOP(this._classname + '.parse');
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserLBL', X.parserLBL);
goog.exportSymbol('X.parserLBL.prototype.parse', X.parserLBL.prototype.parse);
