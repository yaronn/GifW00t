


(function(window, document) {
    
    "use strict";
    
    window.anigif = {
        
        init: function() {
            this.frames = [];
            this.images = [];
            this._log = "";
            this.continue = true;
        },
        
        log: function(str) {
            console.log(str);
            this._log += str + "\r\n";
        },
        
        merge_options: function(obj1,obj2){
            var obj3 = {};
            for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
            for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
            return obj3;
        },

        startRecord: function(opts) {
            
            this.init();
            
            var options = this.merge_options({
                maxFrames: 100,
                frameInterval: 1000,
                el: document.getElementById("main")
            }, opts);
            
            this.recordFrame(options);
        },
        
        recordFrame: function(options) {
            var self = this;
            if (!this.continue) return;
            this.frames.push(this.cloneDom(options.el));
            console.log("took snapshot");
            if (this.frames.length<options.maxFrames) {
                window.setTimeout(function() {
                    self.recordFrame(options);
                    }, options.frameInterval);
            }
        },
        
        cloneDom: function(el) {
            var clone = el.cloneNode(true);
            
            var sourceCanvas = el.getElementsByTagName("canvas");
            var cloneCanvas = clone.getElementsByTagName("canvas");
            for (var i=0; i< sourceCanvas.length; i++) {
                var newCanvas = this.cloneCanvas(sourceCanvas[i])
                cloneCanvas[i].parentElement.replaceChild(newCanvas, cloneCanvas[i])
            }
            
            var sourceVideos = el.getElementsByTagName("video");
            var cloneVideos = clone.getElementsByTagName("video");
            for (var i=0; i< sourceVideos.length; i++) {
                var videoCanvas = this.getVideoCanvas(sourceVideos[i])
                cloneVideos[i].parentElement.replaceChild(videoCanvas, cloneVideos[i])
                //document.body.appendChild(videoCanvas);
            }
            
            clone.id="unique___"+el.id;
            
            return clone;
        },
        
         getVideoCanvas: function(video) {
            
            var canvas = document.createElement("canvas");
            
            //try width/geigh -30? here and bellow
            
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
            
            var ctx = canvas.getContext('2d');
            ctx.drawImage(video,0,0,video.clientWidth,video.clientHeight);
            
            return canvas;
        },
        
       cloneCanvas: function(oldCanvas) {
            //create a new canvas
            var newCanvas = document.createElement('canvas');
            var context = newCanvas.getContext('2d');
        
            //set dimensions
            newCanvas.width = oldCanvas.width;
            newCanvas.height = oldCanvas.height;
        
            //apply the old canvas to the new one
            context.drawImage(oldCanvas, 0, 0);
        
            //return the new canvas
            return newCanvas;
        },
        
        stopRecord: function(cba) {
            var self = this;
            this.continue = false;
            async.timesSeries(this.frames.length, self.renderImage.bind(self), function(err){
                self.composeAnimatedGif(function(err) {
                   cba(); 
                });
            });
        },
        
        renderImage: function(i, cbx) {
            var self = this;
            
            document.body.appendChild(this.frames[i]);
            this.replaceSvgWithCanvas(this.frames[i]);

            window.setTimeout(function() {
           
                window.html2canvas( [ self.frames[i] ], {
                onrendered: function(canvas) {
                    var img = canvas.toDataURL("image/png");
                    self.log(img);
                    self.images.push(canvas);
                    self.frames[i].parentElement.removeChild(self.frames[i]);
                    cbx();
                }
                });    
                
            }, 0);
            
        },
        
        replaceSvgWithCanvas: function(el) {
            var self = this;
            var serializer = new XMLSerializer();
            var svgs = el.querySelectorAll("svg")
            for (var i=0; i<svgs.length; i++) {
                var str = serializer.serializeToString(svgs[i]);
                var canvasEl = document.createElement("canvas");
                canvasEl.id="canvas"+i;
                svgs[i].parentElement.replaceChild(canvasEl, svgs[i]);  
                self.buildCanvasFromSvg(i, canvasEl, str, null);
            }
        },
        
        buildCanvasFromSvg: function(id, canvasEl, svgstr, cba) {
            var canvas;
            
            fabric.loadSVGFromString(svgstr, function(objects, options) {
              
              var shape = fabric.util.groupSVGElements(objects, options);
        
              canvasEl.width = shape.width || 600;
              canvasEl.height = shape.height || 600;
        
              canvas = new fabric.StaticCanvas('canvas'+id, { backgroundColor: '#fff' });
              canvas.add(shape);
              shape.center();
              canvas.renderAll();
              if (cba) cba(null, canvas);
            });
         },
          
        
        composeAnimatedGif: function(cba) {
            var self = this
            var encoder = new window.GIFEncoder_WebWorker();
            encoder.setRepeat(0); //auto-loop
            encoder.setDelay(1000);
            encoder.start();
             for (var i=0; i<this.images.length; i++) {
                var context = this.images[i].getContext('2d');
                encoder.addFrame(context);
            }
            
            /*
            encoder.finish()
            this.img = 'data:image/gif;base64,' + window.encode64(encoder.stream().getData())
            this.log(this.img);
            cba(null)
            */
            
            encoder.finish_async(function(err, data){
                self.log("final: ");
                //this.img = 'data:image/gif;base64,' + window.encode64(encoder.stream().getData())
                self.img = 'data:image/gif;base64,' + window.encode64(data)
                self.log(self.img);
                cba(null)
            });
            
        }
        
    };
    
    window.anigif.init();


window.encode64 = function(input) {
	var output = "", i = 0, l = input.length,
	key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	while (i < l) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) enc3 = enc4 = 64;
		else if (isNaN(chr3)) enc4 = 64;
		output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
	}
	return output;
}

})(window, document);