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
goog.provide('X.renderer');

// requires
goog.require('X.array');
goog.require('X.base');
goog.require('X.camera');
goog.require('X.camera2D');
goog.require('X.camera3D');
goog.require('X.cube');
goog.require('X.cylinder');
goog.require('X.event');
goog.require('X.interactor');
goog.require('X.interactor2D');
goog.require('X.interactor3D');
goog.require('X.labelmap');
goog.require('X.loader');
goog.require('X.object');
goog.require('X.progressbar');
goog.require('X.sphere');
goog.require('X.volume');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.Timer');



/**
 * The superclass for all renderers.
 *
 * @constructor
 * @extends X.base
 */
X.renderer = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'renderer';

  /**
   * The HTML container of this renderer, E.g. a <div>.
   *
   * @type {!Element|HTMLBodyElement}
   * @protected
   */
  this._container = window.document.body;

  /**
   * The width of this renderer.
   *
   * @type {!number}
   * @public
   */
  this._width = this._container.clientWidth;

  /**
   * The height of this renderer.
   *
   * @type {!number}
   * @public
   */
  this._height = this._container.clientHeight;

  /**
   * The Canvas of this renderer.
   *
   * @type {?Element}
   * @public
   */
  this._canvas = null;

  /**
   * The camera of this renderer.
   *
   * @type {?X.camera}
   * @protected
   */
  this._camera = null;

  /**
   * The interactor of this renderer.
   *
   * @type {?X.interactor}
   * @protected
   */
  this._interactor = null;

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
   * A locked flag for synchronizing.
   *
   * @type {boolean}
   * @protected
   */
  this._locked = false;

  /**
   * A flag to show if the initial loading was completed.
   *
   * @type {boolean}
   * @protected
   */
  this._loadingCompleted = false;

  /**
   * A flag to indicate that the onShowtime callback is about to be called.
   *
   * @type {boolean}
   * @protected
   */
  this._onShowtime = false;

  /**
   * The progressBar of this renderer.
   *
   * @type {?X.progressbar}
   * @protected
   */
  this._progressBar = null;

  /**
   * The progressBar for computing progress.
   *
   * @type {?X.progressbar}
   * @protected
   */
  this._progressBar2 = null;

  /**
   * The rendering context of this renderer.
   *
   * @type {?Object}
   * @protected
   */
  this._context = null;

  /**
   * The configuration of this renderer.
   *
   * @enum {boolean}
   */
  this._config = {
    'PROGRESSBAR_ENABLED': true,
    'INTERMEDIATE_RENDERING': false,
    'SLICENAVIGATORS': true
  };

  /**
   * The animation frame ID.
   *
   * @type {!number}
   * @protected
   */
  this._AnimationFrameID = -1;

  window.console
      .log('XTK release 10 -- ###TIMESTAMP### -- http://www.goXTK.com -- @goXTK');

};
// inherit from X.base
goog.inherits(X.renderer, X.base);


/**
 * The callback for X.event.events.COMPUTING events which indicate computing
 * for volume rendering
 *
 * @param {!X.event.ComputingEvent} event The computing event.
 * @public
 */
X.renderer.prototype.onComputing = function(event) {

  // stop the rendering loop
  window.cancelAnimationFrame(this._AnimationFrameID);

  // only do the following if the progressBar was not turned off
  if (this._config['PROGRESSBAR_ENABLED']) {

      this._progressBar2 = new X.progressbar(this._container, 3);

  }

};


/**
 * The callback for X.event.events.COMPUTING_END events which indicate the end of computing
 * for volume rendering
 *
 * @param {!X.event.ComputingEndEvent} event The computing end event.
 * @public
 */
X.renderer.prototype.onComputingEnd = function(event) {

  // only do the following if the progressBar was not turned off
  if (this._config['PROGRESSBAR_ENABLED']) {

    if (this._progressBar2) {

      // show a green, full progress bar
      this._progressBar2.done();

      // wait for a short time
      this.__readyCheckTimer2 = goog.Timer.callOnce(function() {

        this.__readyCheckTimer2 = null;

        if (this._progressBar2) {

          // we are done, kill the progressbar
          this._progressBar2.kill();
          this._progressBar2 = null;

        }

      // // we don't want to call onShowtime again
      this._onShowtime = true;
      this._loadingCompleted = true;

      // restart the rendering loop
      this.render();

      }.bind(this), 700);
      // .. and jump out
      return;

    } // if progressBar still exists

  } // if progressBar is enabled

};


