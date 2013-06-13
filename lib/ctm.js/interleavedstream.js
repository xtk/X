goog.provide('CTM.InterleavedStream');

goog.scope(function() {

CTM.InterleavedStream = function(data, count){
  this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  this.offset = CTM.isLittleEndian? 3: 0;
  this.count = count * 4;
  this.len = this.data.length;
};

CTM.InterleavedStream.prototype.writeByte = function(value){
  this.data[this.offset] = value;
  
  this.offset += this.count;
  if (this.offset >= this.len){
  
    this.offset -= this.len - 4;
    if (this.offset >= this.count){
    
      this.offset -= this.count + (CTM.isLittleEndian? 1: -1);
    }
  }
};

  // end of scope
});
