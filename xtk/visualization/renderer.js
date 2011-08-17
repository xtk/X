/*
 * ${HEADER}
 */

// provides
goog.provide('X.renderer');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('X.matrixHelper');
goog.require('goog.dom');
goog.require('goog.math.Matrix');
goog.require('goog.math.Vec3');


/**
 * Create a renderer with the given width and height.
 * 
 * @param {number} width The width of the renderer.
 * @param {number} height The height of the renderer.
 * @constructor
 * @extends {X.base}
 */
X.renderer = function(width, height) {

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
  
};
// inherit from X.base
goog.inherits(X.renderer, X.base);


/**
 * Get the dimension of this renderer. E.g. 2 for two-dimensional, 3 for
 * three-dimensional.
 * 
 * @return {!number} The dimension of this renderer.
 */
X.renderer.prototype.getDimension = function() {

  return this._dimension;
  
};


/**
 * Get the width of this renderer.
 * 
 * @return {!number} The width of this renderer.
 */
X.renderer.prototype.getWidth = function() {

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
X.renderer.prototype.getHeight = function() {

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
X.renderer.prototype.getBackgroundColor = function() {

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
 * Get the container of this renderer.
 * 
 * @return {!Element} The container of this renderer as a DOM object.
 * @throws {X.exception} An exception if the <body> could not be found.
 */
X.renderer.prototype.getContainer = function() {

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
 * Create the canvas of this renderer inside the configured container and using
 * attributes like width, height, backgroundColor etc. Then, initialize the
 * WebGL context. All this will only happen once, no matter how often this
 * method is called.
 * 
 * @throws {X.exception} An exception if there were problems during WebGL
 *           initialization.
 */
X.renderer.prototype.init = function() {

  // if the canvas already exists, exit now
  if (this._canvas) {
    return;
  }
  
  // create a canvas object with certain properties
  var canvas = goog.dom.createDom('canvas');
  canvas.style.setProperty('background-color', this.getBackgroundColor()
      .toString());
  canvas.width = this.getWidth();
  canvas.height = this.getHeight();
  
  // append it to the container
  goog.dom.appendChild(this.getContainer(), canvas);
  
  // WebGL initialization
  
  //
  // Step1: Get Context of canvas
  //
  try {
    
    var gl = canvas.getContext('experimental-webgl');
    // TODO do we need 2d canvas in a 2d case??
    // gl = canvas.getContext('2d');
    
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
    
    gl.viewport(0, 0, this.getWidth(), this.getHeight());
    
    // gl.viewport(0, 0, 200, 200);
    // configure color
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    
    // perspective rendering
    gl.depthFunc(gl.LEQUAL);
    
    // clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
  } catch (e) {
    
    throw new X.exception('Fatal: Exception while accessing GL Context!\n' + e);
    
  }
  
  // WebGL initialization done
  
  this._gl = gl;
  this._canvas = canvas;
  
};

X.renderer.prototype.addShaders = function(fragmentShader, vertexShader) {

  if (!this._canvas || !this._gl) {
    
    throw new X.exception('Fatal: Renderer was not initialized properly!');
    
  }
  
  if (!fragmentShader || !vertexShader) {
    
    throw new X.exception('Fatal: Could not add shaders!');
    
  }
  
  // compile the fragment and vertex shaders
  var glFragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
  var glVertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
  
  this._gl.shaderSource(glFragmentShader, fragmentShader.getSource());
  this._gl.shaderSource(glVertexShader, vertexShader.getSource());
  
  this._gl.compileShader(glFragmentShader);
  this._gl.compileShader(glVertexShader);
  
  if (!this._gl.getShaderParameter(glFragmentShader, this._gl.COMPILE_STATUS)
      || !this._gl.getShaderParameter(glVertexShader, this._gl.COMPILE_STATUS)) {
    
    throw new X.exception('Fatal: Shader compilation failed!');
    
  }
  
  // initialize the shaders
  var shaderProgram = this._gl.createProgram();
  this._gl.attachShader(shaderProgram, glVertexShader);
  this._gl.attachShader(shaderProgram, glFragmentShader);
  this._gl.linkProgram(shaderProgram);
  
  if (!this._gl.getProgramParameter(shaderProgram, this._gl.LINK_STATUS)) {
    
    throw new X.exception('Fatal: Could not create shader program!');
    
  }
  
  this._gl.useProgram(shaderProgram);
  
  this._vertexPositionAttribute = this._gl.getAttribLocation(shaderProgram,
      "bVertexPosition");
  this._gl.enableVertexAttribArray(this._vertexPositionAttribute);
  
  this._shaderProgram = shaderProgram;
  
};

X.renderer.prototype.addObject = function(vertices) {

  if (!this._canvas || !this._gl) {
    
    throw new X.exception('Fatal: Renderer was not initialized properly!');
    
  }
  
  if (!vertices) {
    
    throw new X.exception('Fatal: Could not add object with empty vertices!');
    
  }
  
  this._verticesBuffer = this._gl.createBuffer();
  
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._verticesBuffer);
  
  var vertices = [ 1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0,
      0.0 ];
  
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices),
      this._gl.STATIC_DRAW);
  
};

X.renderer.prototype.render = function() {

  if (!this._canvas || !this._gl) {
    
    throw new X.exception('Fatal: Renderer was not initialized properly!');
    
  }
  

  this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
  

  // Establish the perspective with which we want to view the
  // scene. Our field of view is 45 degrees, with a width/height
  // ratio of 640:480, and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  
  perspectiveMatrix = makePerspective(45, this._width / this._height, 0.1,
      100.0);
  
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  
  // loadIdentity();
  identity = goog.math.Matrix.createIdentityMatrix(4);
  
  // Now move the drawing position a bit to where we want to start
  // drawing the square.
  
  // mvTranslate([ -0.0, 0.0, -6.0 ]);
  posMatrix = identity.translate(new goog.math.Vec3(-0.0, 0.0, -4.0));
  
  // Draw the square by binding the array buffer to the square's vertices
  // array, setting attributes, and pushing it to GL.
  
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._verticesBuffer);
  
  this._gl.vertexAttribPointer(this._vertexPositionAttribute, 3,
      this._gl.FLOAT, false, 0, 0);
  // setMatrixUniforms();
  
  var pUniform = this._gl.getUniformLocation(this._shaderProgram, "uPMatrix");
  
  this._gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix
      .flatten()));
  
  var mvUniform = this._gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
  
  this._gl.uniformMatrix4fv(mvUniform, false, new Float32Array(posMatrix
      .flatten()));
  
  this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
  
};


//
// gluPerspective
//
function makePerspective(fovy, aspect, znear, zfar) {

  var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
  var ymin = -ymax;
  var xmin = ymin * aspect;
  var xmax = ymax * aspect;
  
  return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
};

//
// glFrustum
//
function makeFrustum(left, right, bottom, top, znear, zfar) {

  var X = 2 * znear / (right - left);
  var Y = 2 * znear / (top - bottom);
  var A = (right + left) / (right - left);
  var B = (top + bottom) / (top - bottom);
  var C = -(zfar + znear) / (zfar - znear);
  var D = -2 * zfar * znear / (zfar - znear);
  
  var m = new goog.math.Matrix([ [ X, 0, A, 0 ], [ 0, Y, B, 0 ],
      [ 0, 0, C, D ], [ 0, 0, -1, 0 ] ]);
  
  return m;
};

