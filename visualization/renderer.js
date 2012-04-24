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
goog.require('X.buffer');
goog.require('X.camera');
goog.require('X.caption');
goog.require('X.event');
goog.require('X.interactor');
goog.require('X.labelMap');
goog.require('X.loader');
goog.require('X.matrix');
goog.require('X.object');
goog.require('X.progressbar');
goog.require('X.shaders');
goog.require('X.triplets');
goog.require('X.volume');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.iter.Iterator');
goog.require('goog.math.Vec3');
goog.require('goog.structs.Map');
goog.require('goog.Timer');



/**
 * Create a renderer inside a given DOM Element.
 * 
 * @constructor
 * @param {!Element} container The container (DOM Element) to place the renderer
 *          inside.
 * @extends X.base
 */
X.renderer = function(container) {

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
  this['_className'] = 'renderer';
  
  /**
   * The HTML container of this renderer, E.g. a <div>.
   * 
   * @type {!Element}
   * @protected
   */
  this._container = _container;
  
  /**
   * The width of this renderer.
   * 
   * @type {!number}
   * @protected
   */
  this._width = this._container.clientWidth;
  
  /**
   * The height of this renderer.
   * 
   * @type {!number}
   * @protected
   */
  this._height = this._container.clientHeight;
  
  /**
   * The Canvas of this renderer.
   * 
   * @type {?Element}
   * @protected
   */
  this._canvas = null;
  
  /**
   * The WebGL context of this renderer.
   * 
   * @type {?Object}
   * @protected
   */
  this._gl = null;
  
  /**
   * The shader pair for this renderer.
   * 
   * @type {?X.shaders}
   * @protected
   */
  this._shaders = null;
  
  /**
   * The compiled shader program of this renderer.
   * 
   * @type {?Object}
   * @protected
   */
  this._shaderProgram = null;
  
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
   * The minimum X value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this._minX = null;
  
  /**
   * The maximum X value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this._maxX = null;
  
  /**
   * The minimum Y value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this._minY = null;
  
  /**
   * The maximum Y value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this._maxY = null;
  
  /**
   * The minimum Z value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this._minZ = null;
  
  /**
   * The maximum Z value of the global bounding box.
   * 
   * @type {?number}
   * @protected
   */
  this._maxZ = null;
  
  /**
   * The center of the global bounding box in 3D space.
   * 
   * @type {!Array}
   * @protected
   */
  this._center = [0, 0, 0];
  
  /**
   * The frame buffer which is used for picking.
   * 
   * @type {Object}
   * @protected
   */
  this._pickFrameBuffer = null;
  
  /**
   * A hash map of shader attribute pointers.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._attributePointers = new goog.structs.Map();
  
  /**
   * A hash map of shader uniform locations.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._uniformLocations = new goog.structs.Map();
  
  /**
   * A hash map of vertex buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._vertexBuffers = new goog.structs.Map();
  
  /**
   * A hash map of normal buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._normalBuffers = new goog.structs.Map();
  
  /**
   * A hash map of color buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._colorBuffers = new goog.structs.Map();
  
  /**
   * A hash map of scalar buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._scalarBuffers = new goog.structs.Map();
  
  /**
   * A hash map of texture position buffers of this renderer. Each buffer is
   * associated with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._texturePositionBuffers = new goog.structs.Map();
  
  /**
   * A hash map of different textures assigned to this renderer. The maximum
   * number of textures is limited to 32 by WebGL.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._textures = new goog.structs.Map();
  
  /**
   * The loader associated with this renderer.
   * 
   * @type {?X.loader}
   * @protected
   */
  this._loader = null;
  
  /**
   * The progressBar of this renderer.
   * 
   * @type {?X.progressbar}
   * @protected
   */
  this._progressBar = null;
  
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
   * @public
   */
  this['_initialLoadingCompleted'] = false;
  
  /**
   * The configuration of this renderer.
   * 
   * @enum {boolean}
   */
  this['config'] = {
    'PROGRESSBAR_ENABLED': true,
    'PICKING_ENABLED': true,
    'ORDERING_ENABLED': true,
    'STATISTICS_ENABLED': false
  };
  
  window.console.log('XTK Release 4 -- 04/12/12 -- http://www.goXTK.com');
};
// inherit from X.base
goog.inherits(X.renderer, X.base);


/**
 * Get the width of this renderer.
 * 
 * @return {!number} The width of this renderer.
 */
X.renderer.prototype.width = function() {

  return this._width;
  
};


/**
 * Get the height of this renderer.
 * 
 * @return {!number} The height of this renderer.
 */
X.renderer.prototype.height = function() {

  return this._height;
  
};


/**
 * Get the canvas of this renderer. If a canvas does not exist yet, it gets
 * created.
 * 
 * @return {!Element} The canvas of this renderer.
 */
X.renderer.prototype.canvas = function() {

  if (!goog.isDefAndNotNull(this._canvas)) {
    
    this._canvas = goog.dom.createDom('canvas');
    
  }
  
  return this._canvas;
  
};


/**
 * Get the container of this renderer.
 * 
 * @return {!Element} The container of this renderer as a DOM object.
 */
X.renderer.prototype.container = function() {

  // return the _container
  return this._container;
  
};


/**
 * Get the camera of this renderer.
 * 
 * @return {?X.camera} The associated camera.
 */
X.renderer.prototype.camera = function() {

  return this._camera;
  
};


/**
 * Get the interactor of this renderer.
 * 
 * @return {?X.interactor} The associated renderer.
 */
X.renderer.prototype.interactor = function() {

  return this._interactor;
  
};


/**
 * Get the loader of this renderer. If no loader exists yet, this method creates
 * one.
 * 
 * @return {!X.loader} The associated loader.
 */
X.renderer.prototype.loader = function() {

  if (!goog.isDefAndNotNull(this._loader)) {
    
    // create a new loader on demand (lazy loading)
    this._loader = new X.loader();
    
    // listen to a progress event which gets fired during loading whenever
    // progress was made
    goog.events.listen(this.loader(), X.event.events.PROGRESS, this.onProgress
        .bind(this));
    
  }
  
  return this._loader;
  
};


/**
 * The callback for X.event.events.PROGRESS events which indicate progress
 * updates during loading.
 * 
 * @param {!X.event.ProgressEvent} event The progress event holding the total
 *          progress value.
 */
X.renderer.prototype.onProgress = function(event) {

  if (this._progressBar) {
    
    var progress = event._value;
    this._progressBar.setValue(progress * 100);
    
  }
  
};


/**
 * The callback for X.event.events.MODIFIED events which re-configures the
 * object for WebGL rendering. This does not trigger re-rendering.
 * 
 * @param {!X.event.ModifiedEvent} event The modified event pointing to the
 *          modified object.
 */
X.renderer.prototype.onModified = function(event) {

  if (goog.isDefAndNotNull(event) && event instanceof X.event.ModifiedEvent) {
    
    this.update_(event._object);
    
  }
  
};


/**
 * The callback for X.event.events.HOVER events which indicates a hovering over
 * an X.object. This triggers picking and therefor a re-rendering to an
 * invisible framebuffer.
 * 
 * @param {!X.event.HoverEvent} event The hover event pointing to the relevant
 *          screen coordinates.
 */
X.renderer.prototype.onHover = function(event) {

  if (goog.isDefAndNotNull(event) && event instanceof X.event.HoverEvent) {
    
    this.showCaption_(event._x, event._y);
    
  }
  
};


/**
 * Reset the global bounding box for all objects to undefined and reset the
 * center to 0,0,0. This can be useful before calling X.object.modified() on all
 * objects after transforms etc. which then re-calculates the global bounding
 * box.
 */
X.renderer.prototype.resetBoundingBox = function() {

  this._minX = null;
  this._maxX = null;
  this._minY = null;
  this._maxY = null;
  this._minZ = null;
  this._maxZ = null;
  
  this._center = [0, 0, 0];
  
};

/**
 * Shows the loading progress bar by modifying the DOM tree.
 */
