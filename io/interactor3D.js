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

goog.provide('X.interactor3D');

// requires
goog.require('X.interactor');



/**
 * Create a 3D interactor for a given element in the DOM tree.
 * 
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @extends X.interactor
 */
X.interactor3D = function(element) {

  //
  // call the standard constructor of X.base
  goog.base(this, element);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'interactor3D';
  
};
// inherit from X.base
goog.inherits(X.interactor3D, X.interactor);


/**
 * @inheritDoc
 */
X.interactor3D.prototype.onMouseWheel_ = function(event) {

  goog.base(this, 'onMouseWheel_', event);
  
  // create a new zoom event
  var e = new X.event.ZoomEvent();
  
  // make sure, deltaY is defined
  if (!goog.isDefAndNotNull(event.deltaY)) {
    event.deltaY = 0;
  }
  
  // set the zoom direction
  // true if zooming in, false if zooming out
  // delta is here given by the event
  e._in = (event.deltaY < 0);
  
  // with the mouseWheel, the zoom will happen rather
  // fast than fine
  e._fast = true;
  
  // .. fire the event
  this.dispatchEvent(e);
  
};


/**
 * @inheritDoc
 */
X.interactor3D.prototype.onTouchMove_ = function(_event) {

  var _fingers = goog.base(this, 'onTouchMove_', _event);
  
  if (_fingers.length == 1) {
    
    // 1 finger moving
    var finger1 = _fingers[0];
    
    this._touchPosition = [finger1.clientX, finger1.clientY];
    
    var currentTouchPosition = new goog.math.Vec2(this._touchPosition[0],
        this._touchPosition[1]);
    
    var distance = this._lastTouchPosition.subtract(currentTouchPosition);
    
    // store the last touch position
    this._lastTouchPosition = currentTouchPosition.clone();
    
    // create a new rotate event
    var e = new X.event.RotateEvent();
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    
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
    

    if (distanceChange == 0) {
      
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
      
      // create a new zoom event
      var e = new X.event.ZoomEvent();
      
      // set the zoom direction
      // true if zooming in, false if zooming out
      e._in = (distanceChange > 0);
      
      // with the right click, the zoom will happen rather
      // fine than fast
      e._fast = true;
      
      // .. fire the event
      this.dispatchEvent(e);
      
    }
    


  }
  
};