/**
 * The callback for X.event.events.COMPUTING_PROGRESS events which indicate progress
 * updates during computing.
 *
 * @param {!X.event.ComputingProgressEvent} event The progress event holding the total
 *          progress value.
 * @public
 */
X.renderer.prototype.onComputingProgress = function(event) {

  if (this._progressBar2) {

    var _progress = event._value;
    this._progressBar2.setValue(_progress * 100);

  }

};


/**
 * The callback for X.event.events.PROGRESS events which indicate progress
 * updates during loading.
 *
 * @param {!X.event.ProgressEvent} event The progress event holding the total
 *          progress value.
 * @public
 */
X.renderer.prototype.onProgress = function(event) {

  if (this._progressBar) {

    var _progress = event._value;
    this._progressBar.setValue(_progress * 100);

  }

};


/**
 * The callback for X.event.events.MODIFIED events which re-configures the
 * object for rendering. This does not trigger re-rendering.
 *
 * @param {!X.event.ModifiedEvent} event The modified event pointing to the
 *          modified object.
 * @public
 */
X.renderer.prototype.onModified = function(event) {

  if (goog.isDefAndNotNull(event) && event instanceof X.event.ModifiedEvent) {

    if (!event._object) {
      // we need an object here
      return;

    }

    this.update_(event._object);

  }

};

/**
 * The callback for X.event.events.REMOVE events which re-configures the
 * object for rendering. This does not trigger re-rendering.
 *
 * @param {!X.event.RemoveEvent} event The modified event pointing to the
 *          modified object.
 * @public
 */
X.renderer.prototype.onRemove = function(event) {

  if (goog.isDefAndNotNull(event) && event instanceof X.event.RemoveEvent) {

    if (!event._object) {

      // we need an object here
      return;

    }

    this.remove(event._object);

  }

};


/**
 * The callback for X.event.events.HOVER events which indicate a hovering over
 * the viewport.
 *
 * @param {!X.event.HoverEvent} event The hover event pointing to the relevant
 *          screen coordinates.
 * @throws {Error} An error if the given event is invalid.
 * @protected
 */
X.renderer.prototype.onHover_ = function(event) {

  if (!goog.isDefAndNotNull(event) || !(event instanceof X.event.HoverEvent)) {

    throw new Error('Invalid hover event.');

  }

};


/**
 * @protected
 */
X.renderer.prototype.onResize_ = function() {
    this.resize();
};


/**
 * Resizes the control to fit the size of the container.
 */
X.renderer.prototype.resize = function() {

  // grab the new width and height of the container
  var container = goog.dom.getElement(this._container);
  this._width = container.clientWidth;
  this._height = container.clientHeight;

  // propagate it to the canvas
  var canvas = goog.dom.getElement(this._canvas);
  canvas.width = this._width;
  canvas.height = this._height;

  if (this._classname == 'renderer3D') {

    // modify 3d viewport
    this._context.viewport(0, 0, this._width, this._height);

    // modify perspective
    this._camera._perspective = X.matrix.makePerspective(X.matrix.identity(), this._camera._fieldOfView, (this._canvas.width/this._canvas.height), 1, 10000);

  }

  // .. and re-draw
  //this.resetViewAndRender();

};


/**
 * The callback for X.event.events.SCROLL events which indicate scrolling of the
 * viewport.
 *
 * @param {!X.event.ScrollEvent} event The scroll event indicating the scrolling
 *          direction.
 * @throws {Error} An error if the given event is invalid.
 * @protected
 */
X.renderer.prototype.onScroll_ = function(event) {

  if (!goog.isDefAndNotNull(event) || !(event instanceof X.event.ScrollEvent)) {

    throw new Error('Invalid scroll event.');

  }

};


/**
 * Access the configuration of this renderer. Possible settings and there
 * default values are:
 *
 * <pre>
 * config.PROGRESSBAR_ENABLED: true
 * config.INTERMEDIATE_RENDERING: false
 * config.SLICENAVIGATORS: true
 * config.PROGRESSBAR_ENABLED: true
 * </pre>
 *
 * @return {Object} The configuration.
 */
X.renderer.prototype.__defineGetter__('config', function() {

  return this._config;

});


