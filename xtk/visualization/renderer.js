/*
 * ${HEADER}
 */

// provides
goog.provide('X.renderer');
goog.provide('X.renderer.RenderEvent');
goog.provide('X.renderer.ModifiedEvent');

// requires
goog.require('X.base');
goog.require('X.buffer');
goog.require('X.camera');
goog.require('X.event');
goog.require('X.exception');
goog.require('X.interactor');
goog.require('X.loader');
goog.require('X.matrixHelper');
goog.require('X.object');
goog.require('X.shaders');
goog.require('X.triplets');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.iter.Iterator');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec3');
goog.require('goog.structs.AvlTree');
goog.require('goog.structs.Map');
goog.require('goog.Timer');



/**
 * Create a renderer with the given width and height.
 * 
 * @constructor
 * @extends {X.base}
 */
X.renderer = function(container) {

  // check if a container is passed
  if (!goog.isDefAndNotNull(container)) {
    
    throw new X.exception(
        'Fatal: An ID to a valid container (<div>..) is required!');
    
  }
  
  // check if the passed container is really valid
  var _container = goog.dom.getElement(container);
  
  if (!goog.dom.isElement(_container) || _container.clientWidth == 0 ||
      _container.clientHeight == 0) {
    
    throw new X.exception(
        'Fatal: Could not find the given container or it has an undefined size!');
    
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
   * The dimension of this renderer.
   * 
   * @type {!number}
   * @protected
   */
  this._dimension = -1;
  
  /**
   * The HTML container of this renderer, E.g. a <div>.
   * 
   * @type {!Element}
   * @protected
   */
  this._container = goog.dom.getElement(_container);
  
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
   * The background color of this renderer.
   * 
   * @type {!string}
   * @protected
   */
  this._backgroundColor = '#000000';
  
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
   * An AVL tree containing the displayable objects of this renderer. The tree
   * reflects the rendering order for the associated objects.
   * 
   * @type {!goog.structs.AvlTree}
   * @protected
   */
  this._objects = new goog.structs.AvlTree(X.object.OPACITY_COMPARATOR);
  
  /**
   * A hash map of shader attribute pointers.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._attributePointers = new goog.structs.Map();
  
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
  

  this._lighting = true;
  
  /**
   * The loader associated with this renderer.
   * 
   * @type {?X.loader}
   * @protected
   */
  this._loader = null;
  
};
// inherit from X.base
goog.inherits(X.renderer, X.base);


/**
 * The events of this class.
 * 
 * @enum {string}
 */
X.renderer.events = {
  // the render event
  RENDER: X.event.uniqueId('render'),
  MODIFIED: X.event.uniqueId('modified')
};



/**
 * The render event to initiate a re-rendering of all objects.
 * 
 * @constructor
 * @extends {X.event}
 */
X.renderer.RenderEvent = function() {

  // call the default event constructor
  goog.base(this, X.renderer.events.RENDER);
  
  /**
   * The timestamp of this render event.
   * 
   * @type {!number}
   */
  this._timestamp = Date.now();
  
};
// inherit from X.event
goog.inherits(X.renderer.RenderEvent, X.event);


/**
 * The modified event to update a single object.
 * 
 * @constructor
 * @extends {X.event}
 */
X.renderer.ModifiedEvent = function() {

  // call the default event constructor
  goog.base(this, X.renderer.events.MODIFIED);
  
  /**
   * The timestamp of this modified event.
   * 
   * @type {!number}
   */
  this._timestamp = Date.now();
  
  /**
   * The associated X.object of this modified event.
   * 
   * @type {?X.object}
   */
  this._object = null;
  
};
// inherit from X.event
goog.inherits(X.renderer.ModifiedEvent, X.event);



/**
 * Get the dimension of this renderer. E.g. 2 for two-dimensional, 3 for
 * three-dimensional.
 * 
 * @return {!number} The dimension of this renderer.
 */
X.renderer.prototype.dimension = function() {

  return this._dimension;
  
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
 * Get the background color of this renderer.
 * 
 * @return {!string} The background color of this renderer.
 */
X.renderer.prototype.backgroundColor = function() {

  return this._backgroundColor;
  
};


/**
 * Set the background color for this renderer.
 * 
 * @param {!string} backgroundColor The background color for this renderer.
 */
X.renderer.prototype.setBackgroundColor = function(backgroundColor) {

  if (this._canvas) {
    
    // the canvas was already created, let's update it
    this._canvas.style.setProperty('background-color', backgroundColor
        .toString());
    
  }
  
  this._backgroundColor = backgroundColor;
  
};


/**
 * Get the canvas of this renderer. If a canvas does not exist yet it gets
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
 * @return {X.camera} The associated camera.
 */
X.renderer.prototype.camera = function() {

  return this._camera;
  
};


/**
 * Get the interactor of this renderer.
 * 
 * @return {X.interactor} The associated renderer.
 */
X.renderer.prototype.interactor = function() {

  return this._interactor;
  
};


/**
 * Get the lighting of this renderer.
 * 
 * @return {!boolean} TRUE if lighting is active, FALSE if inactive.
 */
X.renderer.prototype.lighting = function() {

  return this._lighting;
  
};


/**
 * Set the lighting of this renderer.
 * 
 * @param {!boolean} lighting TRUE or FALSE to activate/deactivate the
 *          lightning.
 */
X.renderer.prototype.setLighting = function(lighting) {

  this._lighting = lighting;
};


X.renderer.prototype.loader = function() {

  if (!goog.isDefAndNotNull(this._loader)) {
    
    // create a new loader on demand (lazy loading)
    this._loader = new X.loader();
    
    // listen to a modified event which gets fired after loading was completed
    goog.events.listen(this.loader(), X.renderer.events.MODIFIED,
        this.onModified.bind(this));
    
  }
  
  return this._loader;
  
};

X.renderer.prototype.onModified = function(event) {

  var object = event._object;
  window.console.log('start.. ' + object.id() + ': ' + Date());
  this.setupVertices_(object);
  window.console.log('setup vertices.. DONE ' + object.id() + ': ' + Date());
  this.setupObject_(object);
  window.console.log('setup object.. DONE ' + object.id() + ': ' + Date());
  this.render();
  
};


/**
 * Create the canvas of this renderer inside the configured container and using
 * attributes like width, height, backgroundColor etc. Then, initialize the
 * WebGL context and attach all necessary objects (e.g. camera, shaders..).
 * Finally, initialize the event listeners.
 * 
 * @throws {X.exception} An exception if there were problems during
 *           initialization.
 */
X.renderer.prototype.init = function() {

  // get the canvas
  var canvas = this.canvas();
  // css properties
  canvas.style.backgroundColor = this.backgroundColor().toString();
  
  // width and height can not be set using CSS but via object properties
  canvas.width = this.width();
  canvas.height = this.height();
  
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
    // TODO contexts have different names in different browsers
    
  } catch (e) {
    
    throw new X.exception('Fatal: Exception while getting GL Context!\n' + e);
    
  }
  
  //
  // Step2: Check if we got the context, if not, WebGL is not supported
  //
  if (!gl) {
    
    throw new X.exception('Fatal: WebGL not supported!');
    
  }
  
  //
  // Step3: Configure the context
  //
  try {
    
    gl.viewport(0, 0, this.width(), this.height());
    
    // configure opacity to 0.0 to overwrite the viewport background-color by
    // the canvas color
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
    // enable transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    // .. with perspective rendering
    gl.depthFunc(gl.LEQUAL);
    
    // clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
  } catch (e) {
    
    // this exception indicates if the browser supports WebGL
    throw new X.exception('Fatal: Exception while accessing GL Context!\n' + e);
    
  }
  
  //
  // WebGL Viewport initialization done
  // --------------------------------------------------------------------------
  
  // now since we have a valid gl viewport, we want to configure the interactor
  // and camera
  
  //
  // create a new interactor
  var interactor = new X.interactor(canvas);
  interactor.observeMouseWheel();
  interactor.observeMouseClicks();
  interactor.observeMouseMovement();
  

  //
  // create a new camera
  // width and height are required to calculate the perspective
  var camera = new X.camera(this.width(), this.height());
  // observe the interactor for user interactions (mouse-movements etc.)
  camera.observe(interactor);
  // listen to render requests from the camera
  // these get fired after user-interaction and camera re-positioning to re-draw
  // all objects
  goog.events.listen(camera, X.renderer.events.RENDER, this.render.bind(this));
  
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
    
    throw new X.exception('Fatal: Renderer was not initialized properly!');
    
  }
  
  // check if the given shaders are valid
  if (!goog.isDefAndNotNull(shaders) || !(shaders instanceof X.shaders)) {
    
    throw new X.exception('Fatal: Could not add shaders!');
    
  }
  
  // call the validate() method of the shader pair
  // this will cause exceptions if the validation fails..
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
    
    throw new X.exception('Fatal: Fragement Shader compilation failed!\n' +
        this._gl.getShaderInfoLog(glFragmentShader));
    
  }
  
  if (!this._gl.getShaderParameter(glVertexShader, this._gl.COMPILE_STATUS)) {
    
    throw new X.exception('Fatal: Vertex Shader compilation failed!\n' +
        this._gl.getShaderInfoLog(glVertexShader));
    
  }
  
  // create a shaderProgram, attach the shaders and link'em all together
  var shaderProgram = this._gl.createProgram();
  this._gl.attachShader(shaderProgram, glVertexShader);
  this._gl.attachShader(shaderProgram, glFragmentShader);
  this._gl.linkProgram(shaderProgram);
  
  if (!this._gl.getProgramParameter(shaderProgram, this._gl.LINK_STATUS)) {
    
    throw new X.exception('Fatal: Could not create shader program!');
    
  }
  
  // activate the new shaderProgram
  this._gl.useProgram(shaderProgram);
  
  // store the index of the position, color, opacity etc. attributes
  
  // this._attributePointers.set(key, value)
  
  this._vertexPositionAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.position());
  this._gl.enableVertexAttribArray(this._vertexPositionAttribute);
  
  this._normalPositionAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.normal());
  this._gl.enableVertexAttribArray(this._normalPositionAttribute);
  
  this._vertexColorAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.color());
  this._gl.enableVertexAttribArray(this._vertexColorAttribute);
  
  this._texturePositionAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.texturePos());
  this._gl.enableVertexAttribArray(this._texturePositionAttribute);
  
  // attach the shaderProgram to this renderer
  this._shaderProgram = shaderProgram;
  
  // attach the shaders to this renderer
  this._shaders = shaders;
  
};


