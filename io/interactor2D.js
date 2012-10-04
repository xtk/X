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

goog.provide('X.interactor2D');

// requires
goog.require('X.interactor');
goog.require('X.event.ScrollEvent');



/**
 * Create a 2D interactor for a given element in the DOM tree.
 * 
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @extends X.interactor
 */
X.interactor2D = function(element) {

  //
  // call the standard constructor of X.base
  goog.base(this, element);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'interactor2D';
  
};
// inherit from X.base
goog.inherits(X.interactor2D, X.interactor);


/**
 * @inheritDoc
 */
X.interactor2D.prototype.onMouseWheel_ = function(event) {

  goog.base(this, 'onMouseWheel_', event);
  
  // create a new scroll event
  //
  // the scroll event triggers scrolling through the slices in a 2D renderer. we
  // can not use the zoom event here since we also zoom on right click.
  var e = new X.event.ScrollEvent();
  
  // make sure, deltaY is defined
  if (!goog.isDefAndNotNull(event.deltaY)) {
    event.deltaY = 0;
  }
  
  // set the scroll direction
  // true if up, false if down
  // delta is here given by the event
  e._up = (event.deltaY < 0);
  
  // .. fire the event
  this.dispatchEvent(e);
  
};


/**
 * @inheritDoc
 */
X.interactor2D.prototype.onTouchMove_ = function(_event) {

  var _fingers = goog.base(this, 'onTouchMove_', _event);
  
  if (_fingers.length == 1) {
    
    // 1 finger moving
    var finger1 = _fingers[0];
    
    this._touchPosition = [finger1.clientX, finger1.clientY];
    
    var currentTouchPosition = new goog.math.Vec2(this._touchPosition[0],
        this._touchPosition[1]);
    
    var _right_quarter = this._touchPosition[0] > this._element.clientWidth * 3 / 4;
    var _left_quarter = this._touchPosition[0] < this._element.clientWidth / 4;
    var _top_quarter = this._touchPosition[1] < this._element.clientHeight / 4;
    var _bottom_quarter = this._touchPosition[1] > this._element.clientHeight * 3 / 4;
    var _middle = !_right_quarter && !_left_quarter && !_top_quarter &&
        !_bottom_quarter;
    
    var distance = this._lastTouchPosition.subtract(currentTouchPosition);
    
    // store the last touch position
    this._lastTouchPosition = currentTouchPosition.clone();
    

    if (this._touchHovering) {
      
      // we are in hovering mode, so let's pan
      
      // create a new pan event
      var e = new X.event.PanEvent();
      
      // panning in general moves pretty fast, so we threshold the distance
      // additionally
      if (distance.x > 5) {
        
        distance.x = 5;
        
      } else if (distance.x < -5) {
        
        distance.x = -5;
        
      }
      if (distance.y > 5) {
        
        distance.y = 5;
        
      } else if (distance.y < -5) {
        
        distance.y = -5;
        
      }
      
      // attach the distance vector
      e._distance = distance;
      
      // .. fire the event
      this.dispatchEvent(e);
      
    } else {
      
      // no hovering mode so let's either scroll through the slices
      // or window/level
      
      if (_right_quarter || _left_quarter) {
        
        // scrolling
        
        // distance.y > 0 for up
        // distance.y < 0 for down
        var e = new X.event.ScrollEvent();
        
        e._up = (distance.y < 0);
        
        this.dispatchEvent(e);
        
      } else if (_middle) {
        
        // window/level (2e camera listens for rotate events)
        
        // create a new rotate event
        var e = new X.event.RotateEvent();
        
        // attach the distance vector
        e._distance = distance;
        
        // .. fire the event
        this.dispatchEvent(e);
        
      }
      
    }
    
  } else if (_fingers.length == 2) {
    
    // 2 fingers moving
    var finger1 = _fingers[0];
    var finger2 = _fingers[1];
    
    this._touchPosition1 = [finger1.clientX, finger1.clientY];
    this._touchPosition2 = [finger2.clientX, finger2.clientY];
    
    var currentTouchPosition1 = new goog.math.Vec2(this._touchPosition1[0],
        this._touchPosition1[1]);
    var currentTouchPosition2 = new goog.math.Vec2(this._touchPosition2[0],
        this._touchPosition2[1]);
    
    var distance = goog.math.Vec2.squaredDistance(currentTouchPosition1,
        currentTouchPosition2);
    
    var distanceChange = distance - this._lastDistance;
    
    this._lastDistance = distance;
    
    distance = this._lastTouchPosition.subtract(currentTouchPosition1);
    
    // store the last touch position
    this._lastTouchPosition = currentTouchPosition1.clone();
    

    if (Math.abs(distanceChange) > 10) {
      
      // create a new zoom event
      var e = new X.event.ZoomEvent();
      
      // set the zoom direction
      // true if zooming in, false if zooming out
      e._in = (distanceChange > 0);
      
      // with the right click, the zoom will happen rather
      // fine than fast
      e._fast = false;
      
      // .. fire the event
      this.dispatchEvent(e);
      
    }
    
  }
  
};
