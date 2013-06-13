goog.provide('CTM.FileBody');

goog.scope(function() {

CTM.FileBody = function(header){
  var i = header.triangleCount * 3,
      v = header.vertexCount * 3,
      n = header.hasNormals()? header.vertexCount * 3: 0,
      u = header.vertexCount * 2,
      a = header.vertexCount * 4,
      j = 0;

  var data = new ArrayBuffer(
    (i + v + n + (u * header.uvMapCount) + (a * header.attrMapCount) ) * 4);

  this.indices = new Uint32Array(data, 0, i);

  this.vertices = new Float32Array(data, i * 4, v);

  if ( header.hasNormals() ){
    this.normals = new Float32Array(data, (i + v) * 4, n);
  }
  
  if (header.uvMapCount){
    this.uvMaps = [];
    for (j = 0; j < header.uvMapCount; ++ j){
      this.uvMaps[j] = {uv: new Float32Array(data,
        (i + v + n + (j * u) ) * 4, u) };
    }
  }
  
  if (header.attrMapCount){
    this.attrMaps = [];
    for (j = 0; j < header.attrMapCount; ++ j){
      this.attrMaps[j] = {attr: new Float32Array(data,
        (i + v + n + (u * header.uvMapCount) + (j * a) ) * 4, a) };
    }
  }
};

  // end of scope
});
