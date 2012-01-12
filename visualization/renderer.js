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
goog.require('X.base');
goog.require('X.buffer');
goog.require('X.camera');
goog.require('X.caption');
goog.require('X.event');
goog.require('X.exception');
goog.require('X.interactor');
goog.require('X.loader');
goog.require('X.matrix');
goog.require('X.object');
goog.require('X.progressbar');
goog.require('X.shaders');
goog.require('X.triplets');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.iter.Iterator');
goog.require('goog.math.Vec3');
goog.require('goog.structs.Map');
goog.require('goog.Timer');
goog.require('goog.ui.Dialog');



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
    
    throw new X.exception('An ID to a valid container (<div>..) is required!');
    
  }
  
  // check if the passed container is really valid
  var _container = goog.dom.getElement(container);
  
  if (!goog.dom.isElement(_container) || _container.clientWidth == 0 ||
      _container.clientHeight == 0) {
    
    throw new X.exception(
        'Could not find the given container or it has an undefined size!');
    
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
  this._className = 'renderer';
  
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
   * An array containing the displayable objects of this renderer.
   * 
   * @type {!Array}
   * @protected
   */
  this._objects = new Array();
  
  /**
   * An array containing the topLevel objects (which do not have parents) of
   * this renderer.
   * 
   * @type {!Array}
   * @protected
   */
  this._topLevelObjects = new Array();
  
  // TODO jsdoc
  this._minX = null;
  this._maxX = null;
  this._minY = null;
  this._maxY = null;
  this._minZ = null;
  this._maxZ = null;
  this._center = [0, 0, 0];
  
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
  
  window.console.log('XTK Release 0 -- http://www.goXTK.com');
};
// inherit from X.base
goog.inherits(X.renderer, X.base);


/**
 * The configuration of this renderer.
 * 
 * @enum {boolean}
 */
X.renderer.prototype.config = {
  PROGRESSBAR_ENABLED: true,
  PICKING_ENABLED: true
};


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
 * Shows the loading progress bar by modifying the DOM tree.
 */
X.renderer.prototype.showProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this.config.PROGRESSBAR_ENABLED) {
    
    // create a progress bar here if this is the first render request and the
    // loader is working
    if (!this._progressBar) {
      
      this._progressBar = new X.progressbar(this.container(), 0);
      
    }
    
  }
  
};


/**
 * Hides the loading progress bar.
 */
