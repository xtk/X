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
goog.provide('X.renderer2D');

// requires
goog.require('X.renderer');


/**
 * Create a 2D renderer inside a given DOM Element.
 * 
 * @constructor
 * @param {!Element} container The container (DOM Element) to place the renderer
 *          inside.
 * @extends X.renderer
 */
X.renderer2D = function(container) {

  //
  // call the standard constructor of X.renderer
  goog.base(this, container);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['className'] = 'renderer2D';
  
};
// inherit from X.base
goog.inherits(X.renderer2D, X.renderer);


/**
 * @inheritDoc
 */
X.renderer2D.prototype.init = function() {

  var contextName = '2d';
  
  // call the superclass' init method
  X.renderer2D.superClass_.init.call(this, contextName);
  
};



X.renderer2D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  X.renderer2D.superClass_.update_.call(this, object);
  
  window.console.log('updating..');
  
  var id = object['_id'];
  var texture = object._texture;
  var file = object._file;
  
  if (goog.isDefAndNotNull(file) && file._dirty) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this.loader.loadFile(object);
    
    return;
    
  }
  
  window.console.log('updating done', object);
  
};

X.renderer2D.prototype.render = function(picking, invoked) {

  // call the update_ method of the superclass
  X.renderer2D.superClass_.render_.call(this, picking, invoked);
  
  // only proceed if there are actually objects to render
  var _objects = this.objects.values();
  var _numberOfObjects = _objects.length;
  if (_numberOfObjects == 0) {
    // there is nothing to render
    // get outta here
    return;
  }
  
  var _pixels = this.context.getImageData(0, 0, this['width'], this['height']);
  
  var children_ = this.topLevelObjects[0]._slicesX.children();
  
  var x = 0;
  setInterval(function() {

    x++;
    if (x >= children_.length) {
      x = 0;
    }
    var _slice = children_[x];
    


    var _newPixels = _slice._texture._rawData;
    
    // for (y = 0; y < _slice._height; y++) {
    // for (x = 0; x < _slice._width; x++) {
    // window.console.log(_pixels.data.length);
    // var index__ = (x + y * _slice._width) * 4;
    for ( var index__ = 0; index__ < _pixels.data.length; index__++) {
      
      _pixels.data[index__] = _newPixels[index__];
      // _pixels.data[index__ + 1] = _newPixels[index__ + 1];
      // _pixels.data[index__ + 2] = _newPixels[index__ + 2];
      // _pixels.data[index__ + 3] = _newPixels[index__ + 3];
      // }
    }
    
    this.context.putImageData(_pixels, 0, 0);
  }.bind(this), 10);
  // window.console.log(_newPixels.length);
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer2D', X.renderer2D);
