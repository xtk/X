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
goog.require('X.array');
goog.require('X.base');
goog.require('X.loader');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');


/**
 * Create a 2D renderer inside a given DOM Element.
 * 
 * @constructor
 * @param {!Element} container The container (DOM Element) to place the renderer
 *          inside.
 * @extends X.base
 */
X.renderer2D = function(container) {

  // check if a container is passed
  if (!goog.isDefAndNotNull(container)) {
    
    throw new Error('An ID to a valid container (<div>..) is required.');
    
  }
  
  // check if the passed container is really valid
  var _container = goog.dom.getElement(container);
  
  if (!goog.dom.isElement(_container) || _container.clientWidth == 0 ||
      _container.clientHeight == 0) {
    
    throw new Error(
        'Could not find the given container or it has an undefined size.');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'renderer2D';
  
  /**
   * The HTML container of this renderer, E.g. a <div>.
   * 
   * @type {!Element}
   * @public
   */
  this['container'] = _container;
  
  /**
   * The width of this renderer.
   * 
   * @type {!number}
   * @public
   */
  this['width'] = this['container'].clientWidth;
  
  /**
   * The height of this renderer.
   * 
   * @type {!number}
   * @public
   */
  this['height'] = this['container'].clientHeight;
  
  /**
   * The Canvas of this renderer.
   * 
   * @type {?Element}
   * @public
   */
  this['canvas'] = null;
  
  /**
   * An X.array containing the displayable objects of this renderer. The object
   * reflects the rendering order for the associated objects.
   * 
   * @type {!X.array}
   * @protected
   */
  this._objects = new X.array(X.object.OPACITY_COMPARATOR);
  
  /**
   * An array containing the topLevel objects (which do not have parents) of
   * this renderer.
   * 
   * @type {!Array}
   * @protected
   */
  this._topLevelObjects = new Array();
  
  /**
   * The loader associated with this renderer.
   * 
   * @type {?X.loader}
   * @protected
   */
  this._loader = null;
  
  /**
   * A flag to show if the initial loading was completed.
   * 
   * @type {boolean}
   * @public
   */
  this['initialLoadingCompleted'] = false;
  
  /**
   * The progressBar of this renderer.
   * 
   * @type {?X.progressbar}
   * @protected
   */
  this._progressBar = null;
  
  /**
   * The rendering context of this renderer.
   * 
   * @type {?Object}
   * @protected
   */
  this._context = null;
  
  window.window.console
      .log('XTK Release 4 -- 04/12/12 -- http://www.goXTK.com');
  
};
// inherit from X.base
goog.inherits(X.renderer2D, X.base);


/**
 * The callback for X.event.events.MODIFIED events which re-configures the
 * object for rendering. This does not trigger re-rendering.
 * 
 * @param {!X.event.ModifiedEvent} event The modified event pointing to the
 *          modified object.
 */
X.renderer2D.prototype.onModified = function(event) {

  if (goog.isDefAndNotNull(event) && event instanceof X.event.ModifiedEvent) {
    
    this.update_(event._object);
    
  }
  
};


X.renderer2D.prototype.init = function() {

  // get the canvas
  var canvas = goog.dom.createDom('canvas');
  
  // width and height can not be set using CSS but via object properties
  canvas.width = this['width'];
  canvas.height = this['height'];
  
  //
  // append it to the container
  goog.dom.appendChild(this['container'], canvas);
  

  // --------------------------------------------------------------------------
  //
  // WebGL Viewport initialization
  //
  
  //
  // Step1: Get Context of canvas
  //
  try {
    
    var context = canvas.getContext('2d');
    
    if (!context) {
      
      throw new Error();
      
    }
    
  } catch (e) {
    
    // Canvas2D is not supported with this browser/machine/gpu
    
    // attach a message to the container's inner HTML
    var style = "color:red;font-family:sans-serif;";
    var msg = 'Sorry, Canvas is <strong>not supported</strong> on this machine! See <a href="http://crash.goXTK.com" target="_blank">http://crash.goXTK.com</a> for requirements..';
    this.container().innerHTML = '<h3 style="' + style +
        '">Oooops..</h3><p style="' + style + '">' + msg + '</p>';
    
    // .. and throw an exception
    throw new Error(msg);
    
  }
  
  //
  // Step2: Configure the context
  //
  try {
    
  } catch (e) {
    
    // this exception indicates if the browser supports WebGL
    throw new Error('Exception while accessing the rendering context!\n' + e);
    
  }
  
  this._loader = new X.loader();
  
  // listen to a progress event which gets fired during loading whenever
  // progress was made
  // goog.events.listen(this._loader, X.event.events.PROGRESS, this.onProgress
  // .bind(this));
  
  this['canvas'] = canvas;
  this._context = context;
  
};

X.renderer2D.prototype.add = function(object) {

  // we know that objects which are directly added using this function are def.
  // top-level objects, meaning that they do not have a parent
  this._topLevelObjects.push(object);
  
  this.update_(object);
  
};

X.renderer2D.prototype.update_ = function(object) {

  if (!goog.isDefAndNotNull(this['canvas']) ||
      !goog.isDefAndNotNull(this._context)) {
    
    throw new Error('Renderer was not initialized properly.');
    
  }
  
  if (!goog.isDefAndNotNull(object)) {
    window.window.console.log(object);
    throw new Error('Illegal object.');
    
  }
  
  // listen to modified events of this object, if we didn't do that before
  if (!goog.events.hasListener(object, X.event.events.MODIFIED)) {
    
    goog.events.listen(object, X.event.events.MODIFIED, this.onModified
        .bind(this));
    
  }
  
  window.console.log('updating..');
  
  var id = object['_id'];
  var texture = object._texture;
  var file = object._file;
  
  if (goog.isDefAndNotNull(file) && file._dirty) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this._loader.loadFile(object);
    
    return;
    
  }
  
  window.console.log('updating done', object);
  this.render();
};

X.renderer2D.prototype.render = function() {

  var _pixels = this._context.getImageData(0, 0, this['width'], this['height']);
  
  var children_ = this._topLevelObjects[0]._slicesX.children();
  
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
    
    this._context.putImageData(_pixels, 0, 0);
  }.bind(this), 10);
  // window.console.log(_newPixels.length);
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer2D', X.renderer2D);
goog.exportSymbol('X.renderer2D.prototype.init', X.renderer2D.prototype.init);
goog.exportSymbol('X.renderer2D.prototype.add', X.renderer2D.prototype.add);
goog.exportSymbol('X.renderer2D.prototype.render',
    X.renderer2D.prototype.render);