X.renderer.prototype.hideProgressBar_ = function() {

  // only do the following if the progressBar was not turned off
  if (this.config.PROGRESSBAR_ENABLED) {
    
    if (this._progressBar) {
      
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
  this.render_(false);
  
};


/**
 * Create the canvas of this renderer inside the configured container and using
 * attributes like width, height etc. Then, initialize the WebGL context and
 * attach all necessary objects (e.g. camera, shaders..). Finally, initialize
 * the event listeners.
 * 
 * @throws {X.exception} An exception if there were problems during
 *           initialization.
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
    var errorDialog = new goog.ui.Popup(this.container());
    // errorDialog.setContent('mmm');
    // errorDialog.setTitle('Ooops..');
    // errorDialog.setHasTitleCloseButton(false);
    // errorDialog.setButtonSet(null);
    errorDialog.setVisible(true);
    
    throw new X.exception('WebGL not supported!');
    
  }
  
  //
  // Step2: Configure the context
  //
  try {
    
    // gl.viewport(0, 0, this.width(), this.height());
    
    // configure opacity to 0.0 to overwrite the viewport background-color by
    // the container color
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
    // enable transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // gl.polygonOffset(1.0, 1.0);
    // .. with perspective rendering
    gl.depthFunc(gl.LEQUAL);
    
    // clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    if (this.config.PICKING_ENABLED) {
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
    throw new X.exception('Exception while accessing GL Context!\n' + e);
    
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
      false));
  
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
    
    throw new X.exception('Renderer was not initialized properly!');
    
  }
  
  // check if the given shaders are valid
  if (!goog.isDefAndNotNull(shaders) || !(shaders instanceof X.shaders)) {
    
    throw new X.exception('Could not add shaders!');
    
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
    
    throw new X.exception('Fragement Shader compilation failed!\n' +
        this._gl.getShaderInfoLog(glFragmentShader));
    
  }
  
  if (!this._gl.getShaderParameter(glVertexShader, this._gl.COMPILE_STATUS)) {
    
    throw new X.exception('Vertex Shader compilation failed!\n' +
        this._gl.getShaderInfoLog(glVertexShader));
    
  }
  
  // create a shaderProgram, attach the shaders and link'em all together
  var shaderProgram = this._gl.createProgram();
  this._gl.attachShader(shaderProgram, glVertexShader);
  this._gl.attachShader(shaderProgram, glFragmentShader);
  this._gl.linkProgram(shaderProgram);
  
  if (!this._gl.getProgramParameter(shaderProgram, this._gl.LINK_STATUS)) {
    
    throw new X.exception('Could not create shader program!\n' +
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
 * @throws {X.exception} An exception if something goes wrong.
 */
X.renderer.prototype.add = function(object) {

  // we know that objects which are directly added using this function are def.
  // top-level objects, meaning that they do not have a parent
  this._topLevelObjects.push(object);
  
  this.add_(object);
  
};


/**
 * Add a new displayable object to this renderer. The renderer has to be
 * initialized before doing so. A X.renderer.render() call has to be initiated
 * to display added objects.
 * 
 * @param {!X.object} object The displayable object to add to this renderer.
 * @throws {X.exception} An exception if something goes wrong.
 */
X.renderer.prototype.add_ = function(object) {

  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl) ||
      !goog.isDefAndNotNull(this._camera)) {
    
    throw new X.exception('Renderer was not initialized properly!');
    
  }
  
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    
    throw new X.exception('Illegal object!');
    
  }
  
  // MULTI OBJECTS
  //
  // objects can have N child objects which again can have M child objects and
  // so on
  //
  // check if this object has children
  if (object.hasChildren()) {
    
    // loop through the children and recursively setup the object
    var children = object.children();
    var numberOfChildren = children.length;
    var c = 0;
    
    for (c = 0; c < numberOfChildren; c++) {
      
      this.add(children[c]);
      
    }
    
  }
  
  // listen to modified events of this object
  goog.events.listen(object, X.event.events.MODIFIED, this.onModified
      .bind(this));
  
  this.update_(object);
  
};


/**
 * Configure a displayable object within this renderer. The object can be a
 * newly created one or an existing one. A X.renderer.render() call has to be
 * initiated to display the object.
 * 
 * @param {!X.object} object The displayable object to setup within this
 *          renderer.
 * @throws {X.exception} An exception if something goes wrong.
 * @private
 */
