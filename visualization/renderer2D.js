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
  
  this['orientation'] = orientation;
  
};
// inherit from X.base
goog.inherits(X.renderer2D, X.renderer);


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
  
  // .. and trigger re-rendering
  this.render_(false, false);
  
};


/**
 * @inheritDoc
 */
X.renderer2D.prototype.init = function() {

  // call the superclass' init method
  goog.base(this, 'init', '2d');
  
};



X.renderer2D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  goog.base(this, 'update_', object);
  
  var id = object['_id'];
  var texture = object._texture;
  var file = object._file;
  
  if (goog.isDefAndNotNull(file) && file._dirty) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this.loader.loadFile(object);
    
    return;
    
  }
  
  this.objects.add(object);
  
};

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
  
  // first the view matrix which is 4x4 in favor of the 3D renderer
  var _view = this['camera']['view'];
  
  // ..then the x and y values which are the focus position
  var _focusX = 2 * _view.getValueAt(0, 3); // 2 is an acceleration factor
  var _focusY = -2 * _view.getValueAt(1, 3); // we need to flip y here
  
  // ..then the z value which is the zoom level (distance from eye)
  window.console.log(_focusX, _focusY);
  var _scale = Math.max(_view.getValueAt(2, 3), 0);
  _focusX = _focusX - _scale / 2;
  _focusY = _focusY - _scale / 2;
  
  var _pixels = this.context.getImageData(0, 0, this['width'], this['height']);
  
  var _currentSlice = 0;
  var _volume = this.topLevelObjects[0];
  
  var _children = null;
  
  if (this['orientation'] == 'X') {
    
    _children = _volume._slicesX.children();
    _currentSlice = _volume['_indexX'];
    
  } else if (this['orientation'] == 'Y') {
    
    _children = _volume._slicesY.children();
    _currentSlice = _volume['_indexY'];
    
  } else if (this['orientation'] == 'Z') {
    
    _children = _volume._slicesZ.children();
    _currentSlice = _volume['_indexZ'];
    
  }
  
  var _slice = _children[parseInt(_currentSlice, 10)];
  var _sliceData = _slice._texture._rawData;
  
  var _width = this['width'];
  var _height = this['height'];
  var _sliceWidth = _slice._width + 1;
  var _sliceHeight = _slice._height + 1;
  if (this['orientation'] == 'X') {
    
    // the X oriented texture is twisted ..
    var _newSliceWidth = _sliceHeight;
    _sliceHeight = _sliceWidth;
    _sliceWidth = _newSliceWidth;
    
  }
  

  var _paddingX = ((_width - _sliceWidth) / 2);
  var _paddingY = ((_height - _sliceHeight) / 2);
  var _x, _y = 0;
  var _i = 0; // this is the pointer to the current slice data byte
  
  console.log(_scale, _width);
  
  for (_y = _height; _y >= 0; _y = _y - 1 - _scale) {
    for (_x = _width; _x >= 0; _x = _x - 1 - _scale) {
      
      // the pixel index
      var _pxIndex = _x + _y * _width;
      
      // the r-index is the pixel index * 4 since we have RGBA components
      var _rIndex = _pxIndex * 4;
      
      var _color = [0, 0, 0, 255];
      
      //
      // check if we are in the right area to draw slice data
      //
      var _scaledSliceWidth = _sliceWidth * _scale / 2;
      var _scaledSliceHeight = _sliceHeight * _scale / 2;
      var _scaledPaddingX = _paddingX - _scaledSliceWidth;
      var _scaledPaddingY = _paddingY - _scaledSliceHeight;
      
      if ((_x >= _scaledPaddingX) && (_y >= _scaledPaddingY) &&
          (_x < _width - _scaledPaddingX) && (_y < _height - _scaledPaddingY)) {
        
        // use slice data
        var _currentIntensity = [_sliceData[_i], _sliceData[_i + 1],
                                 _sliceData[_i + 2], _sliceData[_i + 3]];
        
        // grab the real pixel value and the thresholds of the volume
        var _currentPixelValue = _sliceData[_i] / 255 *
            _volume.scalarRange()[1];
        var _lowerThreshold = _volume['_lowerThreshold'];
        var _upperThreshold = _volume['_upperThreshold'];
        

        // apply thresholding
        if (_currentPixelValue >= _lowerThreshold &&
            _currentPixelValue <= _upperThreshold) {
          
          // current intensity is inside the threshold range
          _color = _currentIntensity;
          
        }
        
        _i = _i + 4; // increase the slice data byte pointer no matter if
        // thresholded or not
        
      }
      
      var _j = 0;
      for (_j = 0; _j <= _scale; _j++) {
        var _k = 0;
        for (_k = 0; _k <= _scale; _k++) {
          
          var _position = _rIndex + _k * 4 + _j * 4 * _width;
          
          _pixels.data[_position] = _color[0]; // r
          _pixels.data[_position + 1] = _color[1]; // g
          _pixels.data[_position + 2] = _color[2]; // b
          _pixels.data[_position + 3] = _color[3]; // a
          
        }
        
      }
      
    }
    
  }
  
  // propagate new image data
  this.context.putImageData(_pixels, _focusX, _focusY);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer2D', X.renderer2D);
goog.exportSymbol('X.renderer2D.prototype.init', X.renderer2D.prototype.init);
goog.exportSymbol('X.renderer2D.prototype.add', X.renderer2D.prototype.add);
goog.exportSymbol('X.renderer2D.prototype.onShowtime',
    X.renderer2D.prototype.onShowtime);
goog.exportSymbol('X.renderer2D.prototype.get', X.renderer2D.prototype.get);
goog.exportSymbol('X.renderer2D.prototype.render',
    X.renderer2D.prototype.render);
goog.exportSymbol('X.renderer2D.prototype.destroy',
    X.renderer2D.prototype.destroy);
