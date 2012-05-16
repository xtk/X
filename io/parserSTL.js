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
goog.provide('X.parserSTL');

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
X.parserSTL = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserSTL';
  
};
// inherit from X.parser
goog.inherits(X.parserSTL, X.parser);


/**
 * @inheritDoc
 */
X.parserSTL.prototype.parse = function(object, data) {

  var dataAsArray = data.split('\n');
  
  var numberOfLines = dataAsArray.length;
  
  var p = object._points;
  var n = object._normals;
  
  //
  // LOOP THROUGH ALL LINES
  //
  // This uses an optimized loop.
  //
  
  //
  // This one is shorter but Fast Duff's Device is slightly faster on average.
  //
  // var i = numberOfLines;
  // do {
  // i--;
  //    
  // this.parseLine_(p, n, dataAsArray[i]);
  //    
  // } while (i > 0);
  

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
    this.parseLine(p, n, dataAsArray[i]);
    i++;
  }
  
  n2 = (numberOfLines * 0.125) ^ 0;
  while (n2--) {
    this.parseLine(p, n, dataAsArray[i]);
    i++;
    this.parseLine(p, n, dataAsArray[i]);
    i++;
    this.parseLine(p, n, dataAsArray[i]);
    i++;
    this.parseLine(p, n, dataAsArray[i]);
    i++;
    this.parseLine(p, n, dataAsArray[i]);
    i++;
    this.parseLine(p, n, dataAsArray[i]);
    i++;
    this.parseLine(p, n, dataAsArray[i]);
    i++;
    this.parseLine(p, n, dataAsArray[i]);
    i++;
  }
  
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
};


/**
 * Parses a line of .STL data and modifies the given X.triplets containers.
 * 
 * @param {!X.triplets} p The object's points as a X.triplets container.
 * @param {!X.triplets} n The object's normals as a X.triplets container.
 * @param {!string} line The line to parse.
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
