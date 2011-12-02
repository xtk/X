goog.provide('sampleApp');
goog.provide('sampleApp.run');

goog.require('X.box');
goog.require('X.object');
goog.require('X.renderer');
goog.require('X.triplets');


/**
 * The main function of the sampleApp.
 */
sampleApp.run = function() {

  console.log('Starting sampleApp.init..');
  
  try {
    
    var r = new X.renderer('threeDView');
    r.setBackgroundColor('#b3b3e7');
    r.init();
    
    // create a box with a texture
    var box1 = new X.box([10, 10, 10], 5, 10, 20);
    box1.setTexture(new X.texture('xtk.png'));
    
    // create a box with a solid color
    var box2 = new X.box([-10, -10, -10], 5, 5, 5);
    box2.setColor(0, 0, 1);
    box2.setOpacity(0.6);
    box2.transform().translateX(-50);
    box2.transform().translateY(30);
    box2.transform().translateZ(-30);
    box2.transform().rotateX(45);
    
    // create a box with different colored sides
    var box3 = new X.box([0, 0, 0], 3, 3, 3);
    // box3.setTexture(new X.texture('xtk_dark.png'));
    box3.setColors([1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1],
        [0, 1, 1]);
    // // box3.transform().rotateX(30);
    // box3.transform().rotateY(30);
    // box3.transform().rotateZ(30);
    // box3.setTexture(new X.texture('xtk_dark.png'));
    // box3.setOpacity(0.7);
    
    var box4 = new X.box([30, 30, 30], 5, 5, 5);
    box4.setTexture(new X.texture('xtk_dark.png'));
    
    r.add(box1);
    r.add(box2);
    r.add(box3);
    r.add(box4);
    
    // animation!
    setInterval(function() {

      box1.transform().rotateZ(3);
      r.render();
      
    }, 15);
    

    // CUSTOM EVENTS
    //
    // goog.events.listen(threeDView.interactor(), 'mouseup', testCB);
    
    function testCB(e) {

      console.log(e);
      
    }
    

    // THE FOLLOWING IS A HACK UNTIL THE INTERACTOR IS READY
    // function handleFileSelect(evt) {
    //
    // evt.stopPropagation();
    // evt.preventDefault();
    //      
    // var files = evt.dataTransfer.files; // FileList object.
    //      
    // // files is a FileList of File objects. List some properties.
    //      
    // var i, f = 0;
    // for (i = 0; f = files[i]; i++) {
    //        
    // var reader = new FileReader();
    //        
    // reader.onloadend = testcallback;
    //        
    // reader.readAsText(f);
    //        
    // }
    //      
    // }
    //    
    // function testcallback(evt) {
    //
    // var result = evt.target.result;
    // var readAsArray = result.split('\n');
    // var objectN = new X.object();
    //      
    // var i;
    // for (i = 0; i < readAsArray.length; i++) {
    //        
    // var tmp = readAsArray[i];
    // var tmpstr = tmp.split(' ');
    //        
    // if (tmpstr[3] == 'vertex') {
    //          
    // var x = tmpstr[4];
    // var y = tmpstr[5];
    // var z = tmpstr[6];
    // objectN.points().add([x, y, z]);
    //          
    // } else if (tmpstr[1] == 'facet') {
    // var x = tmpstr[3];
    // var y = tmpstr[4];
    // var z = tmpstr[5];
    // objectN.normals().add([x, y, z]);
    // objectN.normals().add([x, y, z]);
    // objectN.normals().add([x, y, z]);
    // }
    // }
    //      
    // threeDView.add(objectN);
    // // threeDView.render();
    //      
    // }
    //    
    // function handleDragOver(evt) {
    //
    // evt.stopPropagation();
    // evt.preventDefault();
    // }
    //    
    // // Setup the dnd listeners.
    // var dropZone = document.getElementById('threeDView');
    // dropZone.addEventListener('dragover', handleDragOver, false);
    // dropZone.addEventListener('drop', handleFileSelect, false);
    //    
    

  } catch (e) {
    
    // catch any X.exception and print the error to the error log
    if (e instanceof X.exception) {
      console.error(e.print());
    } else {
      console.error(e);
    }
    
  }
  
};

// export symbols (requiered for advanced compilation)
goog.exportSymbol('sampleApp', sampleApp);
goog.exportSymbol('sampleApp.run', sampleApp.run);