X.renderer.prototype.update_ = function(object) {

  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl) ||
      !goog.isDefAndNotNull(this._camera)) {
    
    throw new X.exception('Renderer was not initialized properly!');
    
  }
  
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    
    throw new X.exception('Illegal object!');
    
  }
  
  // check if object already existed..
  var existed = false;
  
  if (this.get(object.id())) {
    
    // this means, we are updating
    existed = true;
    
  }
  
  // here we check if additional loading is necessary
  // this would be the case if
  // a) the object has an external texture
  // b) the object is based on an external file (vtk, stl...)
  // in these cases, we do not directly update the object but activate the
  // X.loader to get the externals and then let it call the update method
  if (goog.isDefAndNotNull(object.texture()) && object.texture().dirty()) {
    // texture associated to this object and it is dirty..
    
    // start loading..
    this.loader().loadTexture(object);
    
    return;
    
  } else if (goog.isDefAndNotNull(object.file()) && object.file().dirty()) {
    // this object is based on an external file and it is dirty..
    
    // start loading..
    this.loader().loadFile(object);
    
    return;
    
  }
  
  // check if this is an empty object, if yes, jump out
  // empty objects can be used to group objects
  if (object.points().count() == 0) {
    
    return;
    
  }
  

  // a simple locking mechanism to prevent multiple calls when using
  // asynchronous requests
  var counter = 0;
  while (this._locked) {
    
    // wait
    counter++;
    
  }
  
  this._locked = true;
  

  //
  // VERTICES
  //
  
  if (existed && object.points().dirty()) {
    
    // this means the object already existed and the points are dirty
    // therefore, we delete the old gl buffers
    
    // remove old vertex buffer
    var oldVertexBuffer = this._vertexBuffers.get(object.id());
    if (goog.isDefAndNotNull(oldVertexBuffer)) {
      
      if (this._gl.isBuffer(oldVertexBuffer.glBuffer())) {
        
        this._gl.deleteBuffer(oldVertexBuffer.glBuffer());
        
      }
      
    }
    
  }
  
  var vertexBuffer = null;
  
  if (!existed || object.points().dirty()) {
    
    // the object either did not exist or the points are dirty, so we re-create
    // the gl buffers and reset the bounding box
    
    var glVertexBuffer = this._gl.createBuffer();
    
    var points = object.points();
    
    // bind and fill with vertices of current object
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glVertexBuffer);
    
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(points.all()),
        this._gl.STATIC_DRAW);
    
    // create an X.buffer to store the vertices
    // every vertex consists of 3 items (x,y,z)
    vertexBuffer = new X.buffer(glVertexBuffer, points.count(), 3);
    
    //
    // BOUNDING BOX
    //
    // The global bounding incorporates all individual bounding boxes of the
    // objects
    
    var transformationMatrix = object.transform().matrix();
    
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
    
  } else {
    
    // the points are not dirty and the object already existed, so use the old
    // buffer
    vertexBuffer = this._vertexBuffers.get(object.id());
    
  }
  
  this.loader().addProgress(0.3);
  

  //
  // NORMALS
  //
  
  if (existed && object.normals().dirty()) {
    
    // this means the object already existed and the points are dirty
    // therefore, we delete the old gl buffers
    
    // remove old normals buffer
    var oldNormalBuffer = this._vertexBuffers.get(object.id());
    if (goog.isDefAndNotNull(oldNormalBuffer)) {
      
      if (this._gl.isBuffer(oldNormalBuffer.glBuffer())) {
        
        this._gl.deleteBuffer(oldNormalBuffer.glBuffer());
        
      }
      
    }
    
  }
  
  var normalBuffer = null;
  
  if (!existed || object.normals().dirty()) {
    
    // the object either did not exist or the normals are dirty, so we re-create
    // the gl buffers
    
    var glNormalBuffer = this._gl.createBuffer();
    
    // bind and fill with normals of current object
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glNormalBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object
        .normals().all()), this._gl.STATIC_DRAW);
    
    // create an X.buffer to store the normals
    // every normal consists of 3 items (x,y,z)
    normalBuffer = new X.buffer(glNormalBuffer, object.normals().count(), 3);
    
  } else {
    
    // the normals are not dirty and the object already existed, so use the old
    // buffer
    normalBuffer = this._normalBuffers.get(object.id());
    
  }
  


  // update progress
  this.loader().addProgress(0.3);
  
  //
  // COLORS
  //
  // Objects can have point colors which can be different for each fragment.
  // If no point colors are defined, the object has a solid color.
  
  if (existed && object.colors().dirty()) {
    
    // this means the object already existed and the colors are dirty
    // therefore, we delete the old gl buffers
    
    var oldColorBuffer = this._colorBuffers.get(object.id());
    if (goog.isDefAndNotNull(oldColorBuffer)) {
      
      if (this._gl.isBuffer(oldColorBuffer.glBuffer())) {
        
        this._gl.deleteBuffer(oldColorBuffer.glBuffer());
        
      }
      
    }
  }
  
  // check if we have point colors, then we need to setup the glBuffer and the
  // X.buffer
  var colorBuffer = null;
  
  if (object.colors().length() > 0) {
    
    // yes, there are point colors setup
    
    if (!existed || object.colors().dirty()) {
      
      // the object either did not exist or the colors are dirty, so we
      // re-create the gl buffers
      
      // check if the point colors are valid, note that we use the length for
      // this
      // check which is slightly faster!
      if (object.colors().length() != object.points().length()) {
        
        // mismatch, this can not work
        throw new X.exception('Mismatch between points and point colors!');
        
      }
      var glColorBuffer = this._gl.createBuffer();
      
      // bind and fill with colors defined above
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glColorBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object
          .colors().all()), this._gl.STATIC_DRAW);
      
      // create an X.buffer to store the colors
      // every color consists of 3 items (r,g,b)
      colorBuffer = new X.buffer(glColorBuffer, object.colors().count(), 3);
      
    } else {
      
      // the colors are not dirty and the object already existed, so use the old
      // buffer
      colorBuffer = this._colorBuffers.get(object.id());
      
    }
    
  }
  
  this.loader().addProgress(0.3);
  
  //
  // TEXTURE
  //
  
  if (existed && goog.isDefAndNotNull(object.texture()) &&
      object.texture().dirty()) {
    
    // this means the object already existed and the texture is dirty
    // therefore, we delete the old gl buffers
    
    var oldTexturePositionBuffer = this._texturePositionBuffers
        .get(object.id());
    if (goog.isDefAndNotNull(oldTexturePositionBuffer)) {
      
      if (this._gl.isBuffer(oldTexturePositionBuffer.glBuffer())) {
        
        this._gl.deleteBuffer(oldTexturePositionBuffer.glBuffer());
        
      }
      
    }
  }
  
  var texturePositionBuffer = null;
  if (goog.isDefAndNotNull(object.texture())) {
    // texture associated to this object
    
    if (!existed || object.texture().dirty()) {
      
      // the object either did not exist or the texture is dirty, so we
      // re-create the gl buffers
      
      // check if we have a valid texture-to-object's-coordinate map
      if (!goog.isDefAndNotNull(object.textureCoordinateMap())) {
        
        var m = 'Can not add an object and texture ';
        m += 'without valid coordinate mapping! Set the textureCoordinateMap!';
        throw new X.exception(m);
        
      }
      
      // setup the glTexture, at this point the image for the texture was
      // already
      // loaded thanks to X.loader
      var texture = this._gl.createTexture();
      
      // connect the image and the glTexture
      texture.image = object.texture().image();
      
      //
      // activate the texture on the WebGL side
      this._textures.set(object.texture().file(), texture);
      
      this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
      
      this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
      this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA,
          this._gl.UNSIGNED_BYTE, texture.image);
      
      // TODO different filters?
      this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER,
          this._gl.LINEAR);
      this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER,
          this._gl.LINEAR);
      
      // release the texture binding to clear things
      this._gl.bindTexture(this._gl.TEXTURE_2D, null);
      
      // create texture buffer
      var glTexturePositionBuffer = this._gl.createBuffer();
      
      // bind and fill with colors defined above
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glTexturePositionBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object
          .textureCoordinateMap()), this._gl.STATIC_DRAW);
      
      // create an X.buffer to store the texture-coordinate map
      texturePositionBuffer = new X.buffer(glTexturePositionBuffer, object
          .textureCoordinateMap().length, 2);
      
    } else {
      
      // the texture is not dirty and the object already existed, so use the old
      // buffer
      texturePositionBuffer = this._texturePositionBuffers.get(object.id());
      
    }
    
    // dirty check
    
  } // check if object has a texture
  
  this.loader().addProgress(0.1);
  
  //
  // FINAL STEPS
  //
  
  // add the object to the internal tree which reflects the rendering order
  // (based on opacity)
  if (!this._objects.push(object)) {
    
    throw new X.exception('Could not add object to this renderer.');
    
  }
  
  // add the buffers for the object to the internal hash maps
  // at this point the buffers are: either null (if possible), a newly generated
  // one or an old one
  this._vertexBuffers.set(object.id(), vertexBuffer);
  this._normalBuffers.set(object.id(), normalBuffer);
  this._colorBuffers.set(object.id(), colorBuffer);
  this._texturePositionBuffers.set(object.id(), texturePositionBuffer);
  
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
    
    throw new X.exception('The renderer was not initialized properly!');
    
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
  
  this.render_(false);
  
};


