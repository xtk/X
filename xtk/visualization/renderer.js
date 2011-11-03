/*
 * ${HEADER}
 */

// provides
goog.provide('X.renderer');
goog.provide('X.renderer.RenderEvent');

// requires
goog.require('X.base');
goog.require('X.buffer');
goog.require('X.camera');
goog.require('X.colors');
goog.require('X.event');
goog.require('X.exception');
goog.require('X.interactor');
goog.require('X.matrixHelper');
goog.require('X.object');
goog.require('X.points');
goog.require('X.shaders');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.iter.Iterator');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec3');
goog.require('goog.structs.AvlTree');
goog.require('goog.structs.Map');



/**
 * Create a renderer with the given width and height.
 * 
 * @param {number} width The width of the renderer.
 * @param {number} height The height of the renderer.
 * @constructor
 * @extends {X.base}
 */
X.renderer = function(width, height) {

  // check if this instance is a valid subclass of X.renderer
  if (!(this instanceof X.renderer2D) && !(this instanceof X.renderer3D)) {
    
    var message = '';
    message += 'Fatal: X.renderer should not be instantiated directly.';
    message += 'Use X.renderer2D or X.renderer3D instead.';
    throw new X.exception(message);
    
  }
  
  // validate width and height
  if (!goog.isNumber(width) || !goog.isNumber(height)) {
    
    throw new X.exception('Fatal: Invalid width or height for the renderer.');
    
  }
  
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
   * The width of this renderer.
   * 
   * @type {!number}
   * @protected
   */
  this._width = width;
  
  /**
   * The height of this renderer.
   * 
   * @type {!number}
   * @protected
   */
  this._height = height;
  
  /**
   * The background color of this renderer.
   * 
   * @type {!string}
   * @protected
   */
  this._backgroundColor = '#000000';
  
  /**
   * The HTML container of this renderer, E.g a name of a <div>.
   * 
   * @type {?Element}
   * @protected
   */
  this._container = null;
  
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
  
  /*
   * The interactor of this renderer.
   * 
   * @type {?X.interactor} @protected
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
   * A hash map of color buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._transformBuffers0 = new goog.structs.Map();
  
  /**
   * A hash map of color buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._transformBuffers1 = new goog.structs.Map();
  
  /**
   * A hash map of color buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._transformBuffers2 = new goog.structs.Map();
  
  /**
   * A hash map of color buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._transformBuffers3 = new goog.structs.Map();
  
  /**
   * A hash map of texture position buffers of this renderer. Each buffer is
   * associated with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._texturePositionBuffers = new goog.structs.Map();
  
  /**
   * A hash map of opacity buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   * 
   * @type {!goog.structs.Map}
   * @protected
   */
  this._opacityBuffers = new goog.structs.Map();
  
  this._lighting = true;
  
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
  RENDER: X.event.uniqueId('render')
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
 * Set the width for this renderer.
 * 
 * @param {!number} width The width for this renderer.
 */
X.renderer.prototype.setWidth = function(width) {

  if (this._canvas) {
    
    // the canvas was already created, let's update it
    this._canvas.style.setProperty('width', width.toString());
    
  }
  
  this._width = width;
  
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
 * Set the height for this renderer.
 * 
 * @param {!number} height The height for this renderer.
 */
X.renderer.prototype.setHeight = function(height) {

  if (this._canvas) {
    
    // the canvas was already created, let's update it
    this._canvas.style.setProperty('height', height.toString());
    
  }
  
  this._height = height;
  
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
 * Get the canvas of this renderer.
 * 
 * @return {!Element} The canvas of this renderer.
 * @throws {X.exception} An exception if this renderer does not have a canvas.
 */
X.renderer.prototype.canvas = function() {

  if (!goog.isDefAndNotNull(this._canvas)) {
    
    throw new X.exception('Fatal: No valid canvas for this renderer!');
    
  }
  
  return this._canvas;
  
};


/**
 * Get the container of this renderer.
 * 
 * @return {!Element} The container of this renderer as a DOM object.
 * @throws {X.exception} An exception if the <body> could not be found.
 */
X.renderer.prototype.container = function() {

  // if no _container is associated, use the document.body
  if (!this._container) {
    
    var _document = goog.dom.getDocument();
    var body = _document.body;
    
    if (!body) {
      
      // throw exception when we can not find the body
      throw new X.exception('Fatal: Could not find <body></body>!');
      
    }
    
    this._container = body;
    
  }
  
  // return the _container
  return this._container;
  
};


/**
 * Set the container (DOM object) for this renderer.
 * 
 * @param {Element} container A container (DOM object).
 * @throws {X.exception} An exception if the container could not be found.
 */
X.renderer.prototype.setContainer = function(container) {

  if (!container) {
    
    // throw exception if the container is invalid
    throw new X.exception('Fatal: Could not find container!');
    
  }
  
  this._container = container;
  
};


/**
 * Set the container for this renderer using an id of a DOM object.
 * 
 * @param {!string} containerId An id of a DOM object.
 */
X.renderer.prototype.setContainerById = function(containerId) {

  // retrieve the DOM object with the given id
  var container = goog.dom.getElement(containerId);
  
  // try to set it as a container
  this.setContainer(container);
  
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
 * @return {!boolean} TRUE if lightning is active, FALSE if inactive.
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


/**
 * Create the canvas of this renderer inside the configured container and using
 * attributes like width, height, backgroundColor etc. Then, initialize the
 * WebGL context and attach all necessary objects (e.g. camera, shaders..).
 * Finally, initialize the event listeners. All this will only happen once, no
 * matter how often this method is called.
 * 
 * @throws {X.exception} An exception if there were problems during
 *           initialization.
 */
X.renderer.prototype.init = function() {

  // if the canvas already exists, exit now
  if (goog.isDefAndNotNull(this._canvas)) {
    return;
  }
  
  // create a canvas object with certain properties
  var canvas = goog.dom.createDom('canvas');
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
    
    // enable depth testing
    // gl.enable(gl.DEPTH_TEST);
    // TODO transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    
    // perspective rendering
    gl.depthFunc(gl.LEQUAL);
    
    // clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
  } catch (e) {
    
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
  this._vertexPositionAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.position());
  this._gl.enableVertexAttribArray(this._vertexPositionAttribute);
  
  this._normalPositionAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.normal());
  this._gl.enableVertexAttribArray(this._normalPositionAttribute);
  
  this._vertexColorAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.color());
  this._gl.enableVertexAttribArray(this._vertexColorAttribute);
  
  this._vertexOpacityAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.opacity());
  this._gl.enableVertexAttribArray(this._vertexOpacityAttribute);
  
  this._vertexTransform0Attribute = this._gl.getAttribLocation(shaderProgram,
      shaders.transform0());
  this._gl.enableVertexAttribArray(this._vertexTransform0Attribute);
  
  this._vertexTransform1Attribute = this._gl.getAttribLocation(shaderProgram,
      shaders.transform1());
  this._gl.enableVertexAttribArray(this._vertexTransform1Attribute);
  
  this._vertexTransform2Attribute = this._gl.getAttribLocation(shaderProgram,
      shaders.transform2());
  this._gl.enableVertexAttribArray(this._vertexTransform2Attribute);
  
  this._vertexTransform3Attribute = this._gl.getAttribLocation(shaderProgram,
      shaders.transform3());
  this._gl.enableVertexAttribArray(this._vertexTransform3Attribute);
  
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
  
  this.setupVertices_(object);
  console.log('a');
  this.setupTransform_(object);
  
  this.setupObject_(object);
  
};



