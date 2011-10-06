/*
 * ${HEADER}
 */

// provides
goog.provide('X.renderer');
goog.provide('X.renderer.RenderEvent');

// requires
goog.require('X.base');
goog.require('X.object');
goog.require('X.buffer');
goog.require('X.camera');
goog.require('X.colors');
goog.require('X.exception');
goog.require('X.event');
goog.require('X.interactor');
goog.require('X.matrixHelper');
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
 * @name X.renderer
 * @extends {X.base}
 */
X.renderer = function(width, height) {

  // check if this instance is a valid subclass of X.renderer
  if (!(this instanceof X.renderer2D) && !(this instanceof X.renderer3D)) {

    throw new X.exception(
        'Fatal: X.renderer should not be instantiated directly. Use X.renderer2D or X.renderer3D.');

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
   * A hash map of color buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   *
   * @type {!goog.structs.Map}
   * @protected
   */
  this._colorBuffers = new goog.structs.Map();

  /*
   * A hash map of opacity buffers of this renderer. Each buffer is associated
   * with a displayable object using its unique id.
   *
   * @type {!goog.structs.Map} @protected
   */
  this._opacityBuffers = new goog.structs.Map();

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
  RENDER : X.event.uniqueId('render')
};


/**
 * The render event to initiate a re-rendering of all objects.
 *
 * @constructor
 * @name X.renderer.RenderEvent
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
 * @returns {!Element} The canvas of this renderer.
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
 * @returns {X.camera}
 */
X.renderer.prototype.camera = function() {

  return this._camera;

};


/**
 * Get the interactor of this renderer.
 *
 * @returns {X.interactor}
 */
X.renderer.prototype.interactor = function() {

  return this._interactor;

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
  canvas.style.setProperty('background-color', this.backgroundColor()
      .toString());
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
    gl.disable(gl.DEPTH_TEST);

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


X.renderer.prototype.addShaders = function(shaders) {

  // check if the renderer is initialized properly
  if (!goog.isDefAndNotNull(this._canvas) || !goog.isDefAndNotNull(this._gl)
      || !goog.isDefAndNotNull(this._camera)) {

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

  if (!this._gl.getShaderParameter(glFragmentShader, this._gl.COMPILE_STATUS)
      || !this._gl.getShaderParameter(glVertexShader, this._gl.COMPILE_STATUS)) {

    throw new X.exception('Fatal: Shader compilation failed!');

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

  // store the index of the position, color and opacity attributes
  this._vertexPositionAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.position());
  this._gl.enableVertexAttribArray(this._vertexPositionAttribute);

  this._vertexColorAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.color());
  this._gl.enableVertexAttribArray(this._vertexColorAttribute);

  this._vertexOpacityAttribute = this._gl.getAttribLocation(shaderProgram,
      shaders.opacity());
  this._gl.enableVertexAttribArray(this._vertexOpacityAttribute);

  // attach the shaderProgram to this renderer
  this._shaderProgram = shaderProgram;

  // attach the shaders to this renderer
  this._shaders = shaders;

};

X.renderer.prototype.addObject = function(object) {

  if (!this._canvas || !this._gl || !this._camera) {

    throw new X.exception('Fatal: Renderer was not initialized properly!');

  }

  if (!object || !(object instanceof X.object)) {

    throw new X.exception('Fatal: Illegal object!');

  }

  // first, we check if the object is properly defined
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

  // create vertex buffer
  var glVertexBuffer = this._gl.createBuffer();

  // bind and fill with vertices of current object
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glVertexBuffer);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(object.points()
      .flatten()), this._gl.STATIC_DRAW);

  // create an X.buffer to store the vertices
  // every vertex consists of 3 items (x,y,z)
  var vertexBuffer = new X.buffer(glVertexBuffer, object.points().count(), 3);

  // create color buffer
  var glColorBuffer = this._gl.createBuffer();

  // bind and fill with colors defined above
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glColorBuffer);
  this._gl.bufferData(this._gl.ARRAY_BUFFER,
      new Float32Array(colors.flatten()), this._gl.STATIC_DRAW);

  // create an X.buffer to store the colors
  // every color consists of 4 items (r,g,b,alpha)
  var colorBuffer = new X.buffer(glColorBuffer, colors.count(), 3);

  // create opacity buffer
  var glOpacityBuffer = this._gl.createBuffer();

  // TODO figure out if we can pass data without converting it to an array
  var tmpArray = new Array(object.points().flatten().length);
  var j;
  for (j = 0; j < tmpArray.length; ++j) {

    tmpArray[j] = object.opacity();

  }

  console.log(tmpArray);
  console.log(new Float32Array(tmpArray));

  // bind and fill with opacity value
  this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glOpacityBuffer);
  this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(tmpArray),
      this._gl.STATIC_DRAW);

  // create an X.buffer to store the opacity
  var opacityBuffer = new X.buffer(glOpacityBuffer, 1, 1);

  // TODO buffers for lightning etc..

  // add the object to the internal tree which reflects the rendering order
  // (based on opacity)
  if (!this._objects.add(object)) {

    throw new X.exception('Fatal: Could not add object to this renderer.');

  }
  // add the buffers for the new object to the internal hash maps
  this._vertexBuffers.set(object.id(), vertexBuffer);
  this._colorBuffers.set(object.id(), colorBuffer);
  this._opacityBuffers.set(object.id(), opacityBuffer);

};

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
      var colorBuffer = this._colorBuffers.get(id);
      var opacityBuffer = this._opacityBuffers.get(id);

      // ..bind the glBuffers
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer.glBuffer());

      this._gl.vertexAttribPointer(this._vertexPositionAttribute, vertexBuffer
          .itemSize(), this._gl.FLOAT, false, 0, 0);

      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, colorBuffer.glBuffer());

      this._gl.vertexAttribPointer(this._vertexColorAttribute, colorBuffer
          .itemSize(), this._gl.FLOAT, false, 0, 0);

      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, opacityBuffer.glBuffer());

      this._gl.vertexAttribPointer(this._vertexOpacityAttribute, opacityBuffer
          .itemSize(), this._gl.FLOAT, false, 0, 0);

      // .. and draw with the object's draw mode
      var drawMode = -1;
      if (object.type() == X.object.types.TRIANGLES) {

        drawMode = this._gl.TRIANGLES;

      } else if (object.type() == X.object.types.LINES) {

        drawMode = this._gl.LINES;

      }

      this._gl.drawArrays(drawMode, 0, vertexBuffer.itemCount());

    } else {

      throw new X.exception('Fatal: Could not retrieve object for (re-)drawing');

    }

  } // loop through objects

};