/**
 * Get the interactor of this renderer. The interactor is null until this
 * renderer is initialized.
 *
 * @return {?X.interactor} The interactor.
 */
X.renderer.prototype.__defineGetter__('interactor', function() {

  return this._interactor;

});


/**
 * Get the camera of this renderer. The camera is null until this renderer is
 * initialized.
 *
 * @return {?X.camera} The camera.
 */
X.renderer.prototype.__defineGetter__('camera', function() {

  return this._camera;

});


/**
 * Check if the initial loading of all objects was completed. This value gets
 * set immediately after the onShowtime function is executed.
 *
 * @return {boolean} TRUE if all objects were completely loaded, FALSE else
 *         wise.
 */
X.renderer.prototype.__defineGetter__('loadingCompleted', function() {

  return this._loadingCompleted;

});


/**
 * Get the container of this renderer.
 *
 * @return {!Element|HTMLBodyElement} The container of this renderer.
 * @public
 */
X.renderer.prototype.__defineGetter__('container', function() {

  return this._container;

});


/**
 * Set the container for this renderer. This has to happen before
 * X.renderer.init() is called.
 *
 * @param {!string|Element|HTMLBodyElement} container Either an ID to a DOM
 *          container or the DOM element itself.
 * @throws {Error} An error, if the given container is invalid.
 * @public
 */
X.renderer.prototype.__defineSetter__('container', function(container) {

  // check if a container is passed
  if (!goog.isDefAndNotNull(container)) {

    throw new Error('An ID to a valid container (<div>..) is required.');

  }

  // check if the passed container is really valid
  var _container = container;

  // if an id is given, try to get the corresponding DOM element
  if (goog.isString(_container)) {

    _container = goog.dom.getElement(container);

  }

  // now we should have a valid DOM element
  if (!goog.dom.isElement(_container)) {

    throw new Error('Could not find the given container.');

  }

  this._container = _container;

});


/**
 * Resets the view according to the global bounding box of all associated
 * objects, the configured camera position as well as its focus _and_ triggers
 * re-rendering.
 */
X.renderer.prototype.resetViewAndRender = function() {

  this._camera.reset();
  // this.render_(false, false);

};


/**
 * Shows the loading progress bar by modifying the DOM tree.
 *
 * @protected
 */
X.renderer.prototype.showProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this._config['PROGRESSBAR_ENABLED']) {

    // create a progress bar here if this is the first render request and the
    // loader is working
    if (!this._progressBar) {

      this._progressBar = new X.progressbar(this._container, 3);

    }

  }

};


/**
 * Hides the loading progress bar.
 *
 * @protected
 */
X.renderer.prototype.hideProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this._config['PROGRESSBAR_ENABLED']) {

    if (this._progressBar && !this.__readyCheckTimer2) {

      // show a green, full progress bar
      this._progressBar.done();

      // wait for a short time
      this.__readyCheckTimer2 = goog.Timer.callOnce(function() {

        this.__readyCheckTimer2 = null;

        if (this._progressBar) {

          // we are done, kill the progressbar
          this._progressBar.kill();
          this._progressBar = null;

        }

        this.render();

      }.bind(this), 700);
      // .. and jump out
      return;

    } // if progressBar still exists

  } // if progressBar is enabled

};


/**
 * Create the canvas of this renderer inside the configured container and using
 * attributes like width, height etc. Then, initialize the rendering context and
 * attach all necessary objects (e.g. camera, shaders..). Finally, initialize
 * the event listeners.
 *
 * @param {string} _contextName The name of the context to create.
 * @throws {Error} An exception if there were problems during initialization.
 * @protected
 */
