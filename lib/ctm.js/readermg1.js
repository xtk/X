goog.provide('CTM.ReaderMG1');

goog.require('LZMA');
goog.require('CTM.InterleavedStream');

goog.scope(function() {

CTM.ReaderMG1 = function(){
};

CTM.ReaderMG1.prototype.read = function(stream, body){
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);
  
  if (body.normals){
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderMG1.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readInt32(); //packed size
  
  var interleaved = new CTM.InterleavedStream(indices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG1.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readInt32(); //packed size
  
  var interleaved = new CTM.InterleavedStream(vertices, 1);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readNormals = function(stream, normals){
  stream.readInt32(); //magic "NORM"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(normals, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    
    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

CTM.ReaderMG1.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();
    
    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

  // end of scope
});