/**
 * @param vector
 * @returns {goog.math.Vec2}
 */
X.renderer.prototype.convertWorldToDisplayCoordinates = function(vector) {

  var view = this._camera.view();
  var perspective = this._camera.perspective();

  var viewPerspective = goog.math.Matrix.createIdentityMatrix(4);

  viewPerspective = viewPerspective.multiply(perspective);
  viewPerspective = viewPerspective.multiply(view);

  var twoDVectorAsMatrix;
  twoDVectorAsMatrix = viewPerspective.multiplyByVector(vector);

  var x = (twoDVectorAsMatrix.getValueAt(0, 0) + 1) / 2.0;
  x = x * this.width();

  var y = (1 - twoDVectorAsMatrix.getValueAt(0, 1)) / 2.0;
  y = y * this.height();

  return new goog.math.Vec2(Math.round(x), Math.round(y));

};
// source
// http://webglfactory.blogspot.com/2011/05/how-to-convert-world-to-screen.html
X.renderer.prototype.viewportToNormalizedViewport = function(vector) {

  var view = this._camera.view();
  var perspective = this._camera.perspective();

  var viewPerspective = goog.math.Matrix.createIdentityMatrix(4);
  viewPerspective = viewPerspective.multiply(perspective);
  viewPerspective = viewPerspective.multiply(view);

  var viewPerspectiveInverse = viewPerspective.getInverse();


  var x = 2.0 * vector.x / this.width() - 1;
  var y = -2.0 * vector.y / this.height() + 1;

  threeDVector = new goog.math.Vec3(x, y, 0);
  threeDVectorAsMatrix = viewPerspectiveInverse.multiplyByVector(threeDVector);

  threeDVector.x = threeDVectorAsMatrix.getValueAt(0, 0);
  threeDVector.y = threeDVectorAsMatrix.getValueAt(1, 0);
  threeDVector.z = threeDVectorAsMatrix.getValueAt(2, 0);

  return threeDVector;

};


// export symbols (requiered for advanced compilation)
goog.exportSymbol('X.renderer', X.renderer);
goog.exportSymbol('X.renderer.prototype.getDimension',
    X.renderer.prototype.getDimension);
goog.exportSymbol('X.renderer.prototype.getWidth',
    X.renderer.prototype.getWidth);
goog.exportSymbol('X.renderer.prototype.setWidth',
    X.renderer.prototype.setWidth);
goog.exportSymbol('X.renderer.prototype.getHeight',
    X.renderer.prototype.getHeight);
goog.exportSymbol('X.renderer.prototype.setHeight',
    X.renderer.prototype.setHeight);
goog.exportSymbol('X.renderer.prototype.getBackgroundColor',
    X.renderer.prototype.getBackgroundColor);
goog.exportSymbol('X.renderer.prototype.setBackgroundColor',
    X.renderer.prototype.setBackgroundColor);
goog.exportSymbol('X.renderer.prototype.getContainer',
    X.renderer.prototype.getContainer);
goog.exportSymbol('X.renderer.prototype.setContainer',
    X.renderer.prototype.setContainer);
goog.exportSymbol('X.renderer.prototype.init', X.renderer.prototype.init);
goog.exportSymbol('X.renderer.prototype.setContainerById',
    X.renderer.prototype.setContainerById);
