/*
 * ${HEADER}
 */

// provides
goog.provide('X.renderer');

// requires
goog.require('goog.dom');
goog.require('X.base');
goog.require('X.exception');

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
  
  /** @inheritDoc */
  this._className = 'renderer';
  
  /**
   * The dimension of this renderer.
   * 
   * @type {!number}
   * @private
   */
  this._dimension = -1;
  
  /**
   * The width of this renderer.
   * 
   * @type {!number}
   * @private
   */
  this._width = width;
  
  /**
   * The height of this renderer.
   * 
   * @type {!number}
   * @private
   */
  this._height = height;
  
  /**
   * The background color of this renderer.
   * 
   * @type {!string}
   * @private
   */
  this._backgroundColor = '#000000';
  
  /**
   * The HTML container of this renderer, E.g a name of a <div>.
   * 
   * @type {?Element}
   * @private
   */
  this._container = null;
  
  /**
   * The Canvas of this renderer.
   * 
   * @type {?Element}
   * @private
   */
  this._canvas = null;
  
  /**
   * The WebGL context of this renderer.
   * 
   * @type {?Object}
   * @private
   */
  this._gl = null;
  
};
// inherit from X.base
goog.inherits(X.renderer, X.base);

/**
 * Get the dimension of this renderer. E.g. 2 for two-dimensional, 3 for
 * three-dimensional.
 * 
 * @returns {!number} The dimension of this renderer.
 */
X.renderer.prototype.getDimension = function() {
  
  return this._dimension;
  
};

/**
 * Get the width of this renderer.
 * 
 * @returns {!number} The width of this renderer.
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
 * @returns {!number} The height of this renderer.
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
 * @returns {!string} The background color of this renderer.
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
    this._canvas.style.setProperty('background-color', backgroundColor.toString());
    
  }
  
  this._backgroundColor = backgroundColor;
  
};

/**
 * Get the container of this renderer.
 * 
 * @returns {!Element} The container of this renderer as a DOM object.
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
 * attributes like width, height, backgroundColor etc.
 * 
 * Then, initialize the WebGL context.
 * 
 * All this will only happen once, no matter how often this method is called.
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
  canvas.style.setProperty('width', this.getWidth().toString());
  canvas.style.setProperty('height', this.getHeight().toString());
  canvas.style.setProperty('background-color', this.getBackgroundColor().toString());
  
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
    
  } catch (e) {
    
    throw new X.exception('Fatal: Exception while accessing GL Context!\n' + e);
    
  }
  
  // WebGL initialization done
  
  this._gl = gl;
  this._canvas = canvas;
  
};