/**
 * Add a new displayable object to this renderer. The renderer has to be
 * initialized before doing so. A X.renderer.render() call has to be initiated
 * to display added objects.
 * 
 * @param {!X.object} object The displayable object to add to this renderer.
 * @throws {X.exception} An exception if something goes wrong.
 */
X.renderer.prototype.add = function(object) {

  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl) ||
      !goog.isDefAndNotNull(this._camera)) {
    
    throw new X.exception('Fatal: Renderer was not initialized properly!');
    
  }
  
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    
    throw new X.exception('Fatal: Illegal object!');
    
  }
  
  // TODO move this to the update method.. then, objects can have texture _and_
  // be
  // vtk based etc.
  
  // here we check first if additional loading is necessary
  // this would be the case if
  // a) the object has an external texture
  // b) the object is based on an external file (vtk, stl...)
  // in these cases, we do not directly update the object but activate the
  // X.loader to get the externals and then let it call the update method
  if (goog.isDefAndNotNull(object.texture())) {
    // texture associated to this object
    
    // start loading..
    this.loader().loadTexture(object);
    
    return;
    
  } else if (goog.isDefAndNotNull(object.file())) {
    
    this.loader().loadFile(object);
    
    return;
    
  }
  
  // this.loader().loadVtkObject(object);
  // return;
  
  // } else if (object instanceof X.stlObject) {
  
  // this.loader().loadStlObject(object);
  // return;
  
  // }
  
  // no texture or external file
  this.setupVertices_(object);
  
  this.setupObject_(object);
  
};


