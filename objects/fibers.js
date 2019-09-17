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
 *
 * 
 * 
 */

// provides
goog.provide('X.fibers');

// requires
goog.require('X.object');



/**
 * Create fibers. Fibers are displayable objects and can be loaded from a file.
 * 
 * @constructor
 * @extends X.object
 * @mixin X.loadable
 */
X.fibers = function() {

  //
  // call the standard constructor of X.object
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'fibers';
  
  // inject functionality
  inject(this, new X.loadable()); // this object is loadable from a file
  
};
// inherit from X.object
goog.inherits(X.fibers, X.object);

// export symbols (required for advanced compilation)
goog.exportSymbol('X.fibers', X.fibers);