X.renderer.prototype.init = function(_contextName) {

  // create the canvas
  var _canvas = goog.dom.createDom('canvas');

  //
  // append it to the container
  goog.dom.appendChild(this._container, _canvas);

  // the container might have resized now, so update our width and height
  // settings
  this._width = this._container.clientWidth;
  this._height = this._container.clientHeight;

  // width and height can not be set using CSS but via object properties
  _canvas.width = this._width;
  _canvas.height = this._height;


  // --------------------------------------------------------------------------
  //
  // Viewport initialization
  //

  //
  // Step1: Get Context of canvas
  //
  try {

    var _context = _canvas.getContext(_contextName);

    if (!_context) {

      // this exception triggers the display of the error message
      // because the context creation can either fail with an exception
      // or return a NULL context
      throw new Error();

    }

  } catch (e) {

    // Canvas2D is not supported with this browser/machine/gpu

    // attach a message to the container's inner HTML
    var _style = "color:red;font-family:sans-serif;";
    var _msg = 'Sorry, ' +
        _contextName +
        ' context is <strong>not supported</strong> on this machine! See <a href="http://crash.goXTK.com" target="_blank">http://crash.goXTK.com</a> for requirements..';
    this._container.innerHTML = '<h3 style="' + _style +
        '">Oooops..</h3><p style="' + _style + '">' + _msg + '</p>';

    // .. and throw an exception
    throw new Error(_msg);

  }

  //
  // Step 1b: Configure the X.loader
  //
  this._loader = new X.loader();

  // listen to a progress event which gets fired during loading whenever
  // progress was made
  goog.events.listen(this._loader, X.event.events.PROGRESS, this.onProgress
      .bind(this));

  //
  // Step 1c: Register the created canvas to this instance
  //
  this._canvas = _canvas;

  //
  // Step 1d: Register the created context to this instance
  //
  this._context = _context;

  //
  // Step2: Configure the context and the viewport
  //

  //
  // create a new interactor
  var _interactor = new X.interactor3D(this._canvas);

  // in the 2d case, create a 2d interactor (of course..)
  if (_contextName == '2d') {

    _interactor = new X.interactor2D(this._canvas);

  }
  // initialize it and..
  _interactor.init();

  // .. listen to resetViewEvents
  goog.events.listen(_interactor, X.event.events.RESETVIEW,
      this.resetViewAndRender.bind(this));
  // .. listen to hoverEvents
  goog.events.listen(_interactor, X.event.events.HOVER, this.onHover_
      .bind(this));
  // .. listen to scroll events
  goog.events.listen(_interactor, X.event.events.SCROLL, this.onScroll_
      .bind(this));

  // .. and finally register it to this instance
  this._interactor = _interactor;

  //
  // create a new camera
  // width and height are required to calculate the perspective
  var _camera = new X.camera3D(this._width, this._height);

  if (_contextName == '2d') {
    _camera = new X.camera2D(this._width, this._height);
  }
  // observe the interactor for user interactions (mouse-movements etc.)
  _camera.observe(this._interactor);
  // ..listen to render requests from the camera
  // these get fired after user-interaction and camera re-positioning to re-draw
  // all objects
  // goog.events.listen(_camera, X.event.events.RENDER, this.render_.bind(this,
  // false, false));

  //
  // attach all created objects as class attributes
  // should be one of the last things to do here since we use these attributes
  // to check if the initialization was completed successfully
  this._camera = _camera;

  // .. listen to resizeEvents
  goog.events.listen(window, goog.events.EventType.RESIZE, this.onResize_,
      false, this);

  //
  //
  // .. the rest should be performed in the subclasses

};


/**
 * Add a new object to this renderer. The renderer has to be initialized before
 * doing so. A X.renderer.render() call has to be initiated to display added
 * objects.
 *
 * @param {!X.object} object The object to add to this renderer.
 * @throws {Error} An exception if something goes wrong.
 */
X.renderer.prototype.add = function(object) {

  // for constructable objects (e.g. cube, sphere, cylinder), we call the
  // modified() function to generate the CSG representations
  if (object instanceof X.cube || object instanceof X.sphere ||
      object instanceof X.cylinder) {

    object.modified();

  }

  // we know that objects which are directly added using this function are def.
  // top-level objects, meaning that they do not have a parent
  this._topLevelObjects.push(object);

  this.update_(object);

};


/**
 * Remove an existing object and all its children from the rendering context.
 *
 * @param {!X.object} object The object to remove from the renderer.
 * @return {boolean} TRUE or FALSE depending on success.
 * @throws {Error} An exception if something goes wrong.
 * @public
 */
X.renderer.prototype.remove = function(object) {

  if (!this._canvas || !this._context) {

    throw new Error('The renderer was not initialized properly.');

  }

  if (!goog.isDefAndNotNull(object)) {

    //throw new Error('Illegal object.');

  }
  else{

    goog.events.removeAll(object);

    var _numberOfTopLevelObjects = this._topLevelObjects.length;

    var _y;
    for (_y = 0; _y < _numberOfTopLevelObjects; _y++) {

      if(this._topLevelObjects[_y]._id == object._id){
        this._topLevelObjects[_y] = null;
        this._topLevelObjects.splice(_y, 1);
        return true;
      }
    }
  }

	// to be overloaded

  return false;

};