X.renderer.prototype.showProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this['config']['PROGRESSBAR_ENABLED']) {
    
    // create a progress bar here if this is the first render request and the
    // loader is working
    if (!this._progressBar) {
      
      this._progressBar = new X.progressbar(this.container(), 3);
      
    }
    
  }
  
};


/**
 * Hides the loading progress bar.
 */
X.renderer.prototype.hideProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this['config']['PROGRESSBAR_ENABLED']) {
    
    if (this._progressBar && !this._readyCheckTimer2) {
      
      // show a green, full progress bar
      this._progressBar.done();
      
      // wait for a short time
      this._readyCheckTimer2 = goog.Timer.callOnce(function() {

        this._readyCheckTimer2 = null;
        
        if (this._progressBar) {
          
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
 * Resets the view according to the global bounding box of all associated
 * objects, the configured camera position as well as its focus _and_ triggers
 * re-rendering.
 */
X.renderer.prototype.resetViewAndRender = function() {

  this._camera.reset();
  this.render_(false, false);
  
};


/**
 * Create the canvas of this renderer inside the configured container and using
 * attributes like width, height etc. Then, initialize the WebGL context and
 * attach all necessary objects (e.g. camera, shaders..). Finally, initialize
 * the event listeners.
 * 
 * @throws {Error} An exception if there were problems during initialization.
 */
X.renderer.prototype.init = function() {

  // get the canvas
  var canvas = this.canvas();
  
  // width and height can not be set using CSS but via object properties
  canvas.width = this.width();
  canvas.height = this.height();
  
  //
  // append it to the container
  goog.dom.appendChild(this.container(), canvas);
  
  // --------------------------------------------------------------------------
  //
  // WebGL Viewport initialization
  //
  
  //
  // Step1: Get Context of canvas
  //
  try {
    
    var gl = canvas.getContext('experimental-webgl');
    
    if (!gl) {
      
      throw new Error();
      
    }
    
  } catch (e) {
    
    // WebGL is not supported with this browser/machine/gpu
    
    // attach a message to the container's inner HTML
    var style = "color:red;font-family:sans-serif;";
    var msg = 'Sorry, WebGL is <strong>not supported</strong> on this machine! See <a href="http://crash.goXTK.com" target="_blank">http://crash.goXTK.com</a> for requirements..';
    this.container().innerHTML = '<h3 style="' + style +
        '">Oooops..</h3><p style="' + style + '">' + msg + '</p>';
    
    // .. and throw an exception
    throw new Error(msg);
    
  }
  
  //
  // Step2: Configure the context
  //
  try {
    
    gl.viewport(0, 0, this.width(), this.height());
    
    // configure opacity to 0.0 to overwrite the viewport background-color by
    // the container color
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
    // enable transparency
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE,
    // gl.ZERO);
    // gl.blendFunc(gl.DST_COLOR, gl.ZERO);
    // gl.blendFunc(gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA);
    // // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // // gl.polygonOffset(1.0, 1.0);
    // // .. with perspective rendering
    gl.depthFunc(gl.LEQUAL);
    //    
    


    // clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    if (this['config']['PICKING_ENABLED']) {
      //
      // create a frame buffer for the picking functionality
      //
      // inspired by JAX https://github.com/sinisterchipmunk/jax/ and
      // http://dl.dropbox.com/u/5095342/WebGL/webgldemo3.js
      //
      // we basically render into an invisible framebuffer and use a unique
      // object
      // color to check which object is where (a simulated Z buffer since we can
      // not directly access the one from WebGL)
      var pickFrameBuffer = gl.createFramebuffer();
      var pickRenderBuffer = gl.createRenderbuffer();
      var pickTexture = gl.createTexture();
      
      gl.bindTexture(gl.TEXTURE_2D, pickTexture);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width(), this.height(), 0,
          gl.RGB, gl.UNSIGNED_BYTE, null);
      
      gl.bindFramebuffer(gl.FRAMEBUFFER, pickFrameBuffer);
      gl.bindRenderbuffer(gl.RENDERBUFFER, pickRenderBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this
          .width(), this.height());
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D, pickTexture, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
          gl.RENDERBUFFER, pickRenderBuffer);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      
      this._pickFrameBuffer = pickFrameBuffer;
      
    }
    
  } catch (e) {
    
    // this exception indicates if the browser supports WebGL
    throw new Error('Exception while accessing GL Context!\n' + e);
    
  }
  
  //
  // WebGL Viewport initialization done
  // --------------------------------------------------------------------------
  
  // now since we have a valid gl viewport, we want to configure the interactor
  // and camera
  
  //
  // create a new interactor
  var interactor = new X.interactor(canvas);
  interactor.init();
  // .. listen to resetViewEvents
  goog.events.listen(interactor, X.event.events.RESETVIEW,
      this.resetViewAndRender.bind(this));
  // .. listen to hoverEvents
  goog.events.listen(interactor, X.event.events.HOVER, this.onHover.bind(this));
  

  //
  // create a new camera
  // width and height are required to calculate the perspective
  var camera = new X.camera(this.width(), this.height());
  // observe the interactor for user interactions (mouse-movements etc.)
  camera.observe(interactor);
  // ..listen to render requests from the camera
  // these get fired after user-interaction and camera re-positioning to re-draw
  // all objects
  goog.events.listen(camera, X.event.events.RENDER, this.render_.bind(this,
      false, false));
  
  //
  // attach all created objects as class attributes
  // should be one of the last things to do here since we use these attributes
  // to check if the initialization was completed successfully
  this._canvas = canvas;
  this._gl = gl;
  this._camera = camera;
  this._interactor = interactor;
  
  //
  // add default shaders to this renderer
  // it is possible to attach other custom shaders after this init call
  // also, this has to happen after this._canvas, this._gl and this._camera were
  // attached to this renderer since we check for these
  var defaultShaders = new X.shaders();
  this.addShaders(defaultShaders);
  
};


/**
 * Add a pair of shaders to this renderer. The renderer has to be initialized
 * before adding the shaders.
 * 
 * @param {!X.shaders} shaders The X.shaders pair to add to this renderer.
 */
X.renderer.prototype.addShaders = function(shaders) {

  // check if the renderer is initialized properly
  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl) ||
      !goog.isDefAndNotNull(this._camera)) {
    
    throw new Error('Renderer was not initialized properly.');
    
  }
  
  // check if the given shaders are valid
  if (!goog.isDefAndNotNull(shaders) || !(shaders instanceof X.shaders)) {
    
    throw new Error('Could not add shaders.');
    
  }
  
  // call the validate() method of the shader pair
  // this will cause an exception if the validation fails..
  shaders.validate();
  
  // compile the fragment and vertex shaders
  var glFragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
  var glVertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
  
  // attach the sources, defined in the shaders pair
  this._gl.shaderSource(glFragmentShader, shaders.fragment());
  this._gl.shaderSource(glVertexShader, shaders.vertex());
  
  // start compilation
  this._gl.compileShader(glFragmentShader);
  this._gl.compileShader(glVertexShader);
  
  if (!this._gl.getShaderParameter(glFragmentShader, this._gl.COMPILE_STATUS)) {
    
    throw new Error('Fragement Shader compilation failed!\n' +
        this._gl.getShaderInfoLog(glFragmentShader));
    
  }
  
  if (!this._gl.getShaderParameter(glVertexShader, this._gl.COMPILE_STATUS)) {
    
    throw new Error('Vertex Shader compilation failed!\n' +
        this._gl.getShaderInfoLog(glVertexShader));
    
  }
  
  // create a shaderProgram, attach the shaders and link'em all together
  var shaderProgram = this._gl.createProgram();
  this._gl.attachShader(shaderProgram, glVertexShader);
  this._gl.attachShader(shaderProgram, glFragmentShader);
  this._gl.linkProgram(shaderProgram);
  
  if (!this._gl.getProgramParameter(shaderProgram, this._gl.LINK_STATUS)) {
    
    throw new Error('Could not create shader program!\n' +
        this._gl.getShaderInfoLog(glFragmentShader) + '\n' +
        this._gl.getShaderInfoLog(glVertexShader) + '\n' +
        this._gl.getProgramInfoLog(shaderProgram));
    
  }
  
  // activate the new shaderProgram
  this._gl.useProgram(shaderProgram);
  
  // attach the shaderProgram to this renderer
  this._shaderProgram = shaderProgram;
  
  // store the pointers to the shaders' attributes
  var attributes = Object.keys(X.shaders.attributes);
  
  attributes.forEach(function(a) {

    a = eval("X.shaders.attributes." + a);
    this._attributePointers.set(a, this._gl.getAttribLocation(
        this._shaderProgram, a));
    this._gl.enableVertexAttribArray(this._attributePointers.get(a));
    
  }.bind(this));
  
  // store the pointers to the shaders' uniforms
  var uniforms = Object.keys(X.shaders.uniforms);
  
  uniforms.forEach(function(u) {

    u = eval("X.shaders.uniforms." + u);
    this._uniformLocations.set(u, this._gl.getUniformLocation(
        this._shaderProgram, u));
    
  }.bind(this));
  
  // finally, attach the shaders to this renderer
  this._shaders = shaders;
  
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

  // we know that objects which are directly added using this function are def.
  // top-level objects, meaning that they do not have a parent
  this._topLevelObjects.push(object);
  
  this.update_(object);
  
};


