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
goog.provide('X.parserOBJ');

// requires
goog.require('X.event');
goog.require('X.object');
goog.require('X.parser');
goog.require('X.triplets');

/**
 * Create a parser for the .OBJ format. ASCII or binary format is supported.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserOBJ = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserOBJ';
  
};
// inherit from X.parser
goog.inherits(X.parserOBJ, X.parser);


/**
 * @inheritDoc
 */
X.parserOBJ.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  this._data = data;
  var _length = data.byteLength;
  var byteData = this.scan('uchar', _length);

  // allocate memory using a good guess
  var _pts = [];
  object._points = new X.triplets(_length);
  object._normals = new X.triplets(_length);
  var p = object._points;
  var n = object._normals;
  
  // store the beginning of the byte range
  var _rangeStart = 0;
 
  var i;
  for (i = 0; i < _length; ++i) {
     
     if (byteData[i] == 10) { // line break

       var _substring = this.parseChars(byteData, _rangeStart, i);
       
       var _d = _substring.replace(/\s{2,}/g, ' ').split(' ');

       if (_d[0] == "v") {

         // grab the x, y, z coordinates
         var x = parseFloat(_d[1]);
         var y = parseFloat(_d[2]);
         var z = parseFloat(_d[3]);
         _pts.push([x,y,z]);

       } else if (_d[0] == "f") {

         // assumes all points have been read
         var p1 = _pts[parseInt(_d[1], 10)-1];
         var p2 = _pts[parseInt(_d[2], 10)-1];
         var p3 = _pts[parseInt(_d[3], 10)-1];
     
         p.add(p1[0], p1[1], p1[2]);
         p.add(p2[0], p2[1], p2[2]);
         p.add(p3[0], p3[1], p3[2]);
     
         // calculate normal
         var v1 = new goog.math.Vec3(p1[0], p1[1], p1[2]);
         var v2 = new goog.math.Vec3(p2[0], p2[1], p2[2]);
         var v3 = new goog.math.Vec3(p3[0], p3[1], p3[2]);
         var norm = goog.math.Vec3.cross(v2.subtract(v1),v3.subtract(v1));
         norm.normalize();
         n.add(norm.x, norm.y, norm.z);
         n.add(norm.x, norm.y, norm.z);
         n.add(norm.x, norm.y, norm.z);

       }

       _rangeStart = i+1; // skip the newline character

     }
  
  }

  X.TIMERSTOP(this._classname + '.parse');
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserOBJ', X.parserOBJ);
goog.exportSymbol('X.parserOBJ.prototype.parse', X.parserOBJ.prototype.parse);
