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
goog.provide('X.animation');

// requires
goog.require('X.object');
goog.require('X.renderer3D');



/**
 * Create an animation container. Animations can hold different X.objects and
 * can run using a specified speed (by default every frame).
 * 
 * @constructor
 * @extends X.object
 */
X.animation = function() {

  //
  // call the standard constructor of X.object
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'animation';

  /**
   * The speed of the animation in FPS.
   * 
   * @type {!number}
   * @protected
   */
  this._speed = 1;
  
  /**
   * The flag indicating a running or paused animation.
   * 
   * @type {!boolean}
   * @protected
   */
  this._active = true;
  
  /**
   * The internal index of the currently shown object.
   * 
   * @type {!number}
   * @protected
   */
  this._currentIndex = 0;
  
  /**
   * The currently shown object.
   * 
   * @type {?X.object}
   * @protected
   */
  this._currentObject = null;
  
  /**
   * The number of painted frames.
   * 
   * @type {!number}
   * @protected
   */
  this._framecount = 0;
  
};
// inherit from X.object
goog.inherits(X.animation, X.object);


/**
 * Get the current speed for this animation. The value indicates
 * how many renderings are needed before jumping to the next
 * step of the animation.
 * 
 * @return {!number} The number of frames between animation steps. 
 */
X.animation.prototype.__defineGetter__('speed', function() {

  return this._speed;
  
});


/**
 * Set the current animation speed as number of frames between
 * each step.
 * 
 * @param {!number} speed The number of frames between animation steps.
 */
X.animation.prototype.__defineSetter__('speed', function(speed) {

  this._speed = speed;
  
});


/**
 * Indicates whether the animation is running or paused.
 * 
 * @return {!boolean} TRUE if the animation is running, FALSE else wise.
 */
X.animation.prototype.__defineGetter__('active', function() {

  return this._active;
  
});


/**
 * Toggle the animations running state.
 * 
 * @param {!boolean} active If set to TRUE, the animation is running, if set to 
 *                   FALSE the animation gets paused.
 */
X.animation.prototype.__defineSetter__('active', function(active) {

  this._active = active;
  
});


/**
 * Add an X.object (or X.volume, X.mesh, X.fibers)
 * to this animation.
 * 
 * @param {!X.object} object The object to add.
 * @public
 */
X.animation.prototype.add = function(object) {
  
  // by default, the object is invisible
  object._visible = false;
  
  this._children.push(object);
  
};


/**
 * Perform the animation by showing/hiding
 * the attached objects sequentially.
 * 
 * @param {!X.renderer3D} renderer3d The 3D renderer holding the animation.
 * @protected
 */
X.animation.prototype.animate = function(renderer3d) {
  
  this._framecount++;  
  
  // first check if we have to re-orient a X.volume
  if (this._currentObject && this._currentObject instanceof X.volume) {
    
    // this is a X.volume so re-orient it
    renderer3d.orientVolume_(this._currentObject);
    
  }  
  
  // check if we hit the speed threshold
  if (this._framecount == this._speed) {
    
    // if yes, do the animation (show/hide)
    // but only if we are active here
    if (!this._active) {
      
      // inactive, so jump out
      return;
      
    }
    
    if (this._currentIndex >= 1) {
      
      // hide the previous object
      this._children[this._currentIndex - 1]._visible = false;
      
    }
    
    // start from the beginning if the animation loop is completed
    if (this._currentIndex > this._children.length - 1) {
      
      this._currentIndex = 0;
      
    }
    
    var _object = this._children[this._currentIndex]; 
    
    // show the current object
    _object._visible = true;
    
    this._currentObject = _object;
    
    // increase the internal index
    this._currentIndex++;
    
    // reset the frame counter
    this._framecount = 0;
    
  }
    
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.animation', X.animation);
goog.exportSymbol('X.animation.prototype.add', X.animation.prototype.add);