/**
 * Configure a displayable object within this renderer. The object can be a
 * newly created one or an existing one. A X.renderer.render() call has to be
 * initiated to display the object.
 * 
 * @param {!X.object} object The displayable object to setup within this
 *          renderer.
 * @throws {Error} An exception if something goes wrong.
 * @private
 */
X.renderer.prototype.update_ = function(object) {

  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl) ||
      !goog.isDefAndNotNull(this._camera)) {
    
    throw new Error('Renderer was not initialized properly.');
    
  }
  
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    
    throw new Error('Illegal object.');
    
  }
  
  // check if object already existed..
  var existed = false;
  
  if (this.get(object.id())) {
    // this means, we are updating
    existed = true;
    
  }
  
  // listen to modified events of this object, if we didn't do that before
  if (!goog.events.hasListener(object, X.event.events.MODIFIED)) {
    
    goog.events.listen(object, X.event.events.MODIFIED, this.onModified
        .bind(this));
    
  }
  
  var id = object.id();
  var points = object.points();
  var normals = object.normals();
  var colors = object.colors();
  var texture = object.texture();
  var file = object.file();
  var transform = object.transform();
  var colorTable = object.colorTable();
  var labelMap = object._labelMap; // here we access directly since we do not
  // want to create one using the labelMap() singleton accessor
  var scalars = object._scalars; // same direct access policy
  
  //
  // LABEL MAP
  //
  if (goog.isDefAndNotNull(labelMap) && goog.isDefAndNotNull(labelMap.file()) &&
      labelMap.file().dirty()) {
    // a labelMap file is associated to this object and it is dirty..
    // background: we always want to parse label maps first
    
    // run the update_ function on the labelMap object
    this.update_(labelMap);
    
    // jump out
    return;
    
  }
  
  // here we check if additional loading is necessary
  // this would be the case if
  // a) the object has an external texture
  // b) the object is based on an external file (vtk, stl...)
  // in these cases, we do not directly update the object but activate the
  // X.loader to get the externals and then let it call the update method
  if (goog.isDefAndNotNull(colorTable) &&
      goog.isDefAndNotNull(colorTable.file()) && colorTable.file().dirty()) {
    // a colorTable file is associated to this object and it is dirty..
    
    // start loading
    this.loader().loadColorTable(object);
    
    return;
    
  } else if (goog.isDefAndNotNull(texture) &&
      goog.isDefAndNotNull(texture.file()) && texture.file().dirty()) {
    // a texture file is associated to this object and it is dirty..
    
    // start loading..
    this.loader().loadTexture(object);
    
    return;
    
  } else if (goog.isDefAndNotNull(file) && file.dirty()) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this.loader().loadFile(object);
    
    return;
    
  } else if (goog.isDefAndNotNull(scalars) &&
      goog.isDefAndNotNull(scalars.file()) && scalars.file().dirty()) {
    // a scalars container is associated to this object and it's associated file
    // is dirty
    
    // start loading
    this.loader().loadScalars(object);
    
    return;
    
  }
  
  // MULTI OBJECTS
  //
  // objects can have N child objects which again can have M child objects and
  // so on
  //
  // check if this object has children
  if (object.dirty() && object.children().length > 0) {
    
    // loop through the children and recursively setup the object
    var children = object.children();
    var numberOfChildren = children.length;
    var c = 0;
    
    for (c = 0; c < numberOfChildren; c++) {
      
      this.update_(children[c]);
      
    }
    
  }
  
  // check if this is an empty object, if yes, jump out
  // empty objects can be used to group objects
  if (points.count() == 0) {
    
    object.setClean();
    return;
    
  }
  

  // a simple locking mechanism to prevent multiple calls when using
  // asynchronous requests
  var counter = 0;
  while (this._locked) {
    
    // wait
    counter++;
    window.console.log('Possible thread lock avoided: ' + counter);
    
  }
  
  this._locked = true;
  
  //
  // LOCKED DOWN: ACTION!!
  //
  // This gets executed after all dynamic content has been loaded.
  
  // check if this is an X.slice as part of a X.labelMap
  var isLabelMap = (object instanceof X.slice && object._volume instanceof X.labelMap);
  
  //
  // TEXTURE
  //
  
  if (existed && goog.isDefAndNotNull(texture) && texture.dirty()) {
    
    // this means the object already existed and the texture is dirty
    // therefore, we delete the old gl buffers
    
    var oldTexturePositionBuffer = this._texturePositionBuffers.get(id);
    if (goog.isDefAndNotNull(oldTexturePositionBuffer)) {
      
      if (this._gl.isBuffer(oldTexturePositionBuffer._glBuffer)) {
        
        this._gl.deleteBuffer(oldTexturePositionBuffer._glBuffer);
        
      }
      
    }
  }
  
  var texturePositionBuffer = null;
  if (goog.isDefAndNotNull(texture)) {
    // texture associated to this object
    
    if (!existed || texture.dirty()) {
      
      // the object either did not exist or the texture is dirty, so we
      // re-create the gl buffers
      
      var textureCoordinateMap = object.textureCoordinateMap();
      
      // check if we have a valid texture-to-object's-coordinate map
      if (!goog.isDefAndNotNull(textureCoordinateMap)) {
        
        var m = 'Can not add an object and texture ';
        m += 'without valid coordinate mapping! Set the textureCoordinateMap!';
        throw new Error(m);
        
      }
      
      // setup the glTexture, at this point the image for the texture was
      // already
      // loaded thanks to X.loader
      var glTexture = this._gl.createTexture();
      
      // connect the image and the glTexture
      glTexture.image = texture.image();
      
      //
      // activate the texture on the WebGL side
      this._textures.set(texture.id(), glTexture);
      
      this._gl.bindTexture(this._gl.TEXTURE_2D, glTexture);
      if (texture.rawData()) {
        
        // use rawData rather than loading an imagefile
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, texture
            .rawDataWidth(), texture.rawDataHeight(), 0, this._gl.RGBA,
            this._gl.UNSIGNED_BYTE, texture.rawData());
        
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S,
            this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T,
            this._gl.CLAMP_TO_EDGE);
        
        // we do not want to flip here
        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, true);
        
      } else {
        
        // use an imageFile for the texture
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA,
            this._gl.RGBA, this._gl.UNSIGNED_BYTE, glTexture.image);
        
        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
        
      }
      
      // for labelMaps, we use NEAREST NEIGHBOR filtering
      if (isLabelMap) {
        this._gl.texParameteri(this._gl.TEXTURE_2D,
            this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST);
        this._gl.texParameteri(this._gl.TEXTURE_2D,
            this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST);
      } else {
        this._gl.texParameteri(this._gl.TEXTURE_2D,
            this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D,
            this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
      }
      
      // release the texture binding to clear things
      this._gl.bindTexture(this._gl.TEXTURE_2D, null);
      
      // create texture buffer
      var glTexturePositionBuffer = this._gl.createBuffer();
      
      // bind and fill with colors defined above
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glTexturePositionBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(
          textureCoordinateMap), this._gl.STATIC_DRAW);
      
      // create an X.buffer to store the texture-coordinate map
      texturePositionBuffer = new X.buffer(glTexturePositionBuffer,
          textureCoordinateMap.length, 2);
      
      texture.setClean();
      
    } else {
      
      // the texture is not dirty and the object already existed, so use the old
      // buffer
      texturePositionBuffer = this._texturePositionBuffers.get(id);
      
    }
    
    // dirty check
    
  } // check if object has a texture
  
  this.loader().addProgress(0.1);
  
  //
  // SPECIAL CASE: LABELMAPS
  // 
  
  // since we now have labelMap support, we process the textures (which is the
  // only essential of labelMaps) first and ..
  
  // .. jump out if this is part of a labelMap
  if (isLabelMap) {
    
    this._locked = false; // we gotta unlock here already
    
    this.loader().addProgress(0.9); // add the missing progress
    
    return; // sayonara
    
    // this prevents storing of not required buffers, objects etc. since the
    // labelMaps are only pseudo X.objects and never rendered directly but
    // merged into an X.volume
    
  }
  

  //
  // BOUNDING BOX
  //
  // The global bounding incorporates all individual bounding boxes of the
  // objects. This bounding box only changes if either the points or the
  // transform are dirty.
  if (points.dirty() || transform.dirty()) {
    var transformationMatrix = transform.matrix();
    
    var tMin = transformationMatrix.multiplyByVector(new goog.math.Vec3(points
        .minA(), points.minB(), points.minC()));
    var tMax = transformationMatrix.multiplyByVector(new goog.math.Vec3(points
        .maxA(), points.maxB(), points.maxC()));
    
    if (goog.isNull(this._minX) || tMin.x < this._minX) {
      this._minX = tMin.x;
    }
    if (goog.isNull(this._maxX) || tMax.x > this._maxX) {
      this._maxX = tMax.x;
    }
    if (goog.isNull(this._minY) || tMin.y < this._minY) {
      this._minY = tMin.y;
    }
    if (goog.isNull(this._maxY) || tMax.y > this._maxY) {
      this._maxY = tMax.y;
    }
    if (goog.isNull(this._minZ) || tMin.z < this._minZ) {
      this._minZ = tMin.z;
    }
    if (goog.isNull(this._maxZ) || tMax.z > this._maxZ) {
      this._maxZ = tMax.z;
    }
    // we always keep track of the current center position
    this._center = [(this._minX + this._maxX) / 2,
                    (this._minY + this._maxY) / 2,
                    (this._minZ + this._maxZ) / 2];
    
    // only set the transform clean since we still need to look at the points
    transform.setClean();
  }
  

  //
  // VERTICES
  //
  
  if (existed && points.dirty()) {
    
    // this means the object already existed and the points are dirty
    // therefore, we delete the old gl buffers
    
    // remove old vertex buffer
    var oldVertexBuffer = this._vertexBuffers.get(id);
    if (goog.isDefAndNotNull(oldVertexBuffer)) {
      
      if (this._gl.isBuffer(oldVertexBuffer._glBuffer)) {
        
        this._gl.deleteBuffer(oldVertexBuffer._glBuffer);
        
      }
      
    }
    
  }
  
  var vertexBuffer = null;
  
  if (!existed || points.dirty()) {
    
    // the object either did not exist or the points are dirty, so we re-create
    // the gl buffers and reset the bounding box
    
    var glVertexBuffer = this._gl.createBuffer();
    
    // bind and fill with vertices of current object
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glVertexBuffer);
    
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(points.all()),
        this._gl.STATIC_DRAW);
    
    // create an X.buffer to store the vertices
    // every vertex consists of 3 items (x,y,z)
    vertexBuffer = new X.buffer(glVertexBuffer, points.count(), 3);
    
    points.setClean();
    
  } else {
    
    // the points are not dirty and the object already existed, so use the old
    // buffer
    vertexBuffer = this._vertexBuffers.get(id);
    
  }
  
  this.loader().addProgress(0.3);
  

  //
  // NORMALS
  //
  
  if (existed && normals.dirty()) {
    
    // this means the object already existed and the points are dirty
    // therefore, we delete the old gl buffers
    
    // remove old normals buffer
    var oldNormalBuffer = this._vertexBuffers.get(id);
    if (goog.isDefAndNotNull(oldNormalBuffer)) {
      
      if (this._gl.isBuffer(oldNormalBuffer._glBuffer)) {
        
        this._gl.deleteBuffer(oldNormalBuffer._glBuffer);
        
      }
      
    }
    
  }
  
  var normalBuffer = null;
  
  if (!existed || normals.dirty()) {
    
    // the object either did not exist or the normals are dirty, so we re-create
    // the gl buffers
    
    var glNormalBuffer = this._gl.createBuffer();
    
    // bind and fill with normals of current object
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glNormalBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(normals.all()),
        this._gl.STATIC_DRAW);
    
    // create an X.buffer to store the normals
    // every normal consists of 3 items (x,y,z)
    normalBuffer = new X.buffer(glNormalBuffer, normals.count(), 3);
    
    normals.setClean();
    
  } else {
    
    // the normals are not dirty and the object already existed, so use the old
    // buffer
    normalBuffer = this._normalBuffers.get(id);
    
  }
  
  // update progress
  this.loader().addProgress(0.3);
  

  //
  // COLORS
  //
  // Objects can have point colors which can be different for each fragment.
  // If no point colors are defined, the object has a solid color.
  
  if (existed && colors.dirty()) {
    
    // this means the object already existed and the colors are dirty
    // therefore, we delete the old gl buffers
    
    var oldColorBuffer = this._colorBuffers.get(id);
    if (goog.isDefAndNotNull(oldColorBuffer)) {
      
      if (this._gl.isBuffer(oldColorBuffer._glBuffer)) {
        
        this._gl.deleteBuffer(oldColorBuffer._glBuffer);
        
      }
      
    }
  }
  
  // check if we have point colors, then we need to setup the glBuffer and the
  // X.buffer
  var colorBuffer = null;
  
  if (colors.length() > 0) {
    
    // yes, there are point colors setup
    
    if (!existed || colors.dirty()) {
      
      // the object either did not exist or the colors are dirty, so we
      // re-create the gl buffers
      
      // check if the point colors are valid, note that we use the length for
      // this
      // check which is slightly faster!
      if (colors.length() != points.length()) {
        
        // mismatch, this can not work
        throw new Error('Mismatch between points and point colors.');
        
      }
      var glColorBuffer = this._gl.createBuffer();
      
      // bind and fill with colors defined above
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glColorBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER,
          new Float32Array(colors.all()), this._gl.STATIC_DRAW);
      
      // create an X.buffer to store the colors
      // every color consists of 3 items (r,g,b)
      colorBuffer = new X.buffer(glColorBuffer, colors.count(), 3);
      
      colors.setClean();
      
    } else {
      
      // the colors are not dirty and the object already existed, so use the old
      // buffer
      colorBuffer = this._colorBuffers.get(id);
      
    }
    
  }
  
  this.loader().addProgress(0.2);
  

  //
  // SCALARS
  //
  // Objects can have scalars attached to each vertex.
  
  if (existed && scalars && scalars.dirty()) {
    
    // this means the object already existed and the scalars are dirty
    // therefore, we delete the old gl buffers
    
    var oldScalarBuffer = this._scalarBuffers.get(id);
    if (goog.isDefAndNotNull(oldScalarBuffer)) {
      
      if (this._gl.isBuffer(oldScalarBuffer._glBuffer)) {
        
        this._gl.deleteBuffer(oldScalarBuffer._glBuffer);
        
      }
      
    }
  }
  
  // check if we have scalars, then we need to setup the glBuffer and the
  // X.buffer
  var scalarBuffer = null;
  
  if (scalars) {
    
    // yes, there are scalars setup
    var scalarsArray = scalars._glArray;
    
    if (!existed || scalars.dirty()) {
      
      // the object either did not exist or the scalars are dirty, so we
      // re-create the gl buffers
      
      // check if the scalars are valid - we must match the number of vertices
      // here
      if (scalarsArray.length != points.length()) {
        
        // mismatch, this can not work
        throw new Error('Mismatch between points and scalars.');
        
      }
      var glScalarBuffer = this._gl.createBuffer();
      
      // bind and fill with colors defined above
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glScalarBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER,
          new Float32Array(scalarsArray), this._gl.STATIC_DRAW);
      
      // create an X.buffer to store the colors
      // every scalar consists of 1 item
      scalarBuffer = new X.buffer(glScalarBuffer, scalarsArray.length, 3);
      
      scalars.setClean();
      
    } else {
      
      // the colors are not dirty and the object already existed, so use the old
      // buffer
      scalarBuffer = this._scalarBuffers.get(id);
      
    }
    
  }
  
  this.loader().addProgress(0.1);
  

  //
  // FINAL STEPS
  //
  
  // add the object to the internal tree which reflects the rendering order
  // (based on opacity)
  if (!existed) {
    this._objects.add(object);
  }
  
  // add the buffers for the object to the internal hash maps
  // at this point the buffers are: either null (if possible), a newly generated
  // one or an old one
  this._vertexBuffers.set(id, vertexBuffer);
  this._normalBuffers.set(id, normalBuffer);
  this._colorBuffers.set(id, colorBuffer);
  this._texturePositionBuffers.set(id, texturePositionBuffer);
  this._scalarBuffers.set(id, scalarBuffer);
  
  // clean the object
  object.setClean();
  
  // unlock
  this._locked = false;
  
};


