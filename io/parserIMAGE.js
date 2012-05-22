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
goog.provide('X.parserIMAGE');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('goog.crypt.base64');



/**
 * Create a parser for images (PNG/JPG/JPEG/GIF).
 * 
 * @constructor
 * @extends X.parser
 */
X.parserIMAGE = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'parserIMAGE';
  
};
// inherit from X.parser
goog.inherits(X.parserIMAGE, X.parser);


/**
 * @inheritDoc
 */
X.parserIMAGE.prototype.parse = function(container, object, data, flag) {

  var uInt8Array = new Uint8Array(data);
  var i = uInt8Array.length;
  var binaryString = new Array(i);
  while (i--) {
    binaryString[i] = String.fromCharCode(uInt8Array[i]);
  }
  var data = binaryString.join('');
  
  var base64 = window.btoa(data);
  


  // window.URL = window.URL || window.webkitURL; // Take care of vendor
  // prefixes.
  
  // base64 encode the data stream
  // also, apply unicode conversion from
  // https://developer.mozilla.org/en/DOM/window.btoa
  
  // works with blob
  // var _encodedData = window.URL.createObjectURL(data);
  
  // var _encodedData = window.btoa(unescape(encodeURIComponent(data)));//
  // window.URL.createObjectURL(data);//
  // window.btoa(unescape(encodeURIComponent(data)));
  // var _encodedData = encode64(data);// goog.crypt.base64.encodeString(data,
  // true);
  
  // window.console.log(_encodedData);
  
  // create a new image
  var _image = new Image();
  
  // we need to wait until the image is properly set up
  goog.events.listenOnce(_image, goog.events.EventType.LOAD,
      this.parseCompleted.bind(this, _image, container, object, data, flag));
  
  // set the image data via a data url
  _image.src = "data:image/" + flag + ";base64," + base64;
  
  this.parseCompleted(_image, container, object, data, flag);
  
};

X.parserIMAGE.prototype.parseCompleted = function(image, container, object,
    data, flag) {

  // attach the image to the container
  container._image = image;
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserIMAGE', X.parserIMAGE);
goog.exportSymbol('X.parserIMAGE.prototype.parse',
    X.parserIMAGE.prototype.parse);
