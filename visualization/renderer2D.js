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
X.renderer2D = function(container, orientation) {

  /**
   * @inheritDoc
   * @const
   */
  this._className = this._className || 'renderer2D';  
  
  //
  // call the standard constructor of X.renderer
  goog.base(this, container);
  
  //
  // class attributes
  
  /**
   * The orientation of this renderer.
   * 
   * @type {string}
   * @protected
   */
  this['orientation'] = orientation;
  
  /**
   * A frame buffer for slice data.
   * 
   * @type {?Element}
   * @protected
   */
  this.frameBuffer = null;
  
  /**
   * The rendering context of the slice frame buffer.
   * 
   * @type {?Object}
   * @protected
   */
  this.frameBufferContext = null;
  
  /**
   * A frame buffer for label data.
   * 
   * @type {?Element}
   * @protected
   */
  this.labelFrameBuffer = null;
  
  /**
   * The rendering context of the label frame buffer.
   * 
   * @type {?Object}
   * @protected
   */
  this.labelFrameBufferContext = null;
  
  /**
   * The current slice width.
   * 
   * @type {number}
   * @protected
   */
  this.sliceWidth = 0;
  
  /**
   * The current slice height.
   * 
   * @type {number}
   * @protected
   */
  this.sliceHeight = 0;
  
};
// inherit from X.base
goog.inherits(X.renderer2D, X.renderer);


/**
 * Overload this function to execute code after scrolling has completed and just
 * before the next rendering call.
 * 
 * @public
 */
