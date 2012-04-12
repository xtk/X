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
goog.provide('X.parserCRV');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.parserHelper');
goog.require('X.triplets');



/**
 * Create a parser for the ascii .STL format.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserCRV = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'parserCRV';
  
};
// inherit from X.parser
goog.inherits(X.parserCRV, X.parser);


/**
 * @inheritDoc
 */
X.parserCRV.prototype.parse = function(object, data) {

  var ind = object._pointIndices;
  
  // we need point indices here, so fail if there aren't any
  if (ind.length == 0) {
    
    throw new Error('No _pointIndices defined on the X.object.');
    
  }
  
  var dstream = new X.parserHelper(data);
  dstream
      .setParseFunction(this.parseUChar8Array.bind(this), dstream.sizeOfChar);
  var b1 = dstream.read();
  var b2 = dstream.read();
  var b3 = dstream.read();
  var vnum = (b1 << 16) + (b2 << 8) + b3;
  
  dstream.setParseFunction(this.parseUInt32EndianSwappedArray.bind(this),
      dstream.sizeOfInt);
  var nvertices = dstream.read();
  var nfaces = dstream.read();
  var nvalsPerVertex = dstream.read();
  
  var af_curvVals = [];
  
  dstream.setParseFunction(this.parseFloat32EndianSwappedArray.bind(this),
      dstream.sizeOfFloat);
  af_curvVals = dstream.read(nvertices);
  
  var stats = this.stats_calc(af_curvVals);
  
  object._scalars._min = stats.min;
  object._scalars._max = stats.max;
  object._scalars._array = af_curvVals;
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserCRV', X.parserCRV);
goog.exportSymbol('X.parserCRV.prototype.parse', X.parserCRV.prototype.parse);