X.renderer.prototype.setupVertices_ = function(object) {

  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl) ||
      !goog.isDefAndNotNull(this._camera)) {
    
    throw new X.exception('Fatal: Renderer was not initialized properly!');
    
  }
  
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    
    throw new X.exception('Fatal: Illegal object!');
    
  }
  
  // remove old VERTICES
  var oldVertexBuffer = this._vertexBuffers.get(object.id());
  if (goog.isDefAndNotNull(oldVertexBuffer)) {
    
    if (this._gl.isBuffer(oldVertexBuffer.glBuffer())) {
      
      this._gl.deleteBuffer(oldVertexBuffer.glBuffer());
      
    }
    
  }
  

  //
  // VERTICES
  //
  var glVertexBuffer = this._gl.createBuffer();
  
  // bind and fill with vertices of current object
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glVertexBuffer);
  
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object.points()
      .all()), this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the vertices
  // every vertex consists of 3 items (x,y,z)
  var vertexBuffer = new X.buffer(glVertexBuffer, object.points().count(), 3);
  
  // add the buffers for the new object to the internal hash maps
  this._vertexBuffers.set(object.id(), vertexBuffer);
  
};


/**
 * Setup a displayable object within this renderer. The object can be a newly
 * created one or an existing one. A X.renderer.render() call has to be
 * initiated to display the object.
 * 
 * @param {!X.object} object The displayable object to setup within this
 *          renderer.
 * @throws {X.exception} An exception if something goes wrong.
 * @private
 */
