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

goog.provide('X.loader');
// requires
goog.require('X.base');
goog.require('X.event');
goog.require('X.object');
goog.require('X.parserCRV');
goog.require('X.parserFSM');
goog.require('X.parserLUT');
goog.require('X.parserMGZ');
goog.require('X.parserNRRD');
goog.require('X.parserSTL');
goog.require('X.parserTRK');
goog.require('X.parserVTK');
goog.require('goog.structs.Map');

/**
 * This object loads external files in an asynchronous fashion. In addition, the
 * loading process is monitored and summarized to a total progress value.
 * 
 * @constructor
 * @extends X.base
 */
X.loader = function() {

  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'loader';
  
  /**
   * @protected
   */
  this._jobs = new goog.structs.Map();
  
  this._progress = 0;
  
};
// inherit from X.base
goog.inherits(X.loader, X.base);


/**
 * Check if all loading is completed.
 * 
 * @return {boolean} TRUE if all loading is completed, FALSE else wise.
 */
X.loader.prototype.completed = function() {

  // now we check if all of our jobs are completed
  return !this._jobs.containsValue(false);
  
};


/**
 * Add a value to the overall progress value. The given value is normalized
 * according to the number of current jobs. After adding the value, a
 * X.event.ProgressEvent is fired to inform the progress bar.
 * 
 * @param {!number} value The value to add.
 */
X.loader.prototype.addProgress = function(value) {

  // we have a three stage system during loading
  //
  // stage 1: loading in X.loader
  // stage 2: parsing in X.parser (when loading textures, this does not happen
  // so the loading adds a 2 in total)
  // stage 3: setting up in X.renderer
  //
  // each stage adds progress from 0..1 with a total of 1 at the end
  // add a fake job to prevent the user starring at a full progress bar
  this._progress += value / (this._jobs.getCount()) / 3;
  
  // clamp progress to 0..1
  this._progress = Math.min(1, this._progress);
  
  // fire a progress event so the progressbar can display something
  var progressEvent = new X.event.ProgressEvent();
  progressEvent._value = this._progress;
  this.dispatchEvent(progressEvent);
  
};


/**
 * Check if the given container is configured with a valid file format.
 * 
 * @param {!X.base} container A container which has an X.file() attached.
 * @return {!Array} An array holding the following information [filepath,
 *         extension in uppercase without the '.', the associated but
 *         uninstantiated parser for this file format, additional (optional)
 *         flags which are passed to the parser]
 * @throws {Error} An error, if the configured file format is not supported.
 */
X.loader.prototype.checkFileFormat = function(container) {

  // get the associated file of the object
  var filepath = container._file._path;
  
  // grab the file extension
  var extension = filepath.split('.').pop().toUpperCase();
  
  // check if the file format is supported
  if (!(extension in X.loader.extensions)) {
    
    throw new Error('The ' + extension + ' file format is not supported.');
    
  }
  
  return [filepath, extension, X.loader.extensions[extension][0],
          X.loader.extensions[extension][1]];
  
};


/**
 * Download a file associated to a container via Ajax. Callbacks are executed
 * depending on the success of the request.
 * 
 * @param {!X.base} container The container which has a X.file() attached.
 * @param {!X.object} object The X.object which is the parent of the container
 *          or equals it.
 * @throws {Error} An error, if the given objects were invalid.
 */
X.loader.prototype.load = function(container, object) {

  if (!container || !object) {
    
    // should not happen
    throw new Error('No container or object to load.');
    
  }
  
  // check the file format which returns the filepath, extension and the parser
  var filepath = this.checkFileFormat(container)[0];
  
  // we use a simple XHR to get the file contents
  // this works for binary and for ascii files
  var request = new XMLHttpRequest();
  
  // listen to abort events
  goog.events.listen(request, 'abort', this.failed.bind(this, request,
      container, object));
  
  // listen to error events
  goog.events.listen(request, 'error', this.failed.bind(this, request,
      container, object));
  
  // listen to completed events which triggers parsing
  goog.events.listen(request, 'load', this.parse.bind(this, request, container,
      object));
  
  // configure the URL
  request.open('GET', filepath, true);
  request.overrideMimeType("text/plain; charset=x-user-defined");
  request.setRequestHeader("Content-Type", "text/plain");
  
  // .. and GO!
  request.send(null);
  
  // add this loading job to our jobs map
  this._jobs.set(container._id, false);
  
};


