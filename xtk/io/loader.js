/*
 * ${HEADER}
 */

// provides
goog.provide('X.loader');

// requires
goog.require('X.base');
goog.require('X.exception');
goog.require('X.object');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.structs.Map');

/**
 * This object loads external files in an asynchronous fashion. In addition, the
 * loading process is monitored and summarized to a total progress value.
 * 
 * @constructor
 * @extends {X.base}
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
  this._className = 'loader';
  
  /**
   * @private
   */
  this._jobs_ = null;
  
  // goog.Timer.callOnce(function() {
  
  // this._completed = true;
  // }.bind(this), 6000);
  
};
// inherit from X.base
goog.inherits(X.loader, X.base);


X.loader.prototype.jobs_ = function() {

  if (!goog.isDefAndNotNull(this._jobs_)) {
    
    this._jobs_ = new goog.structs.Map();
    
  }
  
  return this._jobs_;
  
};


X.loader.prototype.completed = function() {

  if (!goog.isDefAndNotNull(this._jobs_)) {
    
    // there are no jobs (and they never were)
    // this is a quick 'jump out'
    return true;
    
  }
  
  // now we check if all of our jobs are completed
  return !this._jobs_.containsValue(false);
  
};

X.loader.prototype.loadTexture = function(object) {

  if (!goog.isDefAndNotNull(object.texture())) {
    
    throw new X.exception('Fatal: Internal error during texture loading.');
    
  }
  
  // setup the image object
  var image = new Image();
  var currentTextureFilename = object.texture().file();
  image.src = currentTextureFilename;
  
  // we let the object point to this image
  object.texture().setImage(image);
  
  // handler after the image was completely loaded
  goog.events.listenOnce(image, goog.events.EventType.LOAD,
      this.loadTextureCompleted.bind(this, object));
  
  // add this loading job to our jobs map
  this.jobs_().set(object.id(), false);
  
};

X.loader.prototype.loadTextureCompleted = function(object) {

  // at this point the image for the texture was loaded properly
  
  // fire the modified event and attach this object so the renderer can update
  // it properly
  var modifiedEvent = new X.renderer.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  
  // mark the loading job as completed
  this.jobs_().set(object.id(), true);
  
};

X.loader.prototype.loadFile = function(object) {

  if (!goog.isDefAndNotNull(object.file())) {
    
    // should not happen :)
    throw new X.exception('Fatal: Internal error during file loading.');
    
  }
  
  var file = object.file();
  
  var request = new XMLHttpRequest();
  
  request.addEventListener('progress',
      this.loadFileProgress.bind(this, object), false);
  
  goog.events.listen(request, 'abort', this.loadFileFailed.bind(this, request,
      object));
  
  goog.events.listen(request, 'error', this.loadFileFailed.bind(this, request,
      object));
  
  goog.events.listen(request, 'load', this.loadFileCompleted.bind(this,
      request, object));
  
  request.open('GET', file, true);
  
  request.send(null);
  
};

X.loader.prototype.loadFileProgress = function(object, event) {

  if (event.lengthComputable) {
    var progress = event.loaded / event.total;
    window.console.log(progress);
  }
  
};

X.loader.prototype.loadFileFailed = function(downloader, object) {

  window.console.log('err');
  
};

X.loader.prototype.loadFileCompleted = function(downloader, object) {

  var file = object.file();
  
  var fileExtension = file.split('.').pop();
  
  var readAsArray = downloader.response.split('\n');
  var objectN = object;
  
  var tmpArray = Array();
  var tmpArray2 = Array();
  var ind = 0;
  var ind2 = 0;
  
  var i;
  for (i = 0; i < readAsArray.length; i++) {
    
    var tmp = readAsArray[i];
    var tmpstr = tmp.split(' ');
    
    if (tmpstr[3] == 'vertex') {
      
      var x = tmpstr[4];
      var y = tmpstr[5];
      var z = tmpstr[6];
      objectN.points().add([x, y, z]);
      
      tmpArray[ind] = x;
      tmpArray[ind + 1] = y;
      tmpArray[ind + 2] = z;
      

      ind = ind + 3;
      

    } else if (tmpstr[1] == 'facet') {
      var x = tmpstr[3];
      var y = tmpstr[4];
      var z = tmpstr[5];
      objectN.normals().add([x, y, z]);
      objectN.normals().add([x, y, z]);
      objectN.normals().add([x, y, z]);
      
      tmpArray2[ind] = x;
      tmpArray2[ind + 1] = y;
      tmpArray2[ind + 2] = z;
      tmpArray2[ind + 3] = x;
      tmpArray2[ind + 4] = y;
      tmpArray2[ind + 5] = z;
      tmpArray2[ind + 6] = x;
      tmpArray2[ind + 7] = y;
      tmpArray2[ind + 8] = z;
      
      ind2 = ind2 + 9;
      
    }
  }
  
  object.tmparr = tmpArray;
  object.tmparr2 = tmpArray2;
  object.tmpcnt = ind + 1;
  object.tmpcnt2 = ind2 + 1;
  
  var modifiedEvent = new X.renderer.ModifiedEvent();
  modifiedEvent._object = object;
  this.dispatchEvent(modifiedEvent);
  // console.log(downloader.response);
  
};



// export symbols (required for advanced compilation)
goog.exportSymbol('X.loader', X.loader);