X.renderer.prototype.setupObject_ = function(object) {

  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl) ||
      !goog.isDefAndNotNull(this._camera)) {
    
    throw new X.exception('Fatal: Renderer was not initialized properly!');
    
  }
  
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    
    throw new X.exception('Fatal: Illegal object!');
    
  }
  
  // check if object already existed..
  if (this._objects.contains(object)) {
    
    // .. it did
    
    // remove it from the tree
    this._objects.remove(object);
    
    // clear all glBuffers by reading the X.buffer
    


    // NORMALS
    var oldNormalBuffer = this._vertexBuffers.get(object.id());
    if (goog.isDefAndNotNull(oldNormalBuffer)) {
      
      if (this._gl.isBuffer(oldNormalBuffer.glBuffer())) {
        
        this._gl.deleteBuffer(oldNormalBuffer.glBuffer());
        
      }
      
    }
    
    // COLORS
    var oldColorBuffer = this._colorBuffers.get(object.id());
    if (goog.isDefAndNotNull(oldColorBuffer)) {
      
      if (this._gl.isBuffer(oldColorBuffer.glBuffer())) {
        
        this._gl.deleteBuffer(oldColorBuffer.glBuffer());
        
      }
      
    }
    
    // TEXTURE
    var oldTexturePositionBuffer = this._texturePositionBuffers
        .get(object.id());
    if (goog.isDefAndNotNull(oldTexturePositionBuffer)) {
      
      if (this._gl.isBuffer(oldTexturePositionBuffer.glBuffer())) {
        
        this._gl.deleteBuffer(oldTexturePositionBuffer.glBuffer());
        
      }
      
    }
    
  }
  
  //
  // NORMALS
  //
  window.console.log('normals.. START ' + object.id() + ': ' + Date());
  var glNormalBuffer = this._gl.createBuffer();
  
  // bind and fill with normals of current object
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glNormalBuffer);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object.normals()
      .all()), this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the normals
  // every normal consists of 3 items (x,y,z)
  var normalBuffer = new X.buffer(glNormalBuffer, object.normals().count(), 3);
  window.console.log('normals.. DONE ' + object.id() + ': ' + Date());
  
  //
  // COLORS
  //
  // Objects can have point colors which can be different for each fragment.
  // If no point colors are defined, the object has a solid color.
  
  // check if we have point colors, then we need to setup the glBuffer and the
  // X.buffer
  var colorBuffer = null;
  
  if (object.colors().length() > 0) {
    
    // yes, there are point colors setup
    
    // check if the point colors are valid, note that we use the length for this
    // check which is slightly faster!
    if (object.colors().length() != object.points().length()) {
      
      // mismatch, this can not work
      throw new X.exception('Fatal: Mismatch between points and point colors!');
      
    }
    var glColorBuffer = this._gl.createBuffer();
    
    // bind and fill with colors defined above
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glColorBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object.colors()
        .all()), this._gl.STATIC_DRAW);
    
    // create an X.buffer to store the colors
    // every color consists of 3 items (r,g,b)
    colorBuffer = new X.buffer(glColorBuffer, object.colors().count(), 3);
    
  }
  
  //
  // TEXTURE
  //
  var texturePositionBuffer = null;
  if (goog.isDefAndNotNull(object.texture())) {
    // texture associated to this object
    
    // check if we have a valid texture-to-object's-coordinate map
    if (!goog.isDefAndNotNull(object.textureCoordinateMap())) {
      
      var m = 'Fatal: Can not add an object and texture ';
      m += 'without valid coordinate mapping! Set the textureCoordinateMap!';
      throw new X.exception(m);
      
    }
    
    // setup the glTexture, at this point the image for the texture was already
    // loaded thanks to X.loader
    var texture = this._gl.createTexture();
    
    // connect the image and the glTexture
    texture.image = object.texture().image();
    
    this._textures.set(object.texture().file(), texture);
    
    this.activateTexture(texture);
    
    // create texture buffer
    var glTexturePositionBuffer = this._gl.createBuffer();
    
    // bind and fill with colors defined above
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glTexturePositionBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object
        .textureCoordinateMap()), this._gl.STATIC_DRAW);
    
    // create an X.buffer to store the texture-coordinate map
    texturePositionBuffer = new X.buffer(glTexturePositionBuffer, object
        .textureCoordinateMap().length, 2);
    
  } // check if object has a texture
  
  //
  // FINAL STEPS
  //
  
  // add the object to the internal tree which reflects the rendering order
  // (based on opacity)
  if (!this._objects.add(object)) {
    
    throw new X.exception('Fatal: Could not add object to this renderer.');
    
  }
  

  this._normalBuffers.set(object.id(), normalBuffer);
  this._colorBuffers.set(object.id(), colorBuffer);
  this._texturePositionBuffers.set(object.id(), texturePositionBuffer);
};