X.renderer.prototype.setupTransform_ = function(object) {

  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl) ||
      !goog.isDefAndNotNull(this._camera)) {
    
    throw new X.exception('Fatal: Renderer was not initialized properly!');
    
  }
  
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    
    throw new X.exception('Fatal: Illegal object!');
    
  }
  

  // remove old TRANSFORM
  var oldTransformBuffer0 = this._transformBuffers0.get(object.id());
  if (goog.isDefAndNotNull(oldTransformBuffer0)) {
    
    if (this._gl.isBuffer(oldTransformBuffer0.glBuffer())) {
      
      this._gl.deleteBuffer(oldTransformBuffer0.glBuffer());
      
    }
    
  }
  var oldTransformBuffer1 = this._transformBuffers1.get(object.id());
  if (goog.isDefAndNotNull(oldTransformBuffer1)) {
    
    if (this._gl.isBuffer(oldTransformBuffer1.glBuffer())) {
      
      this._gl.deleteBuffer(oldTransformBuffer1.glBuffer());
      
    }
    
  }
  var oldTransformBuffer2 = this._transformBuffers2.get(object.id());
  if (goog.isDefAndNotNull(oldTransformBuffer2)) {
    
    if (this._gl.isBuffer(oldTransformBuffer2.glBuffer())) {
      
      this._gl.deleteBuffer(oldTransformBuffer2.glBuffer());
      
    }
    
  }
  var oldTransformBuffer3 = this._transformBuffers3.get(object.id());
  if (goog.isDefAndNotNull(oldTransformBuffer3)) {
    
    if (this._gl.isBuffer(oldTransformBuffer3.glBuffer())) {
      
      this._gl.deleteBuffer(oldTransformBuffer3.glBuffer());
      
    }
    
  }
  


  //
  // TRANSFORM
  //
  // since we want each vertex to be able to sit under a transform,
  // and we can not define a mat4 attribute on the shaders, we pass the
  // transform matrix as 4x size4-vectors.
  
  // get the transform matrix of this object
  var transform = object.transform().matrix();
  
  var glTransformBuffer0 = this._gl.createBuffer();
  
  // we need to convert the transform row0 to an array to set it for all
  // vertices
  tmpArray = new Array(object.points().flatten().length * 4);
  var j;
  for (j = 0; j < tmpArray.length; j = j + 4) {
    
    tmpArray[j] = transform.getValueAt(0, 0);
    tmpArray[j + 1] = transform.getValueAt(0, 1);
    tmpArray[j + 2] = transform.getValueAt(0, 2);
    tmpArray[j + 3] = transform.getValueAt(0, 3);
    
  }
  
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glTransformBuffer0);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(tmpArray),
      this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the transform
  var transformBuffer0 = new X.buffer(glTransformBuffer0, object.points()
      .count(), 4);
  

  var glTransformBuffer1 = this._gl.createBuffer();
  
  // we need to convert the transform row1 to an array to set it for all
  // vertices
  tmpArray = new Array(object.points().flatten().length * 4);
  for (j = 0; j < tmpArray.length; j = j + 4) {
    
    tmpArray[j] = transform.getValueAt(1, 0);
    tmpArray[j + 1] = transform.getValueAt(1, 1);
    tmpArray[j + 2] = transform.getValueAt(1, 2);
    tmpArray[j + 3] = transform.getValueAt(1, 3);
    
  }
  
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glTransformBuffer1);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(tmpArray),
      this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the transform
  var transformBuffer1 = new X.buffer(glTransformBuffer1, object.points()
      .count(), 4);
  
  var glTransformBuffer2 = this._gl.createBuffer();
  
  // we need to convert the transform row2 to an array to set it for all
  // vertices
  tmpArray = new Array(object.points().flatten().length * 4);
  for (j = 0; j < tmpArray.length; j = j + 4) {
    
    tmpArray[j] = transform.getValueAt(2, 0);
    tmpArray[j + 1] = transform.getValueAt(2, 1);
    tmpArray[j + 2] = transform.getValueAt(2, 2);
    tmpArray[j + 3] = transform.getValueAt(2, 3);
    
  }
  
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glTransformBuffer2);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(tmpArray),
      this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the transform
  var transformBuffer2 = new X.buffer(glTransformBuffer2, object.points()
      .count(), 4);
  

  var glTransformBuffer3 = this._gl.createBuffer();
  
  // we need to convert the transform row3 to an array to set it for all
  // vertices
  tmpArray = new Array(object.points().flatten().length * 4);
  for (j = 0; j < tmpArray.length; j = j + 4) {
    
    tmpArray[j] = transform.getValueAt(3, 0);
    tmpArray[j + 1] = transform.getValueAt(3, 1);
    tmpArray[j + 2] = transform.getValueAt(3, 2);
    tmpArray[j + 3] = transform.getValueAt(3, 3);
    
  }
  
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glTransformBuffer3);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(tmpArray),
      this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the transform
  var transformBuffer3 = new X.buffer(glTransformBuffer3, object.points()
      .count(), 4);
  
  // add the buffers for the new object to the internal hash maps
  this._transformBuffers0.set(object.id(), transformBuffer0);
  this._transformBuffers1.set(object.id(), transformBuffer1);
  this._transformBuffers2.set(object.id(), transformBuffer2);
  this._transformBuffers3.set(object.id(), transformBuffer3);
  
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
      .flatten()), this._gl.STATIC_DRAW);
  
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
    
    // OPACITY
    var oldOpacityBuffer = this._opacityBuffers.get(object.id());
    if (goog.isDefAndNotNull(oldOpacityBuffer)) {
      
      if (this._gl.isBuffer(oldOpacityBuffer.glBuffer())) {
        
        this._gl.deleteBuffer(oldOpacityBuffer.glBuffer());
        
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
  var glNormalBuffer = this._gl.createBuffer();
  
  // bind and fill with normals of current object
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glNormalBuffer);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object.normals()
      .flatten()), this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the normals
  // every normal consists of 3 items (x,y,z)
  var normalBuffer = new X.buffer(glNormalBuffer, object.normals().count(), 3);
  
  //
  // COLORS
  //
  // first, we check if the object colors are properly defined
  //
  // case 1:
  // object has an object color defined
  // we create point colors matching this object color
  // case 2:
  // object has not an object color defined and does have the same number of
  // points and point-colors defined
  // case 3:
  // object has not an object color defined and also not the same number of
  // points and point-colors, then we set the object color to 1
  //
  // in all cases, we do not want to correct the passed in object but just
  // correct to good value internally
  
  var colorsValid = false;
  var objectColor = new X.color(1, 1, 1); // initialize to default color (white)
  var colors = null;
  
  // if no object color was set up, check for valid point colors
  if (goog.isNull(object.color())) {
    
    // no object color, check if valid point-colors are defined
    colorsValid = (object.points().count() == object.colors().count());
    colors = object.colors();
    
  } else {
    
    // valid object color
    objectColor = object.color();
    
  }
  
  // if we don't have valid colors at this point, create some based on the
  // objectColor
  if (!colorsValid) {
    
    colors = new X.colors();
    
    var i;
    for (i = 0; i < object.points().count(); i++) {
      
      colors.add(objectColor);
      
    }
    
  }
  
  var glColorBuffer = this._gl.createBuffer();
  
  // bind and fill with colors defined above
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glColorBuffer);
  this._gl.bufferData(this._gl.ARRAY_BUFFER,
      new Float32Array(colors.flatten()), this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the colors
  // every color consists of 3 items (r,g,b)
  var colorBuffer = new X.buffer(glColorBuffer, colors.count(), 3);
  
  //
  // OPACITY
  //
  var glOpacityBuffer = this._gl.createBuffer();
  
  // we need to convert the single opacity value to an array to set it for all
  // vertices
  var tmpArray = new Array(object.points().flatten().length);
  var j;
  for (j = 0; j < tmpArray.length; ++j) {
    
    tmpArray[j] = object.opacity();
    
  }
  
  // bind and fill with opacity value
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glOpacityBuffer);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(tmpArray),
      this._gl.STATIC_DRAW);
  
  // create an X.buffer to store the opacity
  var opacityBuffer = new X.buffer(glOpacityBuffer, 1, 1);
  

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
    
    // load the texture
    var textureImage = new Image();
    var texture = this._gl.createTexture();
    texture.image = textureImage;
    
    textureImage.onload = function() {

      this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
      
      this._gl.bindTexture(this._gl.TEXTURE_2D, this._currentTexture);
      this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA,
          this._gl.UNSIGNED_BYTE, this._currentTexture.image);
      this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER,
          this._gl.LINEAR);
      this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER,
          this._gl.LINEAR);
      
      this._gl.bindTexture(this._gl.TEXTURE_2D, null);
      
    }.bind(this);
    
    this._currentTexture = texture;
    textureImage.src = object.texture().file();
    
    // create color buffer
    var glTexturePosBuffer = this._gl.createBuffer();
    // TODO
    // bind and fill with colors defined above
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glTexturePosBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object
        .textureCoordinateMap()), this._gl.STATIC_DRAW);
    
    // create an X.buffer to store the texture-coordinate map
    texturePositionBuffer = new X.buffer(glTexturePosBuffer, object
        .textureCoordinateMap().length, 2);
    

  }
  

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
  this._opacityBuffers.set(object.id(), opacityBuffer);
  
  this._texturePositionBuffers.set(object.id(), texturePositionBuffer);
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
      var opacityBuffer = this._opacityBuffers.get(id);
      var transformBuffer0 = this._transformBuffers0.get(id);
      var transformBuffer1 = this._transformBuffers1.get(id);
      var transformBuffer2 = this._transformBuffers2.get(id);
      var transformBuffer3 = this._transformBuffers3.get(id);
      var texturePosBuffer = this._texturePositionBuffers.get(id);
      
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
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, colorBuffer.glBuffer());
      
      this._gl.vertexAttribPointer(this._vertexColorAttribute, colorBuffer
          .itemSize(), this._gl.FLOAT, false, 0, 0);
      
      // OPACITY
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, opacityBuffer.glBuffer());
      
      this._gl.vertexAttribPointer(this._vertexOpacityAttribute, opacityBuffer
          .itemSize(), this._gl.FLOAT, false, 0, 0);
      
      // TEXTURE
      var useTextureUniformLocation = this._gl.getUniformLocation(
          this._shaderProgram, this._shaders.useTexture());
      
      if (goog.isDefAndNotNull(object.texture()) &&
          goog.isDefAndNotNull(texturePosBuffer)) {
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
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._currentTexture);
        this._gl.uniform1i(textureSamplerUniformLocation, 0);
        
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, texturePosBuffer.glBuffer());
        
        this._gl.vertexAttribPointer(this._texturePositionAttribute,
            texturePosBuffer.itemSize(), this._gl.FLOAT, false, 0, 0);
        
      } else {
        // no texture for this object
        this._gl.uniform1i(useTextureUniformLocation, false);
        
      }
      
      // TRANSFORMS
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, transformBuffer0.glBuffer());
      
      this._gl.vertexAttribPointer(this._vertexTransform0Attribute,
          transformBuffer0.itemSize(), this._gl.FLOAT, false, 0, 0);
      
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, transformBuffer1.glBuffer());
      
      this._gl.vertexAttribPointer(this._vertexTransform1Attribute,
          transformBuffer1.itemSize(), this._gl.FLOAT, false, 0, 0);
      
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, transformBuffer2.glBuffer());
      
      this._gl.vertexAttribPointer(this._vertexTransform2Attribute,
          transformBuffer2.itemSize(), this._gl.FLOAT, false, 0, 0);
      
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, transformBuffer3.glBuffer());
      
      this._gl.vertexAttribPointer(this._vertexTransform3Attribute,
          transformBuffer3.itemSize(), this._gl.FLOAT, false, 0, 0);
      

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