/**
 * Configure a displayable object within this renderer. The object can be a
 * newly created one or an existing one. A X.renderer.render() call has to be
 * initiated to display the object.
 *
 * @param {!X.object} object The displayable object to setup within this
 *          renderer.
 * @throws {Error} An exception if something goes wrong.
 * @protected
 */
X.renderer.prototype.update_ = function(object) {

  if (!this._canvas || !this._context) {

    throw new Error('The renderer was not initialized properly.');

  }

  if (!goog.isDefAndNotNull(object)) {
    //window.console.log(object);
    //window.console.log('Illegal object');
    //throw new Error('Illegal object.');

  }
  else {

    if(!goog.events.hasListener(object, X.event.events.MODIFIED)) {

      goog.events.listen(object, X.event.events.MODIFIED, this.onModified
          .bind(this));

    }

    if(!goog.events.hasListener(object, X.event.events.REMOVE)) {

      goog.events.listen(object, X.event.events.REMOVE, this.onRemove
          .bind(this));

    }

    if(!goog.events.hasListener(object, X.event.events.COMPUTING)) {

      goog.events.listen(object, X.event.events.COMPUTING, this.onComputing
          .bind(this));

    }

    if(!goog.events.hasListener(object, X.event.events.COMPUTING_PROGRESS)) {

      goog.events.listen(object, X.event.events.COMPUTING_PROGRESS, this.onComputingProgress
          .bind(this));

    }

    if(!goog.events.hasListener(object, X.event.events.COMPUTING_END)) {

      goog.events.listen(object, X.event.events.COMPUTING_END, this.onComputingEnd
          .bind(this));

    }

  }

};


/**
 * Get the existing X.object with the given id.
 *
 * @param {!number} id The object's id.
 * @return {?X.object} The requested X.object or null if it was not found.
 * @throws {Error} If the given id was invalid.
 * @public
 */
X.renderer.prototype.get = function(id) {

  if (!goog.isDefAndNotNull(id)) {

    throw new Error('Invalid object id.');

  }

  // loop through objects and try to find the id
  var _objects = this._objects.values();
  var _numberOfObjects = _objects.length;

  var _k = 0;
  for (_k = 0; _k < _numberOfObjects; _k++) {

    if (_objects[_k]._id == id) {

      // found!
      return _objects[_k];

    }

  }

  // not found
  return null;

};


/**
 * Print the full hierarchy tree of objects.
 *
 * @public
 */
X.renderer.prototype.printScene = function() {

  var _numberOfTopLevelObjects = this._topLevelObjects.length;
  // window.console.log(_numberOfTopLevelObjects);
  // window.console.log(this._objects);

  var _y;
  for (_y = 0; _y < _numberOfTopLevelObjects; _y++) {

    var _topLevelObject = this._topLevelObjects[_y];

    this.generateTree_(_topLevelObject, 0);

  }

};


/**
 * Recursively loop through a hierarchy tree of objects and print it.
 *
 * @param {!X.object} object The starting point object.
 * @param {number} level The current level in the scene hierarchy.
 * @protected
 */
X.renderer.prototype.generateTree_ = function(object, level) {

  // for slices, container is right size but empty
  if(typeof(object) == 'undefined'){
    return;
  }

  var _output = "";

  var _l = 0;
  for (_l = 0; _l < level; _l++) {

    _output += ">";

  }

  _output += object._id;

  // window.console.log(object);
  // window.console.log(_output);

  if (object._children.length > 0) {

    // loop through the children
    var _children = object._children;
    var _numberOfChildren = _children.length;
    var _c = 0;

    for (_c = 0; _c < _numberOfChildren; _c++) {

      this.generateTree_(_children[_c], level + 1);

    }

  }

};


/**
 * (Re-)render all associated displayable objects of this renderer. This method
 * clears the viewport and re-draws everything by looping through the tree of
 * objects. The current camera is used to setup the world space.
 *
 * @public
 */