X.renderer.prototype.activateTexture = function(texture) {

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
  
};


/**
 * (Re-)render all associated displayable objects of this renderer. This method
 * clears the viewport and re-draws everything by looping through the tree of
 * objects. The current perspective and view matrices of the associated camera
 * are used to setup the three-dimensional space.
 */
X.renderer.prototype.render = function() {

  if (!this._canvas || !this._gl || !this._camera) {
    
    throw new X.exception('Fatal: The renderer was not initialized properly!');
    
  }
  
  // READY CHECK
  //
  // now we check if we are ready to display everything
  // - ready means: all textures loaded and setup, all external files loaded and
  // setup and all other objects loaded and setup
  //
  // if we are not ready, we wait and show the progress
  // if we are ready, we continue with the rendering
  
  // let's check if render() was called before and the single-shot timer is
  // already there
  // f.e., if we are in a setInterval-configured render loop, we do not want to
  // create multiple single-shot timers
  if (goog.isDefAndNotNull(this._readyCheckTimer)) {
    
    return;
    
  }
  
  if (!this.loader().completed()) {
    
    // we are not ready yet.. the loader is still working
    this._readyCheckTimer = goog.Timer.callOnce(function() {

      this._readyCheckTimer = null; // destroy the timer
      
      // try to render now..
      // if the loader is ready it will work, else wise another single-shot gets
      // configured in 500 ms
      this.render();
      
    }.bind(this), 500); // check again in 500 ms
    return; // .. and jump out
    
  } else {
    
    // we are ready! yahoooo!
    

  }
  
  //
  // CURTAIN UP! LET THE SHOW BEGIN..
  //
  
  // clear the canvas
  this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
  
  // grab the current perspective from the camera
  var perspectiveMatrix = this._camera.perspective();
  
  // grab the current view from the camera
  var viewMatrix = this._camera.view();
  
  // propagate perspective and view to the uniform matrices of the shader
  var perspectiveUniformLocation = this._gl.getUniformLocation(
      this._shaderProgram, this._shaders.perspective());
  
  this._gl.uniformMatrix4fv(perspectiveUniformLocation, false,
      new Float32Array(perspectiveMatrix.flatten()));
  
  var viewUniformLocation = this._gl.getUniformLocation(this._shaderProgram,
      this._shaders.view());
  
  this._gl.uniformMatrix4fv(viewUniformLocation, false, new Float32Array(
      viewMatrix.flatten()));
  
  var normalUniformLocation = this._gl.getUniformLocation(this._shaderProgram,
      this._shaders.normalUniform());
  
  var matrix = goog.math.Matrix.createIdentityMatrix(3);
  matrix.setValueAt(0, 0, viewMatrix.getValueAt(0, 0));
  matrix.setValueAt(0, 1, viewMatrix.getValueAt(0, 1));
  matrix.setValueAt(0, 2, viewMatrix.getValueAt(0, 2));
  
  matrix.setValueAt(1, 0, viewMatrix.getValueAt(1, 0));
  matrix.setValueAt(1, 1, viewMatrix.getValueAt(1, 1));
  matrix.setValueAt(1, 2, viewMatrix.getValueAt(1, 2));
  
  matrix.setValueAt(2, 0, viewMatrix.getValueAt(2, 0));
  matrix.setValueAt(2, 1, viewMatrix.getValueAt(2, 1));
  matrix.setValueAt(2, 2, viewMatrix.getValueAt(2, 2));
  
  this._gl.uniformMatrix3fv(normalUniformLocation, false, new Float32Array(
      matrix.getInverse().getTranspose().flatten()));
  
  // var lightingUniformLocation = this._gl.getUniformLocation(
  // this._shaderProgram, this._shaders.lighting());
  //  
  // this._gl.uniform1i(lightingUniformLocation, this._lighting);
  

  //
  // loop through all objects and (re-)draw them
  //
  // the rendering order is important in terms of opacity/transparency of
  // objects
  // thus, the most opaque objects are rendered first, the least opaque (== the
  // most transparent) objects are rendered last
  var objects = this._objects.getValues();
  var numberOfObjects = objects.length;
  
  var i;
  for (i = 0; i < numberOfObjects; ++i) {
    
    var object = objects[i];
    
    if (object) {
      // we have a valid object
      var id = object.id();
      

      var vertexBuffer = this._vertexBuffers.get(id);
      var normalBuffer = this._normalBuffers.get(id);
      var colorBuffer = this._colorBuffers.get(id);
      var texturePositionBuffer = this._texturePositionBuffers.get(id);
      
      // ..bind the glBuffers
      
      // VERTICES
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer.glBuffer());
      
      this._gl.vertexAttribPointer(this._vertexPositionAttribute, vertexBuffer
          .itemSize(), this._gl.FLOAT, false, 0, 0);
      
      // NORMALS
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, normalBuffer.glBuffer());
      
      this._gl.vertexAttribPointer(this._normalPositionAttribute, normalBuffer
          .itemSize(), this._gl.FLOAT, false, 0, 0);
      
      // COLORS
      var useObjectColorUniformLocation = this._gl.getUniformLocation(
          this._shaderProgram, this._shaders.useObjectColor());
      
      if (goog.isDefAndNotNull(colorBuffer)) {
        
        // point colors are defined for this object
        
        // de-activate the useObjectColor flag on the shader
        this._gl.uniform1i(useObjectColorUniformLocation, false);
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, colorBuffer.glBuffer());
        
        this._gl.vertexAttribPointer(this._vertexColorAttribute, colorBuffer
            .itemSize(), this._gl.FLOAT, false, 0, 0);
        
      } else {
        
        // we have a solid object color
        
        // activate the useObjectColor flag on the shader
        this._gl.uniform1i(useObjectColorUniformLocation, true);
        
        var objectColor = object.color();
        
        var objectColorUniformLocation = this._gl.getUniformLocation(
            this._shaderProgram, this._shaders.objectColor());
        
        this._gl.uniform3f(objectColorUniformLocation,
            parseFloat(objectColor[0]), parseFloat(objectColor[1]),
            parseFloat(objectColor[2]));
        
        // we always have to configure the attribute of the point colors
        // even if no point colors are in use
        this._gl.vertexAttribPointer(this._vertexColorAttribute, vertexBuffer
            .itemSize(), this._gl.FLOAT, false, 0, 0);
        
      }
      
      // OPACITY
      var objectOpacityUniformLocation = this._gl.getUniformLocation(
          this._shaderProgram, this._shaders.objectOpacity());
      
      this._gl.uniform1f(objectOpacityUniformLocation, parseFloat(object
          .opacity()));
      
      // TEXTURE
      var useTextureUniformLocation = this._gl.getUniformLocation(
          this._shaderProgram, this._shaders.useTexture());
      
      if (goog.isDefAndNotNull(object.texture()) &&
          goog.isDefAndNotNull(texturePositionBuffer)) {
        //
        // texture associated to this object
        //
        
        // activate the texture flag on the shader
        this._gl.uniform1i(useTextureUniformLocation, true);
        
        // setup the sampler
        var textureSamplerUniformLocation = this._gl.getUniformLocation(
            this._shaderProgram, this._shaders.textureSampler());
        
        // bind the texture
        this._gl.activeTexture(this._gl.TEXTURE0);
        
        // grab the texture from the internal hash map using the filename as the
        // key
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._textures.get(object
            .texture().file()));
        this._gl.uniform1i(textureSamplerUniformLocation, 0);
        
        // propagate the current texture-coordinate-map to WebGL
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, texturePositionBuffer
            .glBuffer());
        
        this._gl.vertexAttribPointer(this._texturePositionAttribute,
            texturePositionBuffer.itemSize(), this._gl.FLOAT, false, 0, 0);
        
      } else {
        // no texture for this object
        this._gl.uniform1i(useTextureUniformLocation, false);
        
        // we always have to configure the attribute of the texture positions
        // even if no textures are in use
        this._gl.vertexAttribPointer(this._texturePositionAttribute,
            vertexBuffer.itemSize(), this._gl.FLOAT, false, 0, 0);
        
      }
      
      // TRANSFORMS
      
      // propagate transform to the uniform matrices of the shader
      var objectTransformUniformLocation = this._gl.getUniformLocation(
          this._shaderProgram, this._shaders.objectTransform());
      
      this._gl.uniformMatrix4fv(objectTransformUniformLocation, false,
          new Float32Array(object.transform().matrix().flatten()));
      

      // .. and draw with the object's draw mode
      var drawMode = -1;
      if (object.type() == X.object.types.TRIANGLES) {
        
        drawMode = this._gl.TRIANGLES;
        
      } else if (object.type() == X.object.types.LINES) {
        
        drawMode = this._gl.LINES;
        
      }
      
      this._gl.drawArrays(drawMode, 0, vertexBuffer.itemCount());
      
      // this._gl.drawElements(drawMode, vertexBuffer.itemCount(),
      // this._gl.UNSIGNED_SHORT, 0);
      
    } else {
      
      var message = 'Fatal: Could not retrieve object for (re-)drawing!';
      throw new X.exception(message);
      
    }
    
  } // loop through objects
  
};



