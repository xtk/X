goog.provide('CTM.File');

goog.require('CTM.FileHeader');
goog.require('CTM.FileBody');
goog.require('CTM.ReaderRAW');
goog.require('CTM.ReaderMG1');
goog.require('CTM.ReaderMG2');

goog.scope(function() {

CTM.File = function(stream){
  this.load(stream);
};

CTM.File.prototype.load = function(stream){
  this.header = new CTM.FileHeader(stream);

  this.body = new CTM.FileBody(this.header);
  
  this.getReader().read(stream, this.body);
};

CTM.File.prototype.getReader = function(){
  var reader;

  switch(this.header.compressionMethod){
    case CTM.CompressionMethod.RAW:
      reader = new CTM.ReaderRAW();
      break;
    case CTM.CompressionMethod.MG1:
      reader = new CTM.ReaderMG1();
      break;
    case CTM.CompressionMethod.MG2:
      reader = new CTM.ReaderMG2();
      break;
  }

  return reader;
};

  // end of scope
});
