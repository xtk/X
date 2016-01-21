var dicomParser = {
  parseDicom: function(element) {},
  readEncapsulatedPixelData: function(dataSet, element, index){}
};

function JpxImage(){
  return {
    parse: function(data){}
  };
}

var jpeg = {
  lossless: {
    Decoder: function(){
      return {
        decode: function(arg1, ag2, arg3, arg4){}
      };
    }
  }
};

var JpegImage ={
  parse: function(frameData){},
  getData: function(width, height){},
  getData16: function(width, height){}
};