/**
 * Trigger parsing of a data stream. This is the callback for successful
 * downloading. A single-shot listener is configured for a X.event.ModifiedEvent
 * which then triggers the complete callback.
 * 
 * @param {!XMLHttpRequest} request The original XHR.
 * @param {!X.base} container The container which has a X.file() attached.
 * @param {!X.object} object The X.object which is the parent of the container
 *          or equals it.
 */
X.loader.prototype.parse = function(request, container, object) {

  // downloading completed, add progress
  this.addProgress(1.0);
  
  // we use a timeout here to let the progress bar be able to breath and show
  // something
  setTimeout(function() {

    // check the file format which returns the filepath, extension and the
    // parser
    var _checkresult = this.checkFileFormat(container);
    var parser = _checkresult[2]; // the (uninstantiated) parser
    var flags = _checkresult[3]; // some (optional) custom flags
    
    // instantiate the parser
    var _parser = new parser;
    
    // listen once to a modified event
    goog.events.listenOnce(_parser, X.event.events.MODIFIED, this.complete
        .bind(this));
    
    // call the parse function and pass in the container, the object and the
    // data stream and some additional value
    _parser.parse(container, object, request.response, flags);
    
  }.bind(this), 100);
  
};


/**
 * The complete callback which gets executed after successful parsing of a data
 * stream. A X.event.ModifiedEvent is fired to inform the X.renderer that the
 * loading was completed.
 * 
 * @param {!X.event.ModifiedEvent} event The modified event holding container
 *          and object.
 */
X.loader.prototype.complete = function(event) {

  // parsing completed, add progress
  this.addProgress(1.0);
  
  // we use a timeout here to let the progress bar be able to breath and show
  // something
  setTimeout(function() {

    var container = event._container;
    var object = event._object;
    
    // mark the container's file as clean
    container._file._dirty = false;
    
    // fire the modified event on the object
    object.modified();
    
    // mark the loading job as completed
    this._jobs.set(container._id, true);
    
  }.bind(this), 100);
  
};


/**
 * The failure callback which gets executed if anything goes wrong during
 * downloading. It always throws an error.
 * 
 * @param {!XMLHttpRequest} request The original XHR.
 * @param {!X.base} container The container which has a X.file() attached.
 * @param {!X.object} object The X.object which is the parent of the container
 *          or equals it.
 * @throws {Error} An error, stating that something went wrong.
 */
X.loader.prototype.failed = function(request, container, object) {

  throw new Error('Loading failed: ', container, object);
  
};



X.loader.prototype.loadTexture = function(object) {

  if (!goog.isDefAndNotNull(object._texture)) {
    
    throw new Error('Internal error during texture loading.');
    
  }
  // setup the image object
  var image = new Image();
  var currentTextureFilename = object._texture._file._path;
  image.src = currentTextureFilename;
  
  // we let the object point to this image
  object._texture._image = image;
  
  // handler after the image was completely loaded
  goog.events.listenOnce(image, goog.events.EventType.LOAD,
      this.loadTextureCompleted.bind(this, object));
  
  // add this loading job to our jobs map
  this._jobs.set(object._texture._id, false);
  
  // this is a very fast step so we count it as 30% of the total texture load
  // time
  this.addProgress(0.3);
};

X.loader.prototype.loadTextureCompleted = function(object) {

  // here we add the rest of the setup step 0.7 and a full progress tick for the
  // load completion
  this.addProgress(1.7);
  
  setTimeout(function() {

    // at this point the image for the texture was loaded properly
    object._texture._dirty = true;
    object._texture._file._dirty = false;
    
    // fire the modified event
    object.modified();
    
    // mark the loading job as completed
    this._jobs.set(object._texture._id, true);
    
  }.bind(this), 100);
  
};


/**
 * Supported data types by extension.
 * 
 * @enum {Array}
 */
X.loader.extensions = {
  // support for the following extensions and the mapping to X.parsers as well
  // as some custom flags
  'STL': [X.parserSTL, null],
  'VTK': [X.parserVTK, null],
  'TRK': [X.parserTRK, null],
  'FSM': [X.parserFSM, null],
  'NRRD': [X.parserNRRD, null],
  'CRV': [X.parserCRV, null],
  'MGH': [X.parserMGZ, false],
  'MGZ': [X.parserMGZ, true],
  'TXT': [X.parserLUT, null],
  'LUT': [X.parserLUT, null]
};