X.renderer.prototype.render = function() {

  if (!this._canvas || !this._context) {

    throw new Error('The renderer was not initialized properly.');

  }

  // READY CHECK
  //
  // now we check if we are ready to display everything
  // - ready means: all textures loaded and setup, all external files loaded and
  // setup and all other objects loaded and setup
  //
  // if we are not ready, we wait..
  // if we are ready, we continue with the rendering

  // let's check if render() was called before and the single-shot timer is
  // already there
  // f.e., if we are in a setInterval-configured render loop, we do not want to
  // create multiple single-shot timers
  if (goog.isDefAndNotNull(this._readyCheckTimer)) {

    return;

  }

  //
  // LOADING..
  //
  if (!this._loader.completed()) {

    // we are not ready yet.. the loader is still working;

    this.showProgressBar_();

    // also reset the loadingCompleted flags
    this._loadingCompleted = false;
    this._onShowtime = false;

    // let's check again in a short time
    this._readyCheckTimer = goog.Timer.callOnce(function() {

      this._readyCheckTimer = null; // destroy the timer

      // try to render now..
      // if the loader is ready it will work, else wise another single-shot gets
      // configured in 500 ms
      this.render();

    }.bind(this), 100); // check again in 500 ms

    // intermediate rendering means render also
    // while loading is still active
    if (!this._config['INTERMEDIATE_RENDERING']) {

      return; // .. and jump out

    }

  } else {

    // we are ready! yahoooo!

    // call the onShowtime function which can be overloaded

    // we need two flags here since the render loop repeats so fast
    // that there would be timing issues
    if (!this._loadingCompleted && !this._onShowtime) {

      this._onShowtime = true;
      eval("this.onShowtime()");
      this._loadingCompleted = true; // flag the renderer as 'initial
      // loading completed'

    }

    // if we have a progress bar
    if (this._progressBar) {

      // this means the X.loader is done..
      this.hideProgressBar_();

      // .. we exit here since the hiding takes some time and automatically
      // triggers the rendering when done
      return;

    }

  }
  //
  // END OF LOADING
  //

  //
  // CURTAIN UP! LET THE SHOW BEGIN..
  //

  // this starts the rendering loops and store its id
  this._AnimationFrameID = window.requestAnimationFrame(this.render.bind(this));
  eval("this.onRender()");
  this.render_(false, true);
  eval("this.afterRender()");

};


/**
 * Overload this function to execute code after all initial loading (files,
 * textures..) has completed and just before the first real rendering call.
 *
 * @public
 */
X.renderer.prototype.onShowtime = function() {

  // do nothing
};


/**
 * Overload this function to execute code on each rendering call.
 *
 * @public
 */
X.renderer.prototype.onRender = function() {

  // do nothing
};


/**
 * Overload this function to execute code after each rendering completed.
 *
 * @public
 */
X.renderer.prototype.afterRender = function() {

    // do nothing
};

/**
 * Internal function to perform the actual rendering by looping through all
 * associated X.objects.
 *
 * @param {boolean} picking If TRUE, perform picking - if FALSE render to the
 *          canvas viewport.
 * @param {?boolean=} invoked If TRUE, the render counts as invoked and f.e.
 *          statistics are generated.
 * @throws {Error} If anything goes wrong.
 * @protected
 */
X.renderer.prototype.render_ = function(picking, invoked) {



};


/**
 * Destroy this renderer.
 *
 * @public
 */
X.renderer.prototype.destroy = function() {

  // disconnect events listeners
  goog.events.removeAll(this);
  goog.events.unlisten(window, goog.events.EventType.RESIZE, this.onResize_,
      false, this);

  // stop the rendering loop
  window.cancelAnimationFrame(this._AnimationFrameID);

  // delete the loader if any
  if (this._loader) {
    delete this._loader;
    this._loader = null;
  }

  // remove the progress bar if any
  if (this._progressBar) {
    this._progressBar.kill();
    delete this._progressBar;
    this._progressBar = null;
  }

  // remove all objects
  this._objects.clear();
  delete this._objects;
  this._topLevelObjects.length = 0;
  delete this._topLevelObjects;

  // remove loader, camera and interactor
  delete this._loader;
  this._loader = null;

  delete this._camera;
  this._camera = null;

  delete this._interactor;
  this._interactor = null;

  // remove the rendering context
  delete this._context;
  this._context = null;

  // remove the canvas from the dom tree
  goog.dom.removeNode(this._canvas);
  delete this._canvas;
  this._canvas = null;

};