/**
 * (Re-)render all associated displayable objects of this renderer. This method
 * clears the viewport and re-draws everything by looping through the tree of
 * objects. The current perspective and view matrices of the associated camera
 * are used to setup the three-dimensional space.
 */
X.renderer.prototype.render = function() {

  if (!this._canvas || !this._gl || !this._camera) {
    
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
  if (!this.loader().completed()) {
    
    // we are not ready yet.. the loader is still working;
    
    this.showProgressBar_();
    
    // let's check again in a short time
    this._readyCheckTimer = goog.Timer.callOnce(function() {

      this._readyCheckTimer = null; // destroy the timer
      
      // try to render now..
      // if the loader is ready it will work, else wise another single-shot gets
      // configured in 500 ms
      this.render();
      
    }.bind(this), 100); // check again in 500 ms
    
    return; // .. and jump out
    
  } else if (this._progressBar) {
    
    // we are ready! yahoooo!
    // this means the X.loader is done..
    this.hideProgressBar_();
    
    // call the onShowtime function which can be overloaded
    eval("this.onShowtime()");
    this['_initialLoadingCompleted'] = true; // flag the renderer as 'initial
    // loading completed'
    
    // .. we exit here since the hiding takes some time and automatically
    // triggers the rendering when done
    return;
    
  }
  //
  // END OF LOADING
  //
  
  //
  // CURTAIN UP! LET THE SHOW BEGIN..
  //
  this.render_(false, true);
  
};

/**
 * Overload this function to execute code after all initial loading (files,
 * textures..) has completed and just before the first real rendering call.
 */
X.renderer.prototype.onShowtime = function() {

  // do nothing
};


X.renderer.prototype.generateTree_ = function(object, level) {

  var output = "";
  
  for ( var l = 0; l < level; l++) {
    
    output += ">";
    
  }
  
  output += object.id();
  
  if (object.hasChildren()) {
    
    // loop through the children
    var children = object.children();
    var numberOfChildren = children.length;
    var c = 0;
    
    for (c = 0; c < numberOfChildren; c++) {
      
      this.generateTree_(children[c], level + 1);
      
    }
    
  }
  
};


/**
 * Get the added X.object with the given id.
 * 
 * @param {!number} id The object's id.
 * @return {?X.object} The requested X.object or null if it was not found.
 */
X.renderer.prototype.get = function(id) {

  // TODO we can store the objects ordered and do a binary search here
  
  if (!goog.isDefAndNotNull(id)) {
    
    throw new Error('Invalid object id.');
    
  }
  
  var objects = this._objects.values();
  var k = 0;
  var numberOfObjects = objects.length;
  
  for (k = 0; k < numberOfObjects; k++) {
    
    if (objects[k].id() == id) {
      
      return objects[k];
      
    }
    
  }
  
  // not found
  return null;
  
};


/**
 * Show the caption of the X.object at viewport position x,y. This performs
 * object picking and shows a tooltip if an object with a caption exists at this
 * position.
 * 
 * @param {number} x
 * @param {number} y
 */
X.renderer.prototype.showCaption_ = function(x, y) {

  var pickedId = this.pick(x, y);
  
  var object = this.get(pickedId);
  
  if (object) {
    
    var caption = object.caption();
    
    if (caption) {
      
      var t = new X.caption(this.container(), this.container().offsetLeft + x +
          10, this.container().offsetTop + y + 10, this.interactor());
      t.setHtml(caption);
      
    }
    
  }
  
};


/**
 * (Re-)configure the volume rendering orientation based on the current view
 * matrix of the camera. We always use the slices which are best oriented to
 * create the tiled textures of X.volumes.
 * 
 * @param {X.volume} volume The X.volume to configure
 */
X.renderer.prototype.orientVolume_ = function(volume) {

  // TODO once we have arbitary sliced volumes, we need to modify the vectors
  // here
  var centroidVector = new goog.math.Vec3(1, 0, 0);
  var realCentroidVector = this._camera.view().multiplyByVector(centroidVector);
  var distanceFromEyeX = goog.math.Vec3.distance(this._camera.focus(),
      realCentroidVector);
  centroidVector = new goog.math.Vec3(-1, 0, 0);
  realCentroidVector = this._camera.view().multiplyByVector(centroidVector);
  var distanceFromEyeX2 = goog.math.Vec3.distance(this._camera.focus(),
      realCentroidVector);
  
  centroidVector = new goog.math.Vec3(0, 1, 0);
  realCentroidVector = this._camera.view().multiplyByVector(centroidVector);
  var distanceFromEyeY = goog.math.Vec3.distance(this._camera.focus(),
      realCentroidVector);
  centroidVector = new goog.math.Vec3(0, -1, 0);
  realCentroidVector = this._camera.view().multiplyByVector(centroidVector);
  var distanceFromEyeY2 = goog.math.Vec3.distance(this._camera.focus(),
      realCentroidVector);
  
  centroidVector = new goog.math.Vec3(0, 0, 1);
  realCentroidVector = this._camera.view().multiplyByVector(centroidVector);
  var distanceFromEyeZ = goog.math.Vec3.distance(this._camera.focus(),
      realCentroidVector);
  centroidVector = new goog.math.Vec3(0, 0, -1);
  realCentroidVector = this._camera.view().multiplyByVector(centroidVector);
  var distanceFromEyeZ2 = goog.math.Vec3.distance(this._camera.focus(),
      realCentroidVector);
  
  var maxDistance = Math
      .max(distanceFromEyeX, distanceFromEyeY, distanceFromEyeZ,
          distanceFromEyeX2, distanceFromEyeY2, distanceFromEyeZ2);
  
  window.console.time('volumeRendering');
  if (maxDistance == distanceFromEyeX || maxDistance == distanceFromEyeX2) {
    volume.volumeRendering_(0);
  } else if (maxDistance == distanceFromEyeY ||
      maxDistance == distanceFromEyeY2) {
    volume.volumeRendering_(1);
  } else if (maxDistance == distanceFromEyeZ ||
      maxDistance == distanceFromEyeZ2) {
    volume.volumeRendering_(2);
  }
  window.console.timeEnd('volumeRendering');
  
};


X.renderer.prototype.distanceToEye_ = function(object) {

  var centroid = object._points._centroid;
  var centroidVector = new goog.math.Vec3(centroid[0], centroid[1], centroid[2]);
  var transformedCentroidVector = object._transform._matrix
      .multiplyByVector(centroidVector);
  var realCentroidVector = this._camera._view
      .multiplyByVector(transformedCentroidVector);
  var distanceFromEye = goog.math.Vec3.distance(this._camera._position,
      realCentroidVector);
  
  return Math.round(distanceFromEye * 1000) / 1000;
  
};


/**
 * Calculates the distance for each associated X.object and orders objects array
 * accordingly from back-to-front while fully opaque objects are drawn first.
 * Jumps out as early as possible if all objects are fully opaque.
 */
X.renderer.prototype.order_ = function() {

  // by default we do not want to update the rendering order
  var reSortRequired = false;
  
  var topLevelObjects = this._topLevelObjects;
  var numberOfTopLevelObjects = topLevelObjects.length;
  var t;
  t = numberOfTopLevelObjects - 1;
  do {
    
    var object = topLevelObjects[t];
    
    // special case for X.volumes in volumeRendering mode
    // a) we know the volumeRendering direction and the center of the volume
    // b) based on this we can minimize the expensive distance calculation to
    // the first and last slices
    // c) .. and get the distance for the other slices by simple multiplication
    if (object instanceof X.volume && object['_volumeRendering']) {
      
      var _volumeRenderingDirection = object._volumeRenderingDirection;
      
      var _slices = object._slicesX.children();
      if (_volumeRenderingDirection == 1) {
        _slices = object._slicesY.children();
      } else if (_volumeRenderingDirection == 2) {
        _slices = object._slicesZ.children();
      }
      
      var numberOfSlices = _slices.length;
      
      // grab the first slice, attach the distance and opacity
      var firstSlice = _slices[0];
      firstSlice._distance = this.distanceToEye_(firstSlice);
      firstSlice['_opacity'] = object['_opacity'];
      
      // grab the last slice, attach the distance and opacity
      var lastSlice = _slices[numberOfSlices - 1];
      lastSlice._distance = this.distanceToEye_(lastSlice);
      lastSlice['_opacity'] = object['_opacity'];
      
      // get the distanceDifference the distanceStep
      // if these are > 0: the firstSlice is closer to the eye
      // if these are < 0: the lastSlice is closer to the eye
      var distanceDifference = lastSlice._distance - firstSlice._distance;
      var distanceStep = Math
          .round((distanceDifference / numberOfSlices) * 1000) / 1000;
      
      // loop through all other slices in the volumeRendering direction and
      // calculate the distance and attach the opacity
      var s = 1;
      for (s = 1; s < numberOfSlices - 1; s++) {
        
        var currentDistance = Math
            .round((firstSlice._distance + (s * distanceStep)) * 1000) / 1000;
        
        _slices[s]._distance = currentDistance;
        _slices[s]['_opacity'] = object['_opacity'];
        
      }
      
      // we need to update the rendering order
      reSortRequired = true;
      
    }
    
  } while (t--);
  
  var objects = this._objects.values();
  var numberOfObjects = objects.length;
  
  var i;
  i = numberOfObjects - 1;
  do {
    
    var object = objects[i];
    
    if (!object['_visible']) {
      continue;
    }
    
    // the following cases do not need to be calculated
    // a) opacity is 1
    // b) object is an X.slice since we take care of that when grabbing the
    // volume
    if ((object['_opacity'] == 1) || (object instanceof X.slice)) {
      
      continue;
      
    }
    
    // attach the distance from the eye to the object
    object._distance = this.distanceToEye_(object);
    
    // we need to update the rendering order
    reSortRequired = true;
    
  } while (i--);
  
  // only re-sort the tree if required
  if (reSortRequired) {
    
    this._objects.sort();
    
  }
  
};


/**
 * Picks an object at a position defined by display coordinates. If
 * X.renderer.config['PICKING_ENABLED'] is FALSE, this function always returns
 * -1.
 * 
 * @param {!number} x The X-value of the display coordinates.
 * @param {!number} y The Y-value of the display coordinates.
 * @return {number} The ID of the found X.object or -1 if no X.object was found.
 */
X.renderer.prototype.pick = function(x, y) {

  if (this['config']['PICKING_ENABLED']) {
    
    // render again with picking turned on which renders the scene in a
    // framebuffer
    this.render_(true, false);
    
    // grab the content of the framebuffer
    var data = new Uint8Array(4);
    this._gl.readPixels(x, this._height - y, 1, 1, this._gl.RGBA,
        this._gl.UNSIGNED_BYTE, data);
    
    // grab the id
    var r = Math.round(data[0] / 255 * 10);
    var g = Math.round(data[1] / 255 * 10);
    var b = Math.round(data[2] / 255 * 10);
    
    return (r * 100 + g * 10 + b);
    
  } else {
    
    return -1;
    
  }
  
};


/**
 * Internal function to perform the actual rendering by looping through all
 * associated X.objects.
 * 
 * @param {boolean} picking If TRUE, render to a framebuffer to perform picking -
 *          if FALSE render to the canvas viewport.
 * @param {?boolean=} invoked If TRUE, the render counts as invoked and f.e.
 *          statistics are generated.
 * @private
 */
X.renderer.prototype.render_ = function(picking, invoked) {

  // only proceed if there are actually objects to render
  var objects = this._objects.values();
  var numberOfObjects = objects.length;
  if (numberOfObjects == 0) {
    // there is nothing to render
    // get outta here
    return;
  }
  
  // picking = false;
  // for ( var y = 0; y < this._topLevelObjects.length; y++) {
  //    
  // var topLevelObject = this._topLevelObjects[y];
  //    
  // if (topLevelObject.hasChildren()) {
  //      
  // // this.generateTree_(topLevelObject, 0);
  //      
  // }
  //    
  // }
  
  if (picking) {
    
    // we are in picking mode, so use the framebuffer rather than the canvas
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._pickFrameBuffer);
    
  } else {
    
    // disable the framebuffer
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    
  }
  
  // clear the canvas
  this._gl.viewport(0, 0, this._width, this._height);
  this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
  
  // grab the current perspective from the camera
  var perspectiveMatrix = this._camera._perspective;
  
  // grab the current view from the camera
  var viewMatrix = this._camera._glView;
  
  // propagate perspective and view matrices to the uniforms of
  // the shader
  this._gl.uniformMatrix4fv(this._uniformLocations
      .get(X.shaders.uniforms.PERSPECTIVE), false, perspectiveMatrix);
  
  this._gl.uniformMatrix4fv(
      this._uniformLocations.get(X.shaders.uniforms.VIEW), false, viewMatrix);
  
  // propagate the objects' center to the shader
  //
  var center = this._center;
  this._gl.uniform3f(this._uniformLocations.get(X.shaders.uniforms.CENTER),
      parseFloat(center[0]), parseFloat(center[1]), parseFloat(center[2]));
  
  window.console.time('orientVolumes');
  //
  // orient volumes for proper volume rendering - if there are any,
  // this means, depending on the direction of the eye, we use the slice stack
  // of a specific axis to create the tiled texture
  var i;
  var topLevelObjectsLength = this._topLevelObjects.length;
  for (i = 0; i < topLevelObjectsLength; ++i) {
    var topLevelObject = this._topLevelObjects[i];
    if (topLevelObject instanceof X.volume) {
      this.orientVolume_(topLevelObject);
    }
  }
  window.console.timeEnd('orientVolumes');
  
  window.console.time('order');
  //
  // re-order the objects, but only if enabled.
  // this ordering should be disabled if the objects' opacity settings are not
  // used or if a large number of objects are associated
  if (this['config']['ORDERING_ENABLED']) {
    
    this.order_();
    
  }
  window.console.timeEnd('order');
  
  var statisticsEnabled = (!picking && goog.isDefAndNotNull(invoked) && invoked && this['config']['STATISTICS_ENABLED']);
  if (statisticsEnabled) {
    
    // for statistics
    var verticesCounter = 0;
    var trianglesCounter = 0;
    var linesCounter = 0;
    var pointsCounter = 0;
    
  }
  
  //
  // caching for multiple objects
  //
  var aPointers = this._attributePointers;
  var aPosition = aPointers.get(X.shaders.attributes.VERTEXPOSITION);
  var aNormal = aPointers.get(X.shaders.attributes.VERTEXNORMAL);
  var aColor = aPointers.get(X.shaders.attributes.VERTEXCOLOR);
  var aTexturePosition = aPointers.get(X.shaders.attributes.VERTEXTEXTUREPOS);
  var aScalar = aPointers.get(X.shaders.attributes.VERTEXSCALAR);
  
  var uLocations = this._uniformLocations;
  var uUsePicking = uLocations.get(X.shaders.uniforms.USEPICKING);
  var uUseObjectColor = uLocations.get(X.shaders.uniforms.USEOBJECTCOLOR);
  var uObjectColor = uLocations.get(X.shaders.uniforms.OBJECTCOLOR);
  var uUseScalars = uLocations.get(X.shaders.uniforms.USESCALARS);
  var uScalarsReplaceMode = uLocations
      .get(X.shaders.uniforms.SCALARSREPLACEMODE);
  var uScalarsMin = uLocations.get(X.shaders.uniforms.SCALARSMIN);
  var uScalarsMax = uLocations.get(X.shaders.uniforms.SCALARSMAX);
  var uScalarsMinColor = uLocations.get(X.shaders.uniforms.SCALARSMINCOLOR);
  var uScalarsMaxColor = uLocations.get(X.shaders.uniforms.SCALARSMAXCOLOR);
  var uScalarsMinThreshold = uLocations
      .get(X.shaders.uniforms.SCALARSMINTHRESHOLD);
  var uScalarsMaxThreshold = uLocations
      .get(X.shaders.uniforms.SCALARSMAXTHRESHOLD);
  var uObjectOpacity = uLocations.get(X.shaders.uniforms.OBJECTOPACITY);
  var uLabelMapOpacity = uLocations.get(X.shaders.uniforms.LABELMAPOPACITY);
  var uUseTexture = uLocations.get(X.shaders.uniforms.USETEXTURE);
  var uUseTextureThreshold = uLocations
      .get(X.shaders.uniforms.USETEXTURETHRESHOLD);
  var uUseLabelMapTexture = uLocations
      .get(X.shaders.uniforms.USELABELMAPTEXTURE);
  var uTextureSampler = uLocations.get(X.shaders.uniforms.TEXTURESAMPLER);
  var uTextureSampler2 = uLocations.get(X.shaders.uniforms.TEXTURESAMPLER2);
  var uVolumeLowerThreshold = uLocations
      .get(X.shaders.uniforms.VOLUMELOWERTHRESHOLD);
  var uVolumeUpperThreshold = uLocations
      .get(X.shaders.uniforms.VOLUMEUPPERTHRESHOLD);
  var uVolumeScalarMin = uLocations.get(X.shaders.uniforms.VOLUMESCALARMIN);
  var uVolumeScalarMax = uLocations.get(X.shaders.uniforms.VOLUMESCALARMAX);
  var uObjectTransform = uLocations.get(X.shaders.uniforms.OBJECTTRANSFORM);
  var uPointSize = uLocations.get(X.shaders.uniforms.POINTSIZE);
  
  //
  // loop through all objects and (re-)draw them
  
  i = numberOfObjects;
  window.console.time('realRenderingLoop');
  do {
    
    var object = objects[numberOfObjects - i];
    
    if (object) {
      // we have a valid object
      
      // special case for volumes
      var volume = null;
      
      if (object instanceof X.slice && object._volume) {
        
        // we got a volume
        volume = object._volume;
        
      }
      
      // check visibility
      if (!object['_visible'] || (volume && !volume['_visible'])) {
        
        // not visible, continue to the next one..
        continue;
        
      }
      
      var id = object['_id'];
      
      var magicMode = object['_magicMode'];
      
      var vertexBuffer = this._vertexBuffers.get(id);
      var normalBuffer = this._normalBuffers.get(id);
      
      var colorBuffer = this._colorBuffers.get(id);
      var scalarBuffer = this._scalarBuffers.get(id);
      var texturePositionBuffer = this._texturePositionBuffers.get(id);
      
      // ..bind the glBuffers
      
      // VERTICES
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer._glBuffer);
      
      this._gl.vertexAttribPointer(aPosition, vertexBuffer._itemSize,
          this._gl.FLOAT, false, 0, 0);
      
      // NORMALS
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, normalBuffer._glBuffer);
      
      this._gl.vertexAttribPointer(aNormal, normalBuffer._itemSize,
          this._gl.FLOAT, false, 0, 0);
      
      if (picking) {
        
        // in picking mode, we use a color based on the id of this object
        this._gl.uniform1i(uUsePicking, true);
        
      } else {
        
        // in picking mode, we use a color based on the id of this object
        this._gl.uniform1i(uUsePicking, false);
        
      }
      
      // COLORS
      if (colorBuffer && !picking && !magicMode) {
        
        // point colors are defined for this object and there is not picking
        // request and no magicMode active
        
        // de-activate the useObjectColor flag on the shader
        this._gl.uniform1i(uUseObjectColor, false);
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, colorBuffer._glBuffer);
        
        this._gl.vertexAttribPointer(aColor, colorBuffer._itemSize,
            this._gl.FLOAT, false, 0, 0);
        
      } else {
        
        // we have a fixed object color or this is 'picking' mode
        var useObjectColor = 1;
        
        // some magic mode support
        if (magicMode && !picking) {
          
          useObjectColor = 0;
          
        }
        
        // activate the useObjectColor flag on the shader
        // in magicMode, this is always false!
        this._gl.uniform1i(uUseObjectColor, useObjectColor);
        
        var objectColor = object['_color'];
        
        if (picking) {
          
          if (id > 999) {
            
            throw new Error('Id out of bounds.');
            
          }
          
          // split the id
          // f.e. 15:
          // r = 0 / 10
          // g = 1 / 10
          // b = 5 / 10
          var r = Math.floor(id * 0.01);
          var g = Math.floor(id * 0.1) - r * 10;
          var b = id - r * 100 - g * 10;
          
          // and set it as the color
          objectColor = [r / 10, g / 10, b / 10];
        }
        
        this._gl.uniform3f(uObjectColor, parseFloat(objectColor[0]),
            parseFloat(objectColor[1]), parseFloat(objectColor[2]));
        
        // we always have to configure the attribute of the point colors
        // even if no point colors are in use
        this._gl.vertexAttribPointer(aColor, vertexBuffer._itemSize,
            this._gl.FLOAT, false, 0, 0);
        
      }
      
      // SCALARS
      if (scalarBuffer && !picking && !magicMode) {
        
        // scalars are defined for this object and there is not picking
        // request and no magicMode active
        
        // activate the useScalars flag on the shader
        this._gl.uniform1i(uUseScalars, true);
        
        // propagate the replace flag
        this._gl.uniform1i(uScalarsReplaceMode, object._scalars._replaceMode);
        
        var minColor = object._scalars['_minColor'];
        var maxColor = object._scalars['_maxColor'];
        
        // propagate minColors and maxColors for the scalars
        this._gl.uniform3f(uScalarsMinColor, parseFloat(minColor[0]),
            parseFloat(minColor[1]), parseFloat(minColor[2]));
        this._gl.uniform3f(uScalarsMaxColor, parseFloat(maxColor[0]),
            parseFloat(maxColor[1]), parseFloat(maxColor[2]));
        
        // propagate minThreshold and maxThreshold for the scalars
        this._gl.uniform1f(uScalarsMinThreshold,
            parseFloat(object._scalars['_minThreshold']));
        this._gl.uniform1f(uScalarsMaxThreshold,
            parseFloat(object._scalars['_maxThreshold']));
        
        // propagate min and max for the scalars
        this._gl.uniform1f(uScalarsMin, parseFloat(object._scalars._min));
        this._gl.uniform1f(uScalarsMax, parseFloat(object._scalars._max));
        

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, scalarBuffer._glBuffer);
        
        this._gl.vertexAttribPointer(aScalar, scalarBuffer._itemSize,
            this._gl.FLOAT, false, 0, 0);
        
      } else {
        
        // de-activate the useScalars flag on the shader
        this._gl.uniform1i(uUseScalars, false);
        
        // we always have to configure the attribute of the scalars
        // even if no scalars are in use
        this._gl.vertexAttribPointer(aScalar, vertexBuffer._itemSize,
            this._gl.FLOAT, false, 0, 0);
        
      }
      
      // OPACITY
      this._gl.uniform1f(uObjectOpacity, parseFloat(object['_opacity']));
      
      // TEXTURE
      if (object._texture && texturePositionBuffer && !picking) {
        //
        // texture associated to this object
        //
        
        // activate the texture flag on the shader
        this._gl.uniform1i(uUseTexture, true);
        
        // setup the sampler
        
        // bind the texture
        this._gl.activeTexture(this._gl.TEXTURE0);
        
        // grab the texture from the internal hash map using the id as the
        // key
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._textures
            .get(object._texture['_id']));
        this._gl.uniform1i(uTextureSampler, 0);
        
        // propagate the current texture-coordinate-map to WebGL
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER,
            texturePositionBuffer._glBuffer);
        
        this._gl.vertexAttribPointer(aTexturePosition,
            texturePositionBuffer._itemSize, this._gl.FLOAT, false, 0, 0);
        
        // by default, don't use thresholding
        this._gl.uniform1i(uUseTextureThreshold, false);
        
      } else {
        
        // no texture for this object or 'picking' mode
        this._gl.uniform1i(uUseTexture, false);
        
        // we always have to configure the attribute of the texture positions
        // even if no textures are in use
        this._gl.vertexAttribPointer(aTexturePosition, vertexBuffer._itemSize,
            this._gl.FLOAT, false, 0, 0);
        
      }
      
      // VOLUMES
      // several special values need to be passed to the shaders if the object
      // is a X.slice (part of an X.volume)
      // this is the case if we have a volume here..
      if (volume) {
        
        // enable texture thresholding for volumes
        this._gl.uniform1i(uUseTextureThreshold, true);
        
        // pass the lower threshold
        this._gl.uniform1f(uVolumeLowerThreshold, volume['_lowerThreshold']);
        // pass the upper threshold
        this._gl.uniform1f(uVolumeUpperThreshold, volume['_upperThreshold']);
        
        // pass the scalar range
        var scalarRange = volume._scalarRange;
        this._gl.uniform1f(uVolumeScalarMin, scalarRange[0]);
        this._gl.uniform1f(uVolumeScalarMax, scalarRange[1]);
        
        // get the (optional) label map
        var labelMap = volume._labelMap;
        
        // no labelMap by default
        this._gl.uniform1i(uUseLabelMapTexture, false);
        
        // opacity, only if volume rendering is active
        if (volume['_volumeRendering']) {
          
          this._gl.uniform1f(uObjectOpacity, parseFloat(volume['_opacity']));
          
        } else if (labelMap && labelMap['_visible']) {
          // only if we have an associated labelMap..
          
          // grab the id of the labelMap
          var labelMapTextureID = object._labelMap['_id'];
          
          // we handle a second texture, actually the one for the labelMap
          this._gl.uniform1i(uUseLabelMapTexture, true);
          
          // bind the texture
          this._gl.activeTexture(this._gl.TEXTURE1);
          
          // grab the texture from the internal hash map using the id as
          // the key
          this._gl.bindTexture(this._gl.TEXTURE_2D, this._textures
              .get(labelMapTextureID));
          this._gl.uniform1i(uTextureSampler2, 1);
          
          // propagate label map opacity
          this._gl.uniform1f(uLabelMapOpacity, labelMap['_opacity']);
          
        }
        
      }
      
      // TRANSFORMS
      // propagate transform to the uniform matrices of the shader
      this._gl.uniformMatrix4fv(uObjectTransform, false,
          object._transform._glMatrix);
      
      // POINT SIZE
      var pointSize = 1;
      if (object['_type'] == X.object.types.POINTS) {
        pointSize = object['_pointSize'];
      }
      this._gl.uniform1f(uPointSize, pointSize);
      
      //
      // .. and draw with the object's DRAW MODE
      //
      var drawMode = -1;
      if (object.type() == X.object.types.TRIANGLES) {
        
        drawMode = this._gl.TRIANGLES;
        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }
        
      } else if (object.type() == X.object.types.LINES) {
        
        this._gl.lineWidth(object.lineWidth());
        
        drawMode = this._gl.LINES;
        if (statisticsEnabled) {
          linesCounter += (vertexBuffer._itemCount / 2);
        }
        
      } else if (object.type() == X.object.types.POINTS) {
        
        drawMode = this._gl.POINTS;
        if (statisticsEnabled) {
          pointsCounter += vertexBuffer._itemCount;
        }
        
      } else if (object.type() == X.object.types.TRIANGLE_STRIPS) {
        
        drawMode = this._gl.TRIANGLE_STRIP;
        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }
        
      } else if (object.type() == X.object.types.POLYGONS) {
        
        // TODO right now, this is hacked.. we need to use the Van Gogh
        // triangulation algorithm or something faster to properly convert
        // POLYGONS to TRIANGLES.
        // Remark: The Van Gogh algorithm is implemented in the
        // X.object.toCSG/fromCSG functions but not used here.
        if (vertexBuffer._itemCount % 3 == 0) {
          
          drawMode = this._gl.TRIANGLES;
          
        } else {
          
          drawMode = this._gl.TRIANGLE_FAN;
          
        }
        
        if (statisticsEnabled) {
          trianglesCounter += (vertexBuffer._itemCount / 3);
        }
        
      }
      
      if (statisticsEnabled) {
        
        verticesCounter += vertexBuffer._itemCount;
        
      }
      
      // push it to the GPU, baby..
      this._gl.drawArrays(drawMode, 0, vertexBuffer._itemCount);
      
    }
    
  } while (--i); // loop through objects
  window.console.timeEnd('realRenderingLoop');
  
  if (statisticsEnabled) {
    
    var statistics = "Objects: " + numberOfObjects + " | ";
    statistics += "Vertices: " + verticesCounter + " | ";
    statistics += "Triangles: " + Math.round(trianglesCounter) + " | ";
    statistics += "Lines: " + linesCounter + " | ";
    statistics += "Points: " + pointsCounter + " | ";
    statistics += "Textures: " + this._textures.getCount();
    window.console.log(statistics);
    
  }
  
};