/*
 * THE FOLLOWING IS OBSOLETE AND NOT WORKING FOR NOW
 * 
 * X.renderer.prototype.convertWorldToDisplayCoordinates = function(vector) {
 * 
 * var view = this._camera.view(); var perspective = this._camera.perspective();
 * 
 * var viewPerspective = goog.math.Matrix.createIdentityMatrix(4);
 * 
 * viewPerspective = viewPerspective.multiply(perspective); viewPerspective =
 * viewPerspective.multiply(view);
 * 
 * var twoDVectorAsMatrix; twoDVectorAsMatrix =
 * viewPerspective.multiplyByVector(vector);
 * 
 * var x = (twoDVectorAsMatrix.getValueAt(0, 0) + 1) / 2.0; x = x *
 * this.width();
 * 
 * var y = (1 - twoDVectorAsMatrix.getValueAt(0, 1)) / 2.0; y = y *
 * this.height();
 * 
 * return new goog.math.Vec2(Math.round(x), Math.round(y)); }; // source //
 * http://webglfactory.blogspot.com/2011/05/how-to-convert-world-to-screen.html
 * X.renderer.prototype.viewportToNormalizedViewport = function(vector) {
 * 
 * var view = this._camera.view(); var perspective = this._camera.perspective();
 * 
 * var viewPerspective = goog.math.Matrix.createIdentityMatrix(4);
 * viewPerspective = viewPerspective.multiply(perspective); viewPerspective =
 * viewPerspective.multiply(view);
 * 
 * var viewPerspectiveInverse = viewPerspective.getInverse();
 * 
 * 
 * var x = 2.0 * vector.x / this.width() - 1; var y = -2.0 * vector.y /
 * this.height() + 1;
 * 
 * threeDVector = new goog.math.Vec3(x, y, 0); threeDVectorAsMatrix =
 * viewPerspectiveInverse.multiplyByVector(threeDVector);
 * 
 * threeDVector.x = threeDVectorAsMatrix.getValueAt(0, 0); threeDVector.y =
 * threeDVectorAsMatrix.getValueAt(1, 0); threeDVector.z =
 * threeDVectorAsMatrix.getValueAt(2, 0);
 * 
 * return threeDVector; };
 */

