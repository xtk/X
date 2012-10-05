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
goog.provide('X.parserLUT');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');



/**
 * Create a parser for color maps (look-up tables).
 * 
 * @constructor
 * @extends X.parser
 */
X.parserLUT = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserLUT';
  
};
// inherit from X.parser
goog.inherits(X.parserLUT, X.parser);


/**
 * @inheritDoc
 */
X.parserLUT.prototype.parse = function(container, object, data, flag) {

  X.TIMER(this._classname + '.parse');
  
  var colortable = container;
  
  this._data = data;
  
  var _bytes = this.scan('uchar', data.byteLength);
  var _length = _bytes.length;
  
  var _rangeStart = 0;
  
  var i;
  for (i = 0; i < _length; i++) {
    
    if (_bytes[i] == 10) {
      
      // the current byte is a line break
      
      // grab a line
      var line = this.parseChars(_bytes, _rangeStart, i);
      
      _rangeStart = i + 1;
      
      // now we have the line
      
      // trim the line
      line = line.replace(/^\s+|\s+$/g, '');
      
      // ignore comments
      if (line[0] == '#') {
        continue;
      }
      
      // split each line
      var lineFields = line.split(' ');
      
      // filter out multiple blanks
      lineFields = lineFields.filter(function(v) {

        return v != '';
        
      });
      
      // check if we have 6 values
      if (lineFields.length != 6) {
        
        // ignore this line
        continue;
        
      }
      
      // here, we have a valid array containing
      // labelValue, labelName, r, g, b, a
      
      // convert r, g, b, a to the range 0..1 and don't forget to make it a
      // number
      lineFields[2] = parseInt(lineFields[2], 10) / 255; // r
      lineFields[3] = parseInt(lineFields[3], 10) / 255; // g
      lineFields[4] = parseInt(lineFields[4], 10) / 255; // b
      lineFields[5] = parseInt(lineFields[5], 10) / 255; // a
      
      // .. push it
      colortable.add(parseInt(lineFields[0], 10), lineFields[1], lineFields[2],
          lineFields[3], lineFields[4], lineFields[5], 10);
      

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
goog.exportSymbol('X.parserLUT', X.parserLUT);
goog.exportSymbol('X.parserLUT.prototype.parse', X.parserLUT.prototype.parse);