/**
 * Destroy this renderer.
 */
X.renderer.prototype.destroy = function() {

  // remove all objects
  this._objects.clear();
  delete this._objects;
  this._topLevelObjects.length = 0;
  delete this._topLevelObjects;
  
  // remove shaders, loader, camera and interactor
  this._shaders = null;
  delete this._shaders;
  this._loader = null;
  delete this._loader;
  this._camera = null;
  delete this._camera;
  this._interactor = null;
  delete this._interactor;
  
  // remove the gl context
  this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
  this._gl = null;
  delete this._gl;
  
  // remove the canvas from the dom tree
  goog.dom.removeNode(this._canvas);
  delete this._canvas;
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer', X.renderer);
goog.exportSymbol('X.renderer.prototype.width', X.renderer.prototype.width);
goog.exportSymbol('X.renderer.prototype.height', X.renderer.prototype.height);
goog.exportSymbol('X.renderer.prototype.canvas', X.renderer.prototype.canvas);
goog.exportSymbol('X.renderer.prototype.container',
    X.renderer.prototype.container);
goog.exportSymbol('X.renderer.prototype.camera', X.renderer.prototype.camera);
goog.exportSymbol('X.renderer.prototype.interactor',
    X.renderer.prototype.interactor);
goog.exportSymbol('X.renderer.prototype.resetBoundingBox',
    X.renderer.prototype.resetBoundingBox);
goog.exportSymbol('X.renderer.prototype.resetViewAndRender',
    X.renderer.prototype.resetViewAndRender);
goog.exportSymbol('X.renderer.prototype.init', X.renderer.prototype.init);
goog.exportSymbol('X.renderer.prototype.add', X.renderer.prototype.add);
goog.exportSymbol('X.renderer.prototype.onShowtime',
    X.renderer.prototype.onShowtime);
goog.exportSymbol('X.renderer.prototype.get', X.renderer.prototype.get);
goog.exportSymbol('X.renderer.prototype.pick', X.renderer.prototype.pick);
goog.exportSymbol('X.renderer.prototype.render', X.renderer.prototype.render);
goog.exportSymbol('X.renderer.prototype.destroy', X.renderer.prototype.destroy);