X.renderer2D.prototype.onScroll = function() {

  // do nothing
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.onScroll_ = function(event) {

  goog.base(this, 'onScroll_', event);
  
  // grab the current volume
  var _volume = this.topLevelObjects[0];
  // .. if there is none, exist right away
  if (!_volume) {
    return;
  }
  
  // switch between different orientations
  var _orientation = this['orientation'];
  var _dimIndex = 0; // for X
  if (_orientation == 'Y') {
    _dimIndex = 1;
  } else if (_orientation == 'Z') {
    _dimIndex = 2;
  }
  
  if (event._up) {
    
    // check if we are in the bounds
    if (_volume['_index' + _orientation] < _volume._dimensions[_dimIndex] - 1) {
      
      // yes, scroll up
      _volume['_index' + _orientation] = _volume['_index' + _orientation] + 1;
      
    }
    
  } else {
    
    // check if we are in the bounds
    if (_volume['_index' + _orientation] > 0) {
      
      // yes, so scroll down
      _volume['_index' + _orientation] = _volume['_index' + _orientation] - 1;
      
    }
    
  }
  
  _volume.modified();
  
  // execute the callback
  eval('this.onScroll(event);');
  
  // .. and trigger re-rendering
  this.render_(false, false);
  
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.init = function() {

  // call the superclass' init method
  goog.base(this, 'init', '2d');
  
  // use the background color of the container by setting transparency here
  this.context.fillStyle = "rgba(0,0,0,0)";
  // .. and size
  this.context.fillRect(0, 0, this['width'], this['height']);
  
  // create an invisible canvas as a framebuffer
  this.frameBuffer = goog.dom.createDom('canvas');
  this.labelFrameBuffer = goog.dom.createDom('canvas');
  //
  // 
  // try to apply nearest-neighbor interpolation -> does not work right now
  // so we ignore it
  // this.labelFrameBuffer.style.imageRendering = 'optimizeSpeed';
  // this.labelFrameBuffer.style.imageRendering = '-moz-crisp-edges';
  // this.labelFrameBuffer.style.imageRendering = '-o-crisp-edges';
  // this.labelFrameBuffer.style.imageRendering = '-webkit-optimize-contrast';
  // this.labelFrameBuffer.style.imageRendering = 'optimize-contrast';
  // this.labelFrameBuffer.style.msInterpolationMode = 'nearest-neighbor';
  
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.resetViewAndRender = function() {

  // call the super class
  goog.base(this, 'resetViewAndRender');
  
  // .. and perform auto scaling
  this.autoScale_();
  // .. render
  this.render_(false, false);
  
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  goog.base(this, 'update_', object);
  
  // check if object already existed..
  var existed = false;
  
  if (this.get(object._id)) {
    // this means, we are updating
    existed = true;
    
  }
  
  // var id = object._id;
  // var texture = object._texture;
  var file = object._file;
  var labelMap = object._labelMap; // here we access directly since we do not
  // want to create one using the labelMap() singleton accessor
  var colorTable = object._colorTable;
  
  //
  // LABEL MAP
  //
  if (goog.isDefAndNotNull(labelMap) && goog.isDefAndNotNull(labelMap._file) &&
      labelMap._file._dirty) {
    // a labelMap file is associated to this object and it is dirty..
    // background: we always want to parse label maps first
    
    // run the update_ function on the labelMap object
    this.update_(labelMap);
    
    // jump out
    return;
    
  }
  
  //
  // COLOR TABLE
  //
  if (goog.isDefAndNotNull(colorTable) &&
      goog.isDefAndNotNull(colorTable._file) && colorTable._file._dirty) {
    // a colorTable file is associated to this object and it is dirty..
    
    // start loading
    this.loader.loadColorTable(object);
    
    return;
    
  }
  
  //
  // VOLUME
  //
  if (goog.isDefAndNotNull(file) && file._dirty) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this.loader.loadFile(object);
    
    return;
    
  }
  
  //
  // at this point the orientation of this renderer might have changed so we
  // should recalculate all the cached values
  
  var _sliceWidth = 0;
  var _sliceHeight = 0;
  var _dimensions = object._dimensions;
  
  // check the orientation and store a pointer to the slices
  if (this['orientation'] == 'X') {
    
    this.slices = object._slicesX.children();
    _sliceWidth = _dimensions[2];
    _sliceHeight = _dimensions[1];
    
  } else if (this['orientation'] == 'Y') {
    
    this.slices = object._slicesY.children();
    _sliceWidth = _dimensions[0];
    _sliceHeight = _dimensions[2];
    
  } else if (this['orientation'] == 'Z') {
    
    this.slices = object._slicesZ.children();
    _sliceWidth = _dimensions[0];
    _sliceHeight = _dimensions[1];
    
  }
  
  if (this['orientation'] == 'X') {
    
    // the X oriented texture is twisted ..
    var _newSliceWidth = _sliceHeight;
    _sliceHeight = _sliceWidth;
    _sliceWidth = _newSliceWidth;
    
  }
  // .. and store the dimensions
  this.sliceWidth = _sliceWidth;
  this.sliceHeight = _sliceHeight;
  
  // update the invisible canvas to store the current slice
  var _frameBuffer = this.frameBuffer;
  _frameBuffer.width = _sliceWidth;
  _frameBuffer.height = _sliceHeight;
  var _frameBuffer2 = this.labelFrameBuffer;
  _frameBuffer2.width = _sliceWidth;
  _frameBuffer2.height = _sliceHeight;
  // .. and the context
  this.frameBufferContext = _frameBuffer.getContext('2d');
  this.labelFrameBufferContext = _frameBuffer2.getContext('2d');
  


  // do the following only if the object is brand-new
  if (!existed) {
    this.objects.add(object);
    this.autoScale_();
  }
  
};


/**
 * Adjust the zoom (scale) to best fit the current slice.
 */
X.renderer2D.prototype.autoScale_ = function() {

  // let's auto scale for best fit
  var _wScale = this['width'] / this.sliceWidth;
  var _hScale = this['height'] / this.sliceHeight;
  
  var _autoScale = Math.min(_wScale, _hScale);
  _autoScale = 10 * _autoScale - 10;
  
  // propagate scale (zoom) to the camera
  var _view = this['camera']['view'];
  _view.setValueAt(2, 3, _autoScale);
  
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.render_ = function(picking, invoked) {

  // call the update_ method of the superclass
  goog.base(this, 'render_', picking, invoked);
  
  // only proceed if there are actually objects to render
  var _objects = this.objects.values();
  var _numberOfObjects = _objects.length;
  if (_numberOfObjects == 0) {
    // there is nothing to render
    // get outta here
    return;
  }
  
  //
  // grab the camera settings
  //
  
  // viewport size
  var _width = this['width'];
  var _height = this['height'];
  
  // first grab the view matrix which is 4x4 in favor of the 3D renderer
  var _view = this['camera']['view'];
  
  // clear the canvas
  this.context.save();
  this.context.clearRect(-_width, -_height, 2 * _width, 2 * _height);
  this.context.restore();
  
  // transform the canvas according to the view matrix
  var _x = 1 * _view.getValueAt(0, 3);
  var _y = -1 * _view.getValueAt(1, 3); // we need to flip y here
  // .. this includes zoom
  var _normalizedScale = Math.max(1 + _view.getValueAt(2, 3) / 10, 0.6);
  this.context.setTransform(_normalizedScale, 0, 0, _normalizedScale, _x, _y);
  

  //
  // grab the volume and current slice
  //
  var _volume = this.topLevelObjects[0];
  var _currentSlice = _volume['_index' + this['orientation']];
  
  // .. here is the current slice
  var _slice = this.slices[parseInt(_currentSlice, 10)];
  var _sliceData = _slice._texture._rawData;
  var _currentLabelMap = _slice._labelMap;
  var _labelData = null;
  if (_currentLabelMap) {
    _labelData = _currentLabelMap._rawData;
  }
  var _sliceWidth = this.sliceWidth;
  var _sliceHeight = this.sliceHeight;
  
  // canvas center, taking zooming and panning in account
  var _canvasCenterX = (1 / (_normalizedScale * 2)) *
      (_width - _sliceWidth * _normalizedScale) + _x;
  var _canvasCenterY = (1 / (_normalizedScale * 2)) *
      (_height - _sliceHeight * _normalizedScale) + _y;
  

  //
  // FRAME BUFFERING
  //  
  var _imageFBContext = this.frameBufferContext;
  var _labelFBContext = this.labelFrameBufferContext;
  
  // grab the current pixels
  var _imageData = _imageFBContext
      .getImageData(0, 0, _sliceWidth, _sliceHeight);
  var _labelMapData = _labelFBContext.getImageData(0, 0, _sliceWidth,
      _sliceHeight);
  var _pixels = _imageData.data;
  var _labelPixels = _labelMapData.data;
  var _pixelsLength = _pixels.length;
  
  // threshold values
  var _maxScalarRange = _volume.scalarRange()[1];
  var _lowerThreshold = _volume['_lowerThreshold'];
  var _upperThreshold = _volume['_upperThreshold'];
  

  // loop through the pixels and draw them to the invisible canvas
  // from bottom right up
  // also apply thresholding
  var _index = 0;
  do {
    
    // default color and label is just transparent
    var _color = [0, 0, 0, 0];
    var _label = [0, 0, 0, 0];
    
    // grab the pixel intensity
    var _intensity = _sliceData[_index] / 255 * _maxScalarRange;
    
    // apply thresholding
    if (_intensity >= _lowerThreshold && _intensity <= _upperThreshold) {
      
      // current intensity is inside the threshold range so use the real
      // intensity
      _color = [_sliceData[_index], _sliceData[_index + 1],
                _sliceData[_index + 2], _sliceData[_index + 3]];
      
      if (_currentLabelMap) {
        
        // we have a label map here
        _label = [_labelData[_index], _labelData[_index + 1],
                  _labelData[_index + 2], _labelData[_index + 3]];
        
      }
      
    }
    
    var _invertedIndex = (_pixelsLength - 1 - _index);
    
    _pixels[_invertedIndex - 3] = _color[0]; // r
    _pixels[_invertedIndex - 2] = _color[1]; // g
    _pixels[_invertedIndex - 1] = _color[2]; // b
    _pixels[_invertedIndex] = _color[3]; // a
    

    _labelPixels[_invertedIndex - 3] = _label[0]; // r
    _labelPixels[_invertedIndex - 2] = _label[1]; // g
    _labelPixels[_invertedIndex - 1] = _label[2]; // b
    _labelPixels[_invertedIndex] = _label[3]; // a
    

    _index = _index + 4; // increase by 4 units for r,g,b,a
    
  } while (_index < _pixelsLength);
  
  // store the generated image data to the frame buffer context
  _imageFBContext.putImageData(_imageData, 0, 0);
  _labelFBContext.putImageData(_labelMapData, 0, 0);
  


  //
  // the actual drawing (rendering) happens here
  //
  
  // draw the slice frame buffer (which equals the slice data) to the main
  // context
  this.context.globalAlpha = 1.0; // draw fully opaque
  this.context.drawImage(this.frameBuffer, _canvasCenterX, _canvasCenterY);
  
  // draw the labels with a configured opacity
  if (_currentLabelMap && _volume._labelMap['_visible']) {
    
    var _labelOpacity = _volume._labelMap['_opacity'];
    
    this.context.globalAlpha = _labelOpacity; // draw transparent depending on
    // opacity
    this.context.drawImage(this.labelFrameBuffer, _canvasCenterX,
        _canvasCenterY);
  }
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer2D', X.renderer2D);
goog.exportSymbol('X.renderer2D.prototype.init', X.renderer2D.prototype.init);
goog.exportSymbol('X.renderer2D.prototype.add', X.renderer2D.prototype.add);
goog.exportSymbol('X.renderer2D.prototype.onShowtime',
    X.renderer2D.prototype.onShowtime);
goog.exportSymbol('X.renderer2D.prototype.onScroll',
    X.renderer2D.prototype.onScroll);
goog.exportSymbol('X.renderer2D.prototype.get', X.renderer2D.prototype.get);
goog.exportSymbol('X.renderer2D.prototype.resetViewAndRender',
    X.renderer2D.prototype.resetViewAndRender);
goog.exportSymbol('X.renderer2D.prototype.render',
    X.renderer2D.prototype.render);
goog.exportSymbol('X.renderer2D.prototype.destroy',
    X.renderer2D.prototype.destroy);