// export symbols (required for advanced compilation)
goog.exportSymbol('X.renderer', X.renderer);
goog.exportSymbol('X.renderer.prototype.dimension',
    X.renderer.prototype.dimension);
goog.exportSymbol('X.renderer.prototype.width', X.renderer.prototype.width);
goog.exportSymbol('X.renderer.prototype.setWidth',
    X.renderer.prototype.setWidth);
goog.exportSymbol('X.renderer.prototype.height', X.renderer.prototype.height);
goog.exportSymbol('X.renderer.prototype.setHeight',
    X.renderer.prototype.setHeight);
goog.exportSymbol('X.renderer.prototype.backgroundColor',
    X.renderer.prototype.backgroundColor);
goog.exportSymbol('X.renderer.prototype.setBackgroundColor',
    X.renderer.prototype.setBackgroundColor);
goog.exportSymbol('X.renderer.prototype.canvas', X.renderer.prototype.canvas);
goog.exportSymbol('X.renderer.prototype.container',
    X.renderer.prototype.container);
goog.exportSymbol('X.renderer.prototype.setContainer',
    X.renderer.prototype.setContainer);
goog.exportSymbol('X.renderer.prototype.setContainerById',
    X.renderer.prototype.setContainerById);
goog.exportSymbol('X.renderer.prototype.camera', X.renderer.prototype.camera);
goog.exportSymbol('X.renderer.prototype.interactor',
    X.renderer.prototype.interactor);
goog.exportSymbol('X.renderer.prototype.init', X.renderer.prototype.init);
goog.exportSymbol('X.renderer.prototype.addShaders',
    X.renderer.prototype.addShaders);
goog.exportSymbol('X.renderer.prototype.addObject',
    X.renderer.prototype.addObject);
goog.exportSymbol('X.renderer.prototype.render', X.renderer.prototype.render);
goog.exportSymbol('X.renderer.RenderEvent', X.renderer.RenderEvent);
