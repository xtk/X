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

  dataptr	= new dobj(data, this.parseUInt32EndianSwappedArray, this._sizeof_int);
  dataptr.b_verbose(false);
  b1			= dataptr.read();
  b2			= dataptr.read();
  b3			= dataptr.read();
  
  var vnum		= this.fread3(data);
		
  var nvertices		= this.parseUInt32EndianSwapped(data, 3);
  var nvertices		= dstream.read();
  var nfaces		= this.parseUInt32EndianSwapped(data, 7);
  var nvalsPerVertex= this.parseUInt32EndianSwapped(data, 11);

  var af_curvVals 	= [];
  var al_ret		= [];
		
  al_ret 			= this.parseFloat32EndianSwappedArray(data, 15, nvertices);
  af_curvVals		= al_ret[0];
  
  var f_max			= al_ret[1];
  var f_min			= al_ret[2];

  object.curvVals 	= af_curvVals;
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserCRV', X.parserCRV);
goog.exportSymbol('X.parserCRV.prototype.parse', X.parserCRV.prototype.parse);
