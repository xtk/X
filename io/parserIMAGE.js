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

  if (!(data instanceof ArrayBuffer)) {
    
    throw new Error();
    
  }
  
  // convert data to a byte array
  var bytebuffer = new Uint8Array(data);
  var i = bytebuffer.length;
  
  // create a binary string of the bytebuffer
  var binaryString = new Array(i);
  while (i--) {
    binaryString[i] = String.fromCharCode(bytebuffer[i]);
  }
  var convertedData = binaryString.join('');
  
  // encode the converted binary string
  var encodedData = window.btoa(convertedData);
  
  // create a new image
  var _image = new Image();
  
  // we need to wait until the image is properly set up
  goog.events.listenOnce(_image, goog.events.EventType.LOAD,
      this.parseCompleted.bind(this, _image, container, object, data, flag));
  
  // set the encoded data using a data uri
  _image.src = "data:image/" + flag + ";base64," + encodedData;
  
};


/**
 * The callback which gets called when the image was set up using data uri. We
 * fire the modified event here to tell the X.loader that we are done.
 * 
 * @param {!Image} image The image container.
 * @param {!X.base} container A container which holds the loaded data. This can
 *          be an X.object as well.
 * @param {!X.object} object The object to configure.
 * @param {!ArrayBuffer} data The data to parse.
 * @param {*} flag An additional flag.
 */
X.parserIMAGE.prototype.parseCompleted = function(image, container, object,
    data, flag) {

  // attach the image to the container
  container._image = image;
  
  // if there is any raw data, reset it
  container._rawData = null;
  
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
