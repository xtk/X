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
goog.provide('X.camera2D');

// requires
goog.require('X.camera');


/**
 * Create a 2D camera.
 * 
 * @constructor
 * @param {number} width The width of the camera's viewport.
 * @param {number} height The height of the camera's viewport.
 * @extends X.camera
 */
X.camera2D = function(width, height) {

  //
  // call the standard constructor of X.base
  goog.base(this, width, height);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'camera2D';
  
  this._window = 0;
  this._level = 0;
  
};
// inherit from X.base
goog.inherits(X.camera2D, X.camera);


/**
 * @inheritDoc
 */
X.camera2D.prototype.rotate = function(distance) {
  
  console.log(distance.x,distance.y);
  
  if (distance.x > 0) {
    
    // shrink window
    
  } else if(distance.x < 0) {
    
    // expand window
    
  }
  
  if (distance.y > 0) {
    
    // increase level
    this._level++;
    
  } else if(distance.y < 0) {
    
    // decrease level
    this._level--;
    
  }
  
};