X.renderer.prototype.generateTree_ = function(object, level) {

  var output = "";
  
  for ( var l = 0; l < level; l++) {
    
    output += ">";
    
  }
  
  output += object.id();
  window.console.log(output);
  
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


X.renderer.prototype.get = function(id) {

  // TODO we can store the objects ordered and do a binary search here
  
  if (!goog.isDefAndNotNull(id)) {
    
    throw new X.exception('Invalid object id.');
    
  }
  
  var k = 0;
  var numberOfObjects = this._objects.length;
  
  for (k = 0; k < numberOfObjects; k++) {
    
    if (this._objects[k].id() == id) {
      
      return this._objects[k];
      
    }
    
  }
  
  // not found
  return null;
  
};


X.renderer.prototype.showCaption_ = function(x, y) {

  var pickedId = this.pick(x, y);
  
  var object = this.get(pickedId);
  
  if (object && object.caption()) {
    
    var t = new X.caption(this.container(), x + 10, y + 10, this.interactor());
    t.setHtml(object.caption());
    
  }
  
};


X.renderer.prototype.pick = function(x, y) {

  if (this.config.PICKING_ENABLED) {
    
    // render again with picking turned on which renders the scene in a
    // framebuffer
    this.render_(true);
    
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


X.renderer.prototype.render_ = function(picking) {

  // picking = false;
  for ( var y = 0; y < this._topLevelObjects.length; y++) {
    
    var topLevelObject = this._topLevelObjects[y];
    
    if (topLevelObject.hasChildren()) {
      
      // this.generateTree_(topLevelObject, 0);
      
    }
    
  }
  
  if (picking) {
    
    // we are in picking mode, so use the framebuffer rather than the canvas
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._pickFrameBuffer);
    
  } else {
    
    // disable the framebuffer
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    
  }
  
  // clear the canvas
  this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
  
  // grab the current perspective from the camera
  var perspectiveMatrix = this._camera.perspective();
  
  // grab the current view from the camera
  var viewMatrix = this._camera.glView();
  
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
  
  //
  // loop through all objects and (re-)draw them
  var objects = this._objects;
  var numberOfObjects = objects.length;
  
  var i;
  for (i = 0; i < numberOfObjects; ++i) {
    
    var object = objects[i];
    
    if (object) {
      // we have a valid object
      
      // check visibility
      if (!object.visible()) {
        
        // not visible, continue to the next one..
        continue;
        
      }
      
      var id = object.id();
      var magicMode = object.magicMode();
      
      var vertexBuffer = this._vertexBuffers.get(id);
      var normalBuffer = this._normalBuffers.get(id);
      var colorBuffer = this._colorBuffers.get(id);
      var texturePositionBuffer = this._texturePositionBuffers.get(id);
      
      // ..bind the glBuffers
      
      // VERTICES
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer.glBuffer());
      
      this._gl.vertexAttribPointer(this._attributePointers
          .get(X.shaders.attributes.VERTEXPOSITION), vertexBuffer.itemSize(),
          this._gl.FLOAT, false, 0, 0);
      
      // NORMALS
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, normalBuffer.glBuffer());
      
      this._gl.vertexAttribPointer(this._attributePointers
          .get(X.shaders.attributes.VERTEXNORMAL), normalBuffer.itemSize(),
          this._gl.FLOAT, false, 0, 0);
      
      if (picking) {
        
        // in picking mode, we use a color based on the id of this object
        this._gl.uniform1i(this._uniformLocations
            .get(X.shaders.uniforms.USEPICKING), true);
        
      } else {
        
        // in picking mode, we use a color based on the id of this object
        this._gl.uniform1i(this._uniformLocations
            .get(X.shaders.uniforms.USEPICKING), false);
        
      }
      
      // COLORS
      if (goog.isDefAndNotNull(colorBuffer) && !picking && !magicMode) {
        
        // point colors are defined for this object and there is not picking
        // request and no magicMode active
        
        // de-activate the useObjectColor flag on the shader
        this._gl.uniform1i(this._uniformLocations
            .get(X.shaders.uniforms.USEOBJECTCOLOR), false);
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, colorBuffer.glBuffer());
        
        this._gl.vertexAttribPointer(this._attributePointers
            .get(X.shaders.attributes.VERTEXCOLOR), colorBuffer.itemSize(),
            this._gl.FLOAT, false, 0, 0);
        
      } else {
        
        // we have a fixed object color or this is 'picking' mode
        
        // activate the useObjectColor flag on the shader
        // in magicMode, this is always false!
        this._gl.uniform1i(this._uniformLocations
            .get(X.shaders.uniforms.USEOBJECTCOLOR), (!magicMode || picking));
        
        var objectColor = object.color();
        
        if (picking) {
          
          if (id > 999) {
            
            throw new X.exception('Id out of bounds.');
            
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
        
        this._gl.uniform3f(this._uniformLocations
            .get(X.shaders.uniforms.OBJECTCOLOR), parseFloat(objectColor[0]),
            parseFloat(objectColor[1]), parseFloat(objectColor[2]));
        
        // we always have to configure the attribute of the point colors
        // even if no point colors are in use
        this._gl.vertexAttribPointer(this._attributePointers
            .get(X.shaders.attributes.VERTEXCOLOR), vertexBuffer.itemSize(),
            this._gl.FLOAT, false, 0, 0);
        
      }
      
      // OPACITY
      this._gl.uniform1f(this._uniformLocations
          .get(X.shaders.uniforms.OBJECTOPACITY), parseFloat(object.opacity()));
      
      // TEXTURE
      if (goog.isDefAndNotNull(object.texture()) &&
          goog.isDefAndNotNull(texturePositionBuffer) && !picking) {
        //
        // texture associated to this object
        //
        
        // activate the texture flag on the shader
        this._gl.uniform1i(this._uniformLocations
            .get(X.shaders.uniforms.USETEXTURE), true);
        
        // setup the sampler
        
        // bind the texture
        this._gl.activeTexture(this._gl.TEXTURE0);
        
        // grab the texture from the internal hash map using the filename as the
        // key
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._textures.get(object
            .texture().file()));
        this._gl.uniform1i(this._uniformLocations
            .get(X.shaders.uniforms.TEXTURESAMPLER), 0);
        
        // propagate the current texture-coordinate-map to WebGL
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, texturePositionBuffer
            .glBuffer());
        
        this._gl.vertexAttribPointer(this._attributePointers
            .get(X.shaders.attributes.VERTEXTEXTUREPOS), texturePositionBuffer
            .itemSize(), this._gl.FLOAT, false, 0, 0);
        
      } else {
        
        // no texture for this object or 'picking' mode
        this._gl.uniform1i(this._uniformLocations
            .get(X.shaders.uniforms.USETEXTURE), false);
        
        // we always have to configure the attribute of the texture positions
        // even if no textures are in use
        this._gl.vertexAttribPointer(this._attributePointers
            .get(X.shaders.attributes.VERTEXTEXTUREPOS), vertexBuffer
            .itemSize(), this._gl.FLOAT, false, 0, 0);
        
      }
      
      // TRANSFORMS
      
      // propagate transform to the uniform matrices of the shader
      this._gl.uniformMatrix4fv(this._uniformLocations
          .get(X.shaders.uniforms.OBJECTTRANSFORM), false, object.transform()
          .glMatrix());
      
      //
      // .. and draw with the object's DRAW MODE
      //
      var drawMode = -1;
      if (object.type() == X.object.types.TRIANGLES) {
        
        drawMode = this._gl.TRIANGLES;
        
      } else if (object.type() == X.object.types.LINES) {
        
        this._gl.lineWidth(object.lineWidth());
        
        drawMode = this._gl.LINES;
        
      } else if (object.type() == X.object.types.TRIANGLE_STRIPS) {
        
        drawMode = this._gl.TRIANGLE_STRIP;
        
      } else if (object.type() == X.object.types.POLYGONS) {
        
        // TODO right now, this is hacked.. we need to use the Van Gogh
        // triangulation algorithm or something faster to properly convert
        // POLYGONS to TRIANGLES.
        if (vertexBuffer.itemCount() % 3 == 0) {
          
          drawMode = this._gl.TRIANGLES;
          
        } else {
          
          drawMode = this._gl.TRIANGLE_FAN;
          
        }
        
      }
      
      // push it to the GPU, baby..
      this._gl.drawArrays(drawMode, 0, vertexBuffer.itemCount());
      
    } else {
      
      var message = 'Could not retrieve object for (re-)drawing!';
      throw new X.exception(message);
      
    }
    
  } // loop through objects
  
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer', X.renderer);
goog.exportSymbol('X.renderer.prototype.config', X.renderer.prototype.config);
goog.exportSymbol('X.renderer.prototype.width', X.renderer.prototype.width);
goog.exportSymbol('X.renderer.prototype.height', X.renderer.prototype.height);
goog.exportSymbol('X.renderer.prototype.canvas', X.renderer.prototype.canvas);
goog.exportSymbol('X.renderer.prototype.container',
    X.renderer.prototype.container);
goog.exportSymbol('X.renderer.prototype.camera', X.renderer.prototype.camera);
goog.exportSymbol('X.renderer.prototype.interactor',
    X.renderer.prototype.interactor);
goog.exportSymbol('X.renderer.prototype.loader', X.renderer.prototype.loader);
goog.exportSymbol('X.renderer.prototype.onProgress',
    X.renderer.prototype.onProgress);
goog.exportSymbol('X.renderer.prototype.onModified',
    X.renderer.prototype.onModified);
goog.exportSymbol('X.renderer.prototype.resetViewAndRender',
    X.renderer.prototype.resetViewAndRender);
goog.exportSymbol('X.renderer.prototype.init', X.renderer.prototype.init);
goog.exportSymbol('X.renderer.prototype.addShaders',
    X.renderer.prototype.addShaders);
goog.exportSymbol('X.renderer.prototype.add', X.renderer.prototype.add);
goog.exportSymbol('X.renderer.prototype.render', X.renderer.prototype.render);
