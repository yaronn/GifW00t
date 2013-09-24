


(function(window, document) {
    
    "use strict";
    
    window.anigif = {
        
        initOnce: function() {
            this.init()    
            this.progressSink = null;
            
            this.options = {
                onlyLastFrames: 150,
                frameInterval: 500,
                selector: "#main",
                cores: 8,
                ratio: 0.8,
                quality: "Medium",
                base_url: ""
            };
            
        },
        
        init: function() {
            this.frames = [];
            this.totalFrames = 0;
            this.renderedFrames = 0;
            this.composedFrames = 0;
            this.images = [];
            this.el = null;
            //this._log = "";
            this.continue = true;
        },
        
        progress: function(str) {
            if (this.progressSink) this.progressSink(str)
        },
        
        log: function(str) {
            //console.log(str);
            //this._log += str + "\r\n";
        },
        
        startRecord: function() {
            
            this.init();
            
            this.el = document.querySelectorAll(this.options.selector)[0];
            
            this.recordFrame();
        },
        
        recordFrame: function() {
            var self = this;
            if (!this.continue) return;
            this.frames.push(this.cloneDom(this.el));
            if (this.frames.length>this.options.onlyLastFrames) {
                this.frames.shift()
            }
            this.progress(++this.totalFrames + " frames")
            //console.log("took snapshot");
            
            window.setTimeout(function() {
                self.recordFrame(this.options);
                }, this.options.frameInterval);
        
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
                        //var img = canvas.toDataURL("image/png");
                        //self.log(img);
                        self.progress("rendered " + ++self.renderedFrames + "/" + self.frames.length)
                        //console.log("rendered image" + i)
                        self.resizeImage(canvas, self.options.ratio, function(err, canvas_small) {
                            self.images.push(canvas_small);
                            self.frames[i].parentElement.removeChild(self.frames[i]);
                            cbx();    
                        })
                    }
                });    
                
            }, 0);
            
        },
        
       resizeImage: function(canvas, ratio, cba) {
                var self = this
                if (ratio==1) {
                    cba(null, canvas);
                    return;
                }
                
                var context = canvas.getContext("2d")
                var canvas2 = document.createElement("canvas")
                var context2 = canvas2.getContext("2d")
                canvas2.width = canvas.width*ratio
                canvas2.height = canvas.height*ratio
                var img = new Image();
                if (self.options.quality=="High")
                    img.src = canvas.toDataURL("image/png");
                else if (self.options.quality=="Medium")
                    img.src = canvas.toDataURL("image/jpeg", 0.9);
                else img.src = canvas.toDataURL("image/jpeg", 0.1);
                
                img.onload = function() {
                    context2.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas2.width, canvas2.height)    
                    cba(null, canvas2)
                }
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
            //console.log("starting gif composition")
            var encoder = new window.GIFEncoder_WebWorker({base_url: self.options.base_url+"jsgif/"});
            encoder.setRepeat(0); //auto-loop
            encoder.setDelay(this.options.frameInterval);
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
            
            var singleComplete = function() {
                self.progress("composed " + ++self.composedFrames + "/" + self.frames.length)
            }
            
            var done = function(err, data){
                self.log("final: ");
                //this.img = 'data:image/gif;base64,' + window.encode64(encoder.stream().getData())
                
                //self.img64 = 'data:image/gif;base64,' + window.encode64(data)
                self.img = window.getObjURL(data, "image/gif")
                self.log(self.img);
                cba(null)
            }
            
            self.progress("composed 0/" + self.frames.length)
            encoder.finish_async({singleComplete: singleComplete, done: done});
            
        }
        
    };
    
window.anigif.initOnce();


//need to use this WA since getDataURL() can crash the browser (wehn trying to view the url, not when creating it)
window.getObjURL = function(binStr, type)      {
    //take apart data URL
    //var parts = canvas.toDataURL().match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
    
    //assume base64 encoding
    //var binStr = atob(parts[3]);
    
    //convert to binary in ArrayBuffer
    var buf = new ArrayBuffer(binStr.length);
    var view = new Uint8Array(buf);
    for(var i = 0; i < view.length; i++)
      view[i] = binStr.charCodeAt(i);
    
    var blob = new Blob([view], {'type': type});
    
    var url;
    if (window.webkitURL) url = window.webkitURL.createObjectURL(blob)
    else url = window.URL.createObjectURL(blob)
    return url;
}


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