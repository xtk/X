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
  this['_className'] = 'parserSTL';
  
};
// inherit from X.parser
goog.inherits(X.parserCRV, X.parser);


/**
 * @inheritDoc
 */
X.parserCRV.prototype.parse = function(object, data) {
		
  var vnum		= fread3(data);
		
  var nvertices	= parseUInt32EndianSwapped(data, 3);
  var nfaces		= parseUInt32EndianSwapped(data, 7);

  console.log(sprintf('%20s = %10d\n', 'MAGIC NUMBER', vnum));
  console.log(sprintf('%20s = %10d\n', 'data size', data.length));
  console.log(sprintf('%20s = %10d\n', 'nvertices', nvertices));
  console.log(sprintf('%20s = %10d\n', 'nfaces', nfaces));
		
  var af_curvVals 	= [];
  var al_ret			= [];
		
  al_ret = parseFloat32EndianSwappedArray(data, 11, nvertices);
  af_curvVals			= al_ret[0];
			
  var f_max			= al_ret[1];
  var f_min			= al_ret[2];
		
  stats_determine(af_curvVals);
  
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};

function fread3(data) {
	
	var b1 = parseUChar8(data, 0);
	var b2 = parseUChar8(data, 1);
	var b3 = parseUChar8(data, 2);

	return (b1 << 16) + (b2 << 8) + b3;
}


// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserCRV', X.parserCRV);
goog.exportSymbol('X.parserCRV.prototype.parse', X.parserCRV.prototype.parse